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

Mock providers work without credentials. Real providers require these environment
variables before session creation:

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

Current implemented provider path is REST/batch HTTP. Streaming HTTP, WebSocket,
and WebRTC may be listed as provider capabilities, but they return `501` until
streaming-specific adapters are added.

Current API surface:

- `POST /api/v1/sessions`
- `GET /api/v1/sessions/{session_id}`
- `POST /api/v1/sessions/{session_id}/turns`
