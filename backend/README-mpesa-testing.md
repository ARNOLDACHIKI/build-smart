MPesa STK Push testing (local)
================================

This document explains how to run and test the M-Pesa STK Push flow locally, including a small simulator to post a fake STK callback when you can't receive real Daraja callbacks.

Required environment variables
- `MPESA_ENVIRONMENT` — `sandbox` or `live`
- `MPESA_CONSUMER_KEY`
- `MPESA_CONSUMER_SECRET`
- `MPESA_SHORTCODE`
- `MPESA_PASSKEY`
- `MPESA_CALLBACK_URL` — public/localhost callback URL used by Daraja (e.g. `https://<tunnel>/api/payments/mpesa/callback`)
- `DATABASE_URL` — for applying migrations (only required if you want me to run migrations)

If you prefer not to share secrets, set them locally in your environment or in a `backend/.env` file (do not commit).

Steps to test locally
1. (Optional) Apply Prisma migration if your DB needs the payment tables:

```bash
# from repo root
pnpm --filter ./backend exec -- prisma migrate deploy
# or for local development
pnpm --filter ./backend exec -- prisma migrate dev
```

2. Start the backend (dev):

```bash
pnpm --filter ./backend dev
```

3. Initiate an STK Push (example curl). Replace `0712345678` with your test MSISDN (local format ok):

```bash
curl -X POST http://localhost:3000/api/payments/mpesa/stk-push \
  -H "Content-Type: application/json" \
  -d '{"planKey":"basic","billingCycle":"monthly","phoneNumber":"0712345678","payerName":"Test User","payerEmail":"test@example.com","userId":"user-test"}'
```

If the Daraja request succeeds you should receive a `CheckoutRequestID` in the response JSON. Note that in sandbox you may need to use Safaricom sandbox test numbers and credentials.

4. If you cannot receive the live Daraja callback (e.g. local dev behind NAT), simulate a callback using the provided script. Example usage:

```bash
# simple simulator; provide the CheckoutRequestID you received above
node backend/scripts/simulate-mpesa-callback.js --checkout=ws_CO_12345 --merchant=12345 --amount=4200 --phone=254712345678 --receipt=ABC123 --date=20260506123045
```

The script will POST a JSON payload similar to Daraja's callback to the URL in `MPESA_CALLBACK_URL` (or `http://localhost:3000/api/payments/mpesa/callback` by default).

5. Verify results
- Check payment record via the API: `GET /api/payments/mpesa/:checkoutRequestId`
- For authenticated user subscription state: `GET /api/auth/me` (after simulating callback)
- You can also query the DB directly (Prisma Studio or psql) to inspect `payment_transactions` and `users` subscription fields.

Notes
- Never commit real credentials. Use environment variables or a local `.env` file.
- Sandbox credentials and test MSISDN come from Safaricom Daraja sandbox dashboard.
