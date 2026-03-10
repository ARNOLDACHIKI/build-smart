import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

dotenv.config();

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.1";
const OLLAMA_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS || "12000");
const DEV_AUTH_BYPASS = process.env.DEV_AUTH_BYPASS === "true";
const DEV_ENGINEER_EMAIL = process.env.DEV_ENGINEER_EMAIL || "engineer@local.test";
const DEV_ENGINEER_PASSWORD = process.env.DEV_ENGINEER_PASSWORD || "Engineer1234";
const DEV_ENGINEER_NAME = process.env.DEV_ENGINEER_NAME || "Mock Engineer";

type ProjectStatus = "PLANNING" | "IN_PROGRESS" | "REVIEW" | "COMPLETED";
type ProjectPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

type AiProjectDraft = {
  name: string;
  location: string;
  client: string;
  teamSize: number;
  dueDate: string;
  startDate: string;
  progress: number;
  status: ProjectStatus;
  priority: ProjectPriority;
  projectType: string;
  serviceCategory: string;
  budgetEstimate: string;
  siteAddress: string;
  contactPerson: string;
  contactPhone: string;
  durationWeeks: number;
  scopeSummary: string;
  deliverables: string;
  risksNotes: string;
};

type AiCustomField = {
  id: string;
  label: string;
  value: string;
};

type AiProjectForConversation = AiProjectDraft & {
  id?: string;
  customFields?: AiCustomField[];
};

type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

type AssistantMessage = {
  role: "user" | "assistant";
  content: string;
};

type AiGenerationSource = "ollama" | "fallback";

const getLocationFromMessage = (text: string) => {
  const cities = ["nairobi", "mombasa", "kisumu", "nakuru", "eldoret", "thika", "nyeri", "naivasha"];
  const found = cities.find((c) => text.toLowerCase().includes(c));
  return found ? found.charAt(0).toUpperCase() + found.slice(1) : "Nairobi";
};

const getServiceCategory = (text: string) => {
  const t = text.toLowerCase();
  if (t.includes("road") || t.includes("bridge")) return "Civil Engineering";
  if (t.includes("water") || t.includes("drainage")) return "Water Engineering";
  if (t.includes("electrical") || t.includes("solar")) return "Electrical Engineering";
  if (t.includes("mechanical") || t.includes("hvac")) return "Mechanical Engineering";
  if (t.includes("structural") || t.includes("building")) return "Structural Engineering";
  return "General Engineering";
};

const getProjectType = (text: string) => {
  const t = text.toLowerCase();
  if (t.includes("house") || t.includes("residential")) return "Residential";
  if (t.includes("office") || t.includes("mall") || t.includes("commercial")) return "Commercial Building";
  if (t.includes("road") || t.includes("bridge")) return "Infrastructure";
  if (t.includes("water") || t.includes("plant")) return "Utility / Plant";
  return "Construction";
};

const createEmptyProjectDraft = (): AiProjectDraft => {
  const startDate = new Date();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 45);

  return {
    name: "",
    location: "",
    client: "",
    teamSize: 1,
    startDate: startDate.toISOString().split("T")[0],
    dueDate: dueDate.toISOString().split("T")[0],
    progress: 0,
    status: "PLANNING",
    priority: "MEDIUM",
    projectType: "Construction",
    serviceCategory: "General Engineering",
    budgetEstimate: "",
    siteAddress: "",
    contactPerson: "",
    contactPhone: "",
    durationWeeks: 12,
    scopeSummary: "",
    deliverables: "",
    risksNotes: "",
  };
};

const generateHeuristicProjectDraft = (input: {
  senderName: string;
  senderPhone?: string | null;
  message: string;
}): AiProjectDraft => {
  const base = createEmptyProjectDraft();
  const message = input.message || "";
  const location = getLocationFromMessage(message);
  const serviceCategory = getServiceCategory(message);
  const projectType = getProjectType(message);

  const budgetMatch = message.match(/(KES|KSH|ksh|kes|\$)\s?[\d,]+(\.\d+)?/);
  const urgent = /urgent|asap|immediately|soon/i.test(message);

  const start = new Date();
  const due = new Date(start);
  due.setDate(due.getDate() + (urgent ? 21 : 45));

  return {
    ...base,
    name: `${projectType} Project - ${input.senderName}`,
    location,
    client: input.senderName,
    teamSize: serviceCategory.includes("General") ? 4 : 6,
    startDate: start.toISOString().split("T")[0],
    dueDate: due.toISOString().split("T")[0],
    priority: urgent ? "HIGH" : "MEDIUM",
    projectType,
    serviceCategory,
    budgetEstimate: budgetMatch?.[0] || "",
    siteAddress: location,
    contactPerson: input.senderName,
    contactPhone: input.senderPhone || "",
    durationWeeks: urgent ? 6 : 12,
    scopeSummary: message,
    deliverables: "Initial assessment report, design package, implementation plan.",
    risksNotes: urgent
      ? "Compressed timeline and procurement lead-time risk."
      : "Site access and approvals may affect timeline.",
  };
};

const normalizeAiDraft = (raw: Partial<AiProjectDraft>, fallback: AiProjectDraft): AiProjectDraft => {
  const toDate = (value: string | undefined, fallbackValue: string) => {
    if (!value) return fallbackValue;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? fallbackValue : d.toISOString().split("T")[0];
  };

  return {
    ...fallback,
    ...raw,
    name: (raw.name || fallback.name).trim(),
    location: (raw.location || fallback.location).trim(),
    client: (raw.client || fallback.client).trim(),
    teamSize: Math.max(1, Number(raw.teamSize ?? fallback.teamSize) || fallback.teamSize),
    startDate: toDate(raw.startDate, fallback.startDate),
    dueDate: toDate(raw.dueDate, fallback.dueDate),
    progress: Math.max(0, Math.min(100, Number(raw.progress ?? fallback.progress) || 0)),
    status: (["PLANNING", "IN_PROGRESS", "REVIEW", "COMPLETED"].includes(String(raw.status))
      ? raw.status
      : fallback.status) as ProjectStatus,
    priority: (["LOW", "MEDIUM", "HIGH", "URGENT"].includes(String(raw.priority))
      ? raw.priority
      : fallback.priority) as ProjectPriority,
    projectType: (raw.projectType || fallback.projectType).trim(),
    serviceCategory: (raw.serviceCategory || fallback.serviceCategory).trim(),
    budgetEstimate: (raw.budgetEstimate || fallback.budgetEstimate).trim(),
    siteAddress: (raw.siteAddress || fallback.siteAddress).trim(),
    contactPerson: (raw.contactPerson || fallback.contactPerson).trim(),
    contactPhone: (raw.contactPhone || fallback.contactPhone).trim(),
    durationWeeks: Math.max(1, Number(raw.durationWeeks ?? fallback.durationWeeks) || fallback.durationWeeks),
    scopeSummary: (raw.scopeSummary || fallback.scopeSummary).trim(),
    deliverables: (raw.deliverables || fallback.deliverables).trim(),
    risksNotes: (raw.risksNotes || fallback.risksNotes).trim(),
  };
};

const extractFirstJsonObject = (text: string): string | null => {
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null;
  return text.slice(firstBrace, lastBrace + 1);
};

const generateProjectDraftWithOllama = async (input: {
  senderName: string;
  senderPhone?: string | null;
  message: string;
}): Promise<{ draft: AiProjectDraft; source: AiGenerationSource; fallbackReason?: string }> => {
  const fallback = generateHeuristicProjectDraft(input);
  const prompt = `You are an assistant that extracts engineering project data from a client inquiry for a construction platform.\n\nReturn ONLY valid JSON with exactly these keys:\nname,location,client,teamSize,startDate,dueDate,progress,status,priority,projectType,serviceCategory,budgetEstimate,siteAddress,contactPerson,contactPhone,durationWeeks,scopeSummary,deliverables,risksNotes\n\nRules:\n- status must be one of: PLANNING, IN_PROGRESS, REVIEW, COMPLETED\n- priority must be one of: LOW, MEDIUM, HIGH, URGENT\n- teamSize and durationWeeks must be positive integers\n- progress must be an integer from 0 to 100\n- startDate and dueDate must be YYYY-MM-DD\n- If a field is unknown, make a sensible best guess based on the inquiry\n\nInquiry sender name: ${input.senderName}\nInquiry sender phone: ${input.senderPhone || ""}\nInquiry message:\n${input.message}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        format: "json",
        options: {
          temperature: 0.2,
        },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as { response?: string };
    const text = payload.response || "";
    const rawJson = extractFirstJsonObject(text) || text;
    const parsed = JSON.parse(rawJson) as Partial<AiProjectDraft>;
    return {
      draft: normalizeAiDraft(parsed, fallback),
      source: "ollama",
    };
  } catch (error) {
    console.warn("AI draft generation fallback activated:", error);
    const isTimeout = error instanceof DOMException && error.name === "AbortError";
    return {
      draft: fallback,
      source: "fallback",
      fallbackReason: isTimeout ? "timeout" : "ollama_error",
    };
  } finally {
    clearTimeout(timeout);
  }
};

const STANDARD_FIELD_ALIASES: Record<keyof AiProjectDraft, string[]> = {
  name: ["name", "project name", "title"],
  location: ["location", "city", "county", "area"],
  client: ["client", "customer", "owner"],
  teamSize: ["team size", "team", "workers", "workforce", "crew", "staff"],
  dueDate: ["due date", "deadline", "end date", "completion date"],
  startDate: ["start date", "kickoff date", "commencement date"],
  progress: ["progress", "completion", "percent complete", "status percentage"],
  status: ["status", "project status", "state", "phase"],
  priority: ["priority", "urgency", "importance"],
  projectType: ["project type", "type", "category"],
  serviceCategory: ["service category", "service", "discipline"],
  budgetEstimate: ["budget", "budget estimate", "cost", "estimated cost"],
  siteAddress: ["site address", "address", "site"],
  contactPerson: ["contact person", "contact", "person", "owner contact"],
  contactPhone: ["contact phone", "phone", "telephone", "mobile"],
  durationWeeks: ["duration", "duration weeks", "timeline", "weeks"],
  scopeSummary: ["scope", "scope summary", "summary", "description"],
  deliverables: ["deliverables", "outputs", "milestones"],
  risksNotes: ["risks", "risk notes", "notes", "constraints"],
};

const FIELD_STOP_WORDS = new Set([
  "the",
  "a",
  "an",
  "to",
  "of",
  "for",
  "on",
  "in",
  "at",
  "from",
  "please",
  "kindly",
  "update",
  "change",
  "set",
  "make",
  "put",
  "modify",
  "edit",
  "number",
  "count",
  "value",
  "current",
  "new",
  "field",
  "project",
  "indicates",
]);

const toFieldTokens = (value: string): string[] => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/[\s-]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0 && !FIELD_STOP_WORDS.has(token));
};

const normalizeFieldCandidate = (value: string): string => {
  const tokens = toFieldTokens(value);
  return tokens.join(" ");
};

const findBestCustomField = (
  customFields: AiCustomField[],
  message: string,
  explicitCandidate?: string | null
): AiCustomField | null => {
  const messageLower = message.toLowerCase();
  const messageTokens = new Set(toFieldTokens(message));
  const candidateNorm = explicitCandidate ? normalizeFieldCandidate(explicitCandidate) : "";

  let best: { field: AiCustomField; score: number } | null = null;

  for (const field of customFields) {
    const labelLower = field.label.toLowerCase();
    const fieldTokens = toFieldTokens(field.label);
    const fieldNorm = fieldTokens.join(" ");
    if (!fieldNorm) continue;

    let score = 0;
    if (messageLower.includes(labelLower)) score += 8;
    if (candidateNorm && fieldNorm === candidateNorm) score += 10;
    if (candidateNorm && fieldNorm.includes(candidateNorm)) score += 6;
    if (candidateNorm && candidateNorm.includes(fieldNorm)) score += 5;

    let overlap = 0;
    for (const token of fieldTokens) {
      if (messageTokens.has(token)) overlap += 1;
    }
    score += overlap * 2;

    if (!best || score > best.score) {
      best = { field, score };
    }
  }

  if (!best || best.score < 3) return null;
  return best.field;
};

const extractExplicitFieldCandidate = (message: string): string | null => {
  const patterns = [
    /(?:number|count|value)\s+of\s+([a-zA-Z][a-zA-Z\s-]{1,50})/i,
    /(?:change|update|set|make|put|modify)\s+(?:the\s+)?([a-zA-Z][a-zA-Z\s-]{1,50}?)(?:\s+to|\s*=|\s+as)\b/i,
    /(?:what(?:'s| is)|show|tell me|how many)\s+(?:the\s+)?([a-zA-Z][a-zA-Z\s-]{1,50})/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match?.[1]) {
      const cleaned = normalizeFieldCandidate(match[1]);
      if (cleaned) return cleaned;
    }
  }

  return null;
};

const resolveStandardField = (message: string): keyof AiProjectDraft | null => {
  const lower = message.toLowerCase();
  let best: { key: keyof AiProjectDraft; score: number } | null = null;

  for (const [key, aliases] of Object.entries(STANDARD_FIELD_ALIASES) as Array<[keyof AiProjectDraft, string[]]>) {
    for (const alias of aliases) {
      const aliasLower = alias.toLowerCase();
      let score = 0;
      if (lower.includes(aliasLower)) score += aliasLower.split(" ").length > 1 ? 8 : 4;
      if (score > 0 && (!best || score > best.score)) {
        best = { key, score };
      }
    }
  }

  return best?.key || null;
};

const findLastReferencedField = (
  history: ConversationMessage[],
  project: AiProjectForConversation
): { kind: "standard"; key: keyof AiProjectDraft } | { kind: "custom"; field: AiCustomField } | null => {
  const customFields = project.customFields || [];

  for (let i = history.length - 1; i >= 0; i -= 1) {
    const content = history[i]?.content || "";
    const standard = resolveStandardField(content);
    if (standard) {
      return { kind: "standard", key: standard };
    }

    const candidate = extractExplicitFieldCandidate(content);
    const custom = findBestCustomField(customFields, content, candidate);
    if (custom) {
      return { kind: "custom", field: custom };
    }
  }

  return null;
};

const detectIntent = (message: string): "update" | "query" => {
  const lower = message.toLowerCase();
  const updateIntent = /(change|update|set|make|put|modify|edit)\b/.test(lower) || /\bto\s+[-+]?\d+(?:\.\d+)?\b/.test(lower);
  if (updateIntent) return "update";
  return "query";
};

const extractRawUpdateValue = (message: string): string | null => {
  const patterns = [
    /(?:to|=|as)\s*([^\n]+)$/i,
    /(?:change|update|set|make|put|modify)\s+it\s+(?:to|=|as)\s*([^\n]+)$/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match?.[1]) {
      const cleaned = match[1].trim().replace(/[.?!]+$/, "");
      if (cleaned) return cleaned;
    }
  }

  const firstNumber = message.match(/[-+]?\d+(?:\.\d+)?/);
  if (firstNumber?.[0]) return firstNumber[0];

  return null;
};

const formatFieldLabel = (key: keyof AiProjectDraft): string => {
  const labels: Record<keyof AiProjectDraft, string> = {
    name: "project name",
    location: "location",
    client: "client",
    teamSize: "team size",
    dueDate: "due date",
    startDate: "start date",
    progress: "progress",
    status: "status",
    priority: "priority",
    projectType: "project type",
    serviceCategory: "service category",
    budgetEstimate: "budget estimate",
    siteAddress: "site address",
    contactPerson: "contact person",
    contactPhone: "contact phone",
    durationWeeks: "duration (weeks)",
    scopeSummary: "scope summary",
    deliverables: "deliverables",
    risksNotes: "risks notes",
  };
  return labels[key];
};

const parseStandardFieldValue = (key: keyof AiProjectDraft, rawValue: string): AiProjectDraft[keyof AiProjectDraft] | null => {
  const value = rawValue.trim();
  const numberValue = Number(value.replace(/[,%]/g, ""));

  if (key === "teamSize" || key === "durationWeeks") {
    if (Number.isNaN(numberValue)) return null;
    return Math.max(1, Math.round(numberValue));
  }

  if (key === "progress") {
    if (Number.isNaN(numberValue)) return null;
    return Math.max(0, Math.min(100, Math.round(numberValue)));
  }

  if (key === "status") {
    const normalized = value.toUpperCase().replace(/\s+/g, "_");
    if (["PLANNING", "IN_PROGRESS", "REVIEW", "COMPLETED"].includes(normalized)) {
      return normalized as ProjectStatus;
    }
    return null;
  }

  if (key === "priority") {
    const normalized = value.toUpperCase();
    if (["LOW", "MEDIUM", "HIGH", "URGENT"].includes(normalized)) {
      return normalized as ProjectPriority;
    }
    return null;
  }

  return value;
};

const ensureCustomFieldLabel = (candidate: string): string => {
  const normalized = normalizeFieldCandidate(candidate);
  if (!normalized) return "custom field";
  return normalized
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const ICDBO_TARGET_MARKET = [
  "Developers",
  "Financiers",
  "Contractors",
  "Real estate",
  "Consultants",
  "Tenants",
  "Project management teams",
  "Suppliers and manufacturers",
  "Regulators",
  "Localized stakeholders",
];

const ICDBO_PRICING = [
  "Package 1: Students free for 1 year, then USD 5/year",
  "Package 2: Platform + products + community access at USD 30/year",
  "Package 3: Consultant and team support at USD 50/year",
  "Package 4: Supplier access + approved samples + contractor engagement + specialized project data at USD 75/year",
];

const SAMPLE_ENGINEERS = [
  {
    name: "Eng. David Mwangi",
    location: "Nairobi",
    company: "BuildCore Studio",
    bio: "Structural Engineer | BIM and seismic analysis",
    email: "david.mwangi@example.com",
  },
  {
    name: "Arch. Grace Njeri",
    location: "Nairobi",
    company: "Urban Habitat",
    bio: "Architect | Sustainable design and planning",
    email: "grace.njeri@example.com",
  },
  {
    name: "QS Mary Akinyi",
    location: "Mombasa",
    company: "ValueEdge Cost Consultants",
    bio: "Quantity Surveyor | Value engineering and contracts",
    email: "mary.akinyi@example.com",
  },
  {
    name: "Eng. Joseph Otieno",
    location: "Kisumu",
    company: "Lake Infrastructure Partners",
    bio: "Civil Engineer | Roads, bridges and water systems",
    email: "joseph.otieno@example.com",
  },
];

const isPricingIntent = (message: string) => {
  return /\b(pricing|price|package|subscription|trial|cost|usd)\b/i.test(message);
};

const isTargetMarketIntent = (message: string) => {
  return /\b(target market|stakeholders|who is this for|who is it for|audience|customers?)\b/i.test(message);
};

const isEngineerDiscoveryIntent = (message: string) => {
  return /\b(list|find|show|recommend|search)\b.*\b(engineer|architect|consultant|contractor|professionals?)\b/i.test(message)
    || /\b(engineers?|architects?|consultants?)\b.*\b(in|near|around)\b/i.test(message);
};

const extractLocationHint = (message: string): string | null => {
  const cities = ["nairobi", "mombasa", "kisumu", "nakuru", "eldoret", "thika", "nyeri", "naivasha"];
  const lower = message.toLowerCase();
  const found = cities.find((city) => lower.includes(city));
  if (!found) return null;
  return found.charAt(0).toUpperCase() + found.slice(1);
};

const formatEngineerLine = (engineer: {
  name: string | null;
  location: string | null;
  company: string | null;
  bio: string | null;
  email: string;
}) => {
  const name = engineer.name?.trim() || "Unnamed engineer";
  const location = engineer.location?.trim() || "Location not set";
  const company = engineer.company?.trim() || "Independent";
  const specialty = engineer.bio?.trim() || "Construction professional";
  return `• ${name} — ${specialty} (${location}) | ${company} | ${engineer.email}`;
};

const buildPricingReply = () => {
  return [
    "ICDBO DATA ANALYTICS pricing (annual subscription, with a 3-month free trial):",
    ...ICDBO_PRICING.map((row) => `• ${row}`),
  ].join("\n");
};

const buildTargetMarketReply = () => {
  return [
    "ICDBO target market:",
    ...ICDBO_TARGET_MARKET.map((item) => `• ${item}`),
  ].join("\n");
};

const buildAssistantFallbackReply = (message: string) => {
  if (isPricingIntent(message)) return buildPricingReply();
  if (isTargetMarketIntent(message)) return buildTargetMarketReply();

  return [
    "I can help with ICDBO construction workflows.",
    "Try asking:",
    "• List engineers in Nairobi",
    "• Show ICDBO pricing packages",
    "• What stakeholders are targeted by ICDBO?",
    "• Help me plan a construction project brief",
  ].join("\n");
};

const generateAssistantReplyWithOllama = async (input: {
  userName: string;
  message: string;
  history: AssistantMessage[];
}): Promise<{ reply: string; source: "ollama" | "fallback"; fallbackReason?: string }> => {
  const fallback = buildAssistantFallbackReply(input.message);
  const recentHistory = input.history
    .slice(-6)
    .map((item) => `${item.role.toUpperCase()}: ${item.content}`)
    .join("\n");

  const prompt = [
    "You are ICDBO DATA ANALYTICS assistant for construction stakeholders.",
    "Core brand message: ACCESS. INCENTIVISE. ACTION.",
    "Answer in clear practical language with concise bullet points when useful.",
    "Use context:",
    `- User name: ${input.userName}`,
    `- Target market: ${ICDBO_TARGET_MARKET.join(", ")}`,
    "- Pricing:",
    ...ICDBO_PRICING.map((row) => `  - ${row}`),
    "",
    "Recent conversation:",
    recentHistory || "(no previous messages)",
    "",
    "Latest user request:",
    input.message,
    "",
    "Return plain text only.",
  ].join("\n");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        options: {
          temperature: 0.3,
        },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Ollama assistant request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as { response?: string };
    const reply = (payload.response || "").trim();
    if (!reply) {
      return { reply: fallback, source: "fallback", fallbackReason: "empty_response" };
    }

    return { reply, source: "ollama" };
  } catch (error) {
    console.warn("Assistant Ollama fallback activated:", error);
    const isTimeout = error instanceof DOMException && error.name === "AbortError";
    return {
      reply: fallback,
      source: "fallback",
      fallbackReason: isTimeout ? "timeout" : "ollama_error",
    };
  } finally {
    clearTimeout(timeout);
  }
};

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "profile-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});

type SafeUser = {
  id: string;
  email: string;
  name: string | null;
  profilePicture: string | null;
  phone: string | null;
  bio: string | null;
  company: string | null;
  location: string | null;
  role: "USER" | "ADMIN" | "ENGINEER";
  createdAt: Date;
  updatedAt: Date;
};

type JwtPayload = {
  userId: string;
  email: string;
  role: "USER" | "ADMIN" | "ENGINEER";
};

type AuthenticatedRequest = express.Request & {
  auth?: JwtPayload;
};

const toSafeUser = (user: {
  id: string;
  email: string;
  name: string | null;
  profilePicture: string | null;
  phone: string | null;
  bio: string | null;
  company: string | null;
  location: string | null;
  role: "USER" | "ADMIN" | "ENGINEER";
  createdAt: Date;
  updatedAt: Date;
}): SafeUser => ({
  id: user.id,
  email: user.email,
  name: user.name,
  profilePicture: user.profilePicture,
  phone: user.phone,
  bio: user.bio,
  company: user.company,
  location: user.location,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const buildDevEngineerSafeUser = (): SafeUser => {
  const now = new Date();
  return {
    id: "dev-engineer",
    email: DEV_ENGINEER_EMAIL,
    name: DEV_ENGINEER_NAME,
    profilePicture: null,
    phone: null,
    bio: null,
    company: null,
    location: null,
    role: "ENGINEER",
    createdAt: now,
    updatedAt: now,
  };
};

const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
};

const authMiddleware = (
  req: AuthenticatedRequest,
  res: express.Response,
  next: express.NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.auth = decoded;
    next();
  } catch (_error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
// Serve static files from uploads directory
app.use("/uploads", express.static(uploadsDir));

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Database health check
app.get("/api/health/db", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", message: "Database connection is healthy" });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Database connection failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Auth - register
app.post("/api/auth/register", async (req, res) => {
  const { email, password, name, phone, company } = req.body as {
    email?: string;
    password?: string;
    name?: string;
    phone?: string;
    company?: string;
  };

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        phone: phone || null,
        company: company || null,
      },
    });

    const token = generateToken({
      userId: user.id,
      email,
      role: user.role,
    });

    return res.status(201).json({ user: toSafeUser(user), token });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

// Auth - login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  if (DEV_AUTH_BYPASS && email === DEV_ENGINEER_EMAIL && password === DEV_ENGINEER_PASSWORD) {
    const user = buildDevEngineerSafeUser();
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return res.status(200).json({ user, token, mode: "dev-bypass" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ 
        error: "Account not found",
        message: "No account exists with this email address. Please create an account to continue."
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ 
        error: "Invalid password",
        message: "The password you entered is incorrect. Please try again."
      });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return res.status(200).json({ user: toSafeUser(user), token });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

// Auth - current user
app.get("/api/auth/me", authMiddleware, async (req: AuthenticatedRequest, res) => {
  if (!req.auth?.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (DEV_AUTH_BYPASS && req.auth.userId === "dev-engineer") {
    return res.status(200).json({ user: buildDevEngineerSafeUser(), mode: "dev-bypass" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: req.auth.userId } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ user: toSafeUser(user) });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

// Logout endpoint
app.post("/api/auth/logout", (_req, res) => {
  res.json({ message: "Logout successful" });
});

// Update profile endpoint
app.put("/api/auth/profile", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { name, phone, bio, company, location } = req.body;
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || undefined,
        phone: phone || undefined,
        bio: bio || undefined,
        company: company || undefined,
        location: location || undefined,
      },
    });

    return res.json({ user: toSafeUser(updatedUser) });
  } catch (error) {
    console.error("Profile update error:", error);
    return res.status(500).json({ error: "Failed to update profile" });
  }
});

// Upload profile picture endpoint
app.post(
  "/api/auth/profile/picture",
  authMiddleware,
  upload.single("profilePicture"),
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.auth?.userId;
      const file = req.file;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Get current user to delete old profile picture if exists
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      // Delete old profile picture if it exists
      if (currentUser?.profilePicture) {
        const oldFilePath = path.join(__dirname, "..", currentUser.profilePicture);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      // Update user with new profile picture URL
      const profilePictureUrl = `/uploads/${file.filename}`;
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { profilePicture: profilePictureUrl },
      });

      return res.json({
        profilePicture: profilePictureUrl,
        user: toSafeUser(updatedUser),
      });
    } catch (error) {
      console.error("Profile picture upload error:", error);
      return res.status(500).json({ error: "Failed to upload profile picture" });
    }
  }
);

// Inquiry endpoints
// List engineers for search/discovery
app.get("/api/engineers", async (req, res) => {
  const query = String(req.query.q || "").trim();

  try {
    const engineers = await prisma.user.findMany({
      where: {
        role: "ENGINEER",
        ...(query
          ? {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { email: { contains: query, mode: "insensitive" } },
                { company: { contains: query, mode: "insensitive" } },
                { location: { contains: query, mode: "insensitive" } },
                { bio: { contains: query, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        location: true,
        bio: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return res.status(200).json({ engineers });
  } catch (error) {
    console.error("List engineers error:", error);
    return res.status(500).json({ error: "Failed to fetch engineers" });
  }
});

// Create inquiry (contact form submission)
app.post("/api/inquiries", async (req, res) => {
  const { recipientId, senderName, senderEmail, senderPhone, message } = req.body as {
    recipientId?: string;
    senderName?: string;
    senderEmail?: string;
    senderPhone?: string;
    message?: string;
  };

  if (!recipientId || !senderName || !senderEmail || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Check if this is a demo/mock inquiry (recipientId starts with 'mock-')
    if (recipientId.startsWith('mock-')) {
      // For demo purposes, return success without storing in database
      console.log('Demo inquiry received:', { recipientId, senderName, senderEmail, message });
      return res.status(201).json({ 
        id: 'demo-' + Date.now(),
        recipientId,
        senderName,
        senderEmail,
        senderPhone: senderPhone || null,
        message,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        demo: true,
      });
    }

    // Verify recipient exists for real inquiries
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
    });

    if (!recipient) {
      return res.status(404).json({ error: "Recipient not found" });
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        recipientId,
        senderName,
        senderEmail,
        senderPhone: senderPhone || null,
        message,
      },
    });

    return res.status(201).json(inquiry);
  } catch (error) {
    console.error("Create inquiry error:", error);
    return res.status(500).json({ error: "Failed to create inquiry" });
  }
});

// Get inquiries for authenticated engineer
app.get("/api/inquiries", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const inquiries = await prisma.inquiry.findMany({
      where: { recipientId: userId },
      orderBy: { createdAt: "desc" },
    });

    return res.json(inquiries);
  } catch (error) {
    console.error("Get inquiries error:", error);
    return res.status(500).json({ error: "Failed to fetch inquiries" });
  }
});

// Update inquiry status
app.patch("/api/inquiries/:id", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { status } = req.body as { status?: string };

  if (!status || !["PENDING", "READ", "REPLIED"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Verify inquiry belongs to user
    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
    });

    if (!inquiry) {
      return res.status(404).json({ error: "Inquiry not found" });
    }

    if (inquiry.recipientId !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const updatedInquiry = await prisma.inquiry.update({
      where: { id },
      data: { status: status as "PENDING" | "READ" | "REPLIED" },
    });

    return res.json(updatedInquiry);
  } catch (error) {
    console.error("Update inquiry error:", error);
    return res.status(500).json({ error: "Failed to update inquiry" });
  }
});

// AI project draft generation (local Ollama)
app.post("/api/ai/generate-project-draft", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const { senderName, senderPhone, message } = req.body as {
    senderName?: string;
    senderPhone?: string | null;
    message?: string;
  };

  if (!senderName || !message) {
    return res.status(400).json({ error: "senderName and message are required" });
  }

  try {
    const result = await generateProjectDraftWithOllama({
      senderName,
      senderPhone,
      message,
    });

    return res.status(200).json({
      source: result.source,
      fallbackReason: result.fallbackReason || null,
      model: OLLAMA_MODEL,
      draft: result.draft,
    });
  } catch (error) {
    console.error("Generate AI project draft error:", error);
    return res.status(500).json({ error: "Failed to generate AI project draft" });
  }
});

// Process conversational project updates with AI agent
app.post("/api/ai/process-project-update", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { project, userMessage, conversationHistory } = req.body as {
      project?: AiProjectForConversation;
      userMessage?: string;
      conversationHistory?: ConversationMessage[];
    };

    if (!project || !userMessage) {
      return res.status(400).json({ error: "Missing project or message" });
    }
    const projectState: AiProjectForConversation = {
      ...project,
      customFields: Array.isArray(project.customFields) ? project.customFields : [],
    };

    const history = Array.isArray(conversationHistory) ? conversationHistory : [];
    const intent = detectIntent(userMessage);
    const explicitCandidate = extractExplicitFieldCandidate(userMessage);
    const standardField = resolveStandardField(userMessage);
    const customField = findBestCustomField(projectState.customFields || [], userMessage, explicitCandidate);
    const fallbackField = findLastReferencedField(history, projectState);

    const explicitNormalized = explicitCandidate ? normalizeFieldCandidate(explicitCandidate) : "";
    const customNormalized = customField ? normalizeFieldCandidate(customField.label) : "";
    const customExactFromCandidate = Boolean(customField && explicitNormalized && explicitNormalized === customNormalized);
    const preferCustomOverStandard =
      customExactFromCandidate ||
      (!standardField && Boolean(customField)) ||
      (
        standardField === "teamSize" &&
        Boolean(customField) &&
        /\bworkers?\b/i.test(userMessage) &&
        !/\bteam\s*size\b/i.test(userMessage)
      );

    const target = preferCustomOverStandard
      ? { kind: "custom" as const, field: customField as AiCustomField }
      : standardField
        ? { kind: "standard" as const, key: standardField }
        : customField
          ? { kind: "custom" as const, field: customField }
          : fallbackField;

    if (intent === "query") {
      if (!target) {
        return res.json({
          message: "I can help with that. Ask me about a specific field, like \"what is the number of workers?\" or \"what is the value of spades?\".",
          updates: {},
          source: "rule-agent",
        });
      }

      if (target.kind === "standard") {
        const value = projectState[target.key];
        const valueText = target.key === "progress" ? `${value}%` : String(value ?? "");
        return res.json({
          message: `The current ${formatFieldLabel(target.key)} is ${valueText}.`,
          updates: {},
          source: "rule-agent",
        });
      }

      return res.json({
        message: `The current ${target.field.label} is ${target.field.value || "not set"}.`,
        updates: {},
        source: "rule-agent",
      });
    }

    const rawValue = extractRawUpdateValue(userMessage);
    if (!rawValue) {
      return res.json({
        message: "I understood this as an update request, but I still need the new value. Example: \"change workers to 80\".",
        updates: {},
        source: "rule-agent",
      });
    }

    const updates: Record<string, unknown> = {};

    if (target?.kind === "standard") {
      const parsed = parseStandardFieldValue(target.key, rawValue);
      if (parsed === null) {
        return res.json({
          message: `I couldn't apply that value to ${formatFieldLabel(target.key)}. Please provide a valid value.`,
          updates: {},
          source: "rule-agent",
        });
      }

      updates[target.key] = parsed;
      const rendered = target.key === "progress" ? `${parsed}%` : String(parsed);
      return res.json({
        message: `Done. I updated ${formatFieldLabel(target.key)} to ${rendered}.`,
        updates,
        source: "rule-agent",
      });
    }

    const customFields = [...(projectState.customFields || [])];

    if (target?.kind === "custom") {
      const nextCustomFields = customFields.map((field) =>
        field.id === target.field.id
          ? { ...field, value: rawValue }
          : field
      );

      updates.customFields = nextCustomFields;
      return res.json({
        message: `Done. I updated ${target.field.label} to ${rawValue}.`,
        updates,
        source: "rule-agent",
      });
    }

    const candidateLabel = ensureCustomFieldLabel(explicitCandidate || userMessage);
    const matchedExisting = findBestCustomField(customFields, userMessage, candidateLabel);
    if (matchedExisting) {
      const nextCustomFields = customFields.map((field) =>
        field.id === matchedExisting.id
          ? { ...field, value: rawValue }
          : field
      );
      updates.customFields = nextCustomFields;
      return res.json({
        message: `Done. I updated ${matchedExisting.label} to ${rawValue}.`,
        updates,
        source: "rule-agent",
      });
    }

    const nextCustomFields = [
      ...customFields,
      {
        id: `custom-${Date.now()}-${customFields.length + 1}`,
        label: candidateLabel,
        value: rawValue,
      },
    ];
    updates.customFields = nextCustomFields;

    return res.json({
      message: `Done. I created ${candidateLabel} and set it to ${rawValue}.`,
      updates,
      source: "rule-agent",
    });
  } catch (error) {
    console.error("Process project update error:", error);
    return res.status(500).json({ error: "Failed to process update" });
  }
});

app.post("/api/ai/assistant", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const { message, history } = req.body as {
    message?: string;
    history?: AssistantMessage[];
  };

  if (!message || !message.trim()) {
    return res.status(400).json({ error: "message is required" });
  }

  const trimmedMessage = message.trim();
  const normalizedHistory = Array.isArray(history)
    ? history
        .filter((item): item is AssistantMessage => Boolean(item?.content && (item.role === "user" || item.role === "assistant")))
        .map((item) => ({ role: item.role, content: item.content.trim() }))
        .filter((item) => item.content.length > 0)
    : [];

  if (isPricingIntent(trimmedMessage)) {
    return res.status(200).json({
      reply: buildPricingReply(),
      source: "policy",
    });
  }

  if (isTargetMarketIntent(trimmedMessage)) {
    return res.status(200).json({
      reply: buildTargetMarketReply(),
      source: "policy",
    });
  }

  if (isEngineerDiscoveryIntent(trimmedMessage)) {
    const locationHint = extractLocationHint(trimmedMessage);

    try {
      const engineers = await prisma.user.findMany({
        where: {
          role: "ENGINEER",
          ...(locationHint
            ? {
                location: {
                  contains: locationHint,
                  mode: "insensitive",
                },
              }
            : {}),
        },
        select: {
          name: true,
          email: true,
          company: true,
          location: true,
          bio: true,
        },
        take: 8,
        orderBy: { createdAt: "desc" },
      });

      const fallbackEngineers = SAMPLE_ENGINEERS
        .filter((engineer) => !locationHint || engineer.location.toLowerCase().includes(locationHint.toLowerCase()))
        .slice(0, 8)
        .map((engineer) => ({
          name: engineer.name,
          email: engineer.email,
          company: engineer.company,
          location: engineer.location,
          bio: engineer.bio,
        }));

      const result = engineers.length > 0 ? engineers : fallbackEngineers;
      if (result.length === 0) {
        return res.status(200).json({
          reply: "I could not find engineers for that location yet. Try another city or update engineer profiles first.",
          source: "engineers",
        });
      }

      const heading = locationHint
        ? `Here are engineers I found in ${locationHint}:`
        : "Here are engineers I found:";

      return res.status(200).json({
        reply: [heading, ...result.map((engineer) => formatEngineerLine(engineer))].join("\n"),
        source: "engineers",
      });
    } catch (error) {
      console.error("Assistant engineer lookup error:", error);
      const fallbackEngineers = SAMPLE_ENGINEERS
        .filter((engineer) => !locationHint || engineer.location.toLowerCase().includes(locationHint.toLowerCase()))
        .slice(0, 8);

      if (fallbackEngineers.length > 0) {
        return res.status(200).json({
          reply: [
            "I used sample directory data because live lookup is unavailable right now:",
            ...fallbackEngineers.map((engineer) => formatEngineerLine(engineer)),
          ].join("\n"),
          source: "engineers-fallback",
        });
      }
    }
  }

  const assistantResult = await generateAssistantReplyWithOllama({
    userName: req.auth?.email || "User",
    message: trimmedMessage,
    history: normalizedHistory,
  });

  return res.status(200).json({
    reply: assistantResult.reply,
    source: assistantResult.source,
    fallbackReason: assistantResult.fallbackReason || null,
    model: OLLAMA_MODEL,
  });
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

// Start server
const start = async () => {
  let dbConnected = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbConnected = true;
  } catch (error) {
    console.warn("⚠ Database connection failed. Starting API in degraded mode:", error);
    console.warn("⚠ Endpoints that require database access may fail until DB is reachable.");
  }

  app.listen(PORT, () => {
    console.log(`✓ Server running on http://localhost:${PORT}`);
    if (dbConnected) {
      console.log("✓ Database connection successful");
    }
  }
  );
};

start();

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
