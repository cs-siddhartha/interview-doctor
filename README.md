# Interview Doctor

## Environment configuration

The application reads provider configuration from environment files; no URL
exports are required in the terminal. Docker Compose defines its internal
service URLs directly.

For the complete Docker setup, add provider credentials and backend access
settings to `backend/.env`, then add the app passphrase and matching backend
token to `frontend/.env` before starting the application:

```bash
docker compose up --build
```

For host-run development, create the service-specific environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

FastAPI loads `backend/.env` through `python-dotenv`, and Next.js loads
`frontend/.env.local` automatically.

Set `APP_ACCESS_TOKEN` in the frontend environment to the private passphrase
used to enter the application. Set `BACKEND_API_TOKEN` to a separate random
value in both frontend and backend environments; it authenticates server-side
API requests and signs short-lived realtime socket access. Set the backend
`FRONTEND_ORIGINS` value to the comma-separated browser origins allowed to open
realtime sockets.

## Data handling

Interview sessions, transcripts, and reports expire one hour after creation.
Processed resume text and embeddings expire after 24 hours; the uploaded PDF
bytes are not persisted. Resume embeddings and retrieval queries use OpenAI,
and resume upload requires explicit consent in the setup screen. Completed
interviews also provide a control that immediately deletes the session and its
linked resume vectors.

## Local Infrastructure

Use Docker Compose only for local Postgres and Redis:

```bash
docker compose up postgres redis
```

Postgres:

```text
Host: localhost
Port: 5432
Database: interview_doctor
User: interview_doctor
Password: interview_doctor
URL: postgresql://interview_doctor:interview_doctor@localhost:5432/interview_doctor
```

Redis:

```text
Host: localhost
Port: 6380
URL: redis://localhost:6380/0
```

Stop the services:

```bash
docker compose stop postgres redis
```

Remove containers while keeping local data volumes:

```bash
docker compose down
```

Remove containers and delete local Postgres/Redis data:

```bash
docker compose down -v
```
