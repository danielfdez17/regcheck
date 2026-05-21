# RegCheck Frontend

React + Vite + TypeScript UI for RegCheck. The API lives in [regcheck-backend](https://github.com/your-org/regcheck-backend); PostgreSQL is deployed separately (e.g. Railway).

## Quick start

1. Copy environment defaults:
   - `cp .env.example .env`
2. Set `VITE_API_BASE_URL` to your backend **full URL** including `https://` (e.g. `https://regcheck-backend.up.railway.app`). A bare hostname like `regcheck-backend` is auto-corrected to `https://regcheck-backend`, but the public Railway URL is preferred.
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

### Railway (frontend service)

Set **`VITE_API_BASE_URL` at build time** to the public backend URL, for example:

`https://regcheck-backend.up.railway.app`

Do not use a path-only value like `/regcheck-backend` — the browser would call the frontend host instead of the API.

## Quality checks

```bash
make ci
```
