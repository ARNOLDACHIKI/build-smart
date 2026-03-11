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

## Optional environment variables

Set these only if you want to customize the defaults:

- `ASSISTANT_CHAT_LIMIT=12`
- `ASSISTANT_DAILY_MESSAGE_LIMIT=50`
- `OLLAMA_BASE_URL=http://127.0.0.1:11434`
- `OLLAMA_MODEL=llama3.1`
- `OLLAMA_TIMEOUT_MS=12000`

## Variables you should not set in production

These are only for local development and should usually be omitted in Render:

- `DEV_ENGINEER_EMAIL`
- `DEV_ENGINEER_PASSWORD`
- `DEV_ENGINEER_NAME`

## Notes

- Do **not** set `PORT`; Render injects it automatically.
- If `DATABASE_URL` was ever shared publicly, rotate it in Neon before deploying.
- `npx prisma migrate deploy` is included in the build so production schema changes are applied during deploy.
- If your frontend uses a custom domain, set `FRONTEND_URL` to that final HTTPS origin.
- If you are not running Ollama on the Render instance, leave the `OLLAMA_*` variables unset and the backend will fall back to its built-in non-Ollama behavior.

## After saving Render settings

Redeploy the service from Render. Once it is live, update the frontend env on Vercel if needed:

- `VITE_API_BASE_URL=https://your-render-service.onrender.com`
