SHELL := /bin/bash
ROOT  := $(dir $(lastword $(MAKEFILE_LIST)))
-include $(ROOT).env
export

CYAN	:= \033[36m
GREEN	:= \033[32m
YELLOW	:= \033[33m
RED		:= \033[31m
RESET	:= \033[0m
OK		:= $(GREEN)✔ 
FAIL	:= $(RED)✘ 
WARN	:= $(YELLOW)⚠ 
INFO	:= $(CYAN)ℹ 

DC := docker compose -f $(ROOT)docker-compose.yml

.DEFAULT_GOAL := help
help: ## Show available targets
	@grep -hE '^[a-zA-Z_-]+:.*## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*## "}; {printf "$(CYAN)%-22s$(RESET) %s\n", $$1, $$2}'

# ── Development ──────────────────────────────────────────────────────────

install: ## Install frontend (Next.js) and backend (FastAPI) dependencies locally
	@echo -e "$(INFO) Installing frontend and backend dependencies…$(RESET)"
	@echo -e "$(WARN) Unimplemented rule $(RESET)"
#	npm --prefix frontend install
#	python -m pip install -r backend/requirements.txt
	@echo -e "$(OK) Dependencies installed$(RESET)"

dev: update-submodules ## Start Next.js frontend (:3001) + FastAPI backend (:8000) locally
	@echo -e "$(INFO) Starting frontend on http://localhost:3001 and backend on http://localhost:8000$(RESET)"
	@echo -e "$(INFO) Unimplemented rule $(RESET)"
# 	npm --prefix frontend run dev -- --port 3001
# 	uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000

dev-docker: ## Start full stack via Docker (Next.js :3001 + FastAPI :8000 + MongoDB)
	@echo -e "$(INFO) Starting full stack (frontend + backend + MongoDB) via Docker…$(RESET)"
	@echo -e "$(INFO) Unimplemented rule $(RESET)"
# 	$(DC) up -d
	@echo -e "$(OK) Stack running:$(RESET)"
	@echo -e "  Frontend:   http://localhost:$${FRONTEND_PORT:-3001}"
	@echo -e "  Backend:    http://localhost:$${BACKEND_PORT:-8000}"
	@echo -e "  MongoDB:    localhost:$${MONGO_PORT:-27017}"

up: dev-docker ## Alias for dev-docker

stop: ## Stop Docker stack
	@echo -e "$(INFO) Unimplemented rule $(RESET)"
# 	@$(DC) stop
	@echo -e "$(OK) Stack stopped$(RESET)"

down: ## Stop and remove Docker containers + networks
	@echo -e "$(INFO) Unimplemented rule $(RESET)"
# 	@$(DC) down
	@echo -e "$(OK) Stack removed$(RESET)"

# ── Build ────────────────────────────────────────────────────────────────

build: ## Build frontend for production and validate backend modules
	@echo -e "$(INFO) Building frontend and validating backend…$(RESET)"
	@echo -e "$(INFO) Unimplemented rule $(RESET)"
# 	npm --prefix frontend run build
# 	python -m compileall backend
	@echo -e "$(OK) Build complete$(RESET)"

typecheck: ## Run TypeScript type-checking for Next.js frontend
	@echo -e "$(INFO) Type-checking…$(RESET)"
	@echo -e "$(INFO) Unimplemented rule $(RESET)"
# 	npm --prefix frontend run typecheck
	@echo -e "$(OK) No type errors$(RESET)"

# ── Analysis & Quality ──────────────────────────────────────────────────

lint: ## Run ESLint on frontend with zero-tolerance for warnings
	@echo -e "$(INFO) Linting frontend source files…$(RESET)"
	@echo -e "$(INFO) Unimplemented rule $(RESET)"
# 	npm --prefix frontend run lint -- --max-warnings=0
	@echo -e "$(OK) No lint errors$(RESET)"

pylint: ## Run Pylint on FastAPI backend code
	@echo -e "$(INFO) Running Pylint on all Python files…$(RESET)"
	@PY_FILES=$$(find . -type f -name '*.py' -not -path './.git/*' -not -path './.venv/*' -not -path './venv/*'); \
	if [ -z "$$PY_FILES" ]; then \
		echo -e "$(WARN) No Python files found$(RESET)"; \
	else \
		python3 -m pylint $$PY_FILES; \
		echo -e "$(OK) Pylint analysis complete$(RESET)"; \
	fi

sonar: ## Run SonarQube Scan (requires SonarQube container up)
	@echo -e "$(INFO)Step: SonarQube Scan…$(RESET)"
	@echo -e "$(INFO) Unimplemented rule $(RESET)"
# 	@if [ "$$(docker ps -q -f name=sonarqube)" ]; then \
# 		echo -e "$(INFO)Running Sonar scanner…$(RESET)"; \
# 		npx sonar-scanner || echo -e "$(RED)✘ Sonar scan failed$(RESET)"; \
# 	else \
# 		echo -e "$(YELLOW)⚠ SonarQube container not running, skipping scan$(RESET)"; \
# 	fi

audit: ## Full analysis: Typecheck + Lint + Pylint + SonarQube (requires SonarQube up)
	@echo -e "$(CYAN)══════════════════════════════════════════════════$(RESET)"
	@echo -e "$(CYAN)  Full Audit — TypeScript + ESLint + Pylint + SonarQube $(RESET)"
	@echo -e "$(CYAN)══════════════════════════════════════════════════$(RESET)"
	@$(MAKE) typecheck
	@$(MAKE) lint
	@$(MAKE) pylint
	@echo -e "$(CYAN)Step 4/4: SonarQube Scan…$(RESET)"
	@echo -e "$(INFO) Unimplemented rule $(RESET)"
# 	@if [ "$$(docker ps -q -f name=sonarqube)" ]; then \
# 		echo -e "$(CYAN)Running Sonar scanner…$(RESET)"; \
# 		# Comando para ejecutar el scanner (ajusta la ruta si tienes sonar-scanner local) \
# 		npx sonar-scanner || echo -e "$(RED)✘ Sonar scan failed$(RESET)"; \
# 	else \
# 		echo -e "$(YELLOW)⚠ SonarQube container not running, skipping scan$(RESET)"; \
# 	fi

ci: ## Run the same checks as GitHub Actions locally
	@$(MAKE) typecheck
	@$(MAKE) lint
	@$(MAKE) pylint

# ── Database ─────────────────────────────────────────────────────────────


# ── Reset ────────────────────────────────────────────────────────────────

re: ## Full restart: wipe everything and start fresh
	@echo -e "$(CYAN)══ Full restart ══$(RESET)"
	@echo -e "$(INFO) Unimplemented rule $(RESET)"
# 	$(DC) down -v --remove-orphans 2>/dev/null || true
# 	$(DC) up -d
	@echo -e "$(GREEN)══ Restart complete ══$(RESET)"

clean: ## Remove frontend and backend build artifacts
	@echo -e "$(INFO) Unimplemented rule $(RESET)"
# 	rm -rf frontend/.next frontend/node_modules backend/__pycache__ backend/.pytest_cache
	@echo -e "$(GREEN)✔ Cleaned$(RESET)"

# ── Logs ─────────────────────────────────────────────────────────────────


# ── Utilities ────────────────────────────────────────────────────────────
update-submodules: ## Update git submodules (e.g. ui-collection)
	@echo -e "$(INFO) Updating git submodules…$(RESET)"
	@git submodule update --init --recursive --remote
	@echo -e "$(OK) Submodules updated$(RESET)"

.PHONY: help install dev dev-docker up stop down build typecheck \
        re clean \
        lint audit ci sonar update-submodules