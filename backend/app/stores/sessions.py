from collections.abc import Callable
from datetime import UTC, datetime

from redis.asyncio import Redis
from redis.exceptions import WatchError

from app.schemas.session import (
    InterviewReport,
    Session,
    SessionState,
    SessionTransport,
    TranscriptTurn,
)

SESSION_TTL_SECONDS = 60 * 60
SESSION_KEY_PREFIX = "interview_session"
MAX_CANDIDATE_TURNS = 30


class SessionStoreError(RuntimeError):
    """Base class for atomic session-store failures."""


class SessionStoreNotFoundError(SessionStoreError):
    """Identify a session that expired or does not exist."""


class SessionStoreConflictError(SessionStoreError):
    """Reject stale writes and invalid state transitions."""


class SessionStore:
    def __init__(
        self,
        redis: Redis,
        ttl_seconds: int = SESSION_TTL_SECONDS,
    ) -> None:
        self.redis = redis
        self.ttl_seconds = ttl_seconds

    # Persists the full API session payload without extending its retention window.
    async def save(self, session: Session) -> Session:
        ttl = self._remaining_ttl(session)
        await self.redis.set(
            self.build_key(session.id),
            session.model_dump_json(),
            ex=ttl,
        )

        return session

    async def get(self, session_id: str) -> Session | None:
        payload = await self.redis.get(self.build_key(session_id))

        if payload is None:
            return None

        return Session.model_validate_json(payload)

    async def delete(self, session_id: str) -> bool:
        """Delete all persisted state for one interview session."""
        return bool(await self.redis.delete(self.build_key(session_id)))

    async def claim_turn(
        self,
        session_id: str,
        transport: SessionTransport,
    ) -> Session:
        """Atomically reserve one active turn and reject competing callers."""

        def claim(session: Session) -> None:
            if session.transport != transport:
                raise SessionStoreConflictError(
                    f"Session requires {session.transport.value} transport"
                )
            if session.state == SessionState.SESSION_END:
                raise SessionStoreConflictError("Session has ended")
            if session.state != SessionState.LISTENING:
                raise SessionStoreConflictError("Another turn is already active")
            candidate_turns = sum(
                turn.speaker.value == "candidate" for turn in session.transcript
            )
            if candidate_turns >= MAX_CANDIDATE_TURNS:
                raise SessionStoreConflictError("Session turn limit reached")

            session.state = SessionState.PROCESSING

        return await self._mutate(session_id, claim)

    async def transition(
        self,
        session_id: str,
        expected_version: int,
        state: SessionState,
    ) -> Session:
        """Move a claimed session forward only while its version is current."""

        def transition_state(session: Session) -> None:
            self._require_version(session, expected_version)
            if session.state == SessionState.SESSION_END:
                raise SessionStoreConflictError("Session has ended")
            session.state = state

        return await self._mutate(session_id, transition_state)

    async def complete_turn(
        self,
        session_id: str,
        expected_version: int,
        candidate_turn: TranscriptTurn,
        ai_turn: TranscriptTurn,
        state: SessionState = SessionState.LISTENING,
    ) -> Session:
        """Append one complete turn without overwriting concurrent session changes."""

        def append_turn(session: Session) -> None:
            self._require_version(session, expected_version)
            if session.state == SessionState.SESSION_END:
                raise SessionStoreConflictError("Session has ended")
            session.transcript.extend([candidate_turn, ai_turn])
            session.state = state

        return await self._mutate(session_id, append_turn)

    async def end(self, session_id: str) -> Session:
        """Persist the terminal state atomically so later work cannot reverse it."""

        def end_session(session: Session) -> None:
            session.state = SessionState.SESSION_END

        return await self._mutate(session_id, end_session)

    async def set_report(
        self,
        session_id: str,
        expected_version: int,
        report: InterviewReport | None,
        error: str | None,
    ) -> Session:
        """Attach a final report without allowing stale evaluator writes."""

        def attach_report(session: Session) -> None:
            self._require_version(session, expected_version)
            if session.state != SessionState.SESSION_END:
                raise SessionStoreConflictError("Session has not ended")
            session.report = report
            session.report_error = error

        return await self._mutate(session_id, attach_report)

    async def _mutate(
        self,
        session_id: str,
        mutation: Callable[[Session], None],
    ) -> Session:
        """Apply a versioned mutation with Redis WATCH and retry write races."""
        key = self.build_key(session_id)

        while True:
            async with self.redis.pipeline(transaction=True) as pipeline:
                try:
                    await pipeline.watch(key)
                    payload = await pipeline.get(key)

                    if payload is None:
                        raise SessionStoreNotFoundError("Session not found")

                    session = Session.model_validate_json(payload)
                    mutation(session)
                    session.version += 1
                    session.updated_at = datetime.now(UTC)
                    pipeline.multi()
                    pipeline.set(
                        key,
                        session.model_dump_json(),
                        ex=self._remaining_ttl(session),
                    )
                    await pipeline.execute()
                    return session
                except WatchError:
                    continue

    @staticmethod
    def _require_version(session: Session, expected_version: int) -> None:
        if session.version != expected_version:
            raise SessionStoreConflictError("Session changed while the turn was active")

    def _remaining_ttl(self, session: Session) -> int:
        elapsed = (datetime.now(UTC) - session.created_at).total_seconds()
        return max(1, self.ttl_seconds - int(elapsed))

    def build_key(self, session_id: str) -> str:
        return f"{SESSION_KEY_PREFIX}:{session_id}"
