# Interview Doctor

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
Port: 6379
URL: redis://localhost:6379/0
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
