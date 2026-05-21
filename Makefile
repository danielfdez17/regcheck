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
RED := \033[0;31m
SUCCESS := $(GREEN)✓
INFO := $(CYAN)ℹ
WARN := $(YELLOW)⚠

define print_banner
echo -e "$(CYAN)══════════════════════════════════════════════════$(RESET)"; \
echo -e "$(CYAN)  $(1)$(RESET)"; \
echo -e "$(CYAN)══════════════════════════════════════════════════$(RESET)"
endef

DC := docker compose -f $(ROOT)docker-compose.yml
DC_DEV := docker compose -f $(ROOT)docker-compose.yml -f $(ROOT)docker-compose.dev.yml

.DEFAULT_GOAL := help
.PHONY: help
help: ## Show available targets
	@$(call print_banner,Show available targets)
	@echo ""
	@grep -hE '^[a-zA-Z_-]+:.*## .*$$' Makefile | \
		awk 'BEGIN {FS = ":.*## "}; {printf "  $(CYAN)%-22s$(RESET) %s\n", $$1, $$2}'
	@echo ""

.PHONY: install
install: ## Install frontend (Vite) dependencies locally
	@$(call print_banner,Install frontend dependencies locally)
	@echo -e "$(INFO) Installing frontend dependencies…$(RESET)"
	@pnpm --dir frontend install
	@echo -e "$(SUCCESS) Dependencies installed$(RESET)"

.PHONY: dev
dev: ## Start Vite frontend only (http://localhost:3001)
	@$(call print_banner,Start Vite frontend only)
	@echo -e "$(INFO) Starting Vite frontend on http://localhost:3001$(RESET)"
	@echo -e "$(INFO) API base URL: $${VITE_API_BASE_URL:-http://localhost:8000}$(RESET)"
	@pnpm --dir frontend exec node scripts/dev-frontend.mjs

.PHONY: dev-docker
dev-docker: ## Start hot-reload frontend container (Vite :3001)
	@$(call print_banner,Start hot-reload frontend via Docker)
	@echo -e "$(INFO) Starting frontend dev container…$(RESET)"
	@$(DC_DEV) up -d --build
	@echo -e "$(SUCCESS) Frontend running: http://localhost:$${FRONTEND_PORT:-3001}$(RESET)"

.PHONY: up
up: ## Start production-like frontend container
	@$(call print_banner,Start production-like frontend container)
	@echo -e "$(INFO) Starting frontend via Docker…$(RESET)"
	@$(DC) up -d --build
	@echo -e "$(SUCCESS) Frontend running: http://localhost:$${FRONTEND_PORT:-3001}$(RESET)"

.PHONY: stop
stop: ## Stop Docker frontend container
	@$(call print_banner,Stop Docker frontend container)
	@$(DC_DEV) stop
	@echo -e "$(SUCCESS) Container stopped$(RESET)"

.PHONY: down
down: ## Stop and remove Docker containers + networks
	@$(call print_banner,Stop and remove Docker containers)
	@$(DC_DEV) down --remove-orphans
	@echo -e "$(SUCCESS) Container removed$(RESET)"

.PHONY: build
build: ## Build frontend for production
	@$(call print_banner,Build frontend for production)
	@pnpm --dir frontend run build
	@echo -e "$(SUCCESS) Build complete$(RESET)"

.PHONY: build-docker
build-docker: ## Build production Docker image
	@$(call print_banner,Build production Docker image)
	@$(DC) build
	@echo -e "$(SUCCESS) Docker image built$(RESET)"

.PHONY: typecheck
typecheck: ## Run TypeScript type-checking
	@$(call print_banner,Run TypeScript type-checking)
	@pnpm --dir frontend run typecheck
	@echo -e "$(SUCCESS) No type errors$(RESET)"

.PHONY: lint
lint: ## Run ESLint with zero-tolerance for warnings
	@$(call print_banner,Run ESLint)
	@pnpm --dir frontend run lint
	@echo -e "$(SUCCESS) No lint errors$(RESET)"

.PHONY: ci
ci: ## Run local CI checks
	@$(call print_banner,Run local CI checks)
	@$(MAKE) -s typecheck
	@$(MAKE) -s lint
	@$(MAKE) -s build

.PHONY: logs
logs: ## Follow Docker frontend logs
	@$(call print_banner,Follow Docker frontend logs)
	@$(DC_DEV) logs -f

.PHONY: clean
clean: ## Remove frontend build artifacts
	@$(call print_banner,Remove frontend build artifacts)
	@rm -rf frontend/dist frontend/node_modules
	@echo -e "$(SUCCESS) Cleaned$(RESET)"

.PHONY: ensure-env
ensure-env: ## Ensure the .env file is present
	@$(call print_banner,Ensure .env file is present)
	@if [ ! -f .env ]; then \
		echo -e "$(WARN) .env file not found. Creating from .env.example…$(RESET)"; \
		cp .env.example .env; \
		echo -e "$(SUCCESS) .env file created$(RESET)"; \
	fi
