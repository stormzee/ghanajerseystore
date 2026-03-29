from __future__ import annotations
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, field_validator


# ── Auth ────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    public_key: Optional[str] = None  # ECDH/RSA PEM public key

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


# ── Users ───────────────────────────────────────────────────────────────────

class UserPublic(BaseModel):
    id: int
    username: str
    email: str
    public_key: Optional[str]
    avatar_url: Optional[str]
    bio: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    public_key: Optional[str] = None


# ── Tasks ───────────────────────────────────────────────────────────────────

class TaskCreate(BaseModel):
    title: str
    description: str
    tags: Optional[str] = None
    is_open: bool = True


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[str] = None
    is_open: Optional[bool] = None


class CollaboratorOut(BaseModel):
    user_id: int
    username: str
    joined_at: datetime

    class Config:
        from_attributes = True


class TaskOut(BaseModel):
    id: int
    title: str
    description: str
    tags: Optional[str]
    owner_id: int
    owner_username: str
    is_open: bool
    created_at: datetime
    collaborator_count: int = 0

    class Config:
        from_attributes = True


class SimilarTask(TaskOut):
    similarity: float


class SimilaritySearchRequest(BaseModel):
    query: str
    limit: int = 10


# ── Messages ─────────────────────────────────────────────────────────────────

class MessageCreate(BaseModel):
    recipient_id: int
    ciphertext: str           # encrypted message body (base64)
    ephemeral_public_key: Optional[str] = None
    encrypted_key: Optional[str] = None
    iv: Optional[str] = None
    media_url: Optional[str] = None
    media_type: Optional[str] = None


class MessageOut(BaseModel):
    id: int
    sender_id: int
    recipient_id: int
    ciphertext: str
    ephemeral_public_key: Optional[str]
    encrypted_key: Optional[str]
    iv: Optional[str]
    media_url: Optional[str]
    media_type: Optional[str]
    expires_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationSummary(BaseModel):
    peer: UserPublic
    last_message_at: Optional[datetime]
    unread_count: int


# ── Media ────────────────────────────────────────────────────────────────────

class MediaOut(BaseModel):
    id: int
    url: str
    content_type: str
    original_name: str
    size_bytes: int
    created_at: datetime

    class Config:
        from_attributes = True
