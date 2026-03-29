# TaskCollab – Task Similarity Search Platform

A collaborative platform where users post tasks they're working on, discover others working on similar things via **vector similarity search**, and communicate through **end-to-end encrypted** real-time messages.

## Architecture

| Layer | Technology |
|-------|-----------|
| Backend API | FastAPI (Python) |
| Frontend | React 18 + TypeScript + Vite |
| Database | PostgreSQL 16 + **pgvector** extension |
| Embeddings | `sentence-transformers` – `all-MiniLM-L6-v2` (384-dim) |
| Auth | JWT (access + refresh tokens) |
| Messaging | WebSocket (real-time) + REST |
| Encryption | RSA-OAEP (key wrapping) + AES-256-GCM (message body) |
| Styling | Tailwind CSS |

---

## Features

### ✅ Task Similarity Search
- Post a task with a title, description, and tags.
- Embeddings are generated automatically using `sentence-transformers` and stored in pgvector.
- Search for similar tasks by free-text query – results are ranked by **cosine similarity**.
- Join/leave tasks as a collaborator.

### ✅ Real-time Messaging
- WebSocket connection authenticated via JWT query param.
- Messages are delivered instantly to online recipients.
- Heartbeat ping/pong every 30 seconds keeps connections alive.
- Automatic reconnection on disconnect.

### ✅ End-to-End Encryption
- Each user generates an **RSA-OAEP 2048-bit** key pair in the browser (Web Crypto API).
- Private keys **never leave the device** (stored in `localStorage`).
- Public keys are uploaded to the server so others can encrypt messages for this user.
- Message body is encrypted with a per-message **AES-256-GCM** key, and the AES key is wrapped with the recipient's RSA public key.
- The server stores only ciphertext and never sees plaintext.

### ✅ Disappearing Messages
- Every message has an `expires_at = NOW() + 8 hours`.
- A background scheduler (APScheduler) purges expired messages every 30 minutes.
- Expired messages are also excluded from all API queries.

### ✅ Media Sharing
- Upload images, videos, audio, and PDFs (max 20 MB).
- Shared via a secure `/media/files/{filename}` endpoint (JWT-protected).
- Media messages are encrypted before sending (plaintext is `[media]`).

---

## Quick Start (Docker Compose)

```bash
# From the repository root
docker compose -f docker-compose.platform.yml up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## Local Development

### Backend

```bash
cd platform/backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Copy env and edit DATABASE_URL etc.
cp .env.example .env

# Start (requires a running PostgreSQL with pgvector)
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd platform/frontend
npm install
npm run dev
```

The Vite dev server proxies `/api/*` to `http://localhost:8000`.

---

## Environment Variables (backend)

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql+asyncpg://postgres:postgres@localhost:5432/taskplatform` | Async SQLAlchemy connection string |
| `SECRET_KEY` | `change-me-…` | JWT signing secret (change in production!) |
| `ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | Access token lifetime |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` | Refresh token lifetime |
| `MEDIA_UPLOAD_DIR` | `./uploads` | Where uploaded files are stored |
| `MAX_UPLOAD_SIZE_MB` | `20` | Maximum upload size |
| `MESSAGE_TTL_HOURS` | `8` | Disappearing message TTL |

---

## API Overview

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login → tokens |
| POST | `/auth/refresh` | Refresh access token |
| GET | `/users/me` | Get current user |
| PATCH | `/users/me` | Update profile / public key |
| GET | `/users/{id}` | Get user by ID |
| POST | `/tasks` | Create task |
| GET | `/tasks` | List all tasks |
| GET | `/tasks/search/similar?q=…` | Similarity search |
| GET | `/tasks/{id}` | Get task |
| PATCH | `/tasks/{id}` | Update task |
| DELETE | `/tasks/{id}` | Delete task |
| POST | `/tasks/{id}/join` | Join as collaborator |
| DELETE | `/tasks/{id}/leave` | Leave task |
| GET | `/tasks/{id}/collaborators` | List collaborators |
| POST | `/messages` | Send encrypted message |
| GET | `/messages/conversations` | List conversations |
| GET | `/messages/{peer_id}` | Get message history |
| WS | `/messages/ws?token=…` | Real-time WebSocket |
| POST | `/media` | Upload file |
| GET | `/media/files/{filename}` | Download file |
| GET | `/media` | List my uploads |
