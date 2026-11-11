# Clinic Patient History System

Spring Boot API and React frontend for clinic patient history workflows.

## Database target

The backend is configured for PostgreSQL and can connect to a local PostgreSQL
container or a Supabase PostgreSQL project. Database credentials and JWT signing
keys are supplied through environment variables; no production credentials belong
in the repository.

### Local configuration

1. Copy `.env.example` to `.env` and replace all secret placeholders with unique
   local values. Do not commit `.env`.
2. Start the services with `docker compose up --build`.
3. The API listens on `http://localhost:5000/api`; the frontend is at
   `http://localhost:8080`.

The Compose stack starts PostgreSQL and waits for its health check before starting
the API. Stop it with `docker compose down`; add `-v` only when intentionally
deleting the local database volume.

### Supabase setup

1. Create a Supabase project and set its database password in a secret manager.
2. In **Project Settings → Database → Connection string**, choose a direct
   connection when the hosting network supports it, or the session pooler for
   deployments that require pooling. Do not use the transaction pooler for
   session-bound refcursor operations.
3. Set `DB_URL` to a JDBC URL in the form
   `jdbc:postgresql://<host>:<port>/<database>?sslmode=require`, `DB_USER` and
   `DB_PASSWORD` to the Supabase connection values, and `DB_SSLMODE=require`.
   Set `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL`, and
   `AUTH_COOKIE_SECURE=true` in the backend deployment environment.
4. Apply the PostgreSQL schema, functions, indexes, and seed data before
   connecting the API. Keep application access limited to the required database
   role and protect patient records according to the deployment's privacy and
   retention requirements.

`DB_URL` overrides the local host/port/database settings. Do not put credentials
in a committed environment example, URL in source control, or frontend variables.

## GitHub Pages frontend

The GitHub Actions workflow builds and deploys the static frontend to GitHub Pages.
In the repository's **Settings → Pages**, set the build and deployment source to
**GitHub Actions**. The resulting site is served at
`https://d3vsolodev.github.io/clinic-patient-history-system/`.

GitHub Pages hosts only the React frontend; it does not run the Spring Boot API or
database. Until a backend is deployed, the frontend cannot load or save application
data. Before deploying a backend, set the repository Actions variable
`VITE_API_URL` to its HTTPS `/api` URL and configure that backend's CORS and
`CLIENT_URL` to allow the Pages site.

## Database migration status

The Java datasource and JDBC driver now target PostgreSQL. The existing SQL files
under `database/` are the original SQL Server scripts (`GO`, `IDENTITY`, T-SQL
procedures, and SQL Server-specific expressions); they are **not PostgreSQL
migrations** and must not be applied to PostgreSQL or Supabase. The application
executor expects PostgreSQL functions named for the existing `sp_*` operations,
returning `SETOF refcursor` so existing repository result-set ordering can be
preserved. The PostgreSQL schema and those function definitions still need to be
ported before the API can serve database-backed requests. This repository state
is therefore not yet a complete or deployable database cutover.

The frontend routes and API contracts remain unchanged. No Supabase project is
provisioned by this repository.
