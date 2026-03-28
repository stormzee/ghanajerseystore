from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

import models
import schemas
import auth as auth_utils
from database import get_db

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=schemas.TokenResponse, status_code=201)
async def register(body: schemas.RegisterRequest, db: AsyncSession = Depends(get_db)):
    # Check uniqueness
    result = await db.execute(
        select(models.User).where(
            (models.User.email == body.email) | (models.User.username == body.username)
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email or username already registered")

    user = models.User(
        username=body.username,
        email=body.email,
        password_hash=auth_utils.hash_password(body.password),
        public_key=body.public_key,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    return schemas.TokenResponse(
        access_token=auth_utils.create_access_token(user.id),
        refresh_token=auth_utils.create_refresh_token(user.id),
    )


@router.post("/login", response_model=schemas.TokenResponse)
async def login(body: schemas.LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.User).where(models.User.email == body.email)
    )
    user = result.scalar_one_or_none()
    if not user or not auth_utils.verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    return schemas.TokenResponse(
        access_token=auth_utils.create_access_token(user.id),
        refresh_token=auth_utils.create_refresh_token(user.id),
    )


@router.post("/refresh", response_model=schemas.TokenResponse)
async def refresh(body: schemas.RefreshRequest, db: AsyncSession = Depends(get_db)):
    user_id = auth_utils.decode_token(body.refresh_token, token_type="refresh")
    result = await db.execute(select(models.User).where(models.User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return schemas.TokenResponse(
        access_token=auth_utils.create_access_token(user.id),
        refresh_token=auth_utils.create_refresh_token(user.id),
    )
