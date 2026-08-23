# Interview Doctor

## Environment configuration

The application reads provider configuration from environment files; no URL
exports are required in the terminal. Docker Compose defines its internal
service URLs directly.

For the complete Docker setup, add the provider credentials you plan to use to
`backend/.env`, then start the application:

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
