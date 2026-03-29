import datetime
from sqlalchemy import (
    Column, Integer, String, Text, DateTime, Boolean,
    ForeignKey, func,
)
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from database import Base

EMBEDDING_DIM = 384  # all-MiniLM-L6-v2 output dimension


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(64), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(Text, nullable=False)
    # ECDH public key (PEM, for E2E encryption)
    public_key = Column(Text, nullable=True)
    avatar_url = Column(Text, nullable=True)
    bio = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    tasks = relationship("Task", back_populates="owner", cascade="all, delete-orphan")
    sent_messages = relationship(
        "Message", foreign_keys="Message.sender_id", back_populates="sender"
    )
    received_messages = relationship(
        "Message", foreign_keys="Message.recipient_id", back_populates="recipient"
    )
    collaborations = relationship(
        "TaskCollaborator", back_populates="user", cascade="all, delete-orphan"
    )


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    tags = Column(Text, nullable=True)           # comma-separated tags
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    embedding = Column(Vector(EMBEDDING_DIM), nullable=True)
    is_open = Column(Boolean, default=True, nullable=False)  # accepting collaborators
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    owner = relationship("User", back_populates="tasks")
    collaborators = relationship(
        "TaskCollaborator", back_populates="task", cascade="all, delete-orphan"
    )


class TaskCollaborator(Base):
    __tablename__ = "task_collaborators"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

    task = relationship("Task", back_populates="collaborators")
    user = relationship("User", back_populates="collaborations")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    recipient_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    # Encrypted ciphertext (base64) – only recipient can decrypt
    ciphertext = Column(Text, nullable=False)
    # Ephemeral public key used for this message (ECDH)
    ephemeral_public_key = Column(Text, nullable=True)
    # Encrypted AES key (base64) – encrypted with recipient RSA public key
    encrypted_key = Column(Text, nullable=True)
    # IV / nonce for AES-GCM (base64)
    iv = Column(Text, nullable=True)
    # Optional media attachment URL
    media_url = Column(Text, nullable=True)
    media_type = Column(String(64), nullable=True)
    # Soft-delete / TTL flag
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")
    recipient = relationship(
        "User", foreign_keys=[recipient_id], back_populates="received_messages"
    )


class MediaFile(Base):
    __tablename__ = "media_files"

    id = Column(Integer, primary_key=True, index=True)
    uploader_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    filename = Column(Text, nullable=False)
    original_name = Column(Text, nullable=False)
    content_type = Column(String(128), nullable=False)
    size_bytes = Column(Integer, nullable=False)
    url = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
