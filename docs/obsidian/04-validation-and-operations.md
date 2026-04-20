# 04 Validation and operations

## Validation checklist

- Run make install after dependency changes.
- Run make pylint for backend quality checks.
- Run make dev-backend and verify health and GDPR endpoints.

## Runbook

- Default DB URL: sqlite:///./regcheck.db
- Override with REGCHECK_DATABASE_URL when needed.
- Optional SQL debug logs: REGCHECK_DB_ECHO=true

## Future hardening

- Add Alembic migration environment and first revision.
- Add repository-level tests for catalog query functions.
- Add CRUD endpoints for checklist status updates.

## Back links

- [[00-index]]
- [[03-fastapi-db-integration]]
