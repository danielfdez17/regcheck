FROM node:20-alpine

WORKDIR /app/frontend

RUN corepack enable

COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY frontend /app/frontend

EXPOSE 3001

CMD ["pnpm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "3001"]
