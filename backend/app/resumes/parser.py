import os
from functools import lru_cache
from io import BytesIO
from pathlib import Path

from docling.datamodel.base_models import (
    ConversionStatus,
    DocumentStream,
    InputFormat,
)
from docling.datamodel.pipeline_options import PdfPipelineOptions
from docling.document_converter import DocumentConverter, PdfFormatOption
from docling_core.types.doc import DoclingDocument

MAX_RESUME_BYTES = 10 * 1024 * 1024
MAX_RESUME_PAGES = 20
MIN_EXTRACTED_CHARACTERS = 80
PDF_CONTENT_TYPES = frozenset({"application/pdf", "application/x-pdf"})


class ResumeValidationError(ValueError):
    pass


@lru_cache
def get_pdf_converter() -> DocumentConverter:
    artifacts_path = os.getenv("DOCLING_ARTIFACTS_PATH")
    options = PdfPipelineOptions(
        artifacts_path=artifacts_path,
        do_ocr=False,
        do_table_structure=False,
        do_code_enrichment=False,
        do_formula_enrichment=False,
        enable_remote_services=False,
        allow_external_plugins=False,
        document_timeout=90,
    )

    return DocumentConverter(
        allowed_formats=[InputFormat.PDF],
        format_options={
            InputFormat.PDF: PdfFormatOption(pipeline_options=options),
        },
    )


def parse_resume_pdf(filename: str, content_type: str, data: bytes) -> DoclingDocument:
    validate_pdf_upload(filename, content_type, data)

    try:
        result = get_pdf_converter().convert(
            DocumentStream(name=filename, stream=BytesIO(data)),
            raises_on_error=False,
            max_num_pages=MAX_RESUME_PAGES,
            max_file_size=MAX_RESUME_BYTES,
        )
    except Exception as error:
        raise ResumeValidationError(
            "Could not parse the PDF. It may be corrupt or password-protected."
        ) from error

    if result.status != ConversionStatus.SUCCESS:
        raise ResumeValidationError(
            "Could not parse the PDF. It may be corrupt or password-protected."
        )

    document = result.document

    if not document.pages or len(document.pages) > MAX_RESUME_PAGES:
        raise ResumeValidationError(
            f"Resume PDFs must contain between 1 and {MAX_RESUME_PAGES} pages."
        )

    if len(document.export_to_text().strip()) < MIN_EXTRACTED_CHARACTERS:
        raise ResumeValidationError(
            "This PDF has no readable text. Scanned resumes are not supported."
        )

    return document


def validate_pdf_upload(filename: str, content_type: str, data: bytes) -> None:
    if Path(filename).suffix.lower() != ".pdf":
        raise ResumeValidationError("Only PDF resumes are supported.")

    if content_type.lower() not in PDF_CONTENT_TYPES:
        raise ResumeValidationError("The uploaded file must have a PDF content type.")

    if not data:
        raise ResumeValidationError("The uploaded PDF is empty.")

    if len(data) > MAX_RESUME_BYTES:
        raise ResumeValidationError("The uploaded PDF must be 10 MB or smaller.")

    if not data.startswith(b"%PDF-"):
        raise ResumeValidationError("The uploaded file is not a valid PDF.")

