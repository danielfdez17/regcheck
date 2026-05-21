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

Set a **runtime** variable on the frontend service (no rebuild needed when only the backend URL changes):

```env
REGCHECK_API_BASE_URL=https://your-backend.up.railway.app
```

Use the full public backend URL including `https://`. On each container start, this is written to `/runtime-config.js` and used for all API calls.

You may also set `VITE_API_BASE_URL` at **build time** as a fallback, but `REGCHECK_API_BASE_URL` at runtime is what fixes split-host deploys.

## Quality checks

```bash
make ci
```
