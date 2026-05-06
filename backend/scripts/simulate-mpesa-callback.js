#!/usr/bin/env node
// Simple MPesa STK callback simulator for local testing.
// Usage example:
//  node backend/scripts/simulate-mpesa-callback.js --checkout=ws_CO_12345 --merchant=12345 --amount=100 --phone=254712345678 --receipt=ABC123 --date=20260506121030

const argv = require('node:process').argv.slice(2);
const parsed = Object.fromEntries(argv.map((arg) => {
  const [k, v] = arg.replace(/^--/, '').split('=');
  return [k, v];
}));

const checkout = parsed.checkout || parsed.checkoutRequestId || '';
const merchant = parsed.merchant || parsed.merchantRequestId || 'sim-merchant';
const amount = Number(parsed.amount || 1);
const phone = parsed.phone || parsed.msisdn || '254700000000';
const receipt = parsed.receipt || 'ABC123XYZ';
const date = parsed.date || new Date().toISOString().replace(/[-:T.]/g, '').slice(0,14);
const callbackUrl = process.env.MPESA_CALLBACK_URL || parsed.url || 'http://localhost:3000/api/payments/mpesa/callback';

if (!checkout) {
  console.error('Missing --checkout=CheckoutRequestID');
  process.exit(2);
}

const body = {
  Body: {
    stkCallback: {
      MerchantRequestID: merchant,
      CheckoutRequestID: checkout,
      ResultCode: 0,
      ResultDesc: 'The service request is processed successfully.',
      CallbackMetadata: {
        Item: [
          { Name: 'Amount', Value: amount },
          { Name: 'MpesaReceiptNumber', Value: receipt },
          { Name: 'TransactionDate', Value: date },
          { Name: 'PhoneNumber', Value: phone },
        ],
      },
    },
  },
};

(async () => {
  try {
    console.log('Posting simulated STK callback to', callbackUrl);
    const res = await fetch(callbackUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const text = await res.text().catch(() => '');
    console.log('Response status:', res.status);
    console.log('Response body:', text);
  } catch (err) {
    console.error('Failed to post callback:', err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
})();
