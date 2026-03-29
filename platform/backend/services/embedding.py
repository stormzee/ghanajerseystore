"""
Embedding service using sentence-transformers (all-MiniLM-L6-v2).
Lazy-loaded on first call so startup is fast.
"""
from __future__ import annotations

import asyncio
from functools import lru_cache
from typing import List

_model = None


def _load_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def embed_text_sync(text: str) -> List[float]:
    """Return a 384-dim embedding for the given text (blocking)."""
    model = _load_model()
    vector = model.encode(text, normalize_embeddings=True)
    return vector.tolist()


async def embed_text(text: str) -> List[float]:
    """Async wrapper – runs in a thread pool to avoid blocking the event loop."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, embed_text_sync, text)
