# 10-minute deploy

## Local
1. Copy `.env.example` to `.env`
2. `docker compose up --build`
3. `curl -s localhost:8080/healthz`
4. Create a customer + key via dashboard admin routes (see README)
5. `API_KEY=... npm run cli -- call /v1/echo`

## Cloud (outline)
1. Provision Postgres
2. Set `DATABASE_URL`, `PAID_BY_DEFAULT=true`, `ADMIN_TOKEN`
3. Build container and expose port 8080
4. Point DNS / reverse proxy at the service
5. Rotate admin token; issue first paid customer key

Replace this outline with your host’s exact steps (Fly, Render, Railway, etc.) when you pick one.
