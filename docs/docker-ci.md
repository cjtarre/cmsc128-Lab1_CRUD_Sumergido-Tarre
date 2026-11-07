
# Docker and Continuous Integration

This guide explains how to run Takda with Docker Compose and how GitHub Actions checks changes before they are merged.

## 1. Overview

Takda runs two services in Docker:

- **Frontend:** React and Vite application, built with Node.js and served by Nginx.
- **Backend:** Node.js and Express REST API.

Supabase PostgreSQL and Supabase Authentication remain cloud-hosted. No database container is required.

Nginx serves the frontend and forwards requests beginning with `/api/` to the backend over the internal Docker network.

```text
Browser (http://localhost:8081)
             |
             v
      Frontend / Nginx
        |          |
        |          +--> React application
        |
        +-- /api/* --> Express backend (port 5000, internal)
                            |
                            v
                  Supabase (cloud-hosted)
```

## 2. Prerequisites

- Docker Desktop with the Linux container engine running and Docker Compose available.
- Access to the Supabase project used by Takda.
- A valid `backend/.env` file.
- Git, if cloning or updating the repository.

Node.js does not need to be installed on the host to run the containerized application. It is needed for the separate, non-Docker development workflow described in the main README.

Check Docker availability:

```bash
docker --version
docker compose version
docker info
```

## 3. Environment Configuration

Create `backend/.env` if it does not already exist. Supply the real values for the Takda Supabase project:

```dotenv
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

The Docker Compose configuration also sets:

- `PORT=5000` — the Express port inside the backend container.
- `FRONTEND_URL=http://localhost:8081` — the frontend origin used by the backend.

The Supabase service-role key has elevated privileges. **Keep it on the backend only. Never commit `.env` files or put this key in frontend code or Vite build variables.** The repository ignores `backend/.env`.

For password recovery and email verification, add the relevant redirect URLs for `http://localhost:8081` in **Supabase Dashboard → Authentication → URL Configuration**. For example, allow `/reset-password` and `/verify-email` if those are the routes used by your application.

## 4. Start Takda

Open a terminal in the repository root and run:

```bash
docker compose config --quiet
docker compose up --build -d
docker compose ps
```

Open **http://localhost:8081** in your browser.

The frontend is published to `127.0.0.1:8081` on the host. The backend listens on port `5000` inside the Docker network; it is **not** published directly to the host.

Port `8081` was selected because another local project uses port `8080`. If `8081` is occupied, change **both** the frontend port mapping and the backend `FRONTEND_URL` value in `docker-compose.yml`. Re-create the services afterward:

```bash
docker compose up -d
```

## 5. Manage Containers

Check container status:

```bash
docker compose ps
```

View recent logs:

```bash
docker compose logs --tail=100 frontend
docker compose logs --tail=100 backend
```

Stop and remove the Takda containers and network:

```bash
docker compose down
```

Start the services again without rebuilding unchanged images:

```bash
docker compose up -d
```

Rebuild after code, dependencies, or Docker configuration changes:

```bash
docker compose up --build -d
```

These commands affect the Takda Compose project, not other Docker projects running on the computer.

## 6. Verify Application Behavior

After starting the containers, manually test the main flows:

- Log in with an existing account, then refresh to check session restoration.
- Create, edit, complete, soft-delete, and restore a task.
- Open a collaborative project and verify that its data loads.
- Test invitations and project membership permissions with appropriate accounts.
- Check notifications and navigation.
- Refresh the page and confirm saved data persists in Supabase.
- Check the layout on desktop and mobile viewport sizes.

A successful Docker build or an **Up** container status does not prove that application functionality, authorization, or Supabase connectivity works correctly.

## 7. Continuous Integration (CI)

The GitHub Actions workflow is defined in `.github/workflows/ci.yml` and runs on pushes and pull requests.

| Job | Checks |
| --- | --- |
| **Frontend** | `npm ci`, Vitest tests, ESLint, Vite production build |
| **Backend** | `npm ci`, Vitest tests |
| **Docker Build Validation** | Build the Express backend image and the React/Nginx frontend image |

The Docker build job uses the repository's Dockerfiles and sets `VITE_BACKEND_URL=/` for the frontend image. Real Supabase credentials are not needed to build these images.

**Scope of CI:** The Docker job verifies that both images can be built. It does **not** start the containers, test communication between services, verify Supabase access, or deploy the application. Those checks require separate integration testing or deployment workflows.

After pushing a feature branch or opening a pull request, check the **Actions** tab on GitHub and confirm that all jobs pass. Do not assume local test results guarantee success on the GitHub runner.

## 8. Troubleshooting

### Port already in use

If Docker reports `ports are not available`, check which containers have published ports:

```bash
docker ps --format "table {{.Names}}\t{{.Ports}}"
```

Takda uses host port `8081` to avoid the existing application on `8080`. If necessary, change the frontend port mapping and `FRONTEND_URL` together in `docker-compose.yml`.

### Docker engine unavailable

If `docker info` cannot connect to the Docker API, open Docker Desktop and ensure the Linux container engine is running:

```bash
docker info
```

### Frontend loads but API requests fail

Check service status and logs:

```bash
docker compose ps
docker compose logs --tail=100 frontend
docker compose logs --tail=100 backend
```

Verify that `backend/.env` contains valid Supabase credentials. Do not post these values in issues, logs, screenshots, or pull requests.

### Changes do not appear in the browser

This configuration serves a production Vite build through Nginx; it does not provide live source reload. Rebuild the images after source changes:

```bash
docker compose up --build -d
```

## 9. Deployment Status

This configuration supports **local containerization and automated build validation**. It is not a public, always-on deployment.

Continuous Deployment (CD) will be configured separately after selecting and configuring a hosting provider. Until then, the GitHub Actions workflow runs CI checks only.
