from app.schemas.session import InterviewMode, ResumeSetup, Session
from app.stores.resumes import ResumeStore


class ResumeDocumentNotFoundError(ValueError):
    pass

async def get_resume_evidence(
    mode: InterviewMode,
    setup: object,
    resume_store: ResumeStore,
    candidate_answer: str | None = None,
    current_question: str | None = None,
) -> list[str]:
    if mode != InterviewMode.RESUME or not isinstance(setup, ResumeSetup):
        return []

    document = await resume_store.get(setup.resumeDocumentId)

    if document is None:
        raise ResumeDocumentNotFoundError(
            "The processed resume is missing or expired. Upload it again."
        )

    await resume_store.refresh(document)
    query = build_retrieval_query(
        setup.targetRole,
        candidate_answer,
        current_question,
    )

    return await resume_store.retrieve(document.id, query)


def build_retrieval_query(
    target_role: str,
    candidate_answer: str | None,
    current_question: str | None,
) -> str:
    if candidate_answer:
        return "\n".join(
            part
            for part in [target_role, current_question, candidate_answer]
            if part
        )

    return (
        f"Most interview-worthy experience for {target_role}: projects, ownership, "
        "technical decisions, tradeoffs, and measurable outcomes."
    )


def get_current_question(session: Session) -> str | None:
    for turn in reversed(session.transcript):
        if turn.speaker.value == "ai_interviewer":
            return turn.text

    return None
