from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete
from sqlalchemy.orm import selectinload

import models
import schemas
import auth as auth_utils
from database import get_db
from services.embedding import embed_text

router = APIRouter(prefix="/tasks", tags=["tasks"])


def _task_to_out(task: models.Task, collab_count: int = 0) -> schemas.TaskOut:
    return schemas.TaskOut(
        id=task.id,
        title=task.title,
        description=task.description,
        tags=task.tags,
        owner_id=task.owner_id,
        owner_username=task.owner.username if task.owner else "",
        is_open=task.is_open,
        created_at=task.created_at,
        collaborator_count=collab_count,
    )


@router.post("", response_model=schemas.TaskOut, status_code=201)
async def create_task(
    body: schemas.TaskCreate,
    current_user: models.User = Depends(auth_utils.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    text_for_embedding = f"{body.title}. {body.description}"
    if body.tags:
        text_for_embedding += f" {body.tags}"

    embedding = await embed_text(text_for_embedding)

    task = models.Task(
        title=body.title,
        description=body.description,
        tags=body.tags,
        owner_id=current_user.id,
        is_open=body.is_open,
        embedding=embedding,
    )
    db.add(task)
    await db.commit()
    await db.refresh(task, ["owner"])
    return _task_to_out(task)


@router.get("", response_model=List[schemas.TaskOut])
async def list_tasks(
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    _: models.User = Depends(auth_utils.get_current_user),
):
    result = await db.execute(
        select(models.Task)
        .options(selectinload(models.Task.owner), selectinload(models.Task.collaborators))
        .order_by(models.Task.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    tasks = result.scalars().all()
    return [_task_to_out(t, len(t.collaborators)) for t in tasks]


@router.get("/search/similar", response_model=List[schemas.SimilarTask])
async def similar_tasks(
    q: str,
    limit: int = 10,
    db: AsyncSession = Depends(get_db),
    _: models.User = Depends(auth_utils.get_current_user),
):
    """Find tasks whose embeddings are closest to the query text."""
    query_embedding = await embed_text(q)

    # pgvector cosine distance operator <=>
    from sqlalchemy import text
    rows = await db.execute(
        text(
            """
            SELECT t.id, t.title, t.description, t.tags, t.owner_id, t.is_open,
                   t.created_at, u.username AS owner_username,
                   (SELECT COUNT(*) FROM task_collaborators tc WHERE tc.task_id = t.id) AS collab_count,
                   1 - (t.embedding <=> CAST(:emb AS vector)) AS similarity
            FROM tasks t
            JOIN users u ON u.id = t.owner_id
            WHERE t.embedding IS NOT NULL
            ORDER BY t.embedding <=> CAST(:emb AS vector)
            LIMIT :lim
            """
        ),
        {"emb": str(query_embedding), "lim": limit},
    )
    results = []
    for row in rows.mappings():
        results.append(
            schemas.SimilarTask(
                id=row["id"],
                title=row["title"],
                description=row["description"],
                tags=row["tags"],
                owner_id=row["owner_id"],
                owner_username=row["owner_username"],
                is_open=row["is_open"],
                created_at=row["created_at"],
                collaborator_count=row["collab_count"],
                similarity=float(row["similarity"]),
            )
        )
    return results


@router.get("/{task_id}", response_model=schemas.TaskOut)
async def get_task(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    _: models.User = Depends(auth_utils.get_current_user),
):
    result = await db.execute(
        select(models.Task)
        .options(selectinload(models.Task.owner), selectinload(models.Task.collaborators))
        .where(models.Task.id == task_id)
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return _task_to_out(task, len(task.collaborators))


@router.patch("/{task_id}", response_model=schemas.TaskOut)
async def update_task(
    task_id: int,
    body: schemas.TaskUpdate,
    current_user: models.User = Depends(auth_utils.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(models.Task)
        .options(selectinload(models.Task.owner), selectinload(models.Task.collaborators))
        .where(models.Task.id == task_id)
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not the task owner")

    changed_text = False
    if body.title is not None:
        task.title = body.title
        changed_text = True
    if body.description is not None:
        task.description = body.description
        changed_text = True
    if body.tags is not None:
        task.tags = body.tags
        changed_text = True
    if body.is_open is not None:
        task.is_open = body.is_open

    if changed_text:
        text_for_embedding = f"{task.title}. {task.description}"
        if task.tags:
            text_for_embedding += f" {task.tags}"
        task.embedding = await embed_text(text_for_embedding)

    await db.commit()
    await db.refresh(task, ["owner", "collaborators"])
    return _task_to_out(task, len(task.collaborators))


@router.delete("/{task_id}", status_code=204)
async def delete_task(
    task_id: int,
    current_user: models.User = Depends(auth_utils.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(models.Task).where(models.Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not the task owner")
    await db.delete(task)
    await db.commit()


@router.post("/{task_id}/join", status_code=200)
async def join_task(
    task_id: int,
    current_user: models.User = Depends(auth_utils.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(models.Task).where(models.Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if not task.is_open:
        raise HTTPException(status_code=400, detail="Task is not accepting collaborators")
    if task.owner_id == current_user.id:
        raise HTTPException(status_code=400, detail="You are the owner")

    existing = await db.execute(
        select(models.TaskCollaborator).where(
            models.TaskCollaborator.task_id == task_id,
            models.TaskCollaborator.user_id == current_user.id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Already a collaborator")

    collab = models.TaskCollaborator(task_id=task_id, user_id=current_user.id)
    db.add(collab)
    await db.commit()
    return {"detail": "Joined"}


@router.delete("/{task_id}/leave", status_code=204)
async def leave_task(
    task_id: int,
    current_user: models.User = Depends(auth_utils.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await db.execute(
        delete(models.TaskCollaborator).where(
            models.TaskCollaborator.task_id == task_id,
            models.TaskCollaborator.user_id == current_user.id,
        )
    )
    await db.commit()


@router.get("/{task_id}/collaborators", response_model=List[schemas.CollaboratorOut])
async def list_collaborators(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    _: models.User = Depends(auth_utils.get_current_user),
):
    result = await db.execute(
        select(models.TaskCollaborator)
        .options(selectinload(models.TaskCollaborator.user))
        .where(models.TaskCollaborator.task_id == task_id)
    )
    collabs = result.scalars().all()
    return [
        schemas.CollaboratorOut(
            user_id=c.user_id,
            username=c.user.username,
            joined_at=c.joined_at,
        )
        for c in collabs
    ]
