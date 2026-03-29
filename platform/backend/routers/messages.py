"""
Messaging router – REST endpoints + WebSocket hub.

End-to-end encryption is handled entirely on the client:
  • The sender encrypts the message body with the recipient's public key.
  • The server only ever stores/forwards the ciphertext (base64).
  • The server stores the ephemeral public key + encrypted AES key + IV so the
    recipient can reconstruct the shared secret and decrypt offline.

Disappearing messages: each message has an `expires_at` = NOW + 8 h.
A background job in main.py deletes expired rows periodically.
"""

from __future__ import annotations

import json
import logging
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Set

from fastapi import (
    APIRouter, Depends, HTTPException, Query, WebSocket,
    WebSocketDisconnect, status,
)
from jose import JWTError, jwt
from sqlalchemy import select, or_, and_, delete
from sqlalchemy.ext.asyncio import AsyncSession

import auth as auth_utils
import models
import schemas
from config import settings
from database import AsyncSessionLocal, get_db

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/messages", tags=["messages"])

# ── WebSocket connection manager ─────────────────────────────────────────────

class ConnectionManager:
    def __init__(self):
        # user_id → set of active WebSocket connections
        self._connections: Dict[int, Set[WebSocket]] = {}

    async def connect(self, user_id: int, ws: WebSocket):
        await ws.accept()
        self._connections.setdefault(user_id, set()).add(ws)

    def disconnect(self, user_id: int, ws: WebSocket):
        sockets = self._connections.get(user_id, set())
        sockets.discard(ws)
        if not sockets:
            self._connections.pop(user_id, None)

    async def send_to_user(self, user_id: int, data: dict):
        sockets = list(self._connections.get(user_id, []))
        dead: List[WebSocket] = []
        for ws in sockets:
            try:
                await ws.send_json(data)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(user_id, ws)


manager = ConnectionManager()


# ── WebSocket endpoint ────────────────────────────────────────────────────────

@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(...),
):
    """
    Connect with ?token=<JWT access token>.
    Incoming messages are JSON:
      { "type": "ping" }
    Outgoing messages are JSON:
      { "type": "message", "data": MessageOut }
    """
    try:
        user_id = auth_utils.decode_token(token)
    except HTTPException:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await manager.connect(user_id, websocket)
    try:
        while True:
            raw = await websocket.receive_text()
            try:
                msg = json.loads(raw)
                if msg.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})
            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)


# ── REST endpoints ────────────────────────────────────────────────────────────

@router.post("", response_model=schemas.MessageOut, status_code=201)
async def send_message(
    body: schemas.MessageCreate,
    current_user: models.User = Depends(auth_utils.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Verify recipient exists
    result = await db.execute(
        select(models.User).where(models.User.id == body.recipient_id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Recipient not found")

    expires_at = datetime.now(timezone.utc) + timedelta(hours=settings.message_ttl_hours)

    message = models.Message(
        sender_id=current_user.id,
        recipient_id=body.recipient_id,
        ciphertext=body.ciphertext,
        ephemeral_public_key=body.ephemeral_public_key,
        encrypted_key=body.encrypted_key,
        iv=body.iv,
        media_url=body.media_url,
        media_type=body.media_type,
        expires_at=expires_at,
    )
    db.add(message)
    await db.commit()
    await db.refresh(message)

    out = schemas.MessageOut.model_validate(message)
    # Push to recipient via WebSocket if online
    await manager.send_to_user(body.recipient_id, {"type": "message", "data": out.model_dump(mode="json")})

    return out


@router.get("/conversations", response_model=List[schemas.ConversationSummary])
async def list_conversations(
    current_user: models.User = Depends(auth_utils.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return one summary per unique peer the current user has exchanged messages with."""
    now = datetime.now(timezone.utc)

    result = await db.execute(
        select(models.Message)
        .where(
            or_(
                models.Message.sender_id == current_user.id,
                models.Message.recipient_id == current_user.id,
            ),
            models.Message.expires_at > now,
        )
        .order_by(models.Message.created_at.desc())
    )
    messages = result.scalars().all()

    # Collect unique peer IDs
    peer_ids: set[int] = set()
    last_msg_per_peer: dict[int, datetime] = {}
    for m in messages:
        peer_id = m.recipient_id if m.sender_id == current_user.id else m.sender_id
        peer_ids.add(peer_id)
        if peer_id not in last_msg_per_peer:
            last_msg_per_peer[peer_id] = m.created_at

    # Fetch peer users
    summaries: List[schemas.ConversationSummary] = []
    for peer_id in peer_ids:
        peer_result = await db.execute(
            select(models.User).where(models.User.id == peer_id)
        )
        peer = peer_result.scalar_one_or_none()
        if not peer:
            continue

        unread = sum(
            1
            for m in messages
            if m.recipient_id == current_user.id
            and m.sender_id == peer_id
        )
        summaries.append(
            schemas.ConversationSummary(
                peer=schemas.UserPublic.model_validate(peer),
                last_message_at=last_msg_per_peer.get(peer_id),
                unread_count=unread,
            )
        )

    summaries.sort(key=lambda s: s.last_message_at or datetime.min.replace(tzinfo=timezone.utc), reverse=True)
    return summaries


@router.get("/{peer_id}", response_model=List[schemas.MessageOut])
async def get_conversation(
    peer_id: int,
    skip: int = 0,
    limit: int = 50,
    current_user: models.User = Depends(auth_utils.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(models.Message)
        .where(
            or_(
                and_(
                    models.Message.sender_id == current_user.id,
                    models.Message.recipient_id == peer_id,
                ),
                and_(
                    models.Message.sender_id == peer_id,
                    models.Message.recipient_id == current_user.id,
                ),
            ),
            models.Message.expires_at > now,
        )
        .order_by(models.Message.created_at.asc())
        .offset(skip)
        .limit(limit)
    )
    messages = result.scalars().all()
    return [schemas.MessageOut.model_validate(m) for m in messages]


async def purge_expired_messages():
    """Called periodically to delete messages past their TTL."""
    async with AsyncSessionLocal() as db:
        now = datetime.now(timezone.utc)
        await db.execute(
            delete(models.Message).where(models.Message.expires_at <= now)
        )
        await db.commit()
