from fastapi import APIRouter

from app.routers import resumes, sessions

router = APIRouter(prefix="/api/v1")
router.include_router(resumes.router)
router.include_router(sessions.router)
