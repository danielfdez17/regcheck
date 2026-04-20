# 01 SQLite persistence goal

## Scope

Implement an SQLite persistence layer for GDPR entities so API responses come from durable storage instead of in-memory constants.

## Why now

- Enables future editing workflows and admin tooling.
- Prepares the backend for multi-rule growth.
- Reduces risk of drift between code and data.

## Step output

- Added SQL dependencies in backend requirements.
- Added runtime database settings in app configuration.

## Files touched

- backend/requirements.txt
- backend/app/core/config.py

## Next note

- [[02-sqlite-schema-and-seeding]]
