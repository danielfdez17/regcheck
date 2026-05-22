# RegCheck Frontend

React + Vite + TypeScript UI for RegCheck. The API lives in [regcheck-backend](https://github.com/your-org/regcheck-backend).

## Quick start (development)

1. `cp .env.example .env`
2. `make install`
3. Start backend in **regcheck-backend**: `make dev` (port 8000)
4. Start frontend: `make dev` → http://localhost:3001

API calls go directly to `VITE_API_BASE_URL` (`http://localhost:8000`).

## Local production testing

Backend must be running on port 8000.

| Command | How the API is reached |
|--------|-------------------------|
| `make preview` | Production build; browser → `http://localhost:8000` |
| `make up` | Docker + nginx on :3001; browser → `http://localhost:8000` (same as dev) |

```bash
# Option A: Vite preview (no Docker)
make preview

# Option B: Production-like nginx container
make up
```

## Docker / Railway (deployed frontend)

```bash
make up   # local only; see above
```

On Railway, set:

```env
REGCHECK_API_BASE_URL=https://your-backend.up.railway.app
```

The browser uses same-origin `/api/...`; nginx proxies to the backend (no CORS). Do not point the SPA at the backend URL on Railway.

## Quality checks

```bash
make ci
```

## PDF generation
The PDF report has been generated from the markdown file [[PROJECT-REPORT]] using a [python script](https://github.com/danielfdez17/univers42scripts/blob/main-functional/md-to-pdf/md-to-pdf.py).

To generate a PDF from a Markdown file using the python script mentioned above execute the following commands:
```
git clone https://github.com/danielfdez17/univers42scripts.git
cd univers42scripts
git switch main-functional
cd md-to-pdf
python3 -m venv myvenv
source /myvenv/bin/activate
pip install -r requiremnts.txt
python3 md-to-pdf.py <route/to/desired/mardown_file.MD>
```

> [!important] After running those commands both PDF and HTML files will be generated in the same route of the markdown file.
