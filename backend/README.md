# Interview Doctor Backend

FastAPI backend skeleton for the voice AI interview platform.

## Local Development

```bash
uv run uvicorn app.main:app --reload
```

## Docker Development

```bash
docker compose up --build
```

## Provider Configuration

Provider credentials are required before session creation:

```text
DEEPGRAM_API_KEY
OPENAI_API_KEY
ANTHROPIC_API_KEY
CARTESIA_API_KEY
CARTESIA_VOICE_ID
ELEVENLABS_API_KEY
ELEVENLABS_VOICE_ID
SMALLEST_API_KEY
```

Optional model and voice overrides:

```text
DEEPGRAM_MODEL
OPENAI_MODEL
OPENAI_EMBEDDING_MODEL
OPENAI_TRANSCRIPTION_MODEL
ANTHROPIC_MODEL
CARTESIA_MODEL_ID
ELEVENLABS_MODEL_ID
ELEVENLABS_OUTPUT_FORMAT
SMALLEST_STT_MODEL
SMALLEST_STT_LANGUAGE
SMALLEST_TTS_VOICE_ID
SMALLEST_TTS_SAMPLE_RATE
SMALLEST_TTS_LANGUAGE
```

## Resume processing

Resume interviews accept PDF files only. The backend validates the extension,
content type, PDF signature, 10 MB size limit, and 20-page limit before running
Docling locally. OCR is disabled, so scanned or image-only PDFs are rejected.

Docling uses its local layout model to preserve reading order and sections. The
Docker image downloads that model at build time. `DOCLING_ARTIFACTS_PATH` can
optionally point to a pre-populated model directory in other deployments.

Parsed chunks and OpenAI embeddings are stored for 24 hours in RedisVL. Local
development exposes the vector-capable Redis Stack container on port `6380` to
avoid colliding with a conventional Redis instance on `6379`. Docker services
continue to connect internally through `redis:6379`.

Current implemented provider path is REST/batch HTTP. Streaming HTTP, WebSocket,
and WebRTC may be listed as provider capabilities, but they return `501` until
streaming-specific adapters are added.

Current API surface:

- `POST /api/v1/sessions`
- `GET /api/v1/sessions/{session_id}`
- `POST /api/v1/sessions/{session_id}/turns`
- `POST /api/v1/resumes`
