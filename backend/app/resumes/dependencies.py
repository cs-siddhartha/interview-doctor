from typing import Annotated

from fastapi import Depends
from redis.asyncio import Redis

from app.core.redis import get_redis_client
from app.stores.resumes import ResumeStore, get_resume_index


def get_resume_store(
    redis: Annotated[Redis, Depends(get_redis_client)],
) -> ResumeStore:
    return ResumeStore(redis, get_resume_index())


ResumeStoreDep = Annotated[ResumeStore, Depends(get_resume_store)]
