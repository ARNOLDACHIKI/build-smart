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
import { 
  verifyEmailService, 
  sendVerificationEmail,
  sendTwoFactorCodeEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail
} from "./emailService.js";

dotenv.config();

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const prisma = new PrismaClient();
const prismaDynamic = prisma as typeof prisma & {
  assistantConversation: {
    findMany: (...args: any[]) => Promise<any[]>;
    count: (...args: any[]) => Promise<number>;
    findFirst: (...args: any[]) => Promise<any>;
    create: (...args: any[]) => Promise<any>;
    update: (...args: any[]) => Promise<any>;
    delete: (...args: any[]) => Promise<any>;
  };
  assistantConversationMessage: {
    createMany: (...args: any[]) => Promise<any>;
    count: (...args: any[]) => Promise<number>;
  };
  platformSetting: {
    findMany: (...args: any[]) => Promise<any[]>;
    upsert: (...args: any[]) => Promise<any>;
  };
  assistantTask: {
    create: (...args: any[]) => Promise<any>;
    findMany: (...args: any[]) => Promise<any[]>;
  };
  assistantMeeting: {
    create: (...args: any[]) => Promise<any>;
    findMany: (...args: any[]) => Promise<any[]>;
  };
};
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
let devEngineerTwoFactorEnabled = false;

// Offline-mode state — set true only after a successful DB connection at startup
let dbAvailable = false;
// Pre-hashed password for seeded accounts (populated in start() even when DB is down)
let seededPasswordHash = "";
const ASSISTANT_CHAT_LIMIT = Math.max(1, Number(process.env.ASSISTANT_CHAT_LIMIT || "12"));
const ASSISTANT_DAILY_MESSAGE_LIMIT = Math.max(1, Number(process.env.ASSISTANT_DAILY_MESSAGE_LIMIT || "50"));
const ASSISTANT_CHAT_LIMIT_SETTING_KEY = "assistant.chat.limit";
const ASSISTANT_DAILY_LIMIT_SETTING_KEY = "assistant.daily.limit";

type SentInquiryRecord = {
  id: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string | null;
  senderUserId: string | null;
  message: string;
  replyMessage: string | null;
  senderViewedAt: Date | null;
  recipientId: string;
  status: "PENDING" | "READ" | "REPLIED";
  respondedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  recipient: {
    id: string;
    name: string | null;
    email: string;
    role: AppUserRole;
    company: string | null;
    location: string | null;
  };
};

type AppUserRole =
  | "USER"
  | "ADMIN"
  | "ENGINEER"
  | "LABOURER"
  | "CEMENT_SUPPLIER"
  | "GENERAL_SUPPLIER"
  | "DEVELOPER"
  | "FINANCIER"
  | "CONTRACTOR"
  | "REAL_ESTATE"
  | "CONSULTANT"
  | "TENANT"
  | "PROJECT_MANAGER"
  | "REGULATOR"
  | "LOCAL_STAKEHOLDER";

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

type AssistantIntentName =
  | "ENGINEER_DISCOVERY"
  | "CONTACT_ENGINEER"
  | "PROJECT_COST_ESTIMATE"
  | "PROJECT_BUDGET_ANALYSIS"
  | "PROJECT_PLANNING"
  | "CONSTRUCTION_ADVICE"
  | "MATERIAL_COST_LOOKUP"
  | "CONTRACTOR_RECOMMENDATION"
  | "LOCATION_BASED_SEARCH"
  | "TASK_CREATION"
  | "TASK_FOLLOWUP"
  | "SCHEDULE_MEETING"
  | "PROJECT_RISK_ANALYSIS"
  | "PROJECT_STATUS_QUERY"
  | "CONSTRUCTION_REGULATIONS"
  | "GREETING"
  | "GENERAL_CONVERSATION";

type IntentDefinition = {
  intent_name: AssistantIntentName;
  example_questions: string[];
  function_to_call: string;
  required_parameters: Record<string, string>;
  expected_response_format: {
    type: "object" | "list";
    fields: string[];
  };
};

type AssistantRoutingDebug = {
  intent_name: AssistantIntentName;
  confidence: number;
  function_to_call: string;
  required_parameters: Record<string, string>;
  extracted_parameters: Record<string, string | number | boolean | null>;
  missing_parameters: string[];
  expected_response_format: {
    type: "object" | "list";
    fields: string[];
  };
};

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

const INTENT_DEFINITIONS: IntentDefinition[] = [
  {
    intent_name: "ENGINEER_DISCOVERY",
    example_questions: ["Find structural engineers in Nairobi", "Show available civil engineers", "Who are engineers near Mombasa?"],
    function_to_call: "findEngineers",
    required_parameters: { specialization: "string (optional)", location: "string (optional)", project_type: "string (optional)" },
    expected_response_format: { type: "list", fields: ["name", "specialization", "location", "company", "email"] },
  },
  {
    intent_name: "CONTACT_ENGINEER",
    example_questions: ["Contact Eng. David", "Send a request to QS Mary", "Message this engineer"],
    function_to_call: "createEngineerContactRequest",
    required_parameters: { engineer_id_or_name: "string", message: "string" },
    expected_response_format: { type: "object", fields: ["status", "inquiry_id", "recipient", "message_summary"] },
  },
  {
    intent_name: "PROJECT_COST_ESTIMATE",
    example_questions: ["Estimate cost for 5-floor apartment", "How much to build in Kisumu?", "Rough construction cost"],
    function_to_call: "estimateProjectCost",
    required_parameters: { project_type: "string", location: "string", size_or_scope: "string" },
    expected_response_format: { type: "object", fields: ["estimated_range_min", "estimated_range_max", "currency", "assumptions"] },
  },
  {
    intent_name: "PROJECT_BUDGET_ANALYSIS",
    example_questions: ["Analyze this budget", "Is my budget enough?", "Where can I reduce cost?"],
    function_to_call: "analyzeBudget",
    required_parameters: { budget_total: "number", project_type: "string (optional)", location: "string (optional)" },
    expected_response_format: { type: "object", fields: ["budget_health", "gap_or_surplus", "high_risk_items", "recommendations"] },
  },
  {
    intent_name: "PROJECT_PLANNING",
    example_questions: ["Help me plan my project", "Create construction phases", "Generate a project plan"],
    function_to_call: "generateProjectPlan",
    required_parameters: { project_type: "string", location: "string (optional)", timeline_target: "string (optional)" },
    expected_response_format: { type: "object", fields: ["phases", "deliverables", "timeline_estimate", "dependencies"] },
  },
  {
    intent_name: "CONSTRUCTION_ADVICE",
    example_questions: ["Advice for reducing delays", "Best foundation for weak soil", "How to avoid cost overruns"],
    function_to_call: "getConstructionAdvice",
    required_parameters: { question: "string", context: "string (optional)" },
    expected_response_format: { type: "object", fields: ["advice", "tradeoffs", "next_actions"] },
  },
  {
    intent_name: "MATERIAL_COST_LOOKUP",
    example_questions: ["Cement price in Nairobi", "Steel price per ton", "Current cost of sand"],
    function_to_call: "lookupMaterialCosts",
    required_parameters: { material_name: "string", location: "string (optional)" },
    expected_response_format: { type: "object", fields: ["material", "location", "unit_price_range", "currency", "notes"] },
  },
  {
    intent_name: "CONTRACTOR_RECOMMENDATION",
    example_questions: ["Recommend contractors", "Best contractor in Mombasa", "Contractors for apartment projects"],
    function_to_call: "recommendContractors",
    required_parameters: { project_type: "string (optional)", location: "string (optional)", budget_band: "string (optional)" },
    expected_response_format: { type: "list", fields: ["contractor_name", "location", "specialty", "email"] },
  },
  {
    intent_name: "LOCATION_BASED_SEARCH",
    example_questions: ["Find professionals in Kisumu", "Suppliers near Nairobi", "Who is available around Nakuru"],
    function_to_call: "searchByLocation",
    required_parameters: { location: "string", entity_type: "string (optional)" },
    expected_response_format: { type: "list", fields: ["name", "role", "location", "email"] },
  },
  {
    intent_name: "TASK_CREATION",
    example_questions: ["Create a task to review BOQ tomorrow", "Add task for site inspection", "Remind me to call supplier"],
    function_to_call: "createTask",
    required_parameters: { title: "string", due_date: "string (optional)", priority: "string (optional)" },
    expected_response_format: { type: "object", fields: ["task_id", "title", "status", "due_date", "priority"] },
  },
  {
    intent_name: "TASK_FOLLOWUP",
    example_questions: ["Show my pending tasks", "Any overdue tasks?", "Task followup"],
    function_to_call: "getTaskUpdates",
    required_parameters: { filter: "string (optional)" },
    expected_response_format: { type: "list", fields: ["task_id", "title", "status", "due_date", "priority"] },
  },
  {
    intent_name: "SCHEDULE_MEETING",
    example_questions: ["Schedule meeting with Eng. David tomorrow 10am", "Book consultation Friday", "Set meeting for project kickoff"],
    function_to_call: "scheduleMeeting",
    required_parameters: { participant_id_or_name: "string", date_time: "string", purpose: "string" },
    expected_response_format: { type: "object", fields: ["meeting_id", "participants", "date_time", "status"] },
  },
  {
    intent_name: "PROJECT_RISK_ANALYSIS",
    example_questions: ["Analyze project risks", "What are major risks?", "Risk assessment for this build"],
    function_to_call: "analyzeProjectRisk",
    required_parameters: { project_type: "string", location: "string (optional)", budget: "number (optional)" },
    expected_response_format: { type: "object", fields: ["risk_score", "top_risks", "impact_level", "mitigation_actions"] },
  },
  {
    intent_name: "PROJECT_STATUS_QUERY",
    example_questions: ["What is project status?", "Show latest progress", "How far are we?"],
    function_to_call: "getProjectStatus",
    required_parameters: { project_id_or_name: "string (optional)" },
    expected_response_format: { type: "object", fields: ["current_phase", "progress_percent", "milestones", "blockers"] },
  },
  {
    intent_name: "CONSTRUCTION_REGULATIONS",
    example_questions: ["Permits needed in Nairobi", "Building regulations for apartments", "Do I need NEMA approval?"],
    function_to_call: "getConstructionRegulations",
    required_parameters: { location: "string", project_type: "string" },
    expected_response_format: { type: "object", fields: ["required_permits", "regulatory_bodies", "compliance_checklist", "disclaimer"] },
  },
  {
    intent_name: "GREETING",
    example_questions: ["Hi", "Hello", "Good morning"],
    function_to_call: "handleGreeting",
    required_parameters: {},
    expected_response_format: { type: "object", fields: ["message", "suggested_actions"] },
  },
  {
    intent_name: "GENERAL_CONVERSATION",
    example_questions: ["What can you do?", "Help me", "How does this platform work?"],
    function_to_call: "handleGeneralConversation",
    required_parameters: { message: "string" },
    expected_response_format: { type: "object", fields: ["message", "capabilities", "suggested_next_prompts"] },
  },
];

const MATERIAL_COST_REFERENCES: Record<string, { unit: string; min: number; max: number }> = {
  cement: { unit: "50kg bag", min: 760, max: 1050 },
  steel: { unit: "ton", min: 98000, max: 145000 },
  sand: { unit: "ton", min: 2200, max: 6000 },
  ballast: { unit: "ton", min: 2500, max: 7000 },
  blocks: { unit: "piece", min: 65, max: 140 },
};

const normalizeAssistantText = (message: string): string => {
  return message
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const tokenizeAssistantText = (message: string): string[] => {
  return normalizeAssistantText(message).split(" ").filter(Boolean);
};

const levenshteinDistance = (left: string, right: string): number => {
  if (left === right) return 0;
  if (left.length === 0) return right.length;
  if (right.length === 0) return left.length;

  const matrix: number[][] = Array.from({ length: left.length + 1 }, () => Array(right.length + 1).fill(0));

  for (let i = 0; i <= left.length; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= right.length; j += 1) matrix[0][j] = j;

  for (let i = 1; i <= left.length; i += 1) {
    for (let j = 1; j <= right.length; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[left.length][right.length];
};

const tokenMatchesKeyword = (token: string, keyword: string): boolean => {
  if (token === keyword) return true;
  if (token.length >= 4 && keyword.length >= 4) {
    const maxDistance = keyword.length >= 8 ? 2 : 1;
    if (levenshteinDistance(token, keyword) <= maxDistance) return true;
    if (token.includes(keyword) || keyword.includes(token)) return true;
  }
  return false;
};

const includesSemanticKeyword = (message: string, keywords: string[]): boolean => {
  const normalized = normalizeAssistantText(message);
  const tokens = tokenizeAssistantText(message);

  return keywords.some((keyword) => {
    const normalizedKeyword = normalizeAssistantText(keyword);
    if (!normalizedKeyword) return false;
    if (normalizedKeyword.includes(" ")) {
      return normalized.includes(normalizedKeyword);
    }
    return tokens.some((token) => tokenMatchesKeyword(token, normalizedKeyword));
  });
};

const detectAssistantIntent = (message: string): { intent: AssistantIntentName; confidence: number } => {
  const text = normalizeAssistantText(message);
  const hasGreeting = includesSemanticKeyword(message, ["hello", "hi", "hey", "good morning", "good afternoon", "good evening", "habari", "sasa"]);
  const hasTaskWord = includesSemanticKeyword(message, ["task", "todo", "to do", "reminder", "action item"]);
  const hasCreateWord = includesSemanticKeyword(message, ["create", "add", "set", "make", "remind", "track"]);
  const hasScheduleWord = includesSemanticKeyword(message, ["schedule", "book", "arrange", "set up", "plan"]);
  const hasMeetingWord = includesSemanticKeyword(message, ["meeting", "call", "consultation", "discussion", "session"]);
  const hasBudgetWord = includesSemanticKeyword(message, ["budget", "funds", "cost", "spend", "afford"]);
  const hasEstimateWord = includesSemanticKeyword(message, ["estimate", "quote", "how much", "rough cost", "pricing"]);
  const hasRiskWord = includesSemanticKeyword(message, ["risk", "risks", "hazard", "challenge", "concern"]);
  const hasStatusWord = includesSemanticKeyword(message, ["status", "progress", "update", "how far", "current phase"]);
  const hasRegulationWord = includesSemanticKeyword(message, ["regulation", "permit", "approval", "code", "nema", "compliance", "license"]);
  const hasPlanningWord = includesSemanticKeyword(message, ["plan", "planning", "roadmap", "timeline", "phases", "steps"]);
  const hasAdviceWord = includesSemanticKeyword(message, ["advice", "guide", "guidance", "recommendation", "best practice", "how should"]);
  const hasContractorWord = includesSemanticKeyword(message, ["contractor", "builder", "construction team"]);
  const hasMaterialWord = includesSemanticKeyword(message, ["material", "cement", "steel", "sand", "ballast", "blocks"]);

  if (hasGreeting && text.split(" ").length <= 6) {
    return { intent: "GREETING", confidence: 0.96 };
  }

  if (isContactEngineerIntent(message)) return { intent: "CONTACT_ENGINEER", confidence: 0.94 };

  if ((hasCreateWord && hasTaskWord) || /\bremind me\b/.test(text)) return { intent: "TASK_CREATION", confidence: 0.92 };

  if ((hasTaskWord && includesSemanticKeyword(message, ["status", "follow up", "pending", "overdue", "complete", "completed"])) || /\boverdue tasks?\b/.test(text)) {
    return { intent: "TASK_FOLLOWUP", confidence: 0.9 };
  }

  if ((hasScheduleWord && hasMeetingWord) || (/\btomorrow|today|next week|\d{4}-\d{2}-\d{2}\b/.test(text) && hasMeetingWord)) {
    return { intent: "SCHEDULE_MEETING", confidence: 0.92 };
  }

  if (isEngineerDiscoveryIntent(message)) return { intent: "ENGINEER_DISCOVERY", confidence: 0.9 };

  if (hasEstimateWord || (/\bhow much\b/.test(text) && includesSemanticKeyword(message, ["build", "construction", "project"]))) {
    return { intent: "PROJECT_COST_ESTIMATE", confidence: 0.9 };
  }

  if ((hasBudgetWord && includesSemanticKeyword(message, ["analyze", "analysis", "enough", "optimize", "reduce"])) || /\bbudget enough\b/.test(text)) {
    return { intent: "PROJECT_BUDGET_ANALYSIS", confidence: 0.9 };
  }

  if (hasPlanningWord) return { intent: "PROJECT_PLANNING", confidence: 0.88 };
  if (hasRiskWord) return { intent: "PROJECT_RISK_ANALYSIS", confidence: 0.9 };
  if (hasStatusWord) return { intent: "PROJECT_STATUS_QUERY", confidence: 0.88 };
  if (hasRegulationWord) return { intent: "CONSTRUCTION_REGULATIONS", confidence: 0.9 };

  if (hasMaterialWord && includesSemanticKeyword(message, ["price", "cost", "rate", "market"])) {
    return { intent: "MATERIAL_COST_LOOKUP", confidence: 0.9 };
  }

  if (hasContractorWord && includesSemanticKeyword(message, ["recommend", "best", "top", "suggest"])) {
    return { intent: "CONTRACTOR_RECOMMENDATION", confidence: 0.9 };
  }

  if ((includesSemanticKeyword(message, ["in", "near", "around", "near me", "my area"]) && extractLocationHint(message) !== null)
    || (includesSemanticKeyword(message, ["find", "search", "list", "show"]) && includesSemanticKeyword(message, ["engineer", "contractor", "consultant", "supplier", "professional"]))) {
    return { intent: "LOCATION_BASED_SEARCH", confidence: 0.88 };
  }

  if (hasAdviceWord) return { intent: "CONSTRUCTION_ADVICE", confidence: 0.82 };

  return { intent: "GENERAL_CONVERSATION", confidence: 0.6 };
};

const extractBudgetValueFromText = (message: string): number | null => {
  const match = message.match(/(?:kes|ksh|usd|\$)?\s*([\d,]{4,})/i);
  if (!match?.[1]) return null;
  const num = Number(match[1].replace(/,/g, ""));
  return Number.isFinite(num) ? num : null;
};

const extractMaterialName = (message: string): string | null => {
  const lower = message.toLowerCase();
  return Object.keys(MATERIAL_COST_REFERENCES).find((name) => lower.includes(name)) || null;
};

const extractTaskTitle = (message: string): string => {
  const match = message.match(/(?:task\s+(?:to|for)\s+|remind me to\s+|create\s+task\s+)(.+)$/i);
  return (match?.[1] || message).trim().replace(/[.?!]+$/, "");
};

const extractDateFromMessage = (message: string): Date | null => {
  const lower = message.toLowerCase();
  const now = new Date();
  if (lower.includes("tomorrow")) {
    const date = new Date(now);
    date.setDate(date.getDate() + 1);
    return date;
  }

  const explicitDate = message.match(/(\d{4}-\d{2}-\d{2})/);
  if (explicitDate?.[1]) {
    const parsed = new Date(explicitDate[1]);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
};

const extractMeetingParticipant = (message: string): string => {
  const match = message.match(/(?:with|for)\s+([a-zA-Z][a-zA-Z\s.'-]{2,80})/i);
  return (match?.[1] || "Project contact").trim();
};

const getIntentDefinition = (intent: AssistantIntentName): IntentDefinition => {
  return INTENT_DEFINITIONS.find((item) => item.intent_name === intent)
    || INTENT_DEFINITIONS.find((item) => item.intent_name === "GENERAL_CONVERSATION")
    || {
      intent_name: "GENERAL_CONVERSATION",
      example_questions: [],
      function_to_call: "handleGeneralConversation",
      required_parameters: { message: "string" },
      expected_response_format: { type: "object", fields: ["message"] },
    };
};

const buildIntentExtraction = (intent: AssistantIntentName, message: string): Record<string, string | number | boolean | null> => {
  const location = extractLocationHint(message);
  const budget = extractBudgetValueFromText(message);
  const engineerName = extractContactEngineerName(message);
  const material = extractMaterialName(message);
  const dueDate = extractDateFromMessage(message);

  switch (intent) {
    case "ENGINEER_DISCOVERY":
      return {
        location,
        project_type: getProjectType(message),
        specialization: null,
      };
    case "CONTACT_ENGINEER":
      return {
        engineer_id_or_name: engineerName,
        message: extractContactRequestText(message),
      };
    case "PROJECT_COST_ESTIMATE":
      return {
        project_type: getProjectType(message),
        location,
        size_or_scope: message,
      };
    case "PROJECT_BUDGET_ANALYSIS":
      return {
        budget_total: budget,
        project_type: getProjectType(message),
        location,
      };
    case "PROJECT_PLANNING":
      return {
        project_type: getProjectType(message),
        location,
      };
    case "CONSTRUCTION_ADVICE":
      return { question: message };
    case "MATERIAL_COST_LOOKUP":
      return { material_name: material, location };
    case "CONTRACTOR_RECOMMENDATION":
      return { project_type: getProjectType(message), location, budget_band: null };
    case "LOCATION_BASED_SEARCH":
      return { location, entity_type: null };
    case "TASK_CREATION":
      return {
        title: extractTaskTitle(message),
        due_date: dueDate ? dueDate.toISOString() : null,
        priority: /\burgent|high priority\b/i.test(message) ? "HIGH" : /\blow priority\b/i.test(message) ? "LOW" : "MEDIUM",
      };
    case "TASK_FOLLOWUP":
      return { filter: /\boverdue\b/i.test(message) ? "OVERDUE" : /\bcompleted|done\b/i.test(message) ? "COMPLETED" : "PENDING" };
    case "SCHEDULE_MEETING":
      return {
        participant_id_or_name: extractMeetingParticipant(message),
        date_time: dueDate ? dueDate.toISOString() : null,
        purpose: extractContactRequestText(message),
      };
    case "PROJECT_RISK_ANALYSIS":
      return { project_type: getProjectType(message), location, budget };
    case "PROJECT_STATUS_QUERY":
      return { project_id_or_name: null };
    case "CONSTRUCTION_REGULATIONS":
      return { location, project_type: getProjectType(message) };
    case "GREETING":
      return {};
    case "GENERAL_CONVERSATION":
    default:
      return { message };
  }
};

const buildRoutingDebugInfo = (input: { intent: AssistantIntentName; confidence: number; message: string }): AssistantRoutingDebug => {
  const definition = getIntentDefinition(input.intent);
  const extracted = buildIntentExtraction(input.intent, input.message);
  const missing = Object.keys(definition.required_parameters).filter((param) => {
    const value = extracted[param as keyof typeof extracted];
    return value === null || value === undefined || value === "";
  });

  return {
    intent_name: input.intent,
    confidence: input.confidence,
    function_to_call: definition.function_to_call,
    required_parameters: definition.required_parameters,
    extracted_parameters: extracted,
    missing_parameters: missing,
    expected_response_format: definition.expected_response_format,
  };
};

const isPricingIntent = (message: string) => {
  return /\b(pricing|price|package|subscription|trial|cost|usd)\b/i.test(message);
};

const isInboxListIntent = (message: string) => {
  return /\b(list|show|view|see|open|check)\b.*\b(messages?|inquiries|inbox|requests?)\b/i.test(message)
    || /\b(messages?|inquiries|inbox|requests?)\b.*\b(list|show|all|latest|recent)\b/i.test(message);
};

const isInboxSummaryIntent = (message: string) => {
  return /\b(how many|count|summary|summarize)\b.*\b(messages?|inquiries|inbox|requests?)\b/i.test(message);
};

const isSentInquiryIntent = (message: string) => {
  return /\b(my|sent|outgoing|requested|requester)\b.*\b(messages?|replies|responses?|requests?)\b/i.test(message)
    || /\b(replies|responses?)\b.*\b(from|to|for)\b/i.test(message);
};

const isTargetMarketIntent = (message: string) => {
  return /\b(target market|stakeholders|who is this for|who is it for|audience|customers?)\b/i.test(message);
};

const isEngineerDiscoveryIntent = (message: string) => {
  return (includesSemanticKeyword(message, ["list", "find", "show", "recommend", "search", "looking for", "connect me with"])
    && includesSemanticKeyword(message, ["engineer", "architect", "consultant", "contractor", "professional", "expert"]))
    || (includesSemanticKeyword(message, ["engineers", "architects", "consultants", "contractors"])
      && includesSemanticKeyword(message, ["in", "near", "around", "within", "from"]));
};

const isContactEngineerIntent = (message: string) => {
  const hasContactVerb = includesSemanticKeyword(message, [
    "contact",
    "message",
    "reach out",
    "email",
    "notify",
    "ask",
    "talk to",
    "speak to",
    "connect me with",
    "loop in",
    "ping",
  ]);

  const hasProfessionalTerm = includesSemanticKeyword(message, [
    "eng",
    "engineer",
    "architect",
    "consultant",
    "contractor",
    "qs",
    "quantity surveyor",
    "professional",
    "expert",
  ]);

  return hasContactVerb && hasProfessionalTerm;
};

const isRepeatContactRequestIntent = (message: string) => {
  const lower = message.toLowerCase();
  return /\b(send|do|create|make|submit)\b.*\b(another|one more|same)\b/.test(lower)
    || /\banother one\b/.test(lower)
    || /\bone more\b/.test(lower)
    || /\bsame (?:again|thing|request)\b/.test(lower)
    || /\brepeat (?:that|it|request)\b/.test(lower);
};

const isAlternateContactRequestIntent = (message: string) => {
  const lower = message.toLowerCase();
  return /\b(send|share|route|forward|submit)\b.*\b(to|for)\b.*\b(another|different|someone else|other)\b/.test(lower)
    || /\b(another|different|someone else|other)\s+(one|person|professional|engineer|architect|consultant|contractor)\b/.test(lower)
    || /\bsend (?:it|that|this) to another\b/.test(lower);
};

const CONTACTABLE_ROLES: AppUserRole[] = [
  "ENGINEER",
  "CONSULTANT",
  "CONTRACTOR",
  "PROJECT_MANAGER",
  "REAL_ESTATE",
  "DEVELOPER",
  "FINANCIER",
  "LABOURER",
  "CEMENT_SUPPLIER",
  "GENERAL_SUPPLIER",
  "REGULATOR",
  "LOCAL_STAKEHOLDER",
  "TENANT",
];

const cleanPersonName = (value: string) => {
  return value
    .replace(/^(eng\.?|engineer|arch\.?|architect|qs|quantity\s+surveyor|consultant|contractor)\s+/i, "")
    .replace(/\s{2,}/g, " ")
    .trim();
};

const extractContactEngineerName = (message: string): string | null => {
  const patterns = [
    /(?:contact|message|reach out to|email|notify|ask)\s+(.+?)(?:\s+(?:and|to)\s+ask\b|\s+about\b|[,.!?]|$)/i,
    /(?:eng\.?|engineer|arch\.?|architect|qs|quantity\s+surveyor|consultant|contractor)\s+([a-zA-Z][a-zA-Z\s.'-]{1,80})/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match?.[1]) {
      const cleaned = cleanPersonName(match[1]);
      if (cleaned) return cleaned;
    }
  }

  return null;
};

const extractContactRequestText = (message: string): string => {
  const normalizedMessage = message.trim().replace(/[.\s]+$/, "");
  const askMatch = message.match(/(?:and|to)\s+ask(?:\s+them)?\s+(.+)$/i);
  const aboutMatch = message.match(/\babout\s+(.+)$/i);

  const aboutText = aboutMatch?.[1]?.trim().replace(/[.\s]+$/, "") || "";
  const askText = askMatch?.[1]?.trim().replace(/[.\s]+$/, "") || "";

  if (aboutText && askText) {
    const cleanedAbout = aboutText.replace(/\s+(?:and|to)\s+ask(?:\s+them)?\s+.+$/i, "").trim();
    if (cleanedAbout && !cleanedAbout.toLowerCase().includes(askText.toLowerCase())) {
      return `${cleanedAbout}; also share ${askText}`;
    }
    return aboutText;
  }

  if (aboutText) {
    return aboutText;
  }

  if (askText) {
    return askText;
  }

  const genericContextMatch = normalizedMessage.match(/(?:contact|message|reach out to|email|notify)\s+.+?\s+(?:about|for)\s+(.+)$/i);
  if (genericContextMatch?.[1]) {
    return genericContextMatch[1].trim();
  }

  return "Please share your next available meeting slots and how you can support this construction request.";
};

const toNameSearchTokens = (value: string): string[] => {
  return value
    .toLowerCase()
    .replace(/[^a-z\s'-]/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);
};

const scoreEngineerNameMatch = (candidateName: string | null, requestedName: string): number => {
  const candidateTokens = toNameSearchTokens(candidateName || "");
  const requestedTokens = toNameSearchTokens(requestedName);
  if (candidateTokens.length === 0 || requestedTokens.length === 0) return 0;

  const candidateTokenSet = new Set(candidateTokens);
  let score = 0;

  for (const token of requestedTokens) {
    if (candidateTokenSet.has(token)) score += 2;
  }

  const candidateJoined = candidateTokens.join(" ");
  const requestedJoined = requestedTokens.join(" ");
  if (candidateJoined.includes(requestedJoined) || requestedJoined.includes(candidateJoined)) {
    score += 4;
  }

  return score;
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

type ContactDirectoryEntry = {
  id: string;
  name: string | null;
  email: string;
  location: string | null;
  company: string | null;
};

type ContractorDirectoryEntry = {
  name: string | null;
  email: string;
  location: string | null;
  company: string | null;
  bio: string | null;
};

type LocationSearchEntry = {
  name: string | null;
  email: string;
  role: AppUserRole;
  location: string | null;
  company: string | null;
};

type AssistantTaskRecord = {
  id: string;
  title: string;
  status: string;
  dueDate: Date | null;
  priority: string;
};

type InboxInquiryRecord = {
  id: string;
  status: "PENDING" | "READ" | "REPLIED";
  senderName: string;
  senderEmail: string;
  senderPhone: string | null;
  message: string;
  replyMessage?: string | null;
  createdAt: Date;
  recipient?: {
    name: string | null;
    email: string;
    role: AppUserRole;
  };
};

type EngineerCandidateScore = {
  engineer: ContactDirectoryEntry;
  score: number;
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

const formatInquiryPreview = (inquiry: {
  senderName: string;
  senderEmail: string;
  message: string;
  status: string;
  createdAt: Date;
}) => {
  const preview = inquiry.message.replace(/\s+/g, " ").trim().slice(0, 140);
  return `• ${inquiry.senderName} (${inquiry.senderEmail}) — ${inquiry.status} — ${preview}${inquiry.message.length > 140 ? "..." : ""}`;
};

const formatSentInquiryPreview = (inquiry: {
  message: string;
  replyMessage: string | null;
  status: string;
  createdAt: Date;
  recipient: {
    name: string | null;
    email: string;
    role: AppUserRole;
  };
}) => {
  const recipientLabel = inquiry.recipient.name?.trim() || inquiry.recipient.email;
  const requestPreview = inquiry.message.replace(/\s+/g, " ").trim().slice(0, 90);
  const replyPreview = inquiry.replyMessage?.replace(/\s+/g, " ").trim().slice(0, 90);

  if (replyPreview) {
    return `• To ${recipientLabel} (${inquiry.recipient.role}) — ${inquiry.status} — Reply: ${replyPreview}${inquiry.replyMessage && inquiry.replyMessage.length > 90 ? "..." : ""}`;
  }

  return `• To ${recipientLabel} (${inquiry.recipient.role}) — ${inquiry.status} — Request: ${requestPreview}${inquiry.message.length > 90 ? "..." : ""}`;
};

const buildAssistantConversationTitle = (message: string) => {
  const normalized = message.replace(/\s+/g, " ").trim();
  if (!normalized) return "New chat";

  const firstSentence = normalized.split(/[.!?]/)[0]?.trim() || normalized;
  return firstSentence.length > 48 ? `${firstSentence.slice(0, 45).trim()}...` : firstSentence;
};

const mapStoredAssistantRole = (role: "USER" | "ASSISTANT"): AssistantMessage["role"] => {
  return role === "USER" ? "user" : "assistant";
};

const buildAssistantHistoryFromStoredMessages = (
  messages: Array<{ role: "USER" | "ASSISTANT"; content: string }>
): AssistantMessage[] => {
  return messages.map((message) => ({
    role: mapStoredAssistantRole(message.role),
    content: message.content,
  }));
};

const getStartOfCurrentDay = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const toPositiveInt = (value: string | null | undefined, fallback: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.floor(parsed));
};

const getAssistantLimits = async () => {
  const settings = await prismaDynamic.platformSetting.findMany({
    where: {
      key: {
        in: [ASSISTANT_CHAT_LIMIT_SETTING_KEY, ASSISTANT_DAILY_LIMIT_SETTING_KEY],
      },
    },
  });

  const map = new Map<string, string>((settings as Array<{ key: string; value: string }>).map((item) => [item.key, item.value]));
  const chatLimit = toPositiveInt(map.get(ASSISTANT_CHAT_LIMIT_SETTING_KEY), ASSISTANT_CHAT_LIMIT);
  const dailyMessageLimit = toPositiveInt(map.get(ASSISTANT_DAILY_LIMIT_SETTING_KEY), ASSISTANT_DAILY_MESSAGE_LIMIT);

  return {
    chatLimit,
    dailyMessageLimit,
  };
};

const setAssistantLimits = async (input: { chatLimit: number; dailyMessageLimit: number }) => {
  await prismaDynamic.platformSetting.upsert({
    where: { key: ASSISTANT_CHAT_LIMIT_SETTING_KEY },
    update: { value: String(input.chatLimit) },
    create: { key: ASSISTANT_CHAT_LIMIT_SETTING_KEY, value: String(input.chatLimit) },
  });

  await prismaDynamic.platformSetting.upsert({
    where: { key: ASSISTANT_DAILY_LIMIT_SETTING_KEY },
    update: { value: String(input.dailyMessageLimit) },
    create: { key: ASSISTANT_DAILY_LIMIT_SETTING_KEY, value: String(input.dailyMessageLimit) },
  });
};

const getRemainingAssistantChatsByLimit = (limit: number, conversationCount: number) => {
  return Math.max(limit - conversationCount, 0);
};

const getRemainingDailyMessagesByLimit = (limit: number, dailyCount: number) => {
  return Math.max(limit - dailyCount, 0);
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
  role: AppUserRole;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type JwtPayload = {
  userId: string;
  email: string;
  role: AppUserRole;
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
  role: AppUserRole;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
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
  emailVerified: user.emailVerified,
  twoFactorEnabled: user.twoFactorEnabled,
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
    emailVerified: true,
    twoFactorEnabled: devEngineerTwoFactorEnabled,
    createdAt: now,
    updatedAt: now,
  };
};

const REGISTERABLE_ROLES: AppUserRole[] = [
  "USER",
  "ENGINEER",
  "LABOURER",
  "CEMENT_SUPPLIER",
  "GENERAL_SUPPLIER",
  "DEVELOPER",
  "FINANCIER",
  "CONTRACTOR",
  "REAL_ESTATE",
  "CONSULTANT",
  "TENANT",
  "PROJECT_MANAGER",
  "REGULATOR",
  "LOCAL_STAKEHOLDER",
];

const SEEDED_DEFAULT_PASSWORD = "123456";

const DEFAULT_ROLE_PROFILES: Array<{
  email: string;
  name: string;
  role: AppUserRole;
  phone: string;
  company: string;
  location: string;
  bio: string;
}> = [
  {
    email: "admin@gmail.com",
    name: "Platform Admin",
    role: "ADMIN",
    phone: "+254712345617",
    company: "ICDBO Admin Office",
    location: "Nairobi",
    bio: "System administrator managing governance, users and platform controls.",
  },
];

const DEPRECATED_DUMMY_EMAILS = [
  "david@gmail.com",
  "grace@gmail.com",
  "joseph@gmail.com",
  "kevin@gmail.com",
  "brenda@gmail.com",
  "brian@gmail.com",
  "faith@gmail.com",
  "samuel@gmail.com",
  "hassan@gmail.com",
  "lillian@gmail.com",
  "mary@gmail.com",
  "esther@gmail.com",
  "patrick@gmail.com",
  "dorcas@gmail.com",
  "moses@gmail.com",
  "ivy@gmail.com",
];

// ---------------------------------------------------------------------------
// Offline / in-memory user helpers
// Used automatically when the database is unreachable so seeded demo accounts
// can still log in without a live DB connection.
// ---------------------------------------------------------------------------

/** Build a stable deterministic ID for an in-memory (offline) user. */
const buildOfflineUserId = (email: string): string =>
  `offline-${Buffer.from(email).toString("base64").replace(/[^a-zA-Z0-9]/g, "")}`;

/** Look up a seeded profile by email or by its offline ID. */
const findInMemoryUser = (
  value: string,
  byId = false
): { profile: (typeof DEFAULT_ROLE_PROFILES)[0]; id: string } | null => {
  for (const profile of DEFAULT_ROLE_PROFILES) {
    const id = buildOfflineUserId(profile.email);
    if (byId ? id === value : profile.email === value) {
      return { profile, id };
    }
  }
  return null;
};

/** Convert a seeded profile into the SafeUser shape returned by the API. */
const buildInMemorySafeUser = (
  profile: (typeof DEFAULT_ROLE_PROFILES)[0],
  id: string
): SafeUser => {
  const now = new Date("2026-01-01T00:00:00Z");
  return {
    id,
    email: profile.email,
    name: profile.name,
    profilePicture: null,
    phone: profile.phone,
    bio: profile.bio,
    company: profile.company,
    location: profile.location,
    role: profile.role,
    emailVerified: true,
    twoFactorEnabled: false,
    createdAt: now,
    updatedAt: now,
  };
};

// ---------------------------------------------------------------------------

const seedDefaultProfiles = async () => {
  const hashedPassword = await bcrypt.hash(SEEDED_DEFAULT_PASSWORD, 10);

  await prisma.user.deleteMany({
    where: {
      email: { in: DEPRECATED_DUMMY_EMAILS },
    },
  });

  for (const profile of DEFAULT_ROLE_PROFILES) {
    await prisma.user.upsert({
      where: { email: profile.email },
      update: {
        name: profile.name,
        phone: profile.phone,
        company: profile.company,
        location: profile.location,
        bio: profile.bio,
        role: profile.role as never,
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
      create: {
        email: profile.email,
        password: hashedPassword,
        name: profile.name,
        phone: profile.phone,
        company: profile.company,
        location: profile.location,
        bio: profile.bio,
        role: profile.role as never,
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
    });
  }
};

const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
};

/**
 * Generate a random 6-digit verification code
 */
const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const TWO_FACTOR_CODE_TTL_MS = 10 * 60 * 1000;

const resolveOptionalAuth = (req: express.Request): JwtPayload | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  try {
    return jwt.verify(authHeader.split(" ")[1], JWT_SECRET) as JwtPayload;
  } catch (_error) {
    return null;
  }
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

const adminOnlyMiddleware = (
  req: AuthenticatedRequest,
  res: express.Response,
  next: express.NextFunction
) => {
  if (req.auth?.role !== "ADMIN") {
    return res.status(403).json({ error: "Admin access required" });
  }

  next();
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

// Root endpoint to make local API access clearer in the browser
app.get("/", (_req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8080";
  res.status(200).send(
    `Build Buddy API is running. Open the frontend at ${frontendUrl}. Health check: /health`
  );
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
  const { email, password, name, phone, company, role } = req.body as {
    email?: string;
    password?: string;
    name?: string;
    phone?: string;
    company?: string;
    role?: AppUserRole;
  };

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  const selectedRole = REGISTERABLE_ROLES.includes(role as AppUserRole)
    ? (role as AppUserRole)
    : "USER";

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate verification code
    const verificationCode = generateVerificationCode();
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        phone: phone || null,
        company: company || null,
        role: selectedRole as never,
        emailVerificationToken: verificationCode,
        emailVerificationExpiry: verificationExpiry,
        emailVerificationSent: new Date(),
      },
    });

    // Send verification email (fire and forget, don't block response)
    sendVerificationEmail(
      user.email,
      verificationCode,
      user.name || user.email
    ).catch((error) => {
      console.error("Failed to send verification email:", error);
    });

    return res.status(201).json({ 
      user: toSafeUser(user),
      message: "Registration successful! A verification email has been sent. Please verify your email using the code sent to your inbox.",
      emailVerificationRequired: true,
      verificationEmail: user.email,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Can't reach database server")) {
      return res.status(503).json({
        error: "Database is temporarily unavailable. Please try again shortly.",
      });
    }

    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

// Auth - verify email
app.post("/api/auth/verify-email", async (req, res) => {
  const { email, code } = req.body as {
    email?: string;
    code?: string;
  };

  if (!email || !code) {
    return res.status(400).json({ error: "Email and verification code are required" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: "Email is already verified" });
    }

    if (!user.emailVerificationToken) {
      return res.status(400).json({ error: "No verification code found. Please register again." });
    }

    if (user.emailVerificationExpiry && new Date() > user.emailVerificationExpiry) {
      return res.status(400).json({ 
        error: "Verification code has expired. Please request a new one.",
        expired: true
      });
    }

    if (user.emailVerificationToken !== code) {
      return res.status(400).json({ error: "Invalid verification code" });
    }

    // Update user as verified
    const verifiedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
    });

    // Send welcome email
    sendWelcomeEmail(
      verifiedUser.email,
      verifiedUser.name || verifiedUser.email
    ).catch((error) => {
      console.error("Failed to send welcome email:", error);
    });

    const token = generateToken({
      userId: verifiedUser.id,
      email: verifiedUser.email,
      role: verifiedUser.role,
    });

    return res.status(200).json({ 
      message: "Email verified successfully!",
      user: toSafeUser(verifiedUser), 
      token 
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

// Auth - resend verification email
app.post("/api/auth/resend-verification", async (req, res) => {
  const { email } = req.body as {
    email?: string;
  };

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: "Email is already verified" });
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with new code
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationCode,
        emailVerificationExpiry: verificationExpiry,
        emailVerificationSent: new Date(),
      },
    });

    // Send verification email
    await sendVerificationEmail(
      updatedUser.email,
      verificationCode,
      updatedUser.name || updatedUser.email
    );

    return res.status(200).json({ 
      message: "Verification email resent successfully. Check your inbox." 
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

// Auth - verify two-factor code
app.post("/api/auth/verify-two-factor", async (req, res) => {
  const { email, code } = req.body as {
    email?: string;
    code?: string;
  };

  if (!email || !code) {
    return res.status(400).json({ error: "Email and verification code are required" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ error: "Two-factor authentication is not enabled for this account" });
    }

    if (!user.emailVerificationToken) {
      return res.status(400).json({ error: "No active two-factor code found. Please sign in again." });
    }

    if (user.emailVerificationExpiry && new Date() > user.emailVerificationExpiry) {
      return res.status(400).json({
        error: "Two-factor code has expired. Please request a new one.",
        expired: true,
      });
    }

    if (user.emailVerificationToken !== code) {
      return res.status(400).json({ error: "Invalid two-factor code" });
    }

    const authenticatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
    });

    const token = generateToken({
      userId: authenticatedUser.id,
      email: authenticatedUser.email,
      role: authenticatedUser.role,
    });

    return res.status(200).json({ user: toSafeUser(authenticatedUser), token });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

// Auth - resend two-factor code
app.post("/api/auth/resend-two-factor", async (req, res) => {
  const { email } = req.body as { email?: string };

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ error: "Two-factor authentication is not enabled for this account" });
    }

    const twoFactorCode = generateVerificationCode();
    const twoFactorExpiry = new Date(Date.now() + TWO_FACTOR_CODE_TTL_MS);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: twoFactorCode,
        emailVerificationExpiry: twoFactorExpiry,
      },
    });

    await sendTwoFactorCodeEmail(user.email, twoFactorCode, user.name || user.email);

    return res.status(200).json({
      message: "Two-factor code resent successfully. Check your inbox.",
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

// Auth - forgot password
app.post("/api/auth/forgot-password", async (req, res) => {
  const { email } = req.body as { email?: string };

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "Account not found" });
    }

    const resetToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        type: "password_reset",
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    await sendPasswordResetEmail(user.email, resetToken, user.name || user.email);

    return res.status(200).json({
      message: "Password reset link has been sent.",
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

// Auth - reset password
app.post("/api/auth/reset-password", async (req, res) => {
  const { email, token, password } = req.body as {
    email?: string;
    token?: string;
    password?: string;
  };

  if (!email || !token || !password) {
    return res.status(400).json({
      error: "Email, token, and new password are required",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      error: "Password must be at least 6 characters",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId?: string;
      email?: string;
      type?: string;
    };

    if (decoded.type !== "password_reset" || decoded.email !== email) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.id !== decoded.userId) {
      return res.status(400).json({ error: "Invalid reset request" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return res.status(200).json({ message: "Password reset successful" });
  } catch (_error) {
    return res.status(400).json({ error: "Invalid or expired reset token" });
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

    if (!user.emailVerified) {
      return res.status(403).json({
        error: "Email not verified",
        message: "Please verify your email first using the code we sent to your inbox.",
        emailVerificationRequired: true,
        verificationEmail: user.email,
      });
    }

    if (user.twoFactorEnabled) {
      const twoFactorCode = generateVerificationCode();
      const twoFactorExpiry = new Date(Date.now() + TWO_FACTOR_CODE_TTL_MS);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerificationToken: twoFactorCode,
          emailVerificationExpiry: twoFactorExpiry,
        },
      });

      sendTwoFactorCodeEmail(user.email, twoFactorCode, user.name || user.email).catch((error) => {
        console.error("Failed to send two-factor code:", error);
      });

      return res.status(403).json({
        error: "Two-factor authentication required",
        message: "Enter the 6-digit code sent to your email to complete sign in.",
        twoFactorRequired: true,
        twoFactorEmail: user.email,
      });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return res.status(200).json({ user: toSafeUser(user), token });
  } catch (error) {
    // --- Offline fallback: when DB is unreachable use seeded in-memory accounts ---
    if (!dbAvailable && seededPasswordHash) {
      const match = findInMemoryUser(email);
      if (match) {
        const passwordOk = await bcrypt.compare(password, seededPasswordHash);
        if (!passwordOk) {
          return res.status(401).json({
            error: "Invalid password",
            message: "The password you entered is incorrect. Please try again.",
          });
        }
        const { profile, id } = match;
        const safeUser = buildInMemorySafeUser(profile, id);
        const token = generateToken({ userId: id, email: profile.email, role: profile.role });
        return res.status(200).json({ user: safeUser, token, mode: "offline" });
      }
      return res.status(404).json({
        error: "Account not found",
        message: "No account exists with this email address. Please create an account to continue.",
      });
    }
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
    // Offline fallback: resolve from in-memory seeded users
    if (!dbAvailable) {
      const match = findInMemoryUser(req.auth.userId, true);
      if (match) {
        return res.status(200).json({
          user: buildInMemorySafeUser(match.profile, match.id),
          mode: "offline",
        });
      }
    }
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
    const { name, phone, bio, company, location, twoFactorEnabled } = req.body;
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (DEV_AUTH_BYPASS && userId === "dev-engineer") {
      if (typeof twoFactorEnabled === "boolean") {
        devEngineerTwoFactorEnabled = twoFactorEnabled;
      }
      return res.json({ user: buildDevEngineerSafeUser(), mode: "dev-bypass" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || undefined,
        phone: phone || undefined,
        bio: bio || undefined,
        company: company || undefined,
        location: location || undefined,
        twoFactorEnabled:
          typeof twoFactorEnabled === "boolean" ? twoFactorEnabled : undefined,
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
    const optionalAuth = resolveOptionalAuth(req);

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
        senderUserId: optionalAuth?.userId && optionalAuth.userId !== "dev-engineer" ? optionalAuth.userId : null,
        message,
      } as never,
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
    }) as SentInquiryRecord[];

    return res.json(inquiries);
  } catch (error) {
    console.error("Get inquiries error:", error);
    return res.status(500).json({ error: "Failed to fetch inquiries" });
  }
});

app.get("/api/inquiries/sent", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.auth?.userId;
    const email = req.auth?.email;

    if (!userId || !email) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const inquiries = await (prisma.inquiry.findMany as any)({
      where: {
        OR: [
          { senderUserId: userId },
          { senderEmail: email },
        ],
      } as never,
      include: {
        recipient: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            company: true,
            location: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(
      inquiries.map((inquiry: SentInquiryRecord) => ({
        ...inquiry,
        senderHasUnreadReply: Boolean(inquiry.replyMessage && !inquiry.senderViewedAt),
      })),
    );
  } catch (error) {
    console.error("Get sent inquiries error:", error);
    return res.status(500).json({ error: "Failed to fetch sent inquiries" });
  }
});

app.patch("/api/inquiries/sent/:id/read", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  try {
    const userId = req.auth?.userId;
    const email = req.auth?.email;

    if (!userId || !email) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const inquiry = await (prisma.inquiry.findUnique as any)({
      where: { id },
      include: {
        recipient: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            company: true,
            location: true,
          },
        },
      },
    }) as SentInquiryRecord | null;

    if (!inquiry) {
      return res.status(404).json({ error: "Inquiry not found" });
    }

    const isSender = inquiry.senderUserId === userId || inquiry.senderEmail === email;
    if (!isSender) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const updatedInquiry = await (prisma.inquiry.update as any)({
      where: { id },
      data: {
        senderViewedAt: new Date(),
      } as never,
      include: {
        recipient: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            company: true,
            location: true,
          },
        },
      },
    }) as SentInquiryRecord;

    return res.json({
      ...updatedInquiry,
      senderHasUnreadReply: Boolean(updatedInquiry.replyMessage && !updatedInquiry.senderViewedAt),
    });
  } catch (error) {
    console.error("Mark sent inquiry read error:", error);
    return res.status(500).json({ error: "Failed to update sent inquiry read status" });
  }
});

app.post("/api/inquiries/:id/reply", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { replyMessage } = req.body as { replyMessage?: string };

  if (!replyMessage || !replyMessage.trim()) {
    return res.status(400).json({ error: "replyMessage is required" });
  }

  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

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
      data: {
        replyMessage: replyMessage.trim(),
        senderViewedAt: null,
        respondedAt: new Date(),
        status: "REPLIED",
      } as never,
    });

    return res.json(updatedInquiry);
  } catch (error) {
    console.error("Reply inquiry error:", error);
    return res.status(500).json({ error: "Failed to send reply" });
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

app.get("/api/admin/assistant-limits", authMiddleware, adminOnlyMiddleware, async (_req: AuthenticatedRequest, res) => {
  try {
    const limits = await getAssistantLimits();
    return res.json({
      chatLimit: limits.chatLimit,
      dailyMessageLimit: limits.dailyMessageLimit,
      defaults: {
        chatLimit: ASSISTANT_CHAT_LIMIT,
        dailyMessageLimit: ASSISTANT_DAILY_MESSAGE_LIMIT,
      },
    });
  } catch (error) {
    console.error("Get assistant limits error:", error);
    return res.status(500).json({ error: "Failed to load assistant limits" });
  }
});

app.put("/api/admin/assistant-limits", authMiddleware, adminOnlyMiddleware, async (req: AuthenticatedRequest, res) => {
  const { chatLimit, dailyMessageLimit } = req.body as {
    chatLimit?: number;
    dailyMessageLimit?: number;
  };

  const nextChatLimit = Math.max(1, Math.floor(Number(chatLimit || 0)));
  const nextDailyLimit = Math.max(1, Math.floor(Number(dailyMessageLimit || 0)));

  if (!Number.isFinite(nextChatLimit) || !Number.isFinite(nextDailyLimit)) {
    return res.status(400).json({ error: "chatLimit and dailyMessageLimit must be valid positive numbers" });
  }

  try {
    await setAssistantLimits({
      chatLimit: nextChatLimit,
      dailyMessageLimit: nextDailyLimit,
    });

    return res.json({
      chatLimit: nextChatLimit,
      dailyMessageLimit: nextDailyLimit,
    });
  } catch (error) {
    console.error("Update assistant limits error:", error);
    return res.status(500).json({ error: "Failed to update assistant limits" });
  }
});

app.get("/api/ai/intents", authMiddleware, (_req: AuthenticatedRequest, res) => {
  return res.json({
    intents: INTENT_DEFINITIONS,
    count: INTENT_DEFINITIONS.length,
  });
});

app.get("/api/ai/conversations", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const limits = await getAssistantLimits();
    const userId = req.auth?.userId;
    if (!userId || userId === "dev-engineer") {
      return res.json({
        conversations: [],
        limit: limits.chatLimit,
        remainingChats: limits.chatLimit,
        dailyLimit: limits.dailyMessageLimit,
        remainingDailyMessages: limits.dailyMessageLimit,
      });
    }

    const conversations = await prismaDynamic.assistantConversation.findMany({
      where: { userId },
      orderBy: { lastMessageAt: "desc" },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        lastMessageAt: true,
        _count: {
          select: {
            messages: true,
          },
        },
        messages: {
          select: {
            content: true,
            role: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      take: limits.chatLimit,
    });

    const conversationCount = await prismaDynamic.assistantConversation.count({ where: { userId } });
    const dailyMessageCount = await prismaDynamic.assistantConversationMessage.count({
      where: {
        role: "USER",
        conversation: {
          userId,
        },
        createdAt: {
          gte: getStartOfCurrentDay(),
        },
      },
    });

    return res.json({
      conversations: conversations.map((conversation: any) => ({
        id: conversation.id,
        title: conversation.title,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        lastMessageAt: conversation.lastMessageAt,
        messageCount: conversation._count.messages,
        preview: conversation.messages[0]?.content || "",
        previewRole: conversation.messages[0] ? mapStoredAssistantRole(conversation.messages[0].role) : null,
      })),
      limit: limits.chatLimit,
      remainingChats: getRemainingAssistantChatsByLimit(limits.chatLimit, conversationCount),
      dailyLimit: limits.dailyMessageLimit,
      remainingDailyMessages: getRemainingDailyMessagesByLimit(limits.dailyMessageLimit, dailyMessageCount),
    });
  } catch (error) {
    console.error("List assistant conversations error:", error);
    return res.status(500).json({ error: "Failed to fetch assistant conversations" });
  }
});

app.get("/api/ai/conversations/:id", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId || userId === "dev-engineer") {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const conversation = await prismaDynamic.assistantConversation.findFirst({
      where: {
        id: req.params.id,
        userId,
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    return res.json({
      id: conversation.id,
      title: conversation.title,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      lastMessageAt: conversation.lastMessageAt,
      messages: conversation.messages.map((message: any) => ({
        id: message.id,
        role: mapStoredAssistantRole(message.role),
        content: message.content,
        createdAt: message.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get assistant conversation error:", error);
    return res.status(500).json({ error: "Failed to fetch assistant conversation" });
  }
});

app.delete("/api/ai/conversations/:id", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const limits = await getAssistantLimits();
    const userId = req.auth?.userId;
    if (!userId || userId === "dev-engineer") {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const conversation = await prismaDynamic.assistantConversation.findFirst({
      where: {
        id: req.params.id,
        userId,
      },
      select: { id: true },
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    await prismaDynamic.assistantConversation.delete({
      where: { id: conversation.id },
    });

    const conversationCount = await prismaDynamic.assistantConversation.count({ where: { userId } });
    return res.json({
      ok: true,
      remainingChats: getRemainingAssistantChatsByLimit(limits.chatLimit, conversationCount),
      limit: limits.chatLimit,
      dailyLimit: limits.dailyMessageLimit,
    });
  } catch (error) {
    console.error("Delete assistant conversation error:", error);
    return res.status(500).json({ error: "Failed to delete assistant conversation" });
  }
});

app.post("/api/ai/assistant", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const { message, history } = req.body as {
    message?: string;
    history?: AssistantMessage[];
  };
  const requestedConversationId = typeof req.body?.conversationId === "string" ? req.body.conversationId.trim() : "";

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

  const limits = await getAssistantLimits();
  const canPersistConversation = Boolean(req.auth?.userId && req.auth.userId !== "dev-engineer");
  let assistantConversation:
    | {
        id: string;
        title: string;
        messages: Array<{ role: "USER" | "ASSISTANT"; content: string }>;
      }
    | null = null;
  let conversationCount = 0;
  let dailyMessageCount = 0;

  const resolveDailyMessageCount = async () => {
    if (!canPersistConversation || !req.auth?.userId) {
      return 0;
    }

    if (dailyMessageCount > 0) {
      return dailyMessageCount;
    }

    dailyMessageCount = await prismaDynamic.assistantConversationMessage.count({
      where: {
        role: "USER",
        conversation: {
          userId: req.auth.userId,
        },
        createdAt: {
          gte: getStartOfCurrentDay(),
        },
      },
    });

    return dailyMessageCount;
  };

  if (canPersistConversation && req.auth?.userId) {
    const todayCount = await resolveDailyMessageCount();
    if (todayCount >= limits.dailyMessageLimit) {
      return res.status(429).json({
        error: `You have reached your daily assistant message limit of ${limits.dailyMessageLimit}. Please try again tomorrow.`,
        code: "DAILY_CHAT_LIMIT_REACHED",
        dailyLimit: limits.dailyMessageLimit,
        remainingDailyMessages: 0,
      });
    }
  }

  const resolveAssistantConversation = async () => {
    if (!canPersistConversation || !req.auth?.userId) {
      return null;
    }

    if (assistantConversation) {
      return assistantConversation;
    }

    if (requestedConversationId) {
      const existingConversation = await prismaDynamic.assistantConversation.findFirst({
        where: {
          id: requestedConversationId,
          userId: req.auth.userId,
        },
        include: {
          messages: {
            select: {
              role: true,
              content: true,
            },
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!existingConversation) {
        throw new Error("conversation_not_found");
      }

      conversationCount = await prismaDynamic.assistantConversation.count({ where: { userId: req.auth.userId } });
      assistantConversation = existingConversation;
      return assistantConversation;
    }

    conversationCount = await prismaDynamic.assistantConversation.count({ where: { userId: req.auth.userId } });
    if (conversationCount >= limits.chatLimit) {
      throw new Error("chat_limit_reached");
    }

    const createdConversation = await prismaDynamic.assistantConversation.create({
      data: {
        userId: req.auth.userId,
        title: buildAssistantConversationTitle(trimmedMessage),
      },
      include: {
        messages: {
          select: {
            role: true,
            content: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    conversationCount += 1;
    assistantConversation = createdConversation;
    return assistantConversation;
  };

  const sendAssistantResponse = async (payload: {
    reply: string;
    source: string;
    fallbackReason?: string | null;
    model?: string;
    routing?: AssistantRoutingDebug;
  }) => {
    if (canPersistConversation && req.auth?.userId) {
      try {
        const conversation = await resolveAssistantConversation();
        if (conversation) {
          const now = new Date();
          await prismaDynamic.assistantConversationMessage.createMany({
            data: [
              {
                conversationId: conversation.id,
                role: "USER",
                content: trimmedMessage,
                createdAt: now,
              },
              {
                conversationId: conversation.id,
                role: "ASSISTANT",
                content: payload.reply,
                createdAt: now,
              },
            ],
          });

          await prismaDynamic.assistantConversation.update({
            where: { id: conversation.id },
            data: {
              title: conversation.title === "New chat" ? buildAssistantConversationTitle(trimmedMessage) : conversation.title,
              lastMessageAt: now,
            },
          });

          assistantConversation = {
            ...conversation,
            title: conversation.title === "New chat" ? buildAssistantConversationTitle(trimmedMessage) : conversation.title,
            messages: [
              ...conversation.messages,
              { role: "USER", content: trimmedMessage },
              { role: "ASSISTANT", content: payload.reply },
            ],
          };
          dailyMessageCount += 1;
        }
      } catch (error) {
        if (error instanceof Error && error.message === "chat_limit_reached") {
          return res.status(409).json({
            error: `You have reached the saved chat limit of ${limits.chatLimit}. Delete an old chat to start a new one.`,
            code: "CHAT_LIMIT_REACHED",
            limit: limits.chatLimit,
            remainingChats: 0,
            dailyLimit: limits.dailyMessageLimit,
            remainingDailyMessages: getRemainingDailyMessagesByLimit(limits.dailyMessageLimit, dailyMessageCount),
          });
        }

        if (error instanceof Error && error.message === "conversation_not_found") {
          return res.status(404).json({
            error: "The selected chat could not be found. Refresh and try again.",
            code: "CONVERSATION_NOT_FOUND",
          });
        }

        console.error("Persist assistant conversation error:", error);
      }
    }

    return res.status(200).json({
      ...payload,
      fallbackReason: payload.fallbackReason || null,
      routing: payload.routing || routingDebug,
      conversationId: assistantConversation?.id || null,
      limit: limits.chatLimit,
      remainingChats: canPersistConversation
        ? getRemainingAssistantChatsByLimit(limits.chatLimit, conversationCount)
        : limits.chatLimit,
      dailyLimit: limits.dailyMessageLimit,
      remainingDailyMessages: canPersistConversation
        ? getRemainingDailyMessagesByLimit(limits.dailyMessageLimit, dailyMessageCount)
        : limits.dailyMessageLimit,
    });
  };

  let storedHistory = normalizedHistory;
  if (canPersistConversation && requestedConversationId) {
    try {
      const conversation = await resolveAssistantConversation();
      if (conversation) {
        storedHistory = buildAssistantHistoryFromStoredMessages(conversation.messages);
      }
    } catch (error) {
      if (error instanceof Error && error.message === "conversation_not_found") {
        return res.status(404).json({
          error: "The selected chat could not be found. Refresh and try again.",
          code: "CONVERSATION_NOT_FOUND",
        });
      }

      console.error("Load assistant conversation error:", error);
    }
  }

  let assistantInputMessage = trimmedMessage;
  let repeatedContactFromHistory = false;
  let sendToAnotherProfessional = false;
  const followupContactRequested = isRepeatContactRequestIntent(trimmedMessage) || isAlternateContactRequestIntent(trimmedMessage);

  if (followupContactRequested) {
    const priorContactMessage = [...storedHistory]
      .reverse()
      .find((item) => item.role === "user" && isContactEngineerIntent(item.content));

    if (priorContactMessage?.content) {
      assistantInputMessage = priorContactMessage.content;
      repeatedContactFromHistory = true;
      sendToAnotherProfessional = isAlternateContactRequestIntent(trimmedMessage);
    }
  }

  const detectedIntent = detectAssistantIntent(assistantInputMessage);
  const routingDebug = buildRoutingDebugInfo({
    intent: detectedIntent.intent,
    confidence: detectedIntent.confidence,
    message: assistantInputMessage,
  });

  if (detectedIntent.intent === "GREETING") {
    return sendAssistantResponse({
      reply: [
        "Hi. I can help with engineer discovery, contractor recommendations, cost estimates, planning, tasks and meeting scheduling.",
        "Try:",
        "• Find engineers in Nairobi",
        "• Estimate cost for a 5-floor apartment in Mombasa",
        "• Create task to review BOQ tomorrow",
      ].join("\n"),
      source: "intent-greeting",
    });
  }

  if (detectedIntent.intent === "PROJECT_COST_ESTIMATE") {
    const location = extractLocationHint(trimmedMessage) || "Nairobi";
    const projectType = getProjectType(trimmedMessage);
    const budgetMention = extractBudgetValueFromText(trimmedMessage);
    const floorsMatch = trimmedMessage.match(/(\d+)\s*(?:floor|storey|story)/i);
    const floors = floorsMatch?.[1] ? Math.max(1, Number(floorsMatch[1])) : 1;
    const sizeHint = floors * 150;
    const basePerSqm = projectType === "Residential" ? 450 : projectType === "Commercial Building" ? 600 : 520;
    const min = Math.round(sizeHint * basePerSqm * 0.85);
    const max = Math.round(sizeHint * basePerSqm * 1.25);

    return sendAssistantResponse({
      reply: [
        `Intent: PROJECT_COST_ESTIMATE (confidence ${detectedIntent.confidence.toFixed(2)})`,
        `Estimated range for ${projectType} in ${location}: KES ${min.toLocaleString()} - KES ${max.toLocaleString()}.`,
        budgetMention ? `Provided budget reference: KES ${budgetMention.toLocaleString()}.` : "No explicit budget provided.",
        "Assumptions: preliminary estimate, excludes permit and financing variance.",
      ].join("\n"),
      source: "intent-project-cost-estimate",
    });
  }

  if (detectedIntent.intent === "PROJECT_BUDGET_ANALYSIS") {
    const budget = extractBudgetValueFromText(trimmedMessage);
    if (!budget) {
      return sendAssistantResponse({
        reply: "I can analyze that budget. Please include a numeric budget value, for example: analyze budget KES 12,000,000 for 4-floor apartment in Nairobi.",
        source: "intent-project-budget-analysis",
      });
    }

    const location = extractLocationHint(trimmedMessage) || "Nairobi";
    const projectType = getProjectType(trimmedMessage);
    const baseline = projectType === "Residential" ? 9000000 : 13000000;
    const gap = budget - baseline;
    const health = gap >= 0 ? "Within expected range" : "Potential shortfall";

    return sendAssistantResponse({
      reply: [
        `Intent: PROJECT_BUDGET_ANALYSIS (confidence ${detectedIntent.confidence.toFixed(2)})`,
        `Budget health: ${health}`,
        `Project type: ${projectType} (${location})`,
        `Estimated variance: KES ${gap.toLocaleString()}`,
        "Recommendations:",
        "• Validate structural, MEP and finishes line items",
        "• Keep 8-12% contingency",
        "• Lock supplier rates early for cement/steel",
      ].join("\n"),
      source: "intent-project-budget-analysis",
    });
  }

  if (detectedIntent.intent === "PROJECT_PLANNING") {
    const projectType = getProjectType(trimmedMessage);
    const location = extractLocationHint(trimmedMessage) || "Kenya";
    return sendAssistantResponse({
      reply: [
        `Intent: PROJECT_PLANNING (confidence ${detectedIntent.confidence.toFixed(2)})`,
        `Project plan for ${projectType} (${location}):`,
        "1) Feasibility & requirements",
        "2) Concept design and approvals",
        "3) Detailed design + BOQ",
        "4) Procurement & mobilization",
        "5) Construction execution",
        "6) QA/QC, commissioning and handover",
        "Key dependency: permits + utility clearances before mobilization.",
      ].join("\n"),
      source: "intent-project-planning",
    });
  }

  if (detectedIntent.intent === "CONSTRUCTION_ADVICE") {
    return sendAssistantResponse({
      reply: [
        `Intent: CONSTRUCTION_ADVICE (confidence ${detectedIntent.confidence.toFixed(2)})`,
        "Practical guidance:",
        "• Start with a clear BOQ and phased procurement plan",
        "• Run weekly look-ahead planning and daily site logs",
        "• Track top-3 risks weekly: cashflow, materials, weather",
        "• Freeze design changes before critical path activities",
      ].join("\n"),
      source: "intent-construction-advice",
    });
  }

  if (detectedIntent.intent === "MATERIAL_COST_LOOKUP") {
    const material = extractMaterialName(trimmedMessage);
    const location = extractLocationHint(trimmedMessage) || "Nairobi";
    if (!material) {
      return sendAssistantResponse({
        reply: "Please specify a material name (cement, steel, sand, ballast, blocks) so I can return a market range.",
        source: "intent-material-cost-lookup",
      });
    }

    const ref = MATERIAL_COST_REFERENCES[material];
    return sendAssistantResponse({
      reply: [
        `Intent: MATERIAL_COST_LOOKUP (confidence ${detectedIntent.confidence.toFixed(2)})`,
        `${material.toUpperCase()} in ${location}: KES ${ref.min.toLocaleString()} - KES ${ref.max.toLocaleString()} per ${ref.unit}.`,
        "Note: prices vary by transport distance, supplier terms and seasonality.",
      ].join("\n"),
      source: "intent-material-cost-lookup",
    });
  }

  if (detectedIntent.intent === "CONTRACTOR_RECOMMENDATION") {
    const location = extractLocationHint(trimmedMessage);
    const contractors = await prisma.user.findMany({
      where: {
        role: "CONTRACTOR" as never,
        ...(location ? { location: { contains: location, mode: "insensitive" } } : {}),
      },
      select: { name: true, email: true, location: true, company: true, bio: true },
      take: 6,
      orderBy: { createdAt: "desc" },
    });

    if (contractors.length === 0) {
      return sendAssistantResponse({
        reply: "I could not find contractor profiles matching that request yet. Try another location or onboard contractor accounts first.",
        source: "intent-contractor-recommendation",
      });
    }

    return sendAssistantResponse({
      reply: [
        `Intent: CONTRACTOR_RECOMMENDATION (confidence ${detectedIntent.confidence.toFixed(2)})`,
        "Recommended contractors:",
        ...contractors.map((c: ContractorDirectoryEntry) => `• ${c.name || c.email} — ${c.company || "Independent"} (${c.location || "Location not set"}) | ${c.email}`),
      ].join("\n"),
      source: "intent-contractor-recommendation",
    });
  }

  if (detectedIntent.intent === "LOCATION_BASED_SEARCH") {
    const location = extractLocationHint(trimmedMessage);
    if (!location) {
      return sendAssistantResponse({
        reply: "Please provide a location, for example: find contractors and engineers in Mombasa.",
        source: "intent-location-based-search",
      });
    }

    const professionals = await prisma.user.findMany({
      where: {
        role: { in: CONTACTABLE_ROLES as never },
        location: { contains: location, mode: "insensitive" },
      },
      select: { name: true, email: true, role: true, location: true, company: true },
      take: 12,
      orderBy: { createdAt: "desc" },
    });

    return sendAssistantResponse({
      reply: professionals.length === 0
        ? `No professionals found in ${location} yet.`
        : [
            `Intent: LOCATION_BASED_SEARCH (confidence ${detectedIntent.confidence.toFixed(2)})`,
            `Professionals in ${location}:`,
            ...professionals.map((p: LocationSearchEntry) => `• ${p.name || p.email} — ${p.role} | ${p.company || "Independent"} | ${p.email}`),
          ].join("\n"),
      source: "intent-location-based-search",
    });
  }

  if (detectedIntent.intent === "TASK_CREATION") {
    if (!req.auth?.userId || req.auth.userId === "dev-engineer") {
      return sendAssistantResponse({
        reply: "Task creation requires a logged-in account.",
        source: "intent-task-creation",
      });
    }

    const title = extractTaskTitle(trimmedMessage);
    const dueDate = extractDateFromMessage(trimmedMessage);
    const priority = /\burgent|high priority\b/i.test(trimmedMessage) ? "HIGH" : /\blow priority\b/i.test(trimmedMessage) ? "LOW" : "MEDIUM";
    const task = await prismaDynamic.assistantTask.create({
      data: {
        userId: req.auth.userId,
        title,
        context: trimmedMessage,
        dueDate,
        priority,
        status: "PENDING",
      },
    });

    return sendAssistantResponse({
      reply: [
        `Intent: TASK_CREATION (confidence ${detectedIntent.confidence.toFixed(2)})`,
        `Task created: ${task.title}`,
        `Task ID: ${task.id}`,
        `Priority: ${task.priority}`,
        `Due: ${task.dueDate ? new Date(task.dueDate).toLocaleString() : "Not set"}`,
      ].join("\n"),
      source: "intent-task-creation",
    });
  }

  if (detectedIntent.intent === "TASK_FOLLOWUP") {
    if (!req.auth?.userId || req.auth.userId === "dev-engineer") {
      return sendAssistantResponse({
        reply: "Task follow-up requires a logged-in account.",
        source: "intent-task-followup",
      });
    }

    const filter = /\boverdue\b/i.test(trimmedMessage)
      ? "OVERDUE"
      : /\bcompleted|done\b/i.test(trimmedMessage)
        ? "COMPLETED"
        : "PENDING";
    const now = new Date();

    const tasks = await prismaDynamic.assistantTask.findMany({
      where: {
        userId: req.auth.userId,
        ...(filter === "COMPLETED"
          ? { status: "COMPLETED" }
          : filter === "OVERDUE"
            ? { status: { not: "COMPLETED" }, dueDate: { lt: now } }
            : { status: { not: "COMPLETED" } }),
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return sendAssistantResponse({
      reply: tasks.length === 0
        ? `No ${filter.toLowerCase()} tasks found.`
        : [
            `Intent: TASK_FOLLOWUP (confidence ${detectedIntent.confidence.toFixed(2)})`,
            `Here are your ${filter.toLowerCase()} tasks:`,
            ...tasks.map((task: AssistantTaskRecord) => `• ${task.title} | ${task.status} | due ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "not set"}`),
          ].join("\n"),
      source: "intent-task-followup",
    });
  }

  if (detectedIntent.intent === "SCHEDULE_MEETING") {
    if (!req.auth?.userId || req.auth.userId === "dev-engineer") {
      return sendAssistantResponse({
        reply: "Meeting scheduling requires a logged-in account.",
        source: "intent-schedule-meeting",
      });
    }

    const scheduledFor = extractDateFromMessage(trimmedMessage);
    if (!scheduledFor) {
      return sendAssistantResponse({
        reply: "Please include a meeting date (e.g., tomorrow or YYYY-MM-DD) so I can schedule it.",
        source: "intent-schedule-meeting",
      });
    }

    const participant = extractMeetingParticipant(trimmedMessage);
    const purpose = extractContactRequestText(trimmedMessage);
    const meeting = await prismaDynamic.assistantMeeting.create({
      data: {
        userId: req.auth.userId,
        participant,
        purpose,
        scheduledFor,
        status: "SCHEDULED",
      },
    });

    return sendAssistantResponse({
      reply: [
        `Intent: SCHEDULE_MEETING (confidence ${detectedIntent.confidence.toFixed(2)})`,
        `Meeting scheduled with ${meeting.participant}.`,
        `Meeting ID: ${meeting.id}`,
        `When: ${new Date(meeting.scheduledFor).toLocaleString()}`,
      ].join("\n"),
      source: "intent-schedule-meeting",
    });
  }

  if (detectedIntent.intent === "PROJECT_RISK_ANALYSIS") {
    const budget = extractBudgetValueFromText(trimmedMessage) || 0;
    const location = extractLocationHint(trimmedMessage) || "Nairobi";
    const projectType = getProjectType(trimmedMessage);
    let riskScore = 55;
    if (/\burgent|asap\b/i.test(trimmedMessage)) riskScore += 15;
    if (budget > 0 && budget < 7000000) riskScore += 10;
    if (/\brainy|flood|coast|slope\b/i.test(trimmedMessage)) riskScore += 8;
    riskScore = Math.min(95, riskScore);

    return sendAssistantResponse({
      reply: [
        `Intent: PROJECT_RISK_ANALYSIS (confidence ${detectedIntent.confidence.toFixed(2)})`,
        `Risk score: ${riskScore}/100 for ${projectType} (${location})`,
        "Top risks:",
        "• Procurement lead-time variability",
        "• Scope changes after design freeze",
        "• Cashflow-pressure and contractor productivity",
        "Mitigation: lock critical materials early, maintain contingency, enforce weekly risk review.",
      ].join("\n"),
      source: "intent-project-risk-analysis",
    });
  }

  if (detectedIntent.intent === "PROJECT_STATUS_QUERY") {
    if (!req.auth?.userId || req.auth.userId === "dev-engineer") {
      return sendAssistantResponse({
        reply: "Project status query requires a logged-in account.",
        source: "intent-project-status-query",
      });
    }

    const pendingTasks = await prismaDynamic.assistantTask.findMany({
      where: { userId: req.auth.userId, status: { not: "COMPLETED" } },
      take: 5,
      orderBy: { createdAt: "desc" },
    });
    const upcomingMeetings = await prismaDynamic.assistantMeeting.findMany({
      where: { userId: req.auth.userId, status: "SCHEDULED", scheduledFor: { gte: new Date() } },
      take: 3,
      orderBy: { scheduledFor: "asc" },
    });

    return sendAssistantResponse({
      reply: [
        `Intent: PROJECT_STATUS_QUERY (confidence ${detectedIntent.confidence.toFixed(2)})`,
        `Open tasks: ${pendingTasks.length}`,
        `Upcoming meetings: ${upcomingMeetings.length}`,
        `Current phase: ${pendingTasks.length > 4 ? "Execution" : "Planning / Coordination"}`,
        "Blockers: check pending approvals, supplier confirmations and budget sign-off.",
      ].join("\n"),
      source: "intent-project-status-query",
    });
  }

  if (detectedIntent.intent === "CONSTRUCTION_REGULATIONS") {
    const location = extractLocationHint(trimmedMessage) || "Nairobi";
    const projectType = getProjectType(trimmedMessage);
    return sendAssistantResponse({
      reply: [
        `Intent: CONSTRUCTION_REGULATIONS (confidence ${detectedIntent.confidence.toFixed(2)})`,
        `Regulatory checklist for ${projectType} in ${location}:`,
        "• County development approval / building permit",
        "• NEMA compliance (where applicable)",
        "• Occupational safety compliance for site operations",
        "• Utility and wayleave clearances if required",
        "Disclaimer: confirm final requirements with local county and licensed professionals.",
      ].join("\n"),
      source: "intent-construction-regulations",
    });
  }

  if (detectedIntent.intent === "GENERAL_CONVERSATION" && /\b(what can you do|help me|capabilities|how does this work)\b/i.test(trimmedMessage)) {
    return sendAssistantResponse({
      reply: [
        "I can route your request to platform functions for:",
        "• engineer and contractor discovery",
        "• contact requests and inbox tracking",
        "• project planning, cost and risk analysis",
        "• material cost lookup",
        "• task creation/follow-up and meeting scheduling",
      ].join("\n"),
      source: "intent-general-conversation",
    });
  }

  if (isPricingIntent(trimmedMessage)) {
    return sendAssistantResponse({
      reply: buildPricingReply(),
      source: "policy",
    });
  }

  if (isTargetMarketIntent(trimmedMessage)) {
    return sendAssistantResponse({
      reply: buildTargetMarketReply(),
      source: "policy",
    });
  }

  if (isInboxListIntent(trimmedMessage) || isInboxSummaryIntent(trimmedMessage) || isSentInquiryIntent(trimmedMessage)) {
    if (!req.auth?.userId || req.auth.userId === "dev-engineer") {
      return sendAssistantResponse({
        reply: "Inbox access is unavailable for the current session. Please log in with a saved account to view real messages.",
        source: "inbox",
      });
    }

    try {
      const useSentRequests = req.auth.role === "USER" || isSentInquiryIntent(trimmedMessage);
      const inquiries = useSentRequests
        ? await prisma.inquiry.findMany({
            where: {
              OR: [{ senderUserId: req.auth.userId }, { senderEmail: req.auth.email }],
            } as never,
            include: {
              recipient: {
                select: {
                  name: true,
                  email: true,
                  role: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
            take: 10,
          })
        : await prisma.inquiry.findMany({
            where: { recipientId: req.auth.userId },
            orderBy: { createdAt: "desc" },
            take: 10,
          });

      if (inquiries.length === 0) {
        return sendAssistantResponse({
          reply: useSentRequests ? "You have not sent any requests yet." : "You have no messages in your inbox yet.",
          source: useSentRequests ? "sent-requests" : "inbox",
        });
      }

      if (isInboxSummaryIntent(trimmedMessage)) {
        const pending = inquiries.filter((item: InboxInquiryRecord) => item.status === "PENDING").length;
        const read = inquiries.filter((item: InboxInquiryRecord) => item.status === "READ").length;
        const replied = inquiries.filter((item: InboxInquiryRecord) => item.status === "REPLIED").length;

        return sendAssistantResponse({
          reply: [
            useSentRequests
              ? `You have ${inquiries.length} sent requests tracked in the platform.`
              : `You have ${inquiries.length} messages in your inbox.`,
            `• Pending: ${pending}`,
            `• Read: ${read}`,
            `• Replied: ${replied}`,
          ].join("\n"),
          source: useSentRequests ? "sent-requests" : "inbox",
        });
      }

      const inquiryLines = useSentRequests
        ? inquiries.map((inquiry: InboxInquiryRecord) =>
            formatSentInquiryPreview(inquiry as never)
          )
        : inquiries.map((inquiry: InboxInquiryRecord) =>
            formatInquiryPreview(inquiry as never)
          );

      return sendAssistantResponse({
        reply: [
          useSentRequests
            ? `Here are your latest ${inquiries.length} sent requests and replies:`
            : `Here are your latest ${inquiries.length} messages:`,
          ...inquiryLines,
        ].join("\n"),
        source: useSentRequests ? "sent-requests" : "inbox",
      });
    } catch (error) {
      console.error("Assistant inbox lookup error:", error);
      return sendAssistantResponse({
        reply: req.auth.role === "USER"
          ? "I could not load your sent requests right now. Please open the Messages page or try again shortly."
          : "I could not load your inbox right now. Please open the Inbox page or try again shortly.",
        source: req.auth.role === "USER" ? "sent-requests" : "inbox",
      });
    }
  }

  if (isContactEngineerIntent(assistantInputMessage)) {
    const requestedName = extractContactEngineerName(assistantInputMessage);
    if (!requestedName) {
      return sendAssistantResponse({
        reply: "I can do that. Please include the engineer name, for example: contact Eng. David Mwangi and ask for meeting availability.",
        source: "task-contact",
      });
    }

    const contactRequestText = extractContactRequestText(assistantInputMessage);

    try {
      const potentialEngineers = await prisma.user.findMany({
        where: {
          role: {
            in: CONTACTABLE_ROLES as never,
          },
          OR: [
            { name: { contains: requestedName, mode: "insensitive" } },
            { email: { contains: requestedName, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          location: true,
          company: true,
        },
        take: 20,
      });

      const ranked = potentialEngineers
        .map((engineer: ContactDirectoryEntry): EngineerCandidateScore => ({
          engineer,
          score: scoreEngineerNameMatch(engineer.name, requestedName),
        }))
        .sort((a: EngineerCandidateScore, b: EngineerCandidateScore) => b.score - a.score);

      let selected = ranked[0]?.engineer;

      if (sendToAnotherProfessional && selected) {
        const alternativeFromRanked = ranked.find((item: EngineerCandidateScore) => item.engineer.id !== selected.id && item.score > 0)?.engineer;

        if (alternativeFromRanked) {
          selected = alternativeFromRanked;
        } else {
          const locationHint = extractLocationHint(assistantInputMessage);
          const fallbackAlternative = await prisma.user.findFirst({
            where: {
              role: { in: CONTACTABLE_ROLES as never },
              id: { not: selected.id },
              ...(locationHint
                ? {
                    location: {
                      contains: locationHint,
                      mode: "insensitive",
                    },
                  }
                : {}),
            } as never,
            select: {
              id: true,
              name: true,
              email: true,
              location: true,
              company: true,
            },
            orderBy: { createdAt: "desc" },
          });

          if (fallbackAlternative) {
            selected = fallbackAlternative;
          } else {
            return sendAssistantResponse({
              reply: `I couldn't find another matching professional beyond ${selected.name || selected.email}. Ask me to list professionals first and choose one by name.`,
              source: "task-contact",
            });
          }
        }
      }

      if (!selected) {
        const sampleMatch = SAMPLE_ENGINEERS
          .map((engineer: typeof SAMPLE_ENGINEERS[number]) => ({
            engineer,
            score: scoreEngineerNameMatch(engineer.name, requestedName),
          }))
          .sort((a: { engineer: typeof SAMPLE_ENGINEERS[number]; score: number }, b: { engineer: typeof SAMPLE_ENGINEERS[number]; score: number }) => b.score - a.score)[0];

        if (sampleMatch && sampleMatch.score >= 2) {
          return sendAssistantResponse({
            reply: [
              `I could not find a live profile for ${requestedName}, but I prepared an outreach task for ${sampleMatch.engineer.name}.`,
              "Action draft:",
              `• Contact: ${sampleMatch.engineer.name} (${sampleMatch.engineer.email})`,
              `• Request: ${contactRequestText}`,
              "To execute this automatically, add this engineer as a registered ENGINEER user in the platform.",
            ].join("\n"),
            source: "task-contact-sample",
          });
        }

        return sendAssistantResponse({
          reply: `I could not find ${requestedName} in the current engineer directory. Ask me to list engineers in a location first, then I can contact one directly.`,
          source: "task-contact",
        });
      }

      let senderName = "Platform user";
      let senderEmail = req.auth?.email || "user@icdbo.local";
      let senderPhone: string | null = null;

      if (req.auth?.userId && req.auth.userId !== "dev-engineer") {
        const sender = await prisma.user.findUnique({
          where: { id: req.auth.userId },
          select: {
            name: true,
            email: true,
            phone: true,
          },
        });

        if (sender?.name?.trim()) senderName = sender.name.trim();
        if (sender?.email?.trim()) senderEmail = sender.email.trim();
        if (sender?.phone?.trim()) senderPhone = sender.phone.trim();
      }

      const inquiryMessage = [
        `AI assistant task created by ${senderName}.`,
        `User request: ${trimmedMessage}`,
        ...(assistantInputMessage !== trimmedMessage ? [`Resolved context: ${assistantInputMessage}`] : []),
        ...(sendToAnotherProfessional ? ["Follow-up mode: route to another matching professional."] : []),
        `Action required: ${contactRequestText}`,
      ].join("\n");

      const inquiry = await prisma.inquiry.create({
        data: {
          recipientId: selected.id,
          senderName,
          senderEmail,
          senderPhone,
          senderUserId: req.auth?.userId && req.auth.userId !== "dev-engineer" ? req.auth.userId : null,
          message: inquiryMessage,
        } as never,
      });

      return sendAssistantResponse({
        reply: [
          sendToAnotherProfessional
            ? `Done. I sent this request to another professional: ${selected.name || selected.email}.`
            : repeatedContactFromHistory
            ? `Done. I repeated your previous contact request to ${selected.name || selected.email}.`
            : `Done. I sent your contact request to ${selected.name || selected.email}.`,
          `Inquiry ID: ${inquiry.id}`,
          `Requested action: ${contactRequestText}`,
        ].join("\n"),
        source: "task-contact",
      });
    } catch (error) {
      console.error("Assistant contact-engineer task error:", error);
      return sendAssistantResponse({
        reply: "I could not complete that contact task right now due to a server issue. Please try again in a moment.",
        source: "task-contact",
      });
    }
  }

  if (isEngineerDiscoveryIntent(assistantInputMessage)) {
    const locationHint = extractLocationHint(assistantInputMessage);

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
        .filter((engineer: typeof SAMPLE_ENGINEERS[number]) => !locationHint || engineer.location.toLowerCase().includes(locationHint.toLowerCase()))
        .slice(0, 8)
        .map((engineer: typeof SAMPLE_ENGINEERS[number]) => ({
          name: engineer.name,
          email: engineer.email,
          company: engineer.company,
          location: engineer.location,
          bio: engineer.bio,
        }));

      const result = engineers.length > 0 ? engineers : fallbackEngineers;
      if (result.length === 0) {
        return sendAssistantResponse({
          reply: "I could not find engineers for that location yet. Try another city or update engineer profiles first.",
          source: "engineers",
        });
      }

      const heading = locationHint
        ? `Here are engineers I found in ${locationHint}:`
        : "Here are engineers I found:";

      return sendAssistantResponse({
        reply: [heading, ...result.map((engineer: { name: string | null; email: string; company: string | null; location: string | null; bio: string | null }) => formatEngineerLine(engineer))].join("\n"),
        source: "engineers",
      });
    } catch (error) {
      console.error("Assistant engineer lookup error:", error);
      const fallbackEngineers = SAMPLE_ENGINEERS
        .filter((engineer: typeof SAMPLE_ENGINEERS[number]) => !locationHint || engineer.location.toLowerCase().includes(locationHint.toLowerCase()))
        .slice(0, 8);

      if (fallbackEngineers.length > 0) {
        return sendAssistantResponse({
          reply: [
            "I used sample directory data because live lookup is unavailable right now:",
            ...fallbackEngineers.map((engineer: typeof SAMPLE_ENGINEERS[number]) => formatEngineerLine(engineer)),
          ].join("\n"),
          source: "engineers-fallback",
        });
      }
    }
  }

  const assistantResult = await generateAssistantReplyWithOllama({
    userName: req.auth?.email || "User",
    message: assistantInputMessage,
    history: storedHistory,
  });

  return sendAssistantResponse({
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
  // Pre-hash the seeded password so offline login works even when DB is down
  seededPasswordHash = await bcrypt.hash(SEEDED_DEFAULT_PASSWORD, 10);

  // Initialize email service
  const emailServiceReady = await verifyEmailService();
  if (!emailServiceReady) {
    console.warn("⚠ Email service failed to initialize. Email notifications will not be sent.");
  }

  let dbConnected = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbConnected = true;
    dbAvailable = true;
    await seedDefaultProfiles();
  } catch (error) {
    console.warn("⚠ Database connection failed. Starting API in degraded mode:", error);
    console.warn("⚠ Endpoints that require database access may fail until DB is reachable.");
  }

  app.listen(PORT, () => {
    console.log(`✓ Server running on http://localhost:${PORT}`);
    if (dbConnected) {
      console.log("✓ Database connection successful");
    }
    if (emailServiceReady) {
      console.log("✓ Email service connected");
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
