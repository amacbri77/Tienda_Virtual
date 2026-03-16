# Tienda Virtual Monorepo

Portable PNPM workspace for a React + Vite frontend and an Express backend using Airtable.

## Install

```bash
pnpm install
```

## Run backend

```bash
pnpm --filter @workspace/api-server dev
```

## Run frontend

```bash
pnpm --filter @workspace/joyeria dev
```

Set `VITE_API_BASE_URL` in the frontend environment if your backend runs on a custom URL.
