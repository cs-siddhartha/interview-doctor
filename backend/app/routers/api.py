from fastapi import APIRouter

from app.routers import sessions

router = APIRouter(prefix="/api/v1")
router.include_router(sessions.router)
