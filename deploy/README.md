# Takda Deployment Guide

## Public Application and API

| Purpose | URL |
| --- | --- |
| Application users open | https://takda.smoldergs.studio/ |
| Express API used by the frontend | https://cmsc128-lab1-crud-sumergido-tarre.onrender.com |

Render hosts the frontend as a Static Site and the backend as a Docker-based Web Service. Supabase hosts the database and authentication. The static frontend consists of built HTML, CSS, and JavaScript; browser code calls Express for application data and authentication operations.

## Render Configuration

Confirm these settings against the existing services before changing them. The repository does not contain the dashboard's current settings or deployed commit IDs.

### Frontend Static Site

For a service with Root Directory `frontend`, use:

- Build command: `npm ci && npm run build`
- Publish directory: `dist`
- Environment variable: `VITE_BACKEND_URL=https://cmsc128-lab1-crud-sumergido-tarre.onrender.com`
- SPA rewrite: `/*` to `/index.html`, with action **Rewrite**, so direct React route visits work.

`VITE_BACKEND_URL` is included during the Vite build. Rebuild/redeploy the frontend after changing it. Never place Supabase service-role credentials in frontend variables.

Confirm which frontend service owns the custom domain. Once the custom domain works, the frontend's default Render subdomain can be disabled in that service's Custom Domains settings if only one application address is supported. Do not disable the backend's Render subdomain; the frontend calls it.

### Backend Docker Service

Use the repository's `backend/Dockerfile` with build context `backend` (or Root Directory `backend` and Dockerfile path `Dockerfile`, according to the existing dashboard configuration).

Set backend environment variables in Render:

```env
FRONTEND_URL=https://takda.smoldergs.studio
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

Use real credentials only in the hosting dashboard. `FRONTEND_URL` must be the browser origin without a trailing slash. It configures CORS and authentication redirects. The service uses `process.env.PORT` when supplied by Render.

Configure the health-check path as `/api/health`. A successful response confirms that Express is reachable; it does not independently prove database access or login correctness.

### Supabase Authentication

Use `https://takda.smoldergs.studio` as the production Site URL and allow the application redirects:

- `https://takda.smoldergs.studio/reset-password`
- `https://takda.smoldergs.studio/verify-email`

Keep any development redirect URLs that are still required.

## CI and Deployment Branches

GitHub Actions runs tests, linting, frontend builds, and Docker image build validation through `.github/workflows/ci.yml`.

The final deployed source must be on `main` after `act4-refactor` is merged. Confirm the repository, linked branch, and live commit for both Render services. Render settings can deploy automatically **After CI Checks Pass** when the services are connected to the Git provider and CI runs on that branch. Confirm a successful deploy in the dashboard before describing this automation as verified.

The SSH/Docker Compose workflow proposed on `feature/production-deployment` targets a Linux server. It is not required for Render-managed deploys and should not be merged unchanged as the Render CD configuration.

## Verification Before Submission

1. Open the application URL from another device/network and confirm login.
2. Create and edit a task, refresh, log out/in, and confirm the saved changes remain.
3. Check a collaborative project and role restrictions with appropriate test accounts.
4. Verify password recovery/email redirects and direct navigation to a protected route after refresh.
5. Confirm both Render services deployed the intended final commit and record any checks not yet completed.

The developer reported the custom-domain application functioning in Chrome and Edge. That report does not establish completion of every check above. The default frontend Render address currently receives a CORS failure because the backend allows the custom-domain origin.

If the backend uses Render's Free instance type, it may sleep after inactivity and take about a minute to wake up. Document this if applicable; do not describe a free sleeping service as continuously running.

---

# Alternative: Docker Compose on a Linux Server

This optional setup uses `docker-compose.production.yml` and Caddy on a Linux server. It is separate from the Render deployment described above. The Compose stack runs Takda on one public HTTPS hostname. Caddy obtains and renews the certificate, redirects HTTP to HTTPS, and sends `/api` requests directly to the backend. The frontend uses the same public hostname for API requests. Only Caddy publishes ports.

The local Docker demo still uses `docker compose up --build` and opens at `http://localhost:8081`.

## Prepare the host

1. Choose a Linux host with Docker and Docker Compose. Point the domain's DNS records to that host and allow inbound TCP on ports 80 and 443.
2. Create `.env.production` in the repository root with `TAKDA_DOMAIN=takda.example.com`. Replace the example with the public hostname and omit the protocol and path.
3. Create `backend/.env` on the host with `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` for the deployment. Keep the service-role key on the server and keep both environment files out of Git.
4. In Supabase Auth URL Configuration, add `https://takda.example.com/reset-password` to the allowed redirect URLs. For a Supabase project dedicated to production, set its Site URL to the production origin as well.

## Start and verify

```sh
docker compose --env-file .env.production -f docker-compose.production.yml config --quiet
docker compose --env-file .env.production -f docker-compose.production.yml up -d --build
docker compose --env-file .env.production -f docker-compose.production.yml ps
```

Replace the hostname in the checks below.

```sh
curl -I http://takda.example.com/
curl -fsS https://takda.example.com/api/health
```

The HTTP request should redirect to HTTPS. The HTTPS health endpoint should return `{"status":"ok"}`, which checks that Express is responding. Also sign in with a test account, verify the password reset link, and open Focus Mode and Picture-in-Picture in a supported desktop browser.

If issuance fails, check Caddy's logs and verify DNS and port access from outside the server.

```sh
docker compose --env-file .env.production -f docker-compose.production.yml logs caddy
```

Keep the `caddy_data` volume when restarting or upgrading so Caddy can reuse its certificates and ACME account. The backend trusts one proxy hop in this stack. Keep the backend port unpublished and route public API traffic through Caddy.
