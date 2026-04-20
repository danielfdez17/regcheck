SHELL := /usr/bin/bash
.SHELLFLAGS := -ec
ROOT  := $(dir $(lastword $(MAKEFILE_LIST)))
-include $(ROOT).env
export


BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RESET := \033[0m
CYAN := \033[0;36m
ORANGE := \033[0;31m
RED := \033[0;31m
SUCCESS := $(GREEN)✓
FAIL := $(RED)✗
INFO := $(CYAN)ℹ
WARN := $(YELLOW)⚠

DC := docker compose -f $(ROOT)docker-compose.yml
PYTHON ?= python3
VENV := .venv
VENV_BIN := $(VENV)/bin

.DEFAULT_GOAL := help
help: ## Show available targets
	@echo -e "$(CYAN)List of available targets$(RESET)"
	@echo ""
	@grep -hE '^[a-zA-Z_-]+:.*## .*$$' Makefile | \
		awk 'BEGIN {FS = ":.*## "}; {printf "  $(CYAN)%-18s$(RESET) %s\n", $$1, $$2}'
	@echo ""

# ── Development ──────────────────────────────────────────────────────────

install: ## Install frontend (Next.js) and backend (FastAPI) dependencies locally
	@echo -e "$(INFO) Installing frontend and backend dependencies…$(RESET)"
	$(PYTHON) -m venv $(VENV)
	$(VENV_BIN)/python -m pip install --upgrade pip
	npm --prefix frontend install
	$(VENV_BIN)/python -m pip install -r backend/requirements.txt
	@echo -e "$(SUCCESS) Dependencies installed$(RESET)"

dev: ## Start Next.js frontend (:3001) + FastAPI backend (:8000) locally
	@echo -e "$(INFO) Starting frontend on http://localhost:3001 and backend on http://localhost:8000$(RESET)"
	@echo -e "$(WARN) Run in two terminals:$(RESET)"
	@echo -e "  1) npm --prefix frontend run dev -- --port $${FRONTEND_PORT:-3001}"
	@echo -e "  2) $(VENV_BIN)/uvicorn app.main:app --app-dir backend --reload --host 0.0.0.0 --port $${BACKEND_PORT:-8000}"

dev-docker: ## Start full stack via Docker (Next.js :3001 + FastAPI :8000)
	@echo -e "$(INFO) Starting full stack (frontend + backend) via Docker…$(RESET)"
	$(DC) up -d --build
	@echo -e "$(SUCCESS) Stack running:$(RESET)"
	@echo -e "  Frontend:   http://localhost:$${FRONTEND_PORT:-3001}"
	@echo -e "  Backend:    http://localhost:$${BACKEND_PORT:-8000}"

up: dev-docker ## Alias for dev-docker

stop: ## Stop Docker stack
	@$(DC) stop
	@echo -e "$(SUCCESS) Stack stopped$(RESET)"

down: ## Stop and remove Docker containers + networks
	@$(DC) down
	@echo -e "$(SUCCESS) Stack removed$(RESET)"

# ── Build ────────────────────────────────────────────────────────────────

build: ## Build frontend for production and validate backend modules
	@echo -e "$(INFO) Building frontend and validating backend…$(RESET)"
	npm --prefix frontend run build
	$(VENV_BIN)/python -m compileall backend
	@echo -e "$(SUCCESS) Build complete$(RESET)"

typecheck: ## Run TypeScript type-checking for Next.js frontend
	@echo -e "$(INFO) Type-checking…$(RESET)"
	npm --prefix frontend run typecheck
	@echo -e "$(SUCCESS) No type errors$(RESET)"

# ── Analysis & Quality ──────────────────────────────────────────────────

lint: ## Run ESLint on frontend with zero-tolerance for warnings
	@echo -e "$(INFO) Linting frontend source files…$(RESET)"
	npm --prefix frontend run lint -- --max-warnings=0
	@echo -e "$(SUCCESS) No lint errors$(RESET)"

pylint: ## Run Pylint on FastAPI backend code
	@echo -e "$(INFO) Running Pylint on all Python files…$(RESET)"
	@PY_FILES=$$(find backend -type f -name '*.py' -not -path './.git/*' -not -path './.venv/*' -not -path './venv/*' -not -path './frontend/node_modules/*'); \
	if [ -z "$$PY_FILES" ]; then \
		echo -e "$(WARN) No Python files found$(RESET)"; \
	else \
		$(VENV_BIN)/python -m pylint $$PY_FILES; \
		echo -e "$(SUCCESS) Pylint analysis complete$(RESET)"; \
	fi

sonar: ## Run SonarQube Scan (requires SonarQube container up)
	@echo -e "$(INFO)Step: SonarQube Scan…$(RESET)"
	@if command -v sonar-scanner >/dev/null 2>&1; then \
		sonar-scanner; \
	else \
		echo -e "$(WARN) sonar-scanner is not installed, skipping$(RESET)"; \
	fi

audit: ## Full analysis: Typecheck + Lint + Pylint + SonarQube (requires SonarQube up)
	@echo -e "$(CYAN)══════════════════════════════════════════════════$(RESET)"
	@echo -e "$(CYAN)  Full Audit — TypeScript + ESLint + Pylint + SonarQube $(RESET)"
	@echo -e "$(CYAN)══════════════════════════════════════════════════$(RESET)"
	@$(MAKE) typecheck
	@$(MAKE) lint
	@$(MAKE) pylint
	@echo -e "$(CYAN)Step 4/4: SonarQube Scan…$(RESET)"
	@$(MAKE) sonar

ci: ## Run the same checks as GitHub Actions locally
	@$(MAKE) typecheck
	@$(MAKE) lint
	@$(MAKE) pylint

# ── Database ─────────────────────────────────────────────────────────────


# ── Reset ────────────────────────────────────────────────────────────────

re: ## Full restart: wipe everything and start fresh
	@echo -e "$(CYAN)══ Full restart ══$(RESET)"
	$(DC) down -v --remove-orphans 2>/dev/null || true
	$(DC) up -d --build
	@echo -e "$(GREEN)══ Restart complete ══$(RESET)"

clean: ## Remove frontend and backend build artifacts
	rm -rf frontend/.next frontend/node_modules backend/__pycache__ backend/.pytest_cache
	@echo -e "$(GREEN)✔ Cleaned$(RESET)"

# ── Logs ─────────────────────────────────────────────────────────────────


# ── Utilities ────────────────────────────────────────────────────────────
update-submodules: ## Update git submodules (e.g. ui-collection)
	@echo -e "$(INFO) Updating git submodules…$(RESET)"
	@git submodule update --init --recursive --remote
	@echo -e "$(SUCCESS) Submodules updated$(RESET)"

push-new-branch: ## Pushes a new branch using a script
	@bash ./vendor/scripts/git/push_to_origin.sh

merge-to-dev: ## Merges the current branch into dev using a script
	@bash ./vendor/scripts/git/merge_to_dev.sh

.PHONY: help install dev dev-docker up stop down build typecheck \
        re clean \
        lint audit ci sonar update-submodules