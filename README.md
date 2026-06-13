# Local setup without docker is described in the individual project READMEs.
<b>frontend: </b>

```nmp install```

```npm start```

<b>Backend:</b>

```.\gradlew.bat build```

Add db user and password and database name in the config.

For the first run - set this option to true to make a user created and active:
```app.user.active-on-registration=${APP_USER_ACTIVE_ON_REGISTRATION:true}```

start the backend: 
```.\gradlew.bat bootRun```

<b>Postgress:</b>

install postgress db locally, set user and password.

Run init scipt to create all necessary tables - [001_schema.sql](docker/postgres/init/001_schema.sql)BorrowABook/src/main/resources/data.sql



# BorrowABook Docker Setup

### Never tested with docker!

This repository now has a containerized setup for:
- Backend: Spring Boot (`BorrowABook`)
- Frontend: React + Nginx (`BorrowABookFrontend`)
- Database: official `postgres:16-alpine`

## Files Added

- `docker-compose.yml`
- `.env.example`
- `BorrowABook/Dockerfile`
- `BorrowABook/.dockerignore`
- `BorrowABookFrontend/Dockerfile`
- `BorrowABookFrontend/nginx.conf`
- `BorrowABookFrontend/.dockerignore`
- `docker/postgres/init/001_schema.sql`

Postgres runs `docker/postgres/init/001_schema.sql` on first boot (when the DB volume is empty), creating all required tables, constraints, and indexes.

Backend auth emails (registration + forgot-password) are configurable via `.env` (`APP_MAIL_ENABLED`, `SPRING_MAIL_*`, `APP_MAIL_FROM`).

## 1) Local Run

Create `.env` from `.env.example` and optionally adjust values.

```powershell
Set-Location "C:\zaibatsu\playground\BorrowABook"
Copy-Item .env.example .env
```

Start the full stack:

```powershell
Set-Location "C:\zaibatsu\playground\BorrowABook"
docker compose up --build -d
```

Stop and remove containers:

```powershell
Set-Location "C:\zaibatsu\playground\BorrowABook"
docker compose down
```

Stop and remove containers + DB volume:

```powershell
Set-Location "C:\zaibatsu\playground\BorrowABook"
docker compose down -v
```

If you update SQL init scripts and want them to re-run, remove the DB volume (`down -v`) before starting again.

## 2) Local Access

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`
- Postgres: `localhost:5432`

## 3) Deployment Notes (Remote Server/Cloud)

Use the same compose file on a VM or container host.

1. Install Docker + Docker Compose plugin.
2. Copy repo to the host.
3. Create `.env` with secure values (especially `POSTGRES_PASSWORD`).
4. Run:

```bash
docker compose pull
docker compose up --build -d
```

For safer production rollout later:
- Use image tags from CI/CD and replace local builds with `image:` references.
- Put secrets in cloud secret manager (not plain `.env`).
- Use managed Postgres if available and set `SPRING_DATASOURCE_URL` accordingly.
- Add TLS termination via reverse proxy or cloud load balancer.

