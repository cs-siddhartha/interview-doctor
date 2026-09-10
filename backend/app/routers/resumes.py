import asyncio
import logging
from datetime import UTC, datetime
from typing import Annotated
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from redis.exceptions import RedisError

from app.resumes.chunker import chunk_resume
from app.resumes.dependencies import ResumeStoreDep
from app.resumes.embeddings import embed_texts
from app.resumes.parser import (
    MAX_RESUME_BYTES,
    ResumeValidationError,
    parse_resume_pdf,
)
from app.schemas.common import ApiMeta, ApiResponse
from app.schemas.resume import ResumeDocument
from app.security import require_api_rate_limit, require_backend_token
from app.stores.resumes import build_resume_document

router = APIRouter(
    prefix="/resumes",
    tags=["resumes"],
    dependencies=[
        Depends(require_backend_token),
        Depends(require_api_rate_limit),
    ],
)
logger = logging.getLogger("interview_doctor.resumes")


@router.post(
    "",
    response_model=ApiResponse[ResumeDocument],
    status_code=status.HTTP_201_CREATED,
)
async def upload_resume(
    resume: Annotated[UploadFile, File()],
    allow_openai_embedding: Annotated[bool, Form()],
    resume_store: ResumeStoreDep,
) -> ApiResponse[ResumeDocument]:
    if not allow_openai_embedding:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Resume embedding consent is required.",
        )
    data = await resume.read(MAX_RESUME_BYTES + 1)
    filename = resume.filename or ""
    content_type = resume.content_type or ""
    document_id = str(uuid4())
    logger.info(
        "[backend.resume] upload received document_id=%s content_type=%s bytes=%d",
        document_id,
        content_type,
        len(data),
    )

    try:
        parsed_document = await asyncio.to_thread(
            parse_resume_pdf,
            filename,
            content_type,
            data,
        )
        chunks = await asyncio.to_thread(
            chunk_resume,
            document_id,
            parsed_document,
        )
    except (ResumeValidationError, ValueError) as error:
        logger.warning(
            "[backend.resume] validation failed document_id=%s error=%s",
            document_id,
            error,
        )
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(error),
        ) from error

    try:
        embeddings = await embed_texts([chunk.text for chunk in chunks])
        document = build_resume_document(
            document_id=document_id,
            filename=filename,
            page_count=len(parsed_document.pages),
            chunk_count=len(chunks),
        )
        await resume_store.save(document, chunks, embeddings)
    except RuntimeError as error:
        logger.exception(
            "[backend.resume] processing failed document_id=%s", document_id
        )
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(error),
        ) from error
    except RedisError as error:
        logger.exception("[backend.resume] storage failed document_id=%s", document_id)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Resume storage is unavailable.",
        ) from error

    now = datetime.now(UTC)
    logger.info(
        "[backend.resume] upload completed document_id=%s pages=%d chunks=%d",
        document_id,
        document.page_count,
        document.chunk_count,
    )
    return ApiResponse(data=document, meta=ApiMeta(timestamp=now))
