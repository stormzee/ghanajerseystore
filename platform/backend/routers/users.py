from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

import models
import schemas
import auth as auth_utils
from database import get_db

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=schemas.UserPublic)
async def get_me(current_user: models.User = Depends(auth_utils.get_current_user)):
    return current_user


@router.patch("/me", response_model=schemas.UserPublic)
async def update_me(
    body: schemas.UserUpdate,
    current_user: models.User = Depends(auth_utils.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if body.bio is not None:
        current_user.bio = body.bio
    if body.avatar_url is not None:
        current_user.avatar_url = body.avatar_url
    if body.public_key is not None:
        current_user.public_key = body.public_key
    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.get("/{user_id}", response_model=schemas.UserPublic)
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    _: models.User = Depends(auth_utils.get_current_user),
):
    result = await db.execute(select(models.User).where(models.User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
