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

The initial API surface is mock-only:

- `POST /api/v1/sessions`
