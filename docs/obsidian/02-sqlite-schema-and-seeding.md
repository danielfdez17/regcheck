# 02 SQLite schema and seeding

## Data model

The persistence layer stores three entities:

- Domain mode: logical regulation entry (gdpr).
- Rule option: selectable rule under a domain mode.
- Checklist item: actionable output tied to one rule.

## Implementation

- Created SQLModel tables in backend/app/db/models.py.
- Added seed payloads in backend/app/gdpr/seed_data.py.
- Added initialize_database() and seed routines in backend/app/db/session.py.

## Seeding policy

Initialization is idempotent:

- Existing IDs are detected first.
- Missing rows are inserted.
- Re-running startup does not duplicate records.

## Next note

- [[03-fastapi-db-integration]]
