# 03 FastAPI DB integration

## Request flow

1. Application startup executes initialize_database().
2. Endpoints resolve a request-scoped Session via dependency injection.
3. GDPR catalog services query persisted rows and map to API schemas.

## Changes

- Added lifespan startup hook in backend/app/main.py.
- Injected Session into GDPR endpoints in backend/app/api/v1/gdpr.py.
- Replaced in-memory catalog logic with query-based loaders in backend/app/gdpr/catalog.py.

## Contracts preserved

- Existing endpoint paths are unchanged.
- Existing response models remain the same.
- Unknown rule IDs still return HTTP 400 with details.

## Next note

- [[04-validation-and-operations]]
