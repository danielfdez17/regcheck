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

# Reusable text banner: $(call print_banner,Your message)
define print_banner
echo -e "$(CYAN)══════════════════════════════════════════════════$(RESET)"; \
echo -e "$(CYAN)  $(1)$(RESET)"; \
echo -e "$(CYAN)══════════════════════════════════════════════════$(RESET)"
endef

DC := docker compose -f $(ROOT)docker-compose.yml
DC_DEV := docker compose -f $(ROOT)docker-compose.yml -f $(ROOT)docker-compose.dev.yml
PYTHON ?= python3
VENV := .venv
VENV_BIN := $(VENV)/bin
DEV_BACKEND_DATABASE_URL ?= sqlite:///./regcheck.db

.DEFAULT_GOAL := help
.PHONY: help
help: ## Show available targets
	@$(call print_banner,Show available targets)
	@echo ""
	@grep -hE '^[a-zA-Z_-]+:.*## .*$$' Makefile | \
		awk 'BEGIN {FS = ":.*## "}; {printf "  $(CYAN)%-22s$(RESET) %s\n", $$1, $$2}'
	@echo ""

# ── Development ──────────────────────────────────────────────────────────

.PHONY: install
install: ## Install frontend (Vite) and backend (FastAPI) dependencies locally
	@$(call print_banner,Install frontend (Vite) and backend (FastAPI) dependencies locally)
	@echo -e "$(INFO) Installing frontend and backend dependencies…$(RESET)"
	@$(PYTHON) -m venv $(VENV)
	@$(VENV_BIN)/python -m pip install --upgrade pip
	@pnpm --dir frontend install
	@$(VENV_BIN)/python -m pip install -r backend/requirements.txt
	@echo -e "$(SUCCESS) Dependencies installed$(RESET)"

.PHONY: dev-frontend
dev-frontend: ## Start Vite frontend only (http://localhost:3001)
	@$(call print_banner,Start Vite frontend only (http://localhost:3001))
	@echo -e "$(INFO) Starting Vite frontend on http://localhost:3001$(RESET)"
	@pnpm --dir frontend exec node scripts/dev-frontend.mjs

.PHONY: dev-backend
dev-backend: ## Start FastAPI backend only (http://localhost:8000)
	@$(call print_banner,Start FastAPI backend only (http://localhost:8000))
	@echo -e "$(INFO) Starting FastAPI backend on http://localhost:8000$(RESET)"
	@echo -e "$(INFO) Swagger UI: http://localhost:$${BACKEND_PORT:-8000}/api/docs$(RESET)"
	@REGCHECK_DATABASE_URL="$(DEV_BACKEND_DATABASE_URL)" $(VENV_BIN)/uvicorn app.main:app --app-dir backend --reload --host 0.0.0.0 --port $${BACKEND_PORT:-8000}

.PHONY: dev-docker
dev-docker: ## Start hot-reload Docker stack (Vite :3001 + FastAPI :8000 + Postgres)
	@$(call print_banner,Start hot-reload Docker stack (Vite :3001 + FastAPI :8000 + Postgres))
	@echo -e "$(INFO) Starting hot-reload stack via Docker…$(RESET)"
	@$(DC_DEV) up -d --build
	@echo -e "$(SUCCESS) Stack running:$(RESET)"
	@echo -e "  Frontend:   http://localhost:$${FRONTEND_PORT:-3001}"
	@echo -e "  Backend:    http://localhost:$${BACKEND_PORT:-8000}"
	@echo -e "  Swagger UI: http://localhost:$${BACKEND_PORT:-8000}/api/docs"
	@echo -e "              http://localhost:$${FRONTEND_PORT:-3001}/api/docs (via frontend proxy)"

.PHONY: up
up: ## Start production-like Docker stack
	@$(call print_banner,Start production-like Docker stack)
	@echo -e "$(INFO) Starting production-like stack via Docker…$(RESET)"
	@$(DC) up -d --build
	@echo -e "$(SUCCESS) Stack running:$(RESET)"
	@echo -e "  Frontend:   http://localhost:$${FRONTEND_PORT:-3001}"
	@echo -e "  Backend:    http://localhost:$${BACKEND_PORT:-8000}"
	@echo -e "  Swagger UI: http://localhost:$${BACKEND_PORT:-8000}/api/docs"
	@echo -e "              http://localhost:$${FRONTEND_PORT:-3001}/api/docs (via frontend proxy)"

.PHONY: stop
stop: ## Stop Docker stack
	@$(call print_banner,Stop Docker stack)
	@$(DC_DEV) stop
	@echo -e "$(SUCCESS) Stack stopped$(RESET)"

.PHONY: down
down: ## Stop and remove Docker containers + networks
	@$(call print_banner,Stop and remove Docker containers + networks)
	@$(DC_DEV) down --remove-orphans
	@echo -e "$(SUCCESS) Stack removed$(RESET)"

# ── Build ────────────────────────────────────────────────────────────────

.PHONY: build
build: ## Build frontend for production and validate backend modules
	@$(call print_banner,Build frontend for production and validate backend modules)
	@pnpm --dir frontend run build
	@$(VENV_BIN)/python -m compileall backend
	@echo -e "$(SUCCESS) Build complete$(RESET)"

.PHONY: build-docker
build-docker: ## Build production Docker images
	@$(call print_banner,Build production Docker images)
	@$(DC) build
	@echo -e "$(SUCCESS) Docker images built$(RESET)"

.PHONY: typecheck
typecheck: ## Run TypeScript type-checking for Vite frontend
	@$(call print_banner,Run TypeScript type-checking for Vite frontend)
	@pnpm --dir frontend run typecheck
	@echo -e "$(SUCCESS) No type errors$(RESET)"

# ── Analysis & Quality ──────────────────────────────────────────────────

.PHONY: lint
lint: ## Run ESLint on frontend with zero-tolerance for warnings
	@$(call print_banner,Run ESLint on frontend with zero-tolerance for warnings)
	@pnpm --dir frontend run lint
	@echo -e "$(SUCCESS) No lint errors$(RESET)"

.PHONY: pylint
pylint: ## Run Pylint on FastAPI backend code
	@$(call print_banner,Run Pylint on FastAPI backend code)
	@PY_FILES=$$(find backend -type f -name '*.py' -not -path './.git/*' -not -path './.venv/*' -not -path './venv/*' -not -path './frontend/node_modules/*'); \
	if [ -z "$$PY_FILES" ]; then \
		echo -e "$(WARN) No Python files found$(RESET)"; \
	else \
		$(VENV_BIN)/python -m pylint $$PY_FILES; \
		echo -e "$(SUCCESS) Pylint analysis complete$(RESET)"; \
	fi

.PHONY: audit
audit: ## Full analysis: Typecheck + Lint + Pylint + SonarQube (requires SonarQube up)
	@$(call print_banner,Full analysis: Typecheck + Lint + Pylint + SonarQube (requires SonarQube up))
	@$(MAKE) -s typecheck
	@$(MAKE) -s lint
	@$(MAKE) -s pylint

.PHONY: ci
ci: ## Run local CI checks
	@$(call print_banner,Run local CI checks)
	@$(MAKE) -s typecheck
	@$(MAKE) -s lint
	@$(MAKE) -s build

# ── Database ─────────────────────────────────────────────────────────────

# ── Reset ────────────────────────────────────────────────────────────────

.PHONY: re
re: ## Full restart: wipe everything and start fresh
	@$(call print_banner,Full Restart: wipe everything and start fresh)
	@echo -e "$(CYAN)══ Full restart ══$(RESET)"
	@$(DC_DEV) down -v --remove-orphans 2>/dev/null || true
	@$(DC_DEV) up -d --build
	@echo -e "$(GREEN)══ Restart complete ══$(RESET)"

.PHONY: logs
logs: ## Follow Docker stack logs
	@$(call print_banner,Follow Docker stack logs)
	@$(DC_DEV) logs -f

.PHONY: clean
clean: ## Remove frontend and backend build artifacts
	@$(call print_banner,Remove frontend and backend build artifacts)
	@rm -rf frontend/dist frontend/.next frontend/node_modules backend/__pycache__ backend/.pytest_cache
	@echo -e "$(GREEN)✔ Cleaned$(RESET)"

# ── Logs ─────────────────────────────────────────────────────────────────


# ── Utilities ────────────────────────────────────────────────────────────

.PHONY: update-submodules
update-submodules: ## Update git submodules
	@$(call print_banner,Update git submodules)
	@echo -e "$(INFO) Updating git submodules…$(RESET)"
	@git submodule update --init --recursive --remote
	@echo -e "$(SUCCESS) Submodules updated$(RESET)"

.PHONY: push-new-branch
push-new-branch: ## Pushes a new branch using a script
	@bash ./vendor/scripts/git/push_to_origin.sh

.PHONY: merge-to-dev
merge-to-dev: ## Merges the current branch into dev using a script
	@bash ./vendor/scripts/git/merge_to_dev.sh

.PHONY: merge-dev-to-main
merge-dev-to-main: ## Merges the develop branch into the main branch using a script
	@bash ./vendor/scripts/git/merge_dev_to_main.sh

.PHONY: delete-local-branches
delete-local-branches: ## Deletes local branches except main and develop
	@bash ./vendor/scripts/git/delete_all_local_branches.sh

.PHONY: ensure-env
ensure-env: ## Ensures the .env file is present
	@$(call print_banner,Ensure .env file is present)
	@if [ ! -f .env ]; then \
		echo -e "$(WARN) .env file not found. Please create it using .env.example as a template.$(RESET)"; \
		cp .env.example .env; \
		echo -e "$(SUCCESS) .env file created from .env.example$(RESET)"; \
	fi
	@echo -e "$(SUCCESS) .env file present$(RESET)"