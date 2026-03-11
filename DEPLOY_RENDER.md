# Deploy Backend on Render

Use a **Render Web Service** for the backend.

## Recommended Render settings

- **Root Directory:** leave blank (use the repo root)
- **Environment:** Node
- **Branch:** `main`
- **Build Command:**
  ```bash
  npm install && npm run build -w backend && cd backend && npx prisma generate && npx prisma migrate deploy
  ```
- **Start Command:**
  ```bash
  npm run start -w backend
  ```

## Why use the repo root?

This repo is an npm workspace monorepo. The backend builds cleanly from the workspace root with:

```bash
npm run build -w backend
```

Using the repo root also matches the successful Render install/build behavior already seen in deployment logs.

## Required environment variables

Set these in Render:

- `NODE_ENV=production`
- `DATABASE_URL=your-neon-production-connection-string`
- `JWT_SECRET=your-long-random-secret`
- `JWT_EXPIRES_IN=7d`
- `FRONTEND_URL=https://your-frontend-domain.vercel.app`
- `DEV_AUTH_BYPASS=false`

## Notes

- Do **not** set `PORT`; Render injects it automatically.
- If `DATABASE_URL` was ever shared publicly, rotate it in Neon before deploying.
- `npx prisma migrate deploy` is included in the build so production schema changes are applied during deploy.
- If your frontend uses a custom domain, set `FRONTEND_URL` to that final HTTPS origin.

## After saving Render settings

Redeploy the service from Render. Once it is live, update the frontend env on Vercel if needed:

- `VITE_API_BASE_URL=https://your-render-service.onrender.com`
