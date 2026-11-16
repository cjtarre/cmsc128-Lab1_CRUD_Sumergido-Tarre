# Deploy Takda over HTTPS

The production Compose stack runs Takda on one public HTTPS hostname. Caddy obtains and renews the certificate, redirects HTTP to HTTPS, and sends `/api` requests directly to the backend. The frontend uses the same public hostname for API requests. Only Caddy publishes ports.

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
