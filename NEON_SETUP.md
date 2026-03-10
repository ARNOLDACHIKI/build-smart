# Neon PostgreSQL Migration Guide

This project now uses backend auth with PostgreSQL via Prisma. Neon is used as the hosted PostgreSQL provider.

## 1) Create/Use a Neon project

1. Open Neon dashboard.
2. Open your project (for example `jwrc` from your screenshot).
3. Copy the PostgreSQL connection string from **Connect**.

Use either pooled or direct string. Ensure `sslmode=require` is present.

## 2) Update backend environment

Edit [backend/.env](backend/.env) and set:

```env
DATABASE_URL="postgresql://<user>:<password>@<host>/<db>?sslmode=require"
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
JWT_SECRET=dev-secret-change-in-production
JWT_EXPIRES_IN=7d
```

## 3) Apply Prisma migrations to Neon

Run in backend:

- `pnpm prisma:generate`
- `pnpm prisma:migrate`

This creates the `users` table in Neon.

## 4) Frontend configuration

Set [frontend/.env](frontend/.env):

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_API_URL=http://localhost:3000
```

## 5) Start the project

1. Backend: `cd backend && pnpm dev`
2. Frontend: `cd frontend && pnpm dev`

## 6) Verify

1. Open frontend URL from Vite output.
2. Register a new account.
3. Login with that account.
4. Check [http://localhost:3000/api/health/db](http://localhost:3000/api/health/db) returns `ok`.

## Notes

- Previous hosted-auth client integration has been removed from the app code.
- Google OAuth button was removed; current flow is email/password only.
