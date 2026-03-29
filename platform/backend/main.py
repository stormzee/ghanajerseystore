"""
TaskPlatform – FastAPI application entry point.
"""

import logging
from contextlib import asynccontextmanager

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import init_db
from routers import auth_router, messages, tasks, users, media
from routers.messages import purge_expired_messages

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    # Schedule message purge every 30 minutes
    scheduler.add_job(purge_expired_messages, "interval", minutes=30)
    scheduler.start()
    logger.info("Task Platform API started")
    yield
    # Shutdown
    scheduler.shutdown(wait=False)


app = FastAPI(
    title="Task Similarity Search Platform",
    description=(
        "Post tasks, find like-minded collaborators via vector similarity search, "
        "and chat with end-to-end encrypted messages that disappear after 8 hours."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(users.router)
app.include_router(tasks.router)
app.include_router(messages.router)
app.include_router(media.router)


@app.get("/health", tags=["health"])
async def health():
    return {"status": "ok"}
