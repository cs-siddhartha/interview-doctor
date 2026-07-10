from redis.asyncio import Redis

from app.schemas.session import Session

SESSION_TTL_SECONDS = 60 * 60
SESSION_KEY_PREFIX = "interview_session"


class SessionStore:
    def __init__(
        self,
        redis: Redis,
        ttl_seconds: int = SESSION_TTL_SECONDS,
    ) -> None:
        self.redis = redis
        self.ttl_seconds = ttl_seconds

    # Persists the full API session payload as JSON and refreshes the one-hour TTL
    # every time the session is written.
    async def save(self, session: Session) -> Session:
        await self.redis.set(
            self.build_key(session.id),
            session.model_dump_json(),
            ex=self.ttl_seconds,
        )

        return session

    async def get(self, session_id: str) -> Session | None:
        payload = await self.redis.get(self.build_key(session_id))

        if payload is None:
            return None

        return Session.model_validate_json(payload)

    def build_key(self, session_id: str) -> str:
        return f"{SESSION_KEY_PREFIX}:{session_id}"
