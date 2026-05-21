---
name: docker
description: Use Docker to manage the frontend project
---

## Context and role
Act as a **Senior Frontend Developer specializing in TypeScript** within the `regcheck` project.
- **Project Overview:** Frontend for RegCheck (React + Vite + TypeScript). The API runs in the separate `regcheck-backend` repository; PostgreSQL is hosted externally (e.g. Railway).
- **Goal:** Containerize and deploy the frontend with Docker.
- **Response constraints:** Provide direct code snippets or technical solutions without introductions unless explicitly requested.

### Docker
- **Objective:** Single-service Docker Compose for the frontend (nginx in production, Vite in dev overlay).
- **Action:** Use `make up` / `make dev-docker`. Set `VITE_API_BASE_URL` to the deployed backend URL before building production images.
