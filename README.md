# RegCheck - Rules to actionable list translator

# 🚀 MVP

### 💡 What it does

An enterprise introduces:

- Type of company (small enterprise, SaaS, etc...)
- Rules to be applied (e.g. GDPR, ISO/IEC 27001)

The project returns:

- Clear checklist of fullfil
- Priority classified
- To-do actions list

---

## 🎯 Minimum functionalities

1. **Rule selector**
   - GDPR

2. **Basic engine (simple rules)**
   - Example:
     - "If you handle personal data -> you need privacy policies"
     - "If you have employees -> treatment activity registration"

3. **Checklist generation**
   - Status: pending / in progress / done

4. **Basic export**
   - PDF or CSV or Markdown

---

## 🧱 Fast implementation

- Backend: Python (FastAPI) o Node.js
- Frontend: React
- Database: SQLite

---

## 🎁 Real value that can be sold

- Simplifies complex rules
- Useful for small companies

---

## 🛠️ Infrastructure bootstrapped

Current stack scaffold:

- Backend: FastAPI (Python)
- Frontend: Vite + React + TypeScript
- Local quality checks: typecheck, lint, pylint
- Containerized dev stack: Docker Compose (frontend + backend)

### Quick start

1. Copy environment defaults:
   - `cp .env.example .env`
2. Install dependencies in project-local environments:
   - `make install`
3. Validate project quality checks:
   - `make ci`
4. Run app with containers:
   - `make dev-docker`
5. Run the frontend locally with restart controls:
   - `make dev-frontend`
   - Type `r` and press `Enter` to restart the Vite server without stopping the terminal session.

Endpoints:

- Frontend: http://localhost:3001
- Backend: http://localhost:8000
- Health: http://localhost:8000/api/v1/health

---

# 🗓️ ONE MONTH PLANNING

## Week 1

- Scop definition: GDPR only
- Control structure design
- Basic backend

## Week 2

- Frontend + functional checklist
- Working MVP

## Week 3

- Add self evaluation
- Scoring logic

## Week 4

- UX, export, polish
- Final demo

---

# ⚠️ Key decisions

- ❗ Starting with **only one rule**
- ❗ No integrations automation
- ❗ UX clear and simple is high priority

---

# 🧭 Value of the app

Making the rules **understandable and actionable**
