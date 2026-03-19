#!/usr/bin/env node

const frontendBase = process.env.SMOKE_FRONTEND_URL || "http://localhost:8080";
const backendBase = process.env.SMOKE_BACKEND_URL || "http://localhost:3000";
const loginEmail = process.env.SMOKE_LOGIN_EMAIL || "engineer.mock.1772812759@buildbuddy.test";
const loginPassword = process.env.SMOKE_LOGIN_PASSWORD || "Engineer1234";

const frontendRoutes = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/search",
  "/dashboard",
  "/dashboard/support",
  "/dashboard/settings",
  "/admin",
  "/engineer",
  "/portal",
];

const requiredApiChecks = [
  { name: "health", path: "/health" },
  { name: "db health", path: "/api/health/db" },
  { name: "engineer list", path: "/api/engineers" },
];

const failures = [];

const check = async (name, run) => {
  try {
    await run();
    console.log(`PASS ${name}`);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    failures.push(`${name}: ${reason}`);
    console.log(`FAIL ${name} -> ${reason}`);
  }
};

const expectOk = async (url, opts) => {
  const response = await fetch(url, opts);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response;
};

for (const route of frontendRoutes) {
  await check(`frontend route ${route}`, async () => {
    await expectOk(`${frontendBase}${route}`);
  });
}

for (const api of requiredApiChecks) {
  await check(`backend ${api.name}`, async () => {
    await expectOk(`${backendBase}${api.path}`);
  });
}

let token = "";
await check("backend login", async () => {
  const response = await expectOk(`${backendBase}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: loginEmail, password: loginPassword }),
  });

  const body = await response.json();
  if (!body?.token) {
    throw new Error("No token in login response");
  }
  token = body.token;
});

if (token) {
  await check("backend auth me", async () => {
    await expectOk(`${backendBase}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  });

  await check("backend ai intents", async () => {
    await expectOk(`${backendBase}/api/ai/intents`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  });

  await check("backend ai assistant", async () => {
    await expectOk(`${backendBase}/api/ai/assistant`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: "Find structural engineers in Nairobi" }),
    });
  });

  await check("backend ai generate project draft", async () => {
    await expectOk(`${backendBase}/api/ai/generate-project-draft`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        senderName: "Smoke Test",
        senderPhone: "+254727796479",
        message: "Need a residential project proposal in Nairobi with KES 2,000,000 budget",
      }),
    });
  });
}

if (failures.length > 0) {
  console.error("\nSmoke check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("\nSmoke check passed: all frontend routes and backend API probes are healthy.");
