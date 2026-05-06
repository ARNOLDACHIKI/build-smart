# M-Pesa Payment System Deployment Guide

## Quick Start for Production Deployment

### Step 1: Prepare Environment Variables

#### Frontend Production (`frontend/.env.production`)
```env
VITE_API_BASE_URL=https://your-api-domain.com
VITE_SIMULATION_MODE=false
```

#### Backend Production (`backend/.env`)
Use `backend/.env.production.example` as template and fill in:
- Production database URL (Neon, AWS RDS, etc.)
- JWT_SECRET (generate: `openssl rand -base64 32`)
- M-Pesa production credentials
- Email SMTP credentials
- Domains for CORS and callbacks

### Step 2: M-Pesa Production Setup

1. **Register Production App** on M-Pesa Developer Portal:
   - Get production `MPESA_CONSUMER_KEY` and `MPESA_CONSUMER_SECRET`
   - Configure callback URL: `https://your-api-domain.com/api/payments/mpesa/callback`

2. **Set Environment:**
   ```env
   MPESA_ENVIRONMENT=production
   MPESA_CONSUMER_KEY=your-prod-key
   MPESA_CONSUMER_SECRET=your-prod-secret
   MPESA_SHORTCODE=your-prod-shortcode
   MPESA_PASSKEY=your-prod-passkey
   MPESA_CALLBACK_URL=https://your-api-domain.com/api/payments/mpesa/callback
   ```

### Step 3: Database Migration

```bash
# Run on production database
npx prisma migrate deploy
npx prisma generate
```

### Step 4: Deploy Frontend

**Option A: Vercel**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod --env-file frontend/.env.production
```

**Option B: Netlify**
1. Push to Git (main branch)
2. Connect repo to Netlify
3. Set build command: `pnpm build -w frontend`
4. Set publish directory: `frontend/dist`
5. Add environment variables in Netlify dashboard

### Step 5: Deploy Backend

**Option A: Render**
```yaml
# render.yaml (already exists in repo)
services:
  - type: web
    name: build-smart-backend
    runtime: node
    plan: standard
    buildCommand: pnpm install && pnpm build -w backend
    startCommand: node backend/dist/server.js
    envVars:
      - key: NODE_ENV
        value: production
      # Add all other vars from .env
```

**Option B: Railway/Heroku**
- Set all environment variables in platform dashboard
- Deploy from Git

### Step 6: Testing Payment Flow

1. **User Registration:**
   - Registers with phone number (e.g., `+254712345678`)
   - Phone is stored in user profile

2. **Payment Initiation:**
   - Go to Billing page
   - Click "Pay with M-Pesa" on any plan
   - Phone number auto-fills from registration
   - Confirm payment details and click "Send STK Push"

3. **STK Push Prompt:**
   - M-Pesa sends STK push to user's phone
   - User enters M-Pesa PIN to confirm
   - Payment processed

4. **Callback Processing:**
   - M-Pesa posts result to `MPESA_CALLBACK_URL`
   - Backend updates payment status (COMPLETED/FAILED)
   - If successful, subscription activated
   - User sees updated billing page

### Step 7: Verify Deployment

```bash
# Check API health
curl https://your-api-domain.com/health

# Check Payment history endpoint
curl -H "Authorization: Bearer <token>" \
  https://your-api-domain.com/api/payments/mpesa/history
```

## Required New Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_API_BASE_URL` | Frontend API endpoint | `https://api.yourdomain.com` |
| `MPESA_ENVIRONMENT` | Live payments mode | `production` |
| `MPESA_CONSUMER_KEY` | M-Pesa app key | From Developer Portal |
| `MPESA_CONSUMER_SECRET` | M-Pesa app secret | From Developer Portal |
| `MPESA_CALLBACK_URL` | Daraja callback endpoint | `https://api.yourdomain.com/api/payments/mpesa/callback` |
| `DATABASE_URL` | Production DB | `postgresql://...` |
| `JWT_SECRET` | Token signing secret | Generate with openssl |
| `FRONTEND_URL` | CORS allowed origin | `https://yourdomain.com` |

## Troubleshooting

**Error: "MPESA_CALLBACK_URL is not configured"**
- Ensure `MPESA_CALLBACK_URL` is set in backend `.env`
- URL must be HTTPS and publicly accessible

**Error: "Invalid `prisma.paymentTransaction` invocation"**
- Run migrations: `npx prisma migrate deploy`

**Error: "Unauthorized" on payment endpoints**
- Ensure user is authenticated with valid JWT token

**STK Push not received on phone**
- Verify `MPESA_ENVIRONMENT=production` and credentials
- Check M-Pesa account has active STK Push service
- Verify phone number format matches M-Pesa expectations

## File Changes Made

Files created/modified for deployment:
- `frontend/.env.production` - Production frontend config
- `backend/.env.production.example` - Production backend template
- `DEPLOYMENT_MPESA_GUIDE.md` - This deployment guide

## Features Summary

✅ **Auto-populated phone number** - Uses registered phone in STK Push dialog
✅ **Payment history** - Users can view all past transactions
✅ **Clear payment history** - Reset button to clear old records per user
✅ **Live STK Push** - Real M-Pesa integration for production
✅ **Subscription activation** - Auto-activates on successful payment
✅ **Callback handling** - Daraja callbacks update payment status

## Next Steps

1. Fill in all template variables in `.env` files
2. Test thoroughly in sandbox first
3. Deploy frontend (Vercel/Netlify)
4. Deploy backend (Render/Railway)
5. Configure M-Pesa callback URL in Developer Portal
6. Test full payment flow end-to-end
