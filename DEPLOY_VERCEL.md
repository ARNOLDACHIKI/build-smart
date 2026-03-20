# Deploying to Vercel

This workspace is a monorepo (`frontend` + `backend`).

## What deploys on Vercel here
- Vercel will deploy the **frontend** (Vite React app) using root `vercel.json`.
- Build output: `frontend/dist`.
- `vercel.json` already defines:
  - `installCommand`: `npm install`
  - `buildCommand`: `npm run build -w frontend`
  - `outputDirectory`: `frontend/dist`

## Required environment variable
Set this in Vercel Project Settings → Environment Variables:

- `VITE_API_BASE_URL` = your deployed backend URL
  - Example: `https://your-backend-domain.com`

Without this, frontend API calls default to same-origin `/api`, which will not work unless your backend is also served there.

## Steps
1. Push repository to GitHub (already done).
2. In Vercel, import repo: `ARNOLDACHIKI/build-smart`.
3. Keep root settings; `vercel.json` handles install/build/output.
4. Add `VITE_API_BASE_URL`.
5. Deploy.

## Notes
- SPA routes are handled by rewrite to `index.html` (non-`/api` paths).
- Backend can be hosted separately (Render, Railway, Fly.io, etc.).
- Keep the backend URL on Render in `VITE_API_BASE_URL` so frontend API calls do not target Vercel origin.
