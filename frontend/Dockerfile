FROM node:22-alpine AS base

ENV CI=true

WORKDIR /app/frontend

RUN corepack enable

FROM base AS dependencies

COPY frontend/package.json frontend/pnpm-lock.yaml frontend/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM dependencies AS development

COPY frontend /app/frontend

EXPOSE 3001

CMD ["pnpm", "exec", "vite", "--host", "0.0.0.0", "--port", "3001", "--strictPort"]

FROM dependencies AS build

# Production browser code uses same-origin /api; do not bake a cross-origin API URL.
ARG VITE_API_BASE_URL=

COPY frontend /app/frontend
RUN VITE_API_BASE_URL= pnpm run build

FROM nginx:1.27-alpine AS runtime

COPY frontend/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY frontend/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
COPY --from=build /app/frontend/dist /usr/share/nginx/html

EXPOSE 3001

ENTRYPOINT ["/docker-entrypoint.sh"]
