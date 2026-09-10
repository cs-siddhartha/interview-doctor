import json
from typing import Annotated

from pydantic import BaseModel, Field, ValidationError

from app.schemas.session import (
    InterviewReport,
    ReportCategory,
    ReportEvidence,
    ReportImprovement,
    Session,
    TranscriptSpeaker,
)


class GeneratedCategory(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    score: int = Field(ge=1, le=5)
    rationale: str = Field(min_length=1, max_length=1000)
    evidence_turn_indices: list[int] = Field(min_length=1, max_length=3)


class GeneratedImprovement(BaseModel):
    area: str = Field(min_length=1, max_length=120)
    action: str = Field(min_length=1, max_length=500)


class GeneratedReport(BaseModel):
    overall_score: int = Field(ge=0, le=100)
    summary: str = Field(min_length=1, max_length=1200)
    categories: list[GeneratedCategory] = Field(min_length=1, max_length=5)
    strengths: list[Annotated[str, Field(min_length=1, max_length=500)]] = Field(
        min_length=1,
        max_length=5,
    )
    improvements: list[GeneratedImprovement] = Field(min_length=1, max_length=5)


def build_verified_report(raw_report: str, session: Session) -> InterviewReport:
    """Resolve model-selected indices to exact candidate transcript evidence."""
    try:
        generated = GeneratedReport.model_validate_json(extract_json(raw_report))
    except (json.JSONDecodeError, ValidationError, ValueError) as error:
        raise RuntimeError("Evaluation provider returned an invalid report") from error

    categories: list[ReportCategory] = []
    for category in generated.categories:
        evidence = []
        for turn_index in dict.fromkeys(category.evidence_turn_indices):
            if turn_index >= len(session.transcript):
                continue
            turn = session.transcript[turn_index]
            if turn.speaker != TranscriptSpeaker.CANDIDATE:
                continue
            evidence.append(
                ReportEvidence(
                    turn_index=turn_index,
                    quote=turn.text[:500],
                )
            )

        if evidence:
            categories.append(
                ReportCategory(
                    name=category.name,
                    score=category.score,
                    rationale=category.rationale,
                    evidence=evidence,
                )
            )

    if not categories:
        raise RuntimeError("Evaluation did not reference candidate evidence")

    return InterviewReport(
        overall_score=generated.overall_score,
        summary=generated.summary,
        categories=categories,
        strengths=generated.strengths,
        improvements=[
            ReportImprovement(area=item.area, action=item.action)
            for item in generated.improvements
        ],
    )


def extract_json(value: str) -> str:
    """Accept plain JSON or one fenced JSON object from provider text output."""
    stripped = value.strip()
    if stripped.startswith("```") and stripped.endswith("```"):
        first_newline = stripped.find("\n")
        if first_newline == -1:
            raise ValueError("Empty JSON fence")
        return stripped[first_newline + 1 : -3].strip()
    return stripped
