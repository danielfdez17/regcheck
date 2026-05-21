# RegCheck Frontend

React + Vite + TypeScript UI for RegCheck. The API lives in [regcheck-backend](https://github.com/your-org/regcheck-backend); PostgreSQL is deployed separately (e.g. Railway).

## Quick start

1. Copy environment defaults:
   - `cp .env.example .env`
2. Set `VITE_API_BASE_URL` to your backend URL (local: `http://localhost:8000`).
3. Install and run:
   - `make install`
   - `make dev`

Endpoints:

- Frontend: http://localhost:3001
- Backend (separate repo): configure via `VITE_API_BASE_URL`

## Docker

Production-like static build + nginx:

```bash
make up
```

Hot-reload dev container:

```bash
make dev-docker
```

Set `VITE_API_BASE_URL` in `.env` before `make up` so the built assets call the correct API.

## Quality checks

```bash
make ci
```
