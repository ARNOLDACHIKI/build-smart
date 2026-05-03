# 🚀 Deployment Guide: Frontend + Backend

Complete step-by-step guide to deploy Build Buddy AI to production on Vercel (frontend) and Render (backend).

---

## Prerequisites

- GitHub repository pushed with latest changes ✅
- Neon PostgreSQL database provisioned (for backend)
- Vercel account (https://vercel.com)
- Render account (https://render.com)

---

## Part 1: Deploy Backend to Render

### Step 1: Create Render Service
1. Go to **https://dashboard.render.com**
2. Click **New +** → **Blueprint**
3. Enter repository: `https://github.com/ARNOLDACHIKI/build-smart`
4. Click **Connect**
5. Render will read `render.yaml` automatically ✓

### Step 2: Configure Environment Variables

Set these **required** variables in Render dashboard:

| Key | Value | Example |
|-----|-------|---------|
| `DATABASE_URL` | PostgreSQL connection string from Neon | `postgresql://user:pass@host/db?sslmode=require` |
| `JWT_SECRET` | Random 32+ character secret string | `your-super-secret-jwt-key-min-32-chars-long` |
| `FRONTEND_URL` | Frontend domain (will deploy first to Vercel) | `https://build-buddy.vercel.app` |

Optional variables (defaults provided):

| Key | Value | Default |
|-----|-------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `ASSISTANT_CHAT_LIMIT` | Max chat conversations | `12` |
| `ASSISTANT_DAILY_MESSAGE_LIMIT` | Daily message limit | `50` |
| `OLLAMA_BASE_URL` | Ollama server URL | `http://127.0.0.1:11434` |
| `OLLAMA_MODEL` | Ollama model name | `llama3.1` |
| `OLLAMA_TIMEOUT_MS` | Ollama request timeout | `12000` |
| `DEV_AUTH_BYPASS` | Dev mode flag | `false` |

### Step 3: Deploy Backend
1. After entering environment variables, click **Create Blueprint**
2. Render will:
   - Install dependencies: `pnpm install --frozen-lockfile`
   - Build: `pnpm --filter ./backend build`
   - Generate Prisma client: `pnpm prisma generate`
   - Run migrations: `pnpm prisma migrate deploy`
   - Start server: `pnpm --filter ./backend start`
3. Deployment status visible at **Services** → **build-buddy-backend**
4. Once live, note the service URL (e.g. `https://build-buddy-backend-abc123.onrender.com`)

### Step 4: Verify Backend
- Health endpoint: `https://your-render-service.onrender.com/health`
- Should respond: `{"status":"ok","message":"Server is running"}`

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Import Project to Vercel
1. Go to **https://vercel.com/dashboard**
2. Click **Add New** → **Project**
3. Select **Import Git Repository**
4. Enter: `https://github.com/ARNOLDACHIKI/build-smart`
5. Click **Continue**

### Step 2: Configure Vercel Project
1. **Project Name:** `build-buddy-ai` (or your choice)
2. **Framework Preset:** Vite (auto-detected)
3. **Root Directory:** Leave blank (uses root)
4. **Build Command:** Auto-filled from `vercel.json` ✓
5. **Output Directory:** Auto-filled (`frontend/dist`) ✓

### Step 3: Add Environment Variables
Before deploying, add **required** environment variables:

1. Click **Environment Variables**
2. Add:
   - Key: `VITE_API_BASE_URL`
   - Value: `https://your-render-backend-url.onrender.com` (from Step 1, Part 1)
3. Scope: **Production**
4. Click **Save**

### Step 4: Deploy Frontend
1. Click **Deploy**
2. Vercel will:
   - Install: `pnpm install --frozen-lockfile`
   - Build: `pnpm --filter ./frontend build`
   - Deploy: `frontend/dist` to CDN
3. Deployment usually completes in 1-2 minutes
4. Note the frontend URL (e.g. `https://build-buddy-ai.vercel.app`)

### Step 5: Update Backend FRONTEND_URL
1. Go back to **Render Dashboard** → **build-buddy-backend**
2. Click **Environment** tab
3. Edit `FRONTEND_URL`:
   - Old: placeholder
   - New: `https://your-vercel-frontend.vercel.app`
4. Click **Save** → Render will auto-redeploy

### Step 6: Verify Frontend
- Open `https://your-vercel-domain.vercel.app`
- Check browser console for any API errors
- If console shows API errors, verify `VITE_API_BASE_URL` matches backend service URL

---

## Part 3: Enable Auto-Deployments

### Vercel
- **Auto-deploy on push to `main`:** Automatically enabled ✓
- Every push to `main` will trigger a new build

### Render
- **Auto-deploy on push:** Set to `on` in `render.yaml` ✓
- Every push to `main` will trigger a rebuild

---

## Troubleshooting

### Frontend build fails
- Check `frontend/src/vite-env.d.ts` exists
- Verify all imports resolve correctly
- Rebuild locally: `npm run build -w frontend`

### Backend fails to start
- Check Render logs: **Services** → **build-buddy-backend** → **Logs**
- Verify `DATABASE_URL` is correct and accessible
- Ensure `JWT_SECRET` is set and non-empty
- Run locally: `npm run dev -w backend` to test

### Frontend can't reach backend
- Verify `VITE_API_BASE_URL` is set on Vercel
- Check it matches the Render service URL (no trailing slash)
- Browser console: Network tab should show requests to correct origin
- CORS must be enabled on backend (already configured)

### Migrations fail
- Check Neon connection string format
- Verify database exists and user has migration permissions
- Check Render logs for migration errors
- Test locally: `npm run prisma:migrate -w backend`

### Cold start delays
- First request to Render may take 15-30 seconds (free tier spins up)
- Subsequent requests are fast
- For production, consider upgrading Render tier

---

## Post-Deployment Checklist

- [ ] Backend health endpoint responds: `GET /health`
- [ ] Frontend loads without console errors
- [ ] Frontend API calls resolve to Render backend URL
- [ ] Can create a post in community feed
- [ ] Can send a chat message
- [ ] Database queries work (verify in admin panel if available)
- [ ] Email service works (if configured)
- [ ] Auto-deploy enabled for both services

---

## Environment Isolation

| Environment | Frontend | Backend | Database |
|---|---|---|---|
| **Local Dev** | `http://localhost:8080` | `http://localhost:3000` | Local/Neon dev |
| **Production** | Vercel CDN | Render Web Service | Neon production |

---

## Monitoring & Logs

### Vercel
- **Deployments:** https://vercel.com/ARNOLDACHIKI/build-smart/deployments
- **Logs:** Click deployment → View Function Logs
- **Analytics:** Edge for free tier, real-time included

### Render
- **Deployments:** Dashboard → Services → build-buddy-backend → Deploys
- **Live Logs:** Dashboard → Services → build-buddy-backend → Logs
- **Metrics:** Same location, Metrics tab

---

## Scaling & Cost Optimization

### Current Tier (Free)
- **Vercel Free:** 100 GB bandwidth/month, unlimited serverless functions
- **Render Free:** $0/month but spins down after 15 min inactivity

### Recommended for Production
- **Vercel Pro:** $20/month (priority support, faster builds)
- **Render Paid:** $7/month+ (keeps service always on)
- **Neon Database:** Pay-as-you-go, $5 compute hours included free

---

## Next Steps

1. ✅ **Deploy Backend** on Render (10 min)
2. ✅ **Deploy Frontend** on Vercel (5 min)
3. 📝 **Update documentation** with live URLs
4. 🧪 **Test all features** in production
5. 📊 **Monitor logs** for errors
6. 🔄 **Set up CI/CD** for automated testing (optional)
7. 🔐 **Configure custom domain** (optional)

---

## Support

For issues:
1. Check Render logs: **Dashboard → Services → Logs**
2. Check Vercel logs: **Project → Deployments → View Function Logs**
3. Review this guide's Troubleshooting section
4. Check GitHub: https://github.com/ARNOLDACHIKI/build-smart/issues

---

**Last Updated:** May 3, 2026  
**Status:** Ready for Production Deployment ✅
