"""
Media upload / download router.

Uploaded files are stored on the local filesystem under MEDIA_UPLOAD_DIR.
File metadata is stored in the media_files table.
"""

import os
import uuid
from pathlib import Path
from typing import List

import aiofiles
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

import auth as auth_utils
import models
import schemas
from config import settings
from database import get_db

router = APIRouter(prefix="/media", tags=["media"])

ALLOWED_TYPES = {
    "image/jpeg", "image/png", "image/gif", "image/webp",
    "video/mp4", "video/webm",
    "audio/mpeg", "audio/ogg", "audio/wav",
    "application/pdf",
}

MAX_BYTES = settings.max_upload_size_mb * 1024 * 1024


def _upload_dir() -> Path:
    p = Path(settings.media_upload_dir)
    p.mkdir(parents=True, exist_ok=True)
    return p


@router.post("", response_model=schemas.MediaOut, status_code=201)
async def upload_file(
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth_utils.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=415, detail="Unsupported media type")

    contents = await file.read()
    if len(contents) > MAX_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds {settings.max_upload_size_mb} MB limit",
        )

    ext = Path(file.filename or "upload").suffix or ""
    filename = f"{uuid.uuid4().hex}{ext}"
    dest = _upload_dir() / filename

    async with aiofiles.open(dest, "wb") as f:
        await f.write(contents)

    url = f"/media/files/{filename}"
    record = models.MediaFile(
        uploader_id=current_user.id,
        filename=filename,
        original_name=file.filename or filename,
        content_type=file.content_type,
        size_bytes=len(contents),
        url=url,
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)

    return schemas.MediaOut(
        id=record.id,
        url=url,
        content_type=record.content_type,
        original_name=record.original_name,
        size_bytes=record.size_bytes,
        created_at=record.created_at,
    )


@router.get("/files/{filename}")
async def serve_file(
    filename: str,
    _: models.User = Depends(auth_utils.get_current_user),
):
    # Prevent path traversal
    safe = Path(filename).name
    if safe != filename:
        raise HTTPException(status_code=400, detail="Invalid filename")
    path = _upload_dir() / safe
    if not path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path)


@router.get("", response_model=List[schemas.MediaOut])
async def list_my_files(
    current_user: models.User = Depends(auth_utils.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(models.MediaFile)
        .where(models.MediaFile.uploader_id == current_user.id)
        .order_by(models.MediaFile.created_at.desc())
    )
    files = result.scalars().all()
    return [
        schemas.MediaOut(
            id=f.id,
            url=f.url,
            content_type=f.content_type,
            original_name=f.original_name,
            size_bytes=f.size_bytes,
            created_at=f.created_at,
        )
        for f in files
    ]
