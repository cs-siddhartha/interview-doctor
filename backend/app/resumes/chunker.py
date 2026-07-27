from uuid import uuid4

import tiktoken
from docling.chunking import HybridChunker
from docling_core.transforms.chunker.tokenizer.openai import OpenAITokenizer
from docling_core.types.doc import DoclingDocument

from app.schemas.resume import ResumeChunk

CHUNK_MAX_TOKENS = 450
TOKENIZER_MODEL = "text-embedding-3-small"

def chunk_resume(document_id: str, document: DoclingDocument) -> list[ResumeChunk]:
    chunker = HybridChunker(
        tokenizer=OpenAITokenizer(
            tokenizer=tiktoken.encoding_for_model(TOKENIZER_MODEL),
            max_tokens=CHUNK_MAX_TOKENS,
        ),
        merge_peers=True,
    )
    chunks: list[ResumeChunk] = []

    for ordinal, chunk in enumerate(chunker.chunk(dl_doc=document)):
        text = chunker.contextualize(chunk).strip()

        if not text:
            continue

        page_numbers = sorted(
            {
                provenance.page_no
                for item in chunk.meta.doc_items
                for provenance in item.prov
            }
        )
        headings = chunk.meta.headings or []
        chunks.append(
            ResumeChunk(
                id=str(uuid4()),
                document_id=document_id,
                text=text,
                section=headings[-1] if headings else "",
                page_numbers=page_numbers,
                ordinal=ordinal,
            )
        )

    if not chunks:
        raise ValueError("The PDF did not produce any usable resume sections.")

    return chunks
