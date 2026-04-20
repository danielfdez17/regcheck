# 05 Frontend backend integration

## Integration summary

The homepage now calls live backend endpoints instead of rendering static checklist placeholders.

## Implementation steps

- Added a typed API client in frontend/lib/regcheck-api.ts.
- Added server-side data loading in frontend/app/page.tsx.
- Added connection state rendering (connected or disconnected).
- Added container-safe backend URL in docker-compose frontend environment.

## Runtime behavior

1. Frontend requests /api/v1/gdpr/rule-selector.
2. Frontend requests /api/v1/gdpr/checklists for the first rule.
3. UI renders rule and checklist items from backend payload.
4. If backend is unavailable, UI renders a fallback status note.

## Browser access

- The checklist POST is called from the browser, so the backend must allow the frontend origin through CORS.
- This prevents the OPTIONS preflight from failing with HTTP 405 during local testing.
- The frontend origin is configurable with REGCHECK_FRONTEND_ORIGIN.

## Tester flow

1. Open the homepage.
2. Select one or more GDPR rules.
3. Click Generate checklist.
4. Review the live checklist response rendered from the API.
5. Confirm the UI shows a generated timestamp/message after each successful request.

## Validation

- Run make typecheck
- Run make lint
- Run make pylint
- Run make dev-docker and open frontend on port 3001

## Back links

- [[00-index]]
- [[03-fastapi-db-integration]]
