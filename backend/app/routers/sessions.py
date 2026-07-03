from datetime import UTC, datetime
from uuid import uuid4

from fastapi import APIRouter, status

from app.providers.registry import build_provider_stack
from app.schemas.common import ApiMeta, ApiResponse
from app.schemas.session import (
    CreateSessionRequest,
    ProviderSelection,
    Session,
    SessionState,
)

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.post(
    "",
    response_model=ApiResponse[Session],
    status_code=status.HTTP_201_CREATED,
)
async def create_session(
    request: CreateSessionRequest,
) -> ApiResponse[Session]:
    now = datetime.now(UTC)
    build_provider_stack(request.providers)

    session = Session(
        id=str(uuid4()),
        mode=request.mode,
        providers=ProviderSelection(
            stt=request.providers.stt,
            llm=request.providers.llm,
            tts=request.providers.tts,
        ),
        setup=request.setup,
        state=SessionState.SETUP_COMPLETE,
        created_at=now,
        updated_at=now,
    )

    return ApiResponse(data=session, meta=ApiMeta(timestamp=now))
