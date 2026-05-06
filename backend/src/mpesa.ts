export type MpesaEnvironment = "sandbox" | "live";

export type MpesaStkPushInput = {
  amount: number;
  phoneNumber: string;
  callbackUrl: string;
  accountReference: string;
  transactionDesc: string;
};

export type MpesaStkPushResponse = {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage?: string;
};

const getMpesaEnvironment = (): MpesaEnvironment => {
  return (process.env.MPESA_ENVIRONMENT || "sandbox").trim().toLowerCase() === "live" ? "live" : "sandbox";
};

export const getMpesaBaseUrl = () => {
  return getMpesaEnvironment() === "live" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke";
};

export const normalizeKenyanPhoneNumber = (value: string) => {
  const digits = value.replace(/\D/g, "");

  if (digits.startsWith("254") && digits.length === 12) {
    return digits;
  }

  if (digits.startsWith("0") && digits.length === 10) {
    return `254${digits.slice(1)}`;
  }

  if (digits.startsWith("7") && digits.length === 9) {
    return `254${digits}`;
  }

  throw new Error("Enter a valid Kenyan phone number, for example 0712345678 or 254712345678.");
};

export const getMpesaTimestamp = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${lookup.year}${lookup.month}${lookup.day}${lookup.hour}${lookup.minute}${lookup.second}`;
};

export const buildMpesaPassword = (shortCode: string, passkey: string, timestamp: string) => {
  return Buffer.from(`${shortCode}${passkey}${timestamp}`).toString("base64");
};

export const getMpesaAccessToken = async () => {
  const consumerKey = (process.env.MPESA_CONSUMER_KEY || "").trim();
  const consumerSecret = (process.env.MPESA_CONSUMER_SECRET || "").trim();

  if (!consumerKey || !consumerSecret) {
    throw new Error("Missing MPESA_CONSUMER_KEY or MPESA_CONSUMER_SECRET.");
  }

  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
  const response = await fetch(`${getMpesaBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: {
      Authorization: `Basic ${credentials}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get M-Pesa access token (${response.status})`);
  }

  const payload = await response.json() as { access_token?: string };

  if (!payload.access_token) {
    throw new Error("M-Pesa access token was not returned.");
  }

  return payload.access_token;
};

export const sendMpesaStkPush = async (input: MpesaStkPushInput) => {
  const shortCode = (process.env.MPESA_SHORTCODE || "").trim();
  const passkey = (process.env.MPESA_PASSKEY || "").trim();

  if (!shortCode || !passkey) {
    throw new Error("Missing MPESA_SHORTCODE or MPESA_PASSKEY.");
  }

  const timestamp = getMpesaTimestamp();
  const token = await getMpesaAccessToken();

  const response = await fetch(`${getMpesaBaseUrl()}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      BusinessShortCode: shortCode,
      Password: buildMpesaPassword(shortCode, passkey, timestamp),
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.max(1, Math.round(input.amount)),
      PartyA: input.phoneNumber,
      PartyB: shortCode,
      PhoneNumber: input.phoneNumber,
      CallBackURL: input.callbackUrl,
      AccountReference: input.accountReference,
      TransactionDesc: input.transactionDesc,
    }),
  });

  const payload = await response.json().catch(() => ({})) as Partial<MpesaStkPushResponse> & { errorMessage?: string };

  if (!response.ok) {
    throw new Error(payload.errorMessage || payload.ResponseDescription || `M-Pesa request failed (${response.status})`);
  }

  if (!payload.MerchantRequestID || !payload.CheckoutRequestID) {
    throw new Error("M-Pesa STK push response was missing request identifiers.");
  }

  return payload as MpesaStkPushResponse;
};