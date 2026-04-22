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
  sendPasswordResetEmail,
  sendReminderEmail
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
  communityPost: {
    findMany: (...args: any[]) => Promise<any[]>;
    count: (...args: any[]) => Promise<number>;
    createMany: (...args: any[]) => Promise<any>;
    create: (...args: any[]) => Promise<any>;
  };
  communityUpdate: {
    findMany: (...args: any[]) => Promise<any[]>;
    count: (...args: any[]) => Promise<number>;
    createMany: (...args: any[]) => Promise<any>;
    update: (...args: any[]) => Promise<any>;
  };
  communityAd: {
    findMany: (...args: any[]) => Promise<any[]>;
    count: (...args: any[]) => Promise<number>;
    createMany: (...args: any[]) => Promise<any>;
    update: (...args: any[]) => Promise<any>;
  };
  communityPostReport: {
    create: (...args: any[]) => Promise<any>;
    findFirst: (...args: any[]) => Promise<any>;
  };
};
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.1";
const OLLAMA_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS || "12000");
const LIVE_ROOM_STUN_SERVERS = (process.env.LIVE_ROOM_STUN_SERVERS || "stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const LIVE_ROOM_TURN_URLS = (process.env.LIVE_ROOM_TURN_URLS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const LIVE_ROOM_TURN_USERNAME = (process.env.LIVE_ROOM_TURN_USERNAME || "").trim();
const LIVE_ROOM_TURN_CREDENTIAL = (process.env.LIVE_ROOM_TURN_CREDENTIAL || "").trim();
const LIVE_ROOM_TURN_CREDENTIAL_TYPE = (process.env.LIVE_ROOM_TURN_CREDENTIAL_TYPE || "password").trim();
const DEV_AUTH_BYPASS = process.env.DEV_AUTH_BYPASS === "true";
const DEV_ENGINEER_EMAIL = process.env.DEV_ENGINEER_EMAIL || "engineer@local.test";
const DEV_ENGINEER_PASSWORD = process.env.DEV_ENGINEER_PASSWORD || "Engineer1234";
const DEV_ENGINEER_NAME = process.env.DEV_ENGINEER_NAME || "Mock Engineer";
let devEngineerTwoFactorEnabled = false;
const offlineTwoFactorOverrides = new Map<string, boolean>();

// Offline-mode state — set true only after a successful DB connection at startup
let dbAvailable = false;
// Pre-hashed password for seeded accounts (populated in start() even when DB is down)
let seededPasswordHash = "";
const ASSISTANT_CHAT_LIMIT = Math.max(1, Number(process.env.ASSISTANT_CHAT_LIMIT || "12"));
const ASSISTANT_DAILY_MESSAGE_LIMIT = Math.max(1, Number(process.env.ASSISTANT_DAILY_MESSAGE_LIMIT || "50"));
const ASSISTANT_CHAT_LIMIT_SETTING_KEY = "assistant.chat.limit";
const ASSISTANT_DAILY_LIMIT_SETTING_KEY = "assistant.daily.limit";
const PROJECT_REMINDER_DEFAULT_ENABLED = true;
const PROJECT_REMINDER_DEFAULT_FREQUENCY = "daily" as const;
const PROJECT_REMINDER_DEFAULT_QUIET_HOURS_START = 22;
const PROJECT_REMINDER_DEFAULT_QUIET_HOURS_END = 7;

const getProjectReminderEnabledSettingKey = (userId: string) => `project.reminders.enabled.${userId}`;
const getProjectReminderFrequencySettingKey = (userId: string) => `project.reminders.frequency.${userId}`;
const getProjectReminderQuietHoursStartSettingKey = (userId: string) => `project.reminders.quiet_start.${userId}`;
const getProjectReminderQuietHoursEndSettingKey = (userId: string) => `project.reminders.quiet_end.${userId}`;
const getProjectReminderLastSentSettingKey = (userId: string) => `project.reminders.last_sent.${userId}`;

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

type TeamMemberRecord = {
  id: string;
  ownerId: string;
  name: string;
  email: string;
  role: string;
  projects: number;
  avatar: string;
  createdAt: Date;
  updatedAt: Date;
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

type CommunityPostRecord = {
  id: string;
  title: string;
  summary: string;
  content: string;
  postType: string;
  authorName: string;
  field: string;
  interests: string[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type CommunityMediaAsset = {
  url: string;
  mediaType: "image" | "video" | "audio" | "document";
  fileName: string;
};

type CommunityLiveSession = {
  title: string;
  startsAt: string;
  roomUrl: string;
  roomId?: string;
  description?: string;
};

type LiveRoomSignal = {
  seq: number;
  fromParticipantId: string;
  toParticipantId: string | null;
  type: "offer" | "answer" | "ice-candidate" | "participant-joined" | "participant-left";
  payload: Record<string, unknown>;
  createdAt: string;
};

type LiveRoomParticipant = {
  participantId: string;
  userId: string;
  role: AppUserRole;
  displayName: string;
  joinedAt: string;
  lastSeenAt: string;
};

type LiveRoomTranscriptEntry = {
  id: string;
  participantId: string;
  author: string;
  text: string;
  createdAt: string;
};

type LiveRoomRecordingState = {
  isRecording: boolean;
  startedAt: string | null;
  startedByParticipantId: string | null;
  stoppedAt: string | null;
};

type LiveRoomRecordingAsset = {
  id: string;
  participantId: string;
  author: string;
  fileUrl: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  durationMs: number | null;
  uploadedAt: string;
};

type LiveRoomRecordingUploadSession = {
  uploadId: string;
  roomId: string;
  participantId: string;
  userId: string;
  author: string;
  fileName: string;
  mimeType: string;
  totalChunks: number;
  durationMs: number | null;
  tempPath: string;
  receivedChunks: Set<number>;
  createdAt: number;
  updatedAt: number;
};

type LiveRoomState = {
  roomId: string;
  title: string;
  createdAt: string;
  hostUserId: string | null;
  moderatorUserIds: Set<string>;
  isLocked: boolean;
  allowGuestJoin: boolean;
  participants: Map<string, LiveRoomParticipant>;
  signals: LiveRoomSignal[];
  signalSeq: number;
  transcript: LiveRoomTranscriptEntry[];
  recording: LiveRoomRecordingState;
  recordings: LiveRoomRecordingAsset[];
};

type EncodedCommunityPostContent = {
  kind: "community-post-v1";
  body: string;
  media: CommunityMediaAsset[];
  liveSession: CommunityLiveSession | null;
};

type CommunityUpdateRecord = {
  id: string;
  title: string;
  body: string;
  isPinned: boolean;
  isPublished: boolean;
  pinnedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type CommunityAdRecord = {
  id: string;
  title: string;
  copy: string;
  ctaUrl: string;
  targetFields: string[];
  targetRoles: AppUserRole[];
  isApproved: boolean;
  approvedAt: Date | null;
  approvedById: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type CommunityRecommendation = {
  id: string;
  title: string;
  format: string;
  field: string;
  score: number;
};

type CommunityInteractionState = {
  bookmarks: string[];
  follows: string[];
  votes: Record<string, "up" | "down">;
  pollVotes: Record<string, string>;
  chatMessages: Array<{
    id: string;
    author: string;
    message: string;
    createdAt: string;
  }>;
};

type CommunityPostComment = {
  id: string;
  postId: string;
  author: string;
  message: string;
  replyToCommentId: string | null;
  createdAt: string;
};

type CommunityActivityNotification = {
  id: string;
  type: "post_like" | "post_follow" | "post_comment" | "comment_reply";
  title: string;
  body: string;
  postId: string | null;
  postTitle: string | null;
  actorName: string | null;
  createdAt: string;
  readAt: string | null;
};

type CommunityPostEngagement = {
  likes: number;
  comments: number;
  follows: number;
  showLikes: boolean;
  showComments: boolean;
  showFollows: boolean;
};

type CommunityInteractionAction =
  | "post_create"
  | "post_delete"
  | "bookmark_add"
  | "bookmark_remove"
  | "follow_add"
  | "follow_remove"
  | "vote_up"
  | "vote_down"
  | "vote_clear"
  | "poll_vote"
  | "poll_clear"
  | "post_report"
  | "chat_message"
  | "comment_create"
  | "comment_reply";

type CommunityInteractionEvent = {
  action: CommunityInteractionAction;
  itemId?: string;
  field?: string;
  tokens?: string[];
  createdAt?: string;
};

type CommunityAnalyticsState = {
  interactionsByAction: Partial<Record<CommunityInteractionAction, number>>;
  interactionsByField: Record<string, number>;
  interactionsByToken: Record<string, number>;
  recentActions: Array<{
    action: CommunityInteractionAction;
    itemId: string | null;
    field: string | null;
    createdAt: string;
  }>;
  totalInteractions: number;
  lastInteractionAt: string | null;
};

const COMMUNITY_MODERATOR_ROLES: AppUserRole[] = ["ADMIN", "PROJECT_MANAGER", "REGULATOR"];
const COMMUNITY_STATE_PREFIX = "community.state";
const COMMUNITY_ANALYTICS_PREFIX = "community.analytics";
const COMMUNITY_COMMENTS_PREFIX = "community.comments";
const COMMUNITY_POST_ENGAGEMENT_PREFIX = "community.post.engagement";
const COMMUNITY_ACTIVITY_PREFIX = "community.activity";
const communityStateCache = new Map<string, CommunityInteractionState>();
const communityAnalyticsCache = new Map<string, CommunityAnalyticsState>();
const communityPostCache = new Map<string, CommunityPostRecord>();
const communityCommentsCache = new Map<string, CommunityPostComment[]>();
const communityPostEngagementCache = new Map<string, CommunityPostEngagement>();
const communityActivityCache = new Map<string, CommunityActivityNotification[]>();
const communityLiveRooms = new Map<string, LiveRoomState>();
const LIVE_ROOM_STALE_MS = 5 * 60 * 1000;
const LIVE_ROOM_EMPTY_ROOM_TTL_MS = 60 * 60 * 1000;
const LIVE_ROOM_MAX_SIGNALS = 500;
const LIVE_ROOM_MAX_TRANSCRIPT_ENTRIES = 2000;
const LIVE_ROOM_MAX_RECORDINGS = 200;
const COMMUNITY_ANALYTICS_MAX_RECENT_ACTIONS = 120;
const LIVE_ROOM_RECORDING_CHUNK_MAX_BYTES = 10 * 1024 * 1024;
const LIVE_ROOM_RECORDING_UPLOAD_TTL_MS = 30 * 60 * 1000;
const liveRoomRecordingUploads = new Map<string, LiveRoomRecordingUploadSession>();

const createDefaultCommunityState = (): CommunityInteractionState => ({
  bookmarks: [],
  follows: [],
  votes: {},
  pollVotes: {},
  chatMessages: [],
});

const normalizeCommunityState = (state?: Partial<CommunityInteractionState> | null): CommunityInteractionState => ({
  bookmarks: Array.isArray(state?.bookmarks) ? state!.bookmarks : [],
  follows: Array.isArray(state?.follows) ? state!.follows : [],
  votes: state?.votes && typeof state.votes === "object" ? (state.votes as Record<string, "up" | "down">) : {},
  pollVotes: state?.pollVotes && typeof state.pollVotes === "object" ? (state.pollVotes as Record<string, string>) : {},
  chatMessages: Array.isArray(state?.chatMessages) ? state!.chatMessages : [],
});

const parseCommunityState = (raw: string | null | undefined): CommunityInteractionState => {
  if (!raw) return createDefaultCommunityState();

  try {
    return normalizeCommunityState(JSON.parse(raw) as Partial<CommunityInteractionState>);
  } catch {
    return createDefaultCommunityState();
  }
};

const toPostSummary = (content: string): string => {
  const normalized = content.replace(/\s+/g, " ").trim();
  if (normalized.length <= 180) return normalized;
  return `${normalized.slice(0, 177)}...`;
};

const normalizeMediaAssets = (value: unknown): CommunityMediaAsset[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const candidate = item as Partial<CommunityMediaAsset>;
      if (!candidate.url || !candidate.fileName) return null;
      if (
        candidate.mediaType !== "image" &&
        candidate.mediaType !== "video" &&
        candidate.mediaType !== "audio" &&
        candidate.mediaType !== "document"
      ) {
        return null;
      }
      return {
        url: String(candidate.url),
        mediaType: candidate.mediaType,
        fileName: String(candidate.fileName),
      } as CommunityMediaAsset;
    })
    .filter((item): item is CommunityMediaAsset => Boolean(item));
};

const normalizeLiveSession = (value: unknown): CommunityLiveSession | null => {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<CommunityLiveSession>;
  if (!candidate.title || !candidate.startsAt || !candidate.roomUrl) return null;

  return {
    title: String(candidate.title),
    startsAt: String(candidate.startsAt),
    roomUrl: String(candidate.roomUrl),
    roomId: candidate.roomId ? String(candidate.roomId) : undefined,
    description: candidate.description ? String(candidate.description) : undefined,
  };
};

const normalizeRoomId = (input: string): string =>
  input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);

const extractRoomIdFromUrl = (url: string): string | null => {
  const normalized = url.trim();
  const match = normalized.match(/\/community\/live\/([a-zA-Z0-9-]+)/);
  if (!match?.[1]) return null;
  const roomId = normalizeRoomId(match[1]);
  return roomId || null;
};

const ensureLiveRoom = (roomId: string, title?: string, hostUserId?: string | null): LiveRoomState => {
  const key = normalizeRoomId(roomId);
  const nowIso = new Date().toISOString();
  const existing = communityLiveRooms.get(key);
  if (existing) {
    if (title?.trim()) existing.title = title.trim();
    if (hostUserId && !existing.hostUserId) {
      existing.hostUserId = hostUserId;
      existing.moderatorUserIds.add(hostUserId);
    }
    return existing;
  }

  const created: LiveRoomState = {
    roomId: key,
    title: title?.trim() || "Community live room",
    createdAt: nowIso,
    hostUserId: hostUserId || null,
    moderatorUserIds: new Set(hostUserId ? [hostUserId] : []),
    isLocked: false,
    allowGuestJoin: true,
    participants: new Map<string, LiveRoomParticipant>(),
    signals: [],
    signalSeq: 0,
    transcript: [],
    recording: {
      isRecording: false,
      startedAt: null,
      startedByParticipantId: null,
      stoppedAt: null,
    },
    recordings: [],
  };
  communityLiveRooms.set(key, created);
  return created;
};

const isLiveRoomModerator = (room: LiveRoomState, userId: string, role: AppUserRole): boolean => {
  return room.hostUserId === userId || room.moderatorUserIds.has(userId) || role === "ADMIN";
};

const canJoinLiveRoom = (room: LiveRoomState, userId: string, role: AppUserRole): boolean => {
  if (!room.isLocked) return true;
  if (room.allowGuestJoin) return true;
  return isLiveRoomModerator(room, userId, role);
};

const resolveLiveRoomIceServers = (): Array<{
  urls: string | string[];
  username?: string;
  credential?: string;
  credentialType?: string;
}> => {
  const stunServers = LIVE_ROOM_STUN_SERVERS.map((urls) => ({ urls }));
  const turnServers =
    LIVE_ROOM_TURN_URLS.length > 0 && LIVE_ROOM_TURN_USERNAME && LIVE_ROOM_TURN_CREDENTIAL
      ? LIVE_ROOM_TURN_URLS.map((urls) => ({
          urls,
          username: LIVE_ROOM_TURN_USERNAME,
          credential: LIVE_ROOM_TURN_CREDENTIAL,
          credentialType: LIVE_ROOM_TURN_CREDENTIAL_TYPE,
        }))
      : [];

  return [...turnServers, ...stunServers];
};

const pushLiveRoomSignal = (
  room: LiveRoomState,
  signal: Omit<LiveRoomSignal, "seq" | "createdAt">
): LiveRoomSignal => {
  room.signalSeq += 1;
  const next: LiveRoomSignal = {
    ...signal,
    seq: room.signalSeq,
    createdAt: new Date().toISOString(),
  };

  room.signals.push(next);
  if (room.signals.length > LIVE_ROOM_MAX_SIGNALS) {
    room.signals.splice(0, room.signals.length - LIVE_ROOM_MAX_SIGNALS);
  }

  return next;
};

const pruneLiveRooms = (): void => {
  const now = Date.now();

  for (const [roomId, room] of communityLiveRooms.entries()) {
    for (const [participantId, participant] of room.participants.entries()) {
      if (now - new Date(participant.lastSeenAt).getTime() > LIVE_ROOM_STALE_MS) {
        room.participants.delete(participantId);
        pushLiveRoomSignal(room, {
          fromParticipantId: participantId,
          toParticipantId: null,
          type: "participant-left",
          payload: { participantId },
        });
      }
    }

    if (
      room.participants.size === 0 &&
      now - new Date(room.createdAt).getTime() > LIVE_ROOM_EMPTY_ROOM_TTL_MS
    ) {
      communityLiveRooms.delete(roomId);
    }
  }
};

const pruneLiveRoomRecordingUploads = (): void => {
  const now = Date.now();

  for (const [uploadId, upload] of liveRoomRecordingUploads.entries()) {
    if (now - upload.updatedAt <= LIVE_ROOM_RECORDING_UPLOAD_TTL_MS) {
      continue;
    }

    try {
      if (fs.existsSync(upload.tempPath)) {
        fs.unlinkSync(upload.tempPath);
      }
    } catch {
      // Ignore filesystem cleanup errors and drop stale upload session.
    }

    liveRoomRecordingUploads.delete(uploadId);
  }
};

const decodePostContent = (rawContent: string): {
  body: string;
  media: CommunityMediaAsset[];
  liveSession: CommunityLiveSession | null;
} => {
  try {
    const parsed = JSON.parse(rawContent) as Partial<EncodedCommunityPostContent>;
    if (parsed?.kind !== "community-post-v1") {
      return { body: rawContent, media: [], liveSession: null };
    }

    return {
      body: typeof parsed.body === "string" ? parsed.body : "",
      media: normalizeMediaAssets(parsed.media),
      liveSession: normalizeLiveSession(parsed.liveSession),
    };
  } catch {
    return { body: rawContent, media: [], liveSession: null };
  }
};

const getCommunityStateKey = (userId: string) => `${COMMUNITY_STATE_PREFIX}.${userId}`;
const getCommunityAnalyticsKey = (userId: string) => `${COMMUNITY_ANALYTICS_PREFIX}.${userId}`;
const getCommunityCommentsKey = (postId: string) => `${COMMUNITY_COMMENTS_PREFIX}.${postId}`;
const getCommunityPostEngagementKey = (postId: string) => `${COMMUNITY_POST_ENGAGEMENT_PREFIX}.${postId}`;
const getCommunityActivityKey = (userId: string) => `${COMMUNITY_ACTIVITY_PREFIX}.${userId}`;

const createDefaultCommunityPostEngagement = (): CommunityPostEngagement => ({
  likes: 0,
  comments: 0,
  follows: 0,
  showLikes: true,
  showComments: true,
  showFollows: true,
});

const normalizeCommunityPostEngagement = (value?: Partial<CommunityPostEngagement> | null): CommunityPostEngagement => ({
  likes: Math.max(0, Math.round(Number(value?.likes || 0))),
  comments: Math.max(0, Math.round(Number(value?.comments || 0))),
  follows: Math.max(0, Math.round(Number(value?.follows || 0))),
  showLikes: typeof value?.showLikes === "boolean" ? value.showLikes : true,
  showComments: typeof value?.showComments === "boolean" ? value.showComments : true,
  showFollows: typeof value?.showFollows === "boolean" ? value.showFollows : true,
});

const parseCommunityPostEngagement = (raw: string | null | undefined): CommunityPostEngagement => {
  if (!raw) return createDefaultCommunityPostEngagement();

  try {
    return normalizeCommunityPostEngagement(JSON.parse(raw) as Partial<CommunityPostEngagement>);
  } catch {
    return createDefaultCommunityPostEngagement();
  }
};

const loadCommunityPostEngagement = async (postId: string): Promise<CommunityPostEngagement> => {
  if (!dbAvailable) {
    return communityPostEngagementCache.get(postId) || createDefaultCommunityPostEngagement();
  }

  const rows = await prismaDynamic.platformSetting.findMany({
    where: { key: getCommunityPostEngagementKey(postId) },
    take: 1,
  });

  return parseCommunityPostEngagement(rows[0]?.value);
};

const loadCommunityPostEngagementMap = async (
  postIds: string[]
): Promise<Record<string, CommunityPostEngagement>> => {
  const uniquePostIds = Array.from(new Set(postIds.map((id) => id.trim()).filter(Boolean)));
  const map: Record<string, CommunityPostEngagement> = {};

  if (uniquePostIds.length === 0) {
    return map;
  }

  if (!dbAvailable) {
    for (const postId of uniquePostIds) {
      map[postId] = communityPostEngagementCache.get(postId) || createDefaultCommunityPostEngagement();
    }
    return map;
  }

  const keys = uniquePostIds.map((postId) => getCommunityPostEngagementKey(postId));
  const rows = await prismaDynamic.platformSetting.findMany({
    where: { key: { in: keys } },
  });

  const parsedByPostId = new Map<string, CommunityPostEngagement>();
  for (const row of rows) {
    const key = String(row.key || "");
    const postId = key.startsWith(`${COMMUNITY_POST_ENGAGEMENT_PREFIX}.`)
      ? key.slice(`${COMMUNITY_POST_ENGAGEMENT_PREFIX}.`.length)
      : "";
    if (!postId) continue;
    parsedByPostId.set(postId, parseCommunityPostEngagement(row.value));
  }

  for (const postId of uniquePostIds) {
    map[postId] = parsedByPostId.get(postId) || createDefaultCommunityPostEngagement();
  }

  return map;
};

const saveCommunityPostEngagement = async (
  postId: string,
  value: CommunityPostEngagement
): Promise<CommunityPostEngagement> => {
  const normalized = normalizeCommunityPostEngagement(value);

  if (!dbAvailable) {
    communityPostEngagementCache.set(postId, normalized);
    return normalized;
  }

  await prismaDynamic.platformSetting.upsert({
    where: { key: getCommunityPostEngagementKey(postId) },
    update: { value: JSON.stringify(normalized) },
    create: { key: getCommunityPostEngagementKey(postId), value: JSON.stringify(normalized) },
  });

  communityPostEngagementCache.set(postId, normalized);
  return normalized;
};

const updateCommunityPostEngagement = async (
  postId: string,
  updater: (current: CommunityPostEngagement) => CommunityPostEngagement
): Promise<CommunityPostEngagement> => {
  const current = await loadCommunityPostEngagement(postId);
  const next = normalizeCommunityPostEngagement(updater(current));
  return saveCommunityPostEngagement(postId, next);
};

const normalizeCommunityPostComments = (value: unknown): CommunityPostComment[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const candidate = entry as Partial<CommunityPostComment>;
      const id = typeof candidate.id === "string" ? candidate.id.trim() : "";
      const postId = typeof candidate.postId === "string" ? candidate.postId.trim() : "";
      const author = typeof candidate.author === "string" ? candidate.author.trim() : "";
      const message = typeof candidate.message === "string" ? candidate.message.trim() : "";
      const replyToCommentId =
        typeof candidate.replyToCommentId === "string" && candidate.replyToCommentId.trim().length > 0
          ? candidate.replyToCommentId.trim()
          : null;
      const createdAt = typeof candidate.createdAt === "string" ? candidate.createdAt.trim() : "";

      if (!id || !postId || !author || !message || !createdAt) {
        return null;
      }

      return {
        id,
        postId,
        author,
        message,
        replyToCommentId,
        createdAt,
      };
    })
    .filter((entry): entry is CommunityPostComment => Boolean(entry))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice(-100);
};

const loadCommunityPostComments = async (postId: string): Promise<CommunityPostComment[]> => {
  if (!dbAvailable) {
    return communityCommentsCache.get(postId) || [];
  }

  const rows = await prismaDynamic.platformSetting.findMany({
    where: { key: getCommunityCommentsKey(postId) },
    take: 1,
  });

  const rawValue = rows[0]?.value;
  if (!rawValue) return [];

  try {
    return normalizeCommunityPostComments(JSON.parse(rawValue));
  } catch {
    return [];
  }
};

const saveCommunityPostComments = async (
  postId: string,
  comments: CommunityPostComment[]
): Promise<CommunityPostComment[]> => {
  const normalized = normalizeCommunityPostComments(comments);

  if (!dbAvailable) {
    communityCommentsCache.set(postId, normalized);
    return normalized;
  }

  await prismaDynamic.platformSetting.upsert({
    where: { key: getCommunityCommentsKey(postId) },
    update: { value: JSON.stringify(normalized) },
    create: { key: getCommunityCommentsKey(postId), value: JSON.stringify(normalized) },
  });

  return normalized;
};

const normalizeCommunityActivityNotifications = (value?: unknown): CommunityActivityNotification[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const candidate = entry as Partial<CommunityActivityNotification>;
      const id = typeof candidate.id === "string" ? candidate.id.trim() : "";
      const type = candidate.type;
      const title = typeof candidate.title === "string" ? candidate.title.trim() : "";
      const body = typeof candidate.body === "string" ? candidate.body.trim() : "";
      const postId = typeof candidate.postId === "string" ? candidate.postId.trim() : null;
      const postTitle = typeof candidate.postTitle === "string" ? candidate.postTitle.trim() : null;
      const actorName = typeof candidate.actorName === "string" ? candidate.actorName.trim() : null;
      const createdAt = typeof candidate.createdAt === "string" ? candidate.createdAt.trim() : "";
      const readAt = typeof candidate.readAt === "string" ? candidate.readAt.trim() : null;

      if (!id || !type || !title || !body || !createdAt) {
        return null;
      }

      if (!["post_like", "post_follow", "post_comment", "comment_reply"].includes(type)) {
        return null;
      }

      return { id, type, title, body, postId, postTitle, actorName, createdAt, readAt };
    })
    .filter((entry): entry is CommunityActivityNotification => Boolean(entry))
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 50);
};

const loadCommunityActivity = async (userId: string): Promise<CommunityActivityNotification[]> => {
  if (!dbAvailable) {
    return communityActivityCache.get(userId) || [];
  }

  const rows = await prismaDynamic.platformSetting.findMany({
    where: { key: getCommunityActivityKey(userId) },
    take: 1,
  });

  try {
    return normalizeCommunityActivityNotifications(JSON.parse(rows[0]?.value || "[]"));
  } catch {
    return [];
  }
};

const saveCommunityActivity = async (
  userId: string,
  notifications: CommunityActivityNotification[]
): Promise<CommunityActivityNotification[]> => {
  const normalized = normalizeCommunityActivityNotifications(notifications);

  if (!dbAvailable) {
    communityActivityCache.set(userId, normalized);
    return normalized;
  }

  await prismaDynamic.platformSetting.upsert({
    where: { key: getCommunityActivityKey(userId) },
    update: { value: JSON.stringify(normalized) },
    create: { key: getCommunityActivityKey(userId), value: JSON.stringify(normalized) },
  });

  communityActivityCache.set(userId, normalized);
  return normalized;
};

const pushCommunityActivity = async (userId: string, notification: CommunityActivityNotification): Promise<void> => {
  const current = await loadCommunityActivity(userId);
  const next = normalizeCommunityActivityNotifications([notification, ...current]);
  await saveCommunityActivity(userId, next);
};

const markCommunityActivityRead = async (userId: string, notificationId: string): Promise<CommunityActivityNotification | null> => {
  const current = await loadCommunityActivity(userId);
  let updatedNotification: CommunityActivityNotification | null = null;

  const next = current.map((item) => {
    if (item.id !== notificationId) return item;
    updatedNotification = { ...item, readAt: item.readAt || new Date().toISOString() };
    return updatedNotification;
  });

  if (!updatedNotification) return null;

  await saveCommunityActivity(userId, next);
  return updatedNotification;
};

const markAllCommunityActivityRead = async (userId: string): Promise<CommunityActivityNotification[]> => {
  const current = await loadCommunityActivity(userId);
  const now = new Date().toISOString();
  const next = current.map((item) => ({ ...item, readAt: item.readAt || now }));
  return saveCommunityActivity(userId, next);
};

const resolveUserIdFromDisplayName = async (displayName: string): Promise<string | null> => {
  const normalized = displayName.trim().toLowerCase();
  if (!normalized || !dbAvailable) return null;

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { name: { equals: displayName, mode: "insensitive" } },
        { email: { startsWith: `${normalized}@`, mode: "insensitive" } },
        { email: { startsWith: `${normalized}`, mode: "insensitive" } },
      ],
    },
    select: { id: true },
  });

  return user?.id || null;
};

const resolveCommunityPostSnapshot = async (
  itemId: string
): Promise<{ field: string | null; tokens: string[]; title: string | null; authorName: string | null; authorUserId: string | null }> => {
  const normalizedItemId = itemId.trim();
  if (!normalizedItemId) return { field: null, tokens: [], title: null, authorName: null, authorUserId: null };

  if (!dbAvailable) {
    const fallback = FALLBACK_COMMUNITY_POSTS.find((post) => post.id === normalizedItemId);
    if (!fallback) return { field: null, tokens: [], title: null, authorName: null, authorUserId: null };
    const decoded = decodePostContent(fallback.content);
    const tokens = Array.from(
      new Set([...fallback.interests, ...tokenizeInterestText(fallback.title, decoded.body, fallback.field)])
    );
    return { field: fallback.field, tokens, title: fallback.title, authorName: fallback.authorName, authorUserId: null };
  }

  try {
    const post = (await prismaDynamic.communityPost.findUnique({
      where: { id: normalizedItemId },
    })) as CommunityPostRecord | null;

    if (!post) return { field: null, tokens: [], title: null, authorName: null, authorUserId: null };

    const decoded = decodePostContent(post.content);
    const tokens = Array.from(new Set([...post.interests, ...tokenizeInterestText(post.title, decoded.body, post.field)]));
    const authorUserId = await resolveUserIdFromDisplayName(post.authorName);
    return { field: post.field, tokens, title: post.title, authorName: post.authorName, authorUserId };
  } catch {
    return { field: null, tokens: [], title: null, authorName: null, authorUserId: null };
  }
};

const queueCommunityPostActivity = async (args: {
  itemId: string;
  actorUserId: string;
  actorName: string;
  kind: "post_like" | "post_follow" | "post_comment" | "comment_reply";
  commentMessage?: string;
  replyToCommentId?: string | null;
}): Promise<void> => {
  const snapshot = await resolveCommunityPostSnapshot(args.itemId);
  const recipientUserId = snapshot.authorUserId;
  const postTitle = snapshot.title || "your post";

  if (recipientUserId && recipientUserId !== args.actorUserId) {
    const baseBody =
      args.kind === "post_like"
        ? `${args.actorName} liked your post "${postTitle}".`
        : args.kind === "post_follow"
          ? `${args.actorName} followed your post "${postTitle}".`
          : args.kind === "comment_reply"
            ? `${args.actorName} replied on your post "${postTitle}".`
          : `${args.actorName} commented on your post "${postTitle}".`;

    await pushCommunityActivity(recipientUserId, {
      id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: args.kind === "comment_reply" ? "comment_reply" : args.kind,
      title:
        args.kind === "post_like"
          ? "New like"
          : args.kind === "post_follow"
            ? "New follow"
            : args.kind === "comment_reply"
              ? "New reply"
              : "New comment",
      body: baseBody,
      postId: args.itemId,
      postTitle,
      actorName: args.actorName,
      createdAt: new Date().toISOString(),
      readAt: null,
    });
  }

  if (args.kind === "comment_reply") {
    const targetCommentId = typeof args.replyToCommentId === "string" ? args.replyToCommentId.trim() : "";
    if (!targetCommentId) return;

    const comments = await loadCommunityPostComments(args.itemId);
    const targetComment = comments.find((comment) => comment.id === targetCommentId);
    if (!targetComment) return;

    const targetUserId = await resolveUserIdFromDisplayName(targetComment.author);
    if (!targetUserId || targetUserId === args.actorUserId || targetUserId === recipientUserId) {
      return;
    }

    await pushCommunityActivity(targetUserId, {
      id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: "comment_reply",
      title: "New reply",
      body: `${args.actorName} replied to your comment on "${postTitle}".`,
      postId: args.itemId,
      postTitle,
      actorName: args.actorName,
      createdAt: new Date().toISOString(),
      readAt: null,
    });

    return;
  }

  if (args.kind !== "post_comment") return;

  const comments = await loadCommunityPostComments(args.itemId);
  const previousCommenterNames = Array.from(
    new Set(comments.slice(0, -1).map((comment) => comment.author).filter(Boolean))
  );

  for (const commenterName of previousCommenterNames) {
    const commenterUserId = await resolveUserIdFromDisplayName(commenterName);
    if (!commenterUserId || commenterUserId === args.actorUserId || commenterUserId === recipientUserId) {
      continue;
    }

    await pushCommunityActivity(commenterUserId, {
      id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: "comment_reply",
      title: "Reply in a thread",
      body: `${args.actorName} replied in a discussion you participated in on "${postTitle}".`,
      postId: args.itemId,
      postTitle,
      actorName: args.actorName,
      createdAt: new Date().toISOString(),
      readAt: null,
    });
  }
};

const createDefaultCommunityAnalyticsState = (): CommunityAnalyticsState => ({
  interactionsByAction: {},
  interactionsByField: {},
  interactionsByToken: {},
  recentActions: [],
  totalInteractions: 0,
  lastInteractionAt: null,
});

const normalizeCommunityAnalyticsState = (state?: Partial<CommunityAnalyticsState> | null): CommunityAnalyticsState => {
  const actionCounts: Partial<Record<CommunityInteractionAction, number>> = {};
  if (state?.interactionsByAction && typeof state.interactionsByAction === "object") {
    for (const [key, value] of Object.entries(state.interactionsByAction)) {
      const count = Number(value || 0);
      if (!Number.isFinite(count) || count <= 0) continue;
      actionCounts[key as CommunityInteractionAction] = Math.round(count);
    }
  }

  const fieldCounts: Record<string, number> = {};
  if (state?.interactionsByField && typeof state.interactionsByField === "object") {
    for (const [key, value] of Object.entries(state.interactionsByField)) {
      const normalizedKey = key.trim();
      const count = Number(value || 0);
      if (!normalizedKey || !Number.isFinite(count) || count <= 0) continue;
      fieldCounts[normalizedKey] = Math.round(count);
    }
  }

  const tokenCounts: Record<string, number> = {};
  if (state?.interactionsByToken && typeof state.interactionsByToken === "object") {
    for (const [key, value] of Object.entries(state.interactionsByToken)) {
      const normalizedKey = key.trim().toLowerCase();
      const count = Number(value || 0);
      if (!normalizedKey || !Number.isFinite(count) || count <= 0) continue;
      tokenCounts[normalizedKey] = Math.round(count);
    }
  }

  const recentActions = Array.isArray(state?.recentActions)
    ? state!.recentActions
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const candidate = item as Partial<CommunityAnalyticsState["recentActions"][number]>;
          const action = String(candidate.action || "") as CommunityInteractionAction;
          const createdAt = String(candidate.createdAt || "").trim();
          if (!action || !createdAt) return null;
          return {
            action,
            itemId: typeof candidate.itemId === "string" ? candidate.itemId : null,
            field: typeof candidate.field === "string" ? candidate.field : null,
            createdAt,
          };
        })
        .filter((item): item is CommunityAnalyticsState["recentActions"][number] => Boolean(item))
        .slice(-COMMUNITY_ANALYTICS_MAX_RECENT_ACTIONS)
    : [];

  const totalInteractions = Number.isFinite(state?.totalInteractions) ? Number(state?.totalInteractions) : 0;
  const lastInteractionAt = typeof state?.lastInteractionAt === "string" ? state.lastInteractionAt : null;

  return {
    interactionsByAction: actionCounts,
    interactionsByField: fieldCounts,
    interactionsByToken: tokenCounts,
    recentActions,
    totalInteractions: Math.max(0, Math.round(totalInteractions)),
    lastInteractionAt,
  };
};

const parseCommunityAnalyticsState = (raw: string | null | undefined): CommunityAnalyticsState => {
  if (!raw) return createDefaultCommunityAnalyticsState();

  try {
    return normalizeCommunityAnalyticsState(JSON.parse(raw) as Partial<CommunityAnalyticsState>);
  } catch {
    return createDefaultCommunityAnalyticsState();
  }
};

const loadCommunityState = async (userId: string): Promise<CommunityInteractionState> => {
  if (!dbAvailable) {
    return communityStateCache.get(userId) || createDefaultCommunityState();
  }

  const settings = await prismaDynamic.platformSetting.findMany({
    where: { key: getCommunityStateKey(userId) },
    take: 1,
  });

  return parseCommunityState(settings[0]?.value);
};

const saveCommunityState = async (userId: string, state: CommunityInteractionState): Promise<CommunityInteractionState> => {
  const normalized = normalizeCommunityState(state);

  if (!dbAvailable) {
    communityStateCache.set(userId, normalized);
    return normalized;
  }

  await prismaDynamic.platformSetting.upsert({
    where: { key: getCommunityStateKey(userId) },
    update: { value: JSON.stringify(normalized) },
    create: { key: getCommunityStateKey(userId), value: JSON.stringify(normalized) },
  });

  return normalized;
};

const updateCommunityState = async (
  userId: string,
  updater: (current: CommunityInteractionState) => CommunityInteractionState
): Promise<CommunityInteractionState> => {
  const current = await loadCommunityState(userId);
  const next = normalizeCommunityState(updater(current));
  return saveCommunityState(userId, next);
};

const loadCommunityAnalyticsState = async (userId: string): Promise<CommunityAnalyticsState> => {
  if (!dbAvailable) {
    return communityAnalyticsCache.get(userId) || createDefaultCommunityAnalyticsState();
  }

  const settings = await prismaDynamic.platformSetting.findMany({
    where: { key: getCommunityAnalyticsKey(userId) },
    take: 1,
  });

  return parseCommunityAnalyticsState(settings[0]?.value);
};

const saveCommunityAnalyticsState = async (
  userId: string,
  state: CommunityAnalyticsState
): Promise<CommunityAnalyticsState> => {
  const normalized = normalizeCommunityAnalyticsState(state);

  if (!dbAvailable) {
    communityAnalyticsCache.set(userId, normalized);
    return normalized;
  }

  await prismaDynamic.platformSetting.upsert({
    where: { key: getCommunityAnalyticsKey(userId) },
    update: { value: JSON.stringify(normalized) },
    create: { key: getCommunityAnalyticsKey(userId), value: JSON.stringify(normalized) },
  });

  return normalized;
};

const updateCommunityAnalyticsState = async (
  userId: string,
  updater: (current: CommunityAnalyticsState) => CommunityAnalyticsState
): Promise<CommunityAnalyticsState> => {
  const current = await loadCommunityAnalyticsState(userId);
  const next = normalizeCommunityAnalyticsState(updater(current));
  return saveCommunityAnalyticsState(userId, next);
};

const recordCommunityInteraction = async (userId: string, event: CommunityInteractionEvent): Promise<CommunityAnalyticsState> => {
  const action = event.action;
  const createdAt = event.createdAt || new Date().toISOString();
  const field = event.field?.trim() || null;
  const tokens = Array.from(new Set((event.tokens || []).map((token) => token.trim().toLowerCase()).filter(Boolean)));

  return updateCommunityAnalyticsState(userId, (current) => {
    const next: CommunityAnalyticsState = {
      ...current,
      interactionsByAction: { ...current.interactionsByAction },
      interactionsByField: { ...current.interactionsByField },
      interactionsByToken: { ...current.interactionsByToken },
      recentActions: [...current.recentActions],
    };

    next.totalInteractions = Math.max(0, current.totalInteractions) + 1;
    next.lastInteractionAt = createdAt;
    next.interactionsByAction[action] = Math.max(0, Number(next.interactionsByAction[action] || 0)) + 1;

    if (field) {
      next.interactionsByField[field] = Math.max(0, Number(next.interactionsByField[field] || 0)) + 1;
    }

    for (const token of tokens) {
      next.interactionsByToken[token] = Math.max(0, Number(next.interactionsByToken[token] || 0)) + 1;
    }

    next.recentActions.push({
      action,
      itemId: event.itemId?.trim() || null,
      field,
      createdAt,
    });

    if (next.recentActions.length > COMMUNITY_ANALYTICS_MAX_RECENT_ACTIONS) {
      next.recentActions.splice(0, next.recentActions.length - COMMUNITY_ANALYTICS_MAX_RECENT_ACTIONS);
    }

    return next;
  });
};

const deriveCommunityBehaviorSignals = (
  analytics: CommunityAnalyticsState
): { dominantField: string | null; behaviorTokens: string[] } => {
  const dominantFieldEntry = Object.entries(analytics.interactionsByField)
    .sort((a, b) => b[1] - a[1])[0];
  const dominantField = dominantFieldEntry?.[0] || null;

  const behaviorTokens = Object.entries(analytics.interactionsByToken)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([token]) => token);

  return { dominantField, behaviorTokens };
};

const buildCommunityPostResponse = (
  post: CommunityPostRecord,
  auth: JwtPayload | undefined,
  decoded?: EncodedCommunityPostContent,
  engagement?: CommunityPostEngagement
) => {
  const resolvedContent = decoded || decodePostContent(post.content);
  const canDelete = post.authorName === authUserDisplayName(auth) || auth?.role === "ADMIN" || isModeratorRole(auth?.role || "USER");
  const resolvedEngagement = engagement || createDefaultCommunityPostEngagement();

  return {
    id: post.id,
    type: post.postType,
    title: post.title,
    summary: post.summary,
    author: post.authorName,
    field: post.field,
    interests: post.interests,
    stats: resolvedContent.liveSession ? "Live session" : "Live discussion",
    media: resolvedContent.media,
    liveSession: resolvedContent.liveSession,
    engagement: resolvedEngagement,
    canDelete,
    createdAt: post.createdAt,
  };
};

const storeCommunityPostFallback = (post: CommunityPostRecord): void => {
  communityPostCache.set(post.id, post);
};

const getCommunityFallbackPosts = (): CommunityPostRecord[] => {
  return [...communityPostCache.values(), ...FALLBACK_COMMUNITY_POSTS].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
};

const dedupeCommunityPosts = (posts: CommunityPostRecord[]): CommunityPostRecord[] => {
  const byId = new Map<string, CommunityPostRecord>();

  for (const post of posts) {
    if (!byId.has(post.id)) {
      byId.set(post.id, post);
    }
  }

  return Array.from(byId.values());
};

const FALLBACK_COMMUNITY_POSTS: CommunityPostRecord[] = [
  {
    id: "fallback-post-1",
    title: "How AI-assisted scheduling reduced rework on a public transport terminal",
    summary: "A practical breakdown of milestone tracking, procurement sequencing, and daily standup rhythms.",
    content: "A practical breakdown of milestone tracking, procurement sequencing, and daily standup rhythms.",
    postType: "Blog",
    authorName: "Samuel Otieno",
    field: "Project Management",
    interests: ["Planning", "Delivery"],
    isPublished: true,
    createdAt: new Date("2026-03-20T08:15:00Z"),
    updatedAt: new Date("2026-03-20T08:15:00Z"),
  },
  {
    id: "fallback-post-2",
    title: "Best way to structure weekly site updates for stakeholders",
    summary: "Community members are sharing templates for concise progress updates and risk escalation.",
    content: "Community members are sharing templates for concise progress updates and risk escalation.",
    postType: "Discussion",
    authorName: "Grace Mwikali",
    field: "Engineering",
    interests: ["Communication", "Quality"],
    isPublished: true,
    createdAt: new Date("2026-03-22T10:45:00Z"),
    updatedAt: new Date("2026-03-22T10:45:00Z"),
  },
  {
    id: "fallback-post-3",
    title: "Concrete quality audits: lessons from three mixed-use towers",
    summary: "Data-backed quality checkpoints and how teams aligned inspections with procurement windows.",
    content: "Data-backed quality checkpoints and how teams aligned inspections with procurement windows.",
    postType: "Case Study",
    authorName: "Michael Njoroge",
    field: "Engineering",
    interests: ["Quality", "Safety"],
    isPublished: true,
    createdAt: new Date("2026-03-25T06:30:00Z"),
    updatedAt: new Date("2026-03-25T06:30:00Z"),
  },
];

const FALLBACK_COMMUNITY_UPDATES: CommunityUpdateRecord[] = [
  {
    id: "fallback-update-1",
    title: "Tender board update",
    body: "14 new county projects were published this week.",
    isPinned: true,
    isPublished: true,
    pinnedAt: new Date("2026-03-29T07:10:00Z"),
    createdAt: new Date("2026-03-29T07:10:00Z"),
    updatedAt: new Date("2026-03-29T07:10:00Z"),
  },
  {
    id: "fallback-update-2",
    title: "Platform release",
    body: "Community profiles now support field-based badges.",
    isPinned: false,
    isPublished: true,
    pinnedAt: null,
    createdAt: new Date("2026-03-30T09:20:00Z"),
    updatedAt: new Date("2026-03-30T09:20:00Z"),
  },
  {
    id: "fallback-update-3",
    title: "Market insight",
    body: "Reinforcement steel prices are trending down for the third week.",
    isPinned: false,
    isPublished: true,
    pinnedAt: null,
    createdAt: new Date("2026-03-31T11:05:00Z"),
    updatedAt: new Date("2026-03-31T11:05:00Z"),
  },
];

const FALLBACK_COMMUNITY_ADS: CommunityAdRecord[] = [
  {
    id: "fallback-ad-1",
    title: "Construction ERP for mid-size contractors",
    copy: "Track costs, inventory, and subcontractor billing in one connected system.",
    ctaUrl: "https://example.com/erp",
    targetFields: ["Engineering", "Project Management"],
    targetRoles: ["CONTRACTOR", "PROJECT_MANAGER", "ENGINEER", "USER"],
    isApproved: true,
    approvedAt: new Date("2026-03-15T08:00:00Z"),
    approvedById: "seed-admin",
    createdAt: new Date("2026-03-14T08:00:00Z"),
    updatedAt: new Date("2026-03-15T08:00:00Z"),
  },
  {
    id: "fallback-ad-2",
    title: "Professional certification bootcamp",
    copy: "Join a 6-week online cohort for project controls and advanced reporting.",
    ctaUrl: "https://example.com/bootcamp",
    targetFields: ["Project Management", "Architecture"],
    targetRoles: ["PROJECT_MANAGER", "CONSULTANT", "ENGINEER", "USER"],
    isApproved: true,
    approvedAt: new Date("2026-03-18T08:00:00Z"),
    approvedById: "seed-admin",
    createdAt: new Date("2026-03-17T08:00:00Z"),
    updatedAt: new Date("2026-03-18T08:00:00Z"),
  },
];

const FALLBACK_COMMUNITY_RECOMMENDATIONS: CommunityRecommendation[] = [
  {
    id: "fallback-rec-1",
    field: "Engineering",
    title: "Advanced structural peer-review checklist",
    format: "Template pack",
    score: 0,
  },
  {
    id: "fallback-rec-2",
    field: "Project Management",
    title: "Risk matrix playbook for multi-site rollouts",
    format: "Playbook",
    score: 0,
  },
  {
    id: "fallback-rec-3",
    field: "Architecture",
    title: "Sustainable facade strategy benchmark 2026",
    format: "Industry report",
    score: 0,
  },
];

const ROLE_FIELD_MAP: Partial<Record<AppUserRole, string>> = {
  ENGINEER: "Engineering",
  PROJECT_MANAGER: "Project Management",
  CONSULTANT: "Project Management",
  CONTRACTOR: "Engineering",
  REGULATOR: "Project Management",
  DEVELOPER: "Architecture",
  REAL_ESTATE: "Architecture",
};

const tokenizeInterestText = (...values: Array<string | null | undefined>): string[] => {
  const joined = values
    .filter((value): value is string => Boolean(value && value.trim().length > 0))
    .join(" ")
    .toLowerCase();

  if (!joined) return [];

  return Array.from(
    new Set(
      joined
        .split(/[^a-z0-9]+/)
        .map((token) => token.trim())
        .filter((token) => token.length >= 3)
    )
  );
};

const resolveCommunityInteractionContext = async (
  itemId: string
): Promise<{ field: string | null; tokens: string[] }> => {
  const normalizedItemId = itemId.trim();
  if (!normalizedItemId) return { field: null, tokens: [] };

  if (!dbAvailable) {
    const fallback = FALLBACK_COMMUNITY_POSTS.find((post) => post.id === normalizedItemId);
    if (!fallback) return { field: null, tokens: [] };
    const decoded = decodePostContent(fallback.content);
    const tokens = Array.from(
      new Set([...fallback.interests, ...tokenizeInterestText(fallback.title, decoded.body, fallback.field)])
    );
    return { field: fallback.field, tokens };
  }

  try {
    const rows = (await prismaDynamic.communityPost.findMany({
      where: { id: normalizedItemId },
      take: 1,
    })) as CommunityPostRecord[];

    const post = rows[0];
    if (!post) return { field: null, tokens: [] };

    const decoded = decodePostContent(post.content);
    const tokens = Array.from(new Set([...post.interests, ...tokenizeInterestText(post.title, decoded.body, post.field)]));
    return { field: post.field, tokens };
  } catch {
    return { field: null, tokens: [] };
  }
};

const buildPersonalizationContext = (user: {
  role: AppUserRole;
  industry: string | null;
  bio: string | null;
  company: string | null;
  dominantField?: string | null;
  behaviorTokens?: string[];
}): { inferredField: string; interestTokens: string[] } => {
  const inferredField = user.industry?.trim() || user.dominantField?.trim() || ROLE_FIELD_MAP[user.role] || "Engineering";
  const profileTokens = tokenizeInterestText(user.industry, user.bio, user.company, inferredField, user.role);
  const interestTokens = Array.from(new Set([...profileTokens, ...(user.behaviorTokens || [])]));
  return { inferredField, interestTokens };
};

const scoreRecommendation = (
  recommendation: CommunityRecommendation,
  inferredField: string,
  interestTokens: string[]
): number => {
  const fieldScore = recommendation.field.toLowerCase() === inferredField.toLowerCase() ? 3 : 0;
  const tokenHitScore = interestTokens.some((token) => recommendation.title.toLowerCase().includes(token)) ? 2 : 0;
  return fieldScore + tokenHitScore;
};

const isModeratorRole = (role: AppUserRole): boolean => COMMUNITY_MODERATOR_ROLES.includes(role);


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
    cb(null, `${file.fieldname || "file"}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const profileUpload = multer({
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

const communityUpload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024, files: 6 },
  fileFilter: (_req, file, cb) => {
    const imageTypes = /jpeg|jpg|png|gif|webp/;
    const videoTypes = /mp4|webm|quicktime|x-matroska|mpeg/;
    const audioTypes = /mpeg|mp3|wav|ogg|x-m4a|aac|webm/;
    const documentTypes = /pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document|vnd\.ms-powerpoint|vnd\.openxmlformats-officedocument\.presentationml\.presentation|plain/;
    const documentExtTypes = /pdf|doc|docx|ppt|pptx|txt/;
    const ext = path.extname(file.originalname).toLowerCase();
    const normalizedMime = file.mimetype.toLowerCase();
    const isImage = imageTypes.test(ext) || imageTypes.test(normalizedMime);
    const isVideo = videoTypes.test(ext) || videoTypes.test(normalizedMime);
    const isAudio = audioTypes.test(ext) || audioTypes.test(normalizedMime);
    const isDocument = documentExtTypes.test(ext) || documentTypes.test(normalizedMime);

    if (isImage || isVideo || isAudio || isDocument) {
      return cb(null, true);
    }

    cb(new Error("Only image, video, audio, and document files are allowed for community posts."));
  },
});

const liveRecordingUpload = multer({
  storage,
  limits: { fileSize: 250 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /webm|mp4|ogg|mpeg|wav/;
    const ext = path.extname(file.originalname).toLowerCase();
    const isAllowedByExt = allowedTypes.test(ext);
    const isAllowedByMime = allowedTypes.test(file.mimetype.toLowerCase());

    if (isAllowedByExt || isAllowedByMime) {
      return cb(null, true);
    }

    cb(new Error("Only audio/video recording files are allowed."));
  },
});

const liveRecordingChunkUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: LIVE_ROOM_RECORDING_CHUNK_MAX_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /webm|mp4|ogg|mpeg|wav|octet-stream/;
    const ext = path.extname(file.originalname).toLowerCase();
    const isAllowedByExt = allowedTypes.test(ext);
    const isAllowedByMime = allowedTypes.test(file.mimetype.toLowerCase());

    if (isAllowedByExt || isAllowedByMime) {
      return cb(null, true);
    }

    cb(new Error("Only audio/video recording files are allowed."));
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
  registrationNo: string | null;
  industry: string | null;
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

const authUserDisplayName = (auth?: JwtPayload): string => {
  if (!auth?.email) return "Community member";
  return auth.email.split("@")[0] || "Community member";
};

const toSafeUser = (user: {
  id: string;
  email: string;
  name: string | null;
  profilePicture: string | null;
  phone: string | null;
  bio: string | null;
  company: string | null;
  registrationNo: string | null;
  industry: string | null;
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
  registrationNo: user.registrationNo,
  industry: user.industry,
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
    registrationNo: null,
    industry: null,
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

const DEFAULT_TEAM_MEMBERS: Array<{
  name: string;
  email: string;
  role: string;
  projects: number;
}> = [
  { name: "James Kariuki", email: "james@buildco.ke", role: "Project Manager", projects: 4 },
  { name: "Amina Hassan", email: "amina@buildco.ke", role: "Civil Engineer", projects: 3 },
  { name: "Peter Odhiambo", email: "peter@buildco.ke", role: "Contractor", projects: 5 },
  { name: "Sarah Mwangi", email: "sarah@buildco.ke", role: "Architect", projects: 2 },
  { name: "David Njeru", email: "david@buildco.ke", role: "Site Supervisor", projects: 3 },
  { name: "Grace Wanjiku", email: "grace@buildco.ke", role: "QS Engineer", projects: 4 },
];

const offlineTeamMembers = new Map<string, TeamMemberRecord[]>();
const offlineProjectReminderEnabled = new Map<string, boolean>();
const offlineProjectReminderFrequency = new Map<string, ProjectReminderFrequency>();
const offlineProjectReminderQuietHoursStart = new Map<string, number>();
const offlineProjectReminderQuietHoursEnd = new Map<string, number>();
const offlineProjectReminderLastSent = new Map<string, string>();

type ProjectReminderFrequency = "daily" | "weekly";

type ProjectReminderSettings = {
  enabled: boolean;
  frequency: ProjectReminderFrequency;
  quietHoursStart: number;
  quietHoursEnd: number;
  lastSentAt: string | null;
};

const shouldUseOfflineProjectReminderSettings = (userId: string): boolean =>
  !dbAvailable || (DEV_AUTH_BYPASS && userId === "dev-engineer") || userId.startsWith("offline-");

const parseBooleanSetting = (value: string | null | undefined, fallback: boolean): boolean => {
  if (value == null) return fallback;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return fallback;
};

const parseProjectReminderFrequency = (
  value: string | null | undefined,
  fallback: ProjectReminderFrequency,
): ProjectReminderFrequency => {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  if (normalized === "daily" || normalized === "weekly") {
    return normalized;
  }
  return fallback;
};

const parseIntegerSetting = (
  value: string | null | undefined,
  fallback: number,
  min: number,
  max: number,
): number => {
  if (value == null) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  if (parsed < min || parsed > max) return fallback;
  return parsed;
};

const getProjectReminderMinIntervalMs = (frequency: ProjectReminderFrequency): number =>
  frequency === "weekly" ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

const isWithinQuietHours = (hour: number, quietHoursStart: number, quietHoursEnd: number): boolean => {
  if (quietHoursStart === quietHoursEnd) {
    return false;
  }

  if (quietHoursStart < quietHoursEnd) {
    return hour >= quietHoursStart && hour < quietHoursEnd;
  }

  return hour >= quietHoursStart || hour < quietHoursEnd;
};

const getProjectReminderSettings = async (userId: string): Promise<ProjectReminderSettings> => {
  if (shouldUseOfflineProjectReminderSettings(userId)) {
    return {
      enabled: offlineProjectReminderEnabled.get(userId) ?? PROJECT_REMINDER_DEFAULT_ENABLED,
      frequency: offlineProjectReminderFrequency.get(userId) ?? PROJECT_REMINDER_DEFAULT_FREQUENCY,
      quietHoursStart: offlineProjectReminderQuietHoursStart.get(userId) ?? PROJECT_REMINDER_DEFAULT_QUIET_HOURS_START,
      quietHoursEnd: offlineProjectReminderQuietHoursEnd.get(userId) ?? PROJECT_REMINDER_DEFAULT_QUIET_HOURS_END,
      lastSentAt: offlineProjectReminderLastSent.get(userId) || null,
    };
  }

  const settings = await prismaDynamic.platformSetting.findMany({
    where: {
      key: {
        in: [
          getProjectReminderEnabledSettingKey(userId),
          getProjectReminderFrequencySettingKey(userId),
          getProjectReminderQuietHoursStartSettingKey(userId),
          getProjectReminderQuietHoursEndSettingKey(userId),
          getProjectReminderLastSentSettingKey(userId),
        ],
      },
    },
  });

  const valueByKey = new Map(settings.map((item) => [item.key, item.value]));

  return {
    enabled: parseBooleanSetting(valueByKey.get(getProjectReminderEnabledSettingKey(userId)), PROJECT_REMINDER_DEFAULT_ENABLED),
    frequency: parseProjectReminderFrequency(
      valueByKey.get(getProjectReminderFrequencySettingKey(userId)),
      PROJECT_REMINDER_DEFAULT_FREQUENCY,
    ),
    quietHoursStart: parseIntegerSetting(
      valueByKey.get(getProjectReminderQuietHoursStartSettingKey(userId)),
      PROJECT_REMINDER_DEFAULT_QUIET_HOURS_START,
      0,
      23,
    ),
    quietHoursEnd: parseIntegerSetting(
      valueByKey.get(getProjectReminderQuietHoursEndSettingKey(userId)),
      PROJECT_REMINDER_DEFAULT_QUIET_HOURS_END,
      0,
      23,
    ),
    lastSentAt: valueByKey.get(getProjectReminderLastSentSettingKey(userId)) || null,
  };
};

const setProjectReminderEnabled = async (userId: string, enabled: boolean): Promise<void> => {
  if (shouldUseOfflineProjectReminderSettings(userId)) {
    offlineProjectReminderEnabled.set(userId, enabled);
    return;
  }

  await prismaDynamic.platformSetting.upsert({
    where: { key: getProjectReminderEnabledSettingKey(userId) },
    update: { value: enabled ? "true" : "false" },
    create: {
      key: getProjectReminderEnabledSettingKey(userId),
      value: enabled ? "true" : "false",
    },
  });
};

const setProjectReminderFrequency = async (
  userId: string,
  frequency: ProjectReminderFrequency,
): Promise<void> => {
  if (shouldUseOfflineProjectReminderSettings(userId)) {
    offlineProjectReminderFrequency.set(userId, frequency);
    return;
  }

  await prismaDynamic.platformSetting.upsert({
    where: { key: getProjectReminderFrequencySettingKey(userId) },
    update: { value: frequency },
    create: {
      key: getProjectReminderFrequencySettingKey(userId),
      value: frequency,
    },
  });
};

const setProjectReminderQuietHours = async (
  userId: string,
  quietHoursStart: number,
  quietHoursEnd: number,
): Promise<void> => {
  if (shouldUseOfflineProjectReminderSettings(userId)) {
    offlineProjectReminderQuietHoursStart.set(userId, quietHoursStart);
    offlineProjectReminderQuietHoursEnd.set(userId, quietHoursEnd);
    return;
  }

  await prismaDynamic.platformSetting.upsert({
    where: { key: getProjectReminderQuietHoursStartSettingKey(userId) },
    update: { value: String(quietHoursStart) },
    create: {
      key: getProjectReminderQuietHoursStartSettingKey(userId),
      value: String(quietHoursStart),
    },
  });

  await prismaDynamic.platformSetting.upsert({
    where: { key: getProjectReminderQuietHoursEndSettingKey(userId) },
    update: { value: String(quietHoursEnd) },
    create: {
      key: getProjectReminderQuietHoursEndSettingKey(userId),
      value: String(quietHoursEnd),
    },
  });
};

const setProjectReminderLastSent = async (userId: string, isoDate: string): Promise<void> => {
  if (shouldUseOfflineProjectReminderSettings(userId)) {
    offlineProjectReminderLastSent.set(userId, isoDate);
    return;
  }

  await prismaDynamic.platformSetting.upsert({
    where: { key: getProjectReminderLastSentSettingKey(userId) },
    update: { value: isoDate },
    create: {
      key: getProjectReminderLastSentSettingKey(userId),
      value: isoDate,
    },
  });
};

type ProjectReminderCandidate = {
  id?: string | number;
  name?: string;
  progress?: number;
  status?: string;
};

const projectNeedsAttention = (project: ProjectReminderCandidate): boolean => {
  const progress = Number(project.progress ?? Number.NaN);
  if (!Number.isNaN(progress) && progress < 50) return true;
  const status = String(project.status || "").toLowerCase();
  if (status.includes("attention") || status.includes("at-risk") || status.includes("risk")) return true;
  return false;
};

const formatProjectReminderMessage = (projects: ProjectReminderCandidate[]): string => {
  const lines = projects.slice(0, 8).map((project) => {
    const name = project.name || "Unnamed project";
    const progress = Number.isFinite(Number(project.progress)) ? `${Number(project.progress)}%` : "n/a";
    return `• ${name} (progress: ${progress})`;
  });

  return [
    "The following projects currently need attention:",
    "",
    ...lines,
    "",
    "Please review blockers, schedule risks, and recovery actions in your project dashboard.",
  ].join("\n");
};

const resolveReminderRecipient = async (
  userId: string,
  auth: JwtPayload
): Promise<{ email: string; name: string }> => {
  if (DEV_AUTH_BYPASS && userId === "dev-engineer") {
    return { email: DEV_ENGINEER_EMAIL, name: DEV_ENGINEER_NAME };
  }

  if (!dbAvailable) {
    const match = findInMemoryUser(userId, true);
    if (match) {
      return { email: match.profile.email, name: match.profile.name };
    }
    return { email: auth.email, name: auth.email.split("@")[0] || "User" };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });

  if (!user) {
    return { email: auth.email, name: auth.email.split("@")[0] || "User" };
  }

  return { email: user.email, name: user.name || user.email.split("@")[0] || "User" };
};

const getInitialsFromName = (name: string): string => {
  const trimmed = name.trim();
  if (!trimmed) return "TM";
  const parts = trimmed.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
};

const buildDefaultTeamMemberRecords = (ownerId: string): TeamMemberRecord[] => {
  const now = new Date();
  return DEFAULT_TEAM_MEMBERS.map((member, index) => ({
    id: `${ownerId}-tm-${index + 1}`,
    ownerId,
    name: member.name,
    email: member.email,
    role: member.role,
    projects: member.projects,
    avatar: getInitialsFromName(member.name),
    createdAt: now,
    updatedAt: now,
  }));
};

const getOrCreateOfflineTeamMembers = (ownerId: string): TeamMemberRecord[] => {
  const existing = offlineTeamMembers.get(ownerId);
  if (existing) {
    return existing;
  }
  const seeded = buildDefaultTeamMemberRecords(ownerId);
  offlineTeamMembers.set(ownerId, seeded);
  return seeded;
};

const shouldUseOfflineTeamMembers = (userId: string): boolean =>
  !dbAvailable || (DEV_AUTH_BYPASS && userId === "dev-engineer") || userId.startsWith("offline-");

const DEFAULT_ROLE_PROFILES: Array<{
  email: string;
  name: string;
  role: AppUserRole;
  phone: string;
  company: string;
  registrationNo?: string | null;
  industry?: string | null;
  location: string;
  bio: string;
}> = [
  {
    email: "admin@gmail.com",
    name: "Platform Admin",
    role: "ADMIN",
    phone: "+254712345617",
    company: "ICDBO Admin Office",
    registrationNo: null,
    industry: null,
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
  const twoFactorEnabled = offlineTwoFactorOverrides.get(id) ?? false;
  return {
    id,
    email: profile.email,
    name: profile.name,
    profilePicture: null,
    phone: profile.phone,
    bio: profile.bio,
    company: profile.company,
    registrationNo: profile.registrationNo ?? null,
    industry: profile.industry ?? null,
    location: profile.location,
    role: profile.role,
    emailVerified: true,
    twoFactorEnabled,
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
        registrationNo: profile.registrationNo ?? null,
        industry: profile.industry ?? null,
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
        registrationNo: profile.registrationNo ?? null,
        industry: profile.industry ?? null,
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

const seedCommunityContent = async () => {
  const [postCount, updateCount, adCount] = await Promise.all([
    prismaDynamic.communityPost.count(),
    prismaDynamic.communityUpdate.count(),
    prismaDynamic.communityAd.count(),
  ]);

  if (postCount === 0) {
    await prismaDynamic.communityPost.createMany({
      data: FALLBACK_COMMUNITY_POSTS.map((post) => ({
        title: post.title,
        summary: post.summary,
        content: post.content,
        postType: post.postType,
        authorName: post.authorName,
        field: post.field,
        interests: post.interests,
        isPublished: post.isPublished,
      })),
    });
  }

  if (updateCount === 0) {
    await prismaDynamic.communityUpdate.createMany({
      data: FALLBACK_COMMUNITY_UPDATES.map((update) => ({
        title: update.title,
        body: update.body,
        isPinned: update.isPinned,
        isPublished: update.isPublished,
        pinnedAt: update.pinnedAt,
      })),
    });
  }

  if (adCount === 0) {
    await prismaDynamic.communityAd.createMany({
      data: FALLBACK_COMMUNITY_ADS.map((ad) => ({
        title: ad.title,
        copy: ad.copy,
        ctaUrl: ad.ctaUrl,
        targetFields: ad.targetFields,
        targetRoles: ad.targetRoles,
        isApproved: ad.isApproved,
        approvedAt: ad.approvedAt,
        approvedById: ad.approvedById,
      })),
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

app.get("/api/community/feed", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const userId = req.auth?.userId;
  const authRole = req.auth?.role;

  if (!userId || !authRole) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const q = String(req.query.q || "").trim().toLowerCase();
  const requestedField = String(req.query.field || "all").trim();

  try {
    const state = await loadCommunityState(userId);
    const analytics = await loadCommunityAnalyticsState(userId);
    const behavior = deriveCommunityBehaviorSignals(analytics);
    const profile = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        industry: true,
        bio: true,
        company: true,
      },
    });

    const userProfile = profile || {
      role: authRole,
      industry: null,
      bio: null,
      company: null,
    };

    const { inferredField, interestTokens } = buildPersonalizationContext({
      role: userProfile.role as AppUserRole,
      industry: userProfile.industry,
      bio: userProfile.bio,
      company: userProfile.company,
      dominantField: behavior.dominantField,
      behaviorTokens: behavior.behaviorTokens,
    });

    const postsRaw = await prismaDynamic.communityPost.findMany({
      where: {
        isPublished: true,
        ...(requestedField !== "all"
          ? {
              field: {
                equals: requestedField,
                mode: "insensitive",
              },
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 24,
    });

    const updatesRaw = await prismaDynamic.communityUpdate.findMany({
      where: { isPublished: true },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      take: 12,
    });

    const adsRaw = await prismaDynamic.communityAd.findMany({
      where: { isApproved: true },
      orderBy: { createdAt: "desc" },
      take: 12,
    });

    const feedPosts = dedupeCommunityPosts([...(postsRaw as CommunityPostRecord[]), ...communityPostCache.values()])
      .filter((post) => {
        if (!q) return true;
        const decoded = decodePostContent(post.content);
        const haystack = `${post.title} ${post.summary} ${decoded.body} ${post.interests.join(" ")}`.toLowerCase();
        return haystack.includes(q);
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 24);

    const engagementByPostId = await loadCommunityPostEngagementMap(feedPosts.map((post) => post.id));
    const posts = feedPosts.map((post) => buildCommunityPostResponse(post, req.auth, undefined, engagementByPostId[post.id]));

    const updates = (updatesRaw as CommunityUpdateRecord[]).map((update) => ({
      id: update.id,
      title: update.title,
      body: update.body,
      isPinned: update.isPinned,
      createdAt: update.createdAt,
    }));

    const ads = (adsRaw as CommunityAdRecord[])
      .filter((ad) => {
        const roleMatch = ad.targetRoles.length === 0 || ad.targetRoles.includes(userProfile.role as AppUserRole);
        const fieldMatch =
          ad.targetFields.length === 0 ||
          ad.targetFields.some((field) => field.toLowerCase() === inferredField.toLowerCase());
        return roleMatch || fieldMatch;
      })
      .map((ad) => ({
        id: ad.id,
        title: ad.title,
        copy: ad.copy,
        ctaUrl: ad.ctaUrl,
        approvedAt: ad.approvedAt,
      }));

    const recommendations = FALLBACK_COMMUNITY_RECOMMENDATIONS
      .map((recommendation) => ({
        ...recommendation,
        score: scoreRecommendation(recommendation, requestedField === "all" ? inferredField : requestedField, interestTokens),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(({ score: _score, ...rest }) => rest);

    return res.status(200).json({
      posts,
      updates,
      ads,
      state,
      recommendations,
      personalization: {
        role: userProfile.role,
        inferredField,
        interestTokens,
      },
      moderation: {
        canPinUpdates: isModeratorRole(userProfile.role as AppUserRole),
        canApproveAds: (userProfile.role as AppUserRole) === "ADMIN",
      },
      analytics: {
        totalInteractions: analytics.totalInteractions,
        lastInteractionAt: analytics.lastInteractionAt,
        topFields: Object.entries(analytics.interactionsByField)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4)
          .map(([field, count]) => ({ field, count })),
        topTokens: Object.entries(analytics.interactionsByToken)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([token, count]) => ({ token, count })),
      },
    });
  } catch (error) {
    console.warn("Community feed fallback activated:", error);

    const inferredField = ROLE_FIELD_MAP[authRole] || "Engineering";
    const fallbackPosts = getCommunityFallbackPosts()
      .filter((post) => {
        if (requestedField !== "all" && post.field.toLowerCase() !== requestedField.toLowerCase()) {
          return false;
        }
        if (!q) return true;
        const decoded = decodePostContent(post.content);
        const haystack = `${post.title} ${post.summary} ${decoded.body} ${post.interests.join(" ")}`.toLowerCase();
        return haystack.includes(q);
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 24);

    const fallbackEngagementByPostId = await loadCommunityPostEngagementMap(fallbackPosts.map((post) => post.id));
    const posts = fallbackPosts.map((post) =>
      buildCommunityPostResponse(post, req.auth, undefined, fallbackEngagementByPostId[post.id])
    );

    const recommendations = FALLBACK_COMMUNITY_RECOMMENDATIONS
      .map((recommendation) => ({
        ...recommendation,
        score: scoreRecommendation(recommendation, inferredField, []),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(({ score: _score, ...rest }) => rest);

    return res.status(200).json({
      posts,
      updates: FALLBACK_COMMUNITY_UPDATES,
      ads: FALLBACK_COMMUNITY_ADS,
      state: createDefaultCommunityState(),
      recommendations,
      personalization: {
        role: authRole,
        inferredField,
        interestTokens: [],
      },
      moderation: {
        canPinUpdates: isModeratorRole(authRole),
        canApproveAds: authRole === "ADMIN",
      },
      mode: "fallback",
    });
  }
});

app.get("/api/community/state", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const userId = req.auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const state = await loadCommunityState(userId);
  return res.status(200).json(state);
});

app.get("/api/community/analytics/me", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const userId = req.auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const analytics = await loadCommunityAnalyticsState(userId);
  return res.status(200).json({ analytics });
});

app.put("/api/community/bookmarks/:itemId", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const userId = req.auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const itemId = String(req.params.itemId || "").trim();
  if (!itemId) {
    return res.status(400).json({ error: "Item id is required." });
  }

  const bookmarkedInput = typeof req.body?.bookmarked === "boolean" ? req.body.bookmarked : undefined;
  const state = await updateCommunityState(userId, (current) => {
    const bookmarks = new Set(current.bookmarks);

    if (bookmarkedInput === undefined) {
      if (bookmarks.has(itemId)) {
        bookmarks.delete(itemId);
      } else {
        bookmarks.add(itemId);
      }
    } else if (bookmarkedInput) {
      bookmarks.add(itemId);
    } else {
      bookmarks.delete(itemId);
    }

    return { ...current, bookmarks: Array.from(bookmarks) };
  });

  const isBookmarked = state.bookmarks.includes(itemId);
  try {
    const context = await resolveCommunityInteractionContext(itemId);
    await recordCommunityInteraction(userId, {
      action: isBookmarked ? "bookmark_add" : "bookmark_remove",
      itemId,
      field: context.field ?? undefined,
      tokens: context.tokens,
    });
  } catch (error) {
    // Bookmark persistence should succeed even if analytics enrichment fails.
    console.error("Bookmark analytics error:", error);
  }

  return res.status(200).json({ itemId, bookmarked: isBookmarked, state });
});

app.put("/api/community/follows/:itemId", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const userId = req.auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const itemId = String(req.params.itemId || "").trim();
  if (!itemId) {
    return res.status(400).json({ error: "Item id is required." });
  }

  const followingInput = typeof req.body?.following === "boolean" ? req.body.following : undefined;
  const previousState = await loadCommunityState(userId);
  const wasFollowing = previousState.follows.includes(itemId);
  const state = await updateCommunityState(userId, (current) => {
    const follows = new Set(current.follows);

    if (followingInput === undefined) {
      if (follows.has(itemId)) {
        follows.delete(itemId);
      } else {
        follows.add(itemId);
      }
    } else if (followingInput) {
      follows.add(itemId);
    } else {
      follows.delete(itemId);
    }

    return { ...current, follows: Array.from(follows) };
  });

  const isFollowing = state.follows.includes(itemId);
  let engagement = await loadCommunityPostEngagement(itemId);
  if (wasFollowing !== isFollowing) {
    engagement = await updateCommunityPostEngagement(itemId, (current) => ({
      ...current,
      follows: isFollowing ? current.follows + 1 : Math.max(0, current.follows - 1),
    }));
  }
  const context = await resolveCommunityInteractionContext(itemId);
  await recordCommunityInteraction(userId, {
    action: isFollowing ? "follow_add" : "follow_remove",
    itemId,
    field: context.field ?? undefined,
    tokens: context.tokens,
  });

  if (isFollowing) {
    await queueCommunityPostActivity({
      itemId,
      actorUserId: userId,
      actorName: authUserDisplayName(req.auth),
      kind: "post_follow",
    });
  }

  return res.status(200).json({ itemId, following: isFollowing, state, engagement });
});

app.put("/api/community/votes/:itemId", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const userId = req.auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const itemId = String(req.params.itemId || "").trim();
  if (!itemId) {
    return res.status(400).json({ error: "Item id is required." });
  }

  const vote = req.body?.vote === "up" || req.body?.vote === "down" ? req.body.vote : null;
  const previousState = await loadCommunityState(userId);
  const previousVote = previousState.votes[itemId] || null;
  const state = await updateCommunityState(userId, (current) => {
    const votes = { ...current.votes };

    if (vote) {
      votes[itemId] = vote;
    } else {
      delete votes[itemId];
    }

    return { ...current, votes };
  });

  const resolvedVote = state.votes[itemId] || null;
  let engagement = await loadCommunityPostEngagement(itemId);
  const likeDelta = (previousVote === "up" ? -1 : 0) + (resolvedVote === "up" ? 1 : 0);
  if (likeDelta !== 0) {
    engagement = await updateCommunityPostEngagement(itemId, (current) => ({
      ...current,
      likes: Math.max(0, current.likes + likeDelta),
    }));
  }

  const context = await resolveCommunityInteractionContext(itemId);
  await recordCommunityInteraction(userId, {
    action: vote === "up" ? "vote_up" : vote === "down" ? "vote_down" : "vote_clear",
    itemId,
    field: context.field ?? undefined,
    tokens: context.tokens,
  });

  if (resolvedVote === "up" && previousVote !== "up") {
    await queueCommunityPostActivity({
      itemId,
      actorUserId: userId,
      actorName: authUserDisplayName(req.auth),
      kind: "post_like",
    });
  }

  return res.status(200).json({ itemId, vote: resolvedVote, state, engagement });
});

app.put("/api/community/polls/:itemId/vote", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const userId = req.auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const itemId = String(req.params.itemId || "").trim();
  if (!itemId) {
    return res.status(400).json({ error: "Item id is required." });
  }

  const choice = typeof req.body?.choice === "string" ? req.body.choice.trim() : "";
  const state = await updateCommunityState(userId, (current) => {
    const pollVotes = { ...current.pollVotes };

    if (choice) {
      pollVotes[itemId] = choice;
    } else {
      delete pollVotes[itemId];
    }

    return { ...current, pollVotes };
  });

  await recordCommunityInteraction(userId, {
    action: choice ? "poll_vote" : "poll_clear",
    itemId,
    tokens: tokenizeInterestText(choice || itemId),
  });

  return res.status(200).json({ itemId, choice: state.pollVotes[itemId] || null, state });
});

app.get("/api/community/chat", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const userId = req.auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const state = await loadCommunityState(userId);
  return res.status(200).json({ messages: state.chatMessages });
});

app.post("/api/community/chat/messages", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const userId = req.auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  const chatMessage = {
    id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    author: authUserDisplayName(req.auth),
    message,
    createdAt: new Date().toISOString(),
  };

  const state = await updateCommunityState(userId, (current) => ({
    ...current,
    chatMessages: [chatMessage, ...current.chatMessages].slice(0, 25),
  }));

  await recordCommunityInteraction(userId, {
    action: "chat_message",
    itemId: chatMessage.id,
    tokens: tokenizeInterestText(message),
  });

  return res.status(201).json({ message: chatMessage, state });
});

app.get("/api/community/posts/:id/comments", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const postId = String(req.params.id || "").trim();
  if (!postId) {
    return res.status(400).json({ error: "Post id is required." });
  }

  try {
    const comments = await loadCommunityPostComments(postId);
    return res.status(200).json({ postId, comments });
  } catch (error) {
    console.error("Get community comments error:", error);
    return res.status(500).json({ error: "Unable to fetch comments right now." });
  }
});

app.post("/api/community/posts/:id/comments", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const userId = req.auth?.userId;
  const postId = String(req.params.id || "").trim();
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!postId) {
    return res.status(400).json({ error: "Post id is required." });
  }

  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  const replyToCommentId =
    typeof req.body?.replyToCommentId === "string" && req.body.replyToCommentId.trim().length > 0
      ? req.body.replyToCommentId.trim()
      : null;
  if (!message) {
    return res.status(400).json({ error: "Comment message is required." });
  }

  if (message.length > 2000) {
    return res.status(400).json({ error: "Comment is too long. Limit is 2000 characters." });
  }

  try {
    const current = await loadCommunityPostComments(postId);
    if (replyToCommentId && !current.some((entry) => entry.id === replyToCommentId)) {
      return res.status(400).json({ error: "Reply target no longer exists." });
    }

    const comment: CommunityPostComment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      postId,
      author: authUserDisplayName(req.auth),
      message,
      replyToCommentId,
      createdAt: new Date().toISOString(),
    };

    const comments = await saveCommunityPostComments(postId, [...current, comment]);
    const engagement = await updateCommunityPostEngagement(postId, (existing) => ({
      ...existing,
      comments: comments.length,
    }));

    await recordCommunityInteraction(userId, {
      action: replyToCommentId ? "comment_reply" : "comment_create",
      itemId: postId,
      tokens: tokenizeInterestText(message),
    });

    await queueCommunityPostActivity({
      itemId: postId,
      actorUserId: userId,
      actorName: authUserDisplayName(req.auth),
      kind: replyToCommentId ? "comment_reply" : "post_comment",
      commentMessage: message,
      replyToCommentId,
    });

    return res.status(201).json({ postId, comment, comments, engagement });
  } catch (error) {
    console.error("Create community comment error:", error);
    return res.status(500).json({ error: "Unable to add comment right now." });
  }
});

app.get("/api/community/activity", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const userId = req.auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const notifications = await loadCommunityActivity(userId);
    const unreadCount = notifications.filter((notification) => !notification.readAt).length;
    return res.status(200).json({ notifications, unreadCount });
  } catch (error) {
    console.error("Load community activity error:", error);
    return res.status(500).json({ error: "Unable to load activity right now." });
  }
});

app.patch("/api/community/activity/read-all", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const userId = req.auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const notifications = await markAllCommunityActivityRead(userId);
    const unreadCount = notifications.filter((notification) => !notification.readAt).length;
    return res.status(200).json({ notifications, unreadCount });
  } catch (error) {
    console.error("Mark all community activity read error:", error);
    return res.status(500).json({ error: "Unable to update activity right now." });
  }
});

app.patch("/api/community/activity/:id/read", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const userId = req.auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const notificationId = String(req.params.id || "").trim();
  if (!notificationId) {
    return res.status(400).json({ error: "Notification id is required." });
  }

  try {
    const notification = await markCommunityActivityRead(userId, notificationId);
    if (!notification) {
      return res.status(404).json({ error: "Notification not found." });
    }

    return res.status(200).json({ notification });
  } catch (error) {
    console.error("Mark community activity read error:", error);
    return res.status(500).json({ error: "Unable to update activity right now." });
  }
});

app.patch("/api/community/posts/:id/engagement", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const postId = String(req.params.id || "").trim();
  const role = req.auth?.role;
  if (!postId) {
    return res.status(400).json({ error: "Post id is required." });
  }

  if (!role) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const showLikesInput = req.body?.showLikes;
  const showCommentsInput = req.body?.showComments;
  const showFollowsInput = req.body?.showFollows;

  if (
    typeof showLikesInput !== "boolean" &&
    typeof showCommentsInput !== "boolean" &&
    typeof showFollowsInput !== "boolean"
  ) {
    return res.status(400).json({ error: "At least one visibility flag must be provided." });
  }

  try {
    const existing = (await prismaDynamic.communityPost.findUnique({
      where: { id: postId },
    })) as CommunityPostRecord | null;

    const fallbackPost = communityPostCache.get(postId) || FALLBACK_COMMUNITY_POSTS.find((post) => post.id === postId) || null;
    const candidatePost = existing || fallbackPost;
    if (!candidatePost) {
      return res.status(404).json({ error: "Post not found." });
    }

    const isAuthor = candidatePost.authorName === authUserDisplayName(req.auth);
    if (!isAuthor) {
      return res.status(403).json({ error: "Only the author can change engagement visibility." });
    }

    const engagement = await updateCommunityPostEngagement(postId, (current) => ({
      ...current,
      showLikes: typeof showLikesInput === "boolean" ? showLikesInput : current.showLikes,
      showComments: typeof showCommentsInput === "boolean" ? showCommentsInput : current.showComments,
      showFollows: typeof showFollowsInput === "boolean" ? showFollowsInput : current.showFollows,
    }));

    return res.status(200).json({ postId, engagement });
  } catch (error) {
    console.error("Update community engagement visibility error:", error);
    return res.status(500).json({ error: "Unable to update engagement visibility right now." });
  }
});

app.post(
  "/api/community/posts",
  authMiddleware,
  communityUpload.array("media", 6),
  async (req: AuthenticatedRequest, res) => {
    const userId = req.auth?.userId;
    const userRole = req.auth?.role;

    if (!userId || !userRole) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const title = String(req.body?.title || "").trim();
    const content = String(req.body?.content || "").trim();
    const scheduledAtRaw = String(req.body?.scheduledAt || "").trim();
    const liveTitle = String(req.body?.liveTitle || "").trim();
    const liveStartsAtRaw = String(req.body?.liveStartsAt || "").trim();
    const liveRoomUrlRaw = String(req.body?.liveRoomUrl || "").trim();
    const liveDescription = String(req.body?.liveDescription || "").trim();

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required." });
    }

    const files = (Array.isArray(req.files) ? req.files : []) as Express.Multer.File[];
    let contentTypes: string[] = [];
    const contentTypesInput = req.body?.contentTypes;

    if (Array.isArray(contentTypesInput)) {
      contentTypes = contentTypesInput.map((value) => String(value).trim().toLowerCase()).filter(Boolean);
    } else if (typeof contentTypesInput === "string") {
      const normalized = contentTypesInput.trim();
      if (normalized.startsWith("[")) {
        try {
          const parsed = JSON.parse(normalized) as string[];
          if (Array.isArray(parsed)) {
            contentTypes = parsed.map((value) => String(value).trim().toLowerCase()).filter(Boolean);
          }
        } catch {
          contentTypes = [normalized.toLowerCase()];
        }
      } else if (normalized) {
        contentTypes = [normalized.toLowerCase()];
      }
    }

    const mediaAssets: CommunityMediaAsset[] = files.map((file) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const mime = file.mimetype.toLowerCase();
      const isVideo = mime.startsWith("video/") || /mp4|webm|mov|mkv/.test(ext);
      const isAudio = mime.startsWith("audio/") || /mp3|wav|ogg|m4a|aac/.test(ext);
      const isDocument = /pdf|doc|docx|ppt|pptx|txt/.test(ext) || /application\//.test(mime) || mime === "text/plain";

      let mediaType: CommunityMediaAsset["mediaType"] = "image";
      if (isVideo) {
        mediaType = "video";
      } else if (isAudio) {
        mediaType = "audio";
      } else if (isDocument) {
        mediaType = "document";
      }

      return {
        url: `/uploads/${file.filename}`,
        mediaType,
        fileName: file.originalname,
      };
    });

    const hasLiveSessionInput = req.body?.isLiveSession === "true" || req.body?.isLiveSession === true;
    const inferredRoomId = liveRoomUrlRaw ? extractRoomIdFromUrl(liveRoomUrlRaw) : null;
    const generatedRoomId = `room-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const roomId = hasLiveSessionInput ? normalizeRoomId(inferredRoomId || generatedRoomId) : null;

    if (roomId) {
      ensureLiveRoom(roomId, liveTitle || title, userId);
    }

    const liveSession = hasLiveSessionInput
      ? {
          title: liveTitle || `${title} - Live session`,
          startsAt: liveStartsAtRaw || new Date().toISOString(),
          roomUrl: liveRoomUrlRaw || `/community/live/${roomId}`,
          roomId: roomId || undefined,
          description: liveDescription || undefined,
        }
      : null;

    const encodedContent: EncodedCommunityPostContent = {
      kind: "community-post-v1",
      body: content,
      media: mediaAssets,
      liveSession,
    };

    const summary = toPostSummary(content);
    const roleField = ROLE_FIELD_MAP[userRole] || "Engineering";
    const allInterests = Array.from(new Set([...contentTypes, ...tokenizeInterestText(title, content, roleField)]));
    const interests = allInterests.length > 0 ? allInterests.slice(0, 6) : ["community"];
    const postType = liveSession
      ? "Live Session"
      : mediaAssets.some((asset) => asset.mediaType === "video")
        ? "Video"
        : mediaAssets.some((asset) => asset.mediaType === "image")
          ? "Image"
          : "Discussion";

    try {
      const created = (await prismaDynamic.communityPost.create({
        data: {
          title,
          summary,
          content: JSON.stringify(encodedContent),
          postType,
          authorName: authUserDisplayName(req.auth),
          field: roleField,
          interests,
          isPublished: true,
        },
      })) as CommunityPostRecord;

      await recordCommunityInteraction(userId, {
        action: "post_create",
        itemId: created.id,
        field: created.field,
        tokens: Array.from(new Set([...created.interests, ...tokenizeInterestText(created.title, content, created.field)])),
      });

      const engagement = await saveCommunityPostEngagement(created.id, createDefaultCommunityPostEngagement());

      storeCommunityPostFallback({
        id: created.id,
        title: created.title,
        summary: created.summary,
        content: created.content,
        postType: created.postType,
        authorName: created.authorName,
        field: created.field,
        interests: created.interests,
        isPublished: created.isPublished,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      });

      return res.status(201).json({
        post: {
          id: created.id,
          type: created.postType,
          title: created.title,
          summary: created.summary,
          author: created.authorName,
          field: created.field,
          interests: created.interests,
          stats: liveSession ? "Live session" : "Live discussion",
          media: mediaAssets,
          liveSession,
          engagement,
          canDelete: true,
          scheduledAt: scheduledAtRaw || null,
          createdAt: created.createdAt,
        },
      });
    } catch (error) {
      console.error("Create community post error:", error);

      if (!dbAvailable) {
        const fallbackId = `fallback-post-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const fallbackCreatedAt = new Date();
        const fallbackPost: CommunityPostRecord = {
          id: fallbackId,
          title,
          summary,
          content: JSON.stringify(encodedContent),
          postType,
          authorName: authUserDisplayName(req.auth),
          field: roleField,
          interests,
          isPublished: true,
          createdAt: fallbackCreatedAt,
          updatedAt: fallbackCreatedAt,
        };

        storeCommunityPostFallback(fallbackPost);
        const engagement = await saveCommunityPostEngagement(fallbackPost.id, createDefaultCommunityPostEngagement());
        await recordCommunityInteraction(userId, {
          action: "post_create",
          itemId: fallbackPost.id,
          field: fallbackPost.field,
          tokens: Array.from(new Set([...fallbackPost.interests, ...tokenizeInterestText(fallbackPost.title, content, fallbackPost.field)])),
        });

        return res.status(201).json({
          post: buildCommunityPostResponse(fallbackPost, req.auth, encodedContent, engagement),
          mode: "fallback",
        });
      }

      return res.status(500).json({ error: "Unable to create post right now." });
    }
  }
);

app.get("/api/community/live-sessions", authMiddleware, async (_req: AuthenticatedRequest, res) => {
  try {
    const postsRaw = (await prismaDynamic.communityPost.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      take: 40,
    })) as CommunityPostRecord[];

    const sessions = postsRaw
      .map((post) => {
        const decoded = decodePostContent(post.content);
        if (!decoded.liveSession) return null;
        return {
          postId: post.id,
          title: decoded.liveSession.title,
          startsAt: decoded.liveSession.startsAt,
          roomUrl: decoded.liveSession.roomUrl,
          roomId: decoded.liveSession.roomId || null,
          description: decoded.liveSession.description || "",
          author: post.authorName,
          field: post.field,
          createdAt: post.createdAt,
        };
      })
      .filter((session): session is NonNullable<typeof session> => Boolean(session))
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

    return res.status(200).json({ sessions });
  } catch (error) {
    console.error("Get live sessions error:", error);
    return res.status(500).json({ error: "Unable to fetch live sessions right now." });
  }
});

app.get("/api/community/live-rooms/ice-config", authMiddleware, (_req: AuthenticatedRequest, res) => {
  const iceServers = resolveLiveRoomIceServers();
  return res.status(200).json({
    iceServers,
    hasTurn: iceServers.some((server) => String(server.urls).startsWith("turn:")),
  });
});

app.post("/api/community/live-rooms/:roomId/join", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const userId = req.auth?.userId;
  const role = req.auth?.role;
  if (!userId || !role) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  pruneLiveRooms();
  const roomId = normalizeRoomId(String(req.params.roomId || ""));
  if (!roomId) {
    return res.status(400).json({ error: "Room id is required." });
  }

  const displayNameInput = String(req.body?.displayName || "").trim();
  const room = ensureLiveRoom(roomId);
  if (!canJoinLiveRoom(room, userId, role)) {
    return res.status(403).json({ error: "This room is locked by the host." });
  }

  const participantId = `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const participant: LiveRoomParticipant = {
    participantId,
    userId,
    role,
    displayName: displayNameInput || authUserDisplayName(req.auth),
    joinedAt: new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
  };

  if (!room.hostUserId) {
    room.hostUserId = userId;
    room.moderatorUserIds.add(userId);
  }

  room.participants.set(participantId, participant);
  pushLiveRoomSignal(room, {
    fromParticipantId: participantId,
    toParticipantId: null,
    type: "participant-joined",
    payload: {
      participantId,
      displayName: participant.displayName,
    },
  });

  const participants = Array.from(room.participants.values()).map((item) => ({
    participantId: item.participantId,
    displayName: item.displayName,
    joinedAt: item.joinedAt,
  }));

  return res.status(200).json({
    roomId,
    participantId,
    participants,
    roomLocked: room.isLocked,
    canModerate: isLiveRoomModerator(room, userId, role),
    isHost: room.hostUserId === userId,
    recording: room.recording,
  });
});

app.post("/api/community/live-rooms/:roomId/leave", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const userId = req.auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  pruneLiveRooms();
  const roomId = normalizeRoomId(String(req.params.roomId || ""));
  const participantId = String(req.body?.participantId || "").trim();
  const room = communityLiveRooms.get(roomId);
  if (!room || !participantId) {
    return res.status(200).json({ ok: true });
  }

  const participant = room.participants.get(participantId);
  if (!participant || participant.userId !== userId) {
    return res.status(403).json({ error: "Participant not found for this user." });
  }

  room.participants.delete(participantId);
  pushLiveRoomSignal(room, {
    fromParticipantId: participantId,
    toParticipantId: null,
    type: "participant-left",
    payload: { participantId },
  });

  return res.status(200).json({ ok: true });
});

app.get("/api/community/live-rooms/:roomId/presence", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const userId = req.auth?.userId;
  const role = req.auth?.role;
  if (!userId || !role) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  pruneLiveRooms();
  const roomId = normalizeRoomId(String(req.params.roomId || ""));
  const participantId = String(req.query.participantId || "").trim();
  const room = ensureLiveRoom(roomId);

  if (participantId && room.participants.has(participantId)) {
    const participant = room.participants.get(participantId)!;
    if (participant.userId === userId) {
      participant.lastSeenAt = new Date().toISOString();
      room.participants.set(participantId, participant);
    }
  }

  const participants = Array.from(room.participants.values()).map((item) => ({
    participantId: item.participantId,
    displayName: item.displayName,
    joinedAt: item.joinedAt,
  }));

  return res.status(200).json({
    roomId,
    participantCount: participants.length,
    participants,
    roomLocked: room.isLocked,
    canModerate: isLiveRoomModerator(room, userId, role),
    isHost: room.hostUserId === userId,
    recording: room.recording,
  });
});

app.patch("/api/community/live-rooms/:roomId/access", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const userId = req.auth?.userId;
  const role = req.auth?.role;
  if (!userId || !role) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  pruneLiveRooms();
  const roomId = normalizeRoomId(String(req.params.roomId || ""));
  const room = ensureLiveRoom(roomId);

  if (!isLiveRoomModerator(room, userId, role)) {
    return res.status(403).json({ error: "Host/moderator access required." });
  }

  const lock = typeof req.body?.lock === "boolean" ? req.body.lock : undefined;
  const allowGuestJoin = typeof req.body?.allowGuestJoin === "boolean" ? req.body.allowGuestJoin : undefined;
  const moderatorUserId = typeof req.body?.moderatorUserId === "string" ? req.body.moderatorUserId.trim() : "";
  const action = typeof req.body?.action === "string" ? req.body.action.trim().toLowerCase() : "";

  if (typeof lock === "boolean") room.isLocked = lock;
  if (typeof allowGuestJoin === "boolean") room.allowGuestJoin = allowGuestJoin;

  if (moderatorUserId && action === "add-moderator") {
    room.moderatorUserIds.add(moderatorUserId);
  }

  if (moderatorUserId && action === "remove-moderator") {
    if (room.hostUserId !== moderatorUserId) {
      room.moderatorUserIds.delete(moderatorUserId);
    }
  }

  return res.status(200).json({
    roomId,
    roomLocked: room.isLocked,
    allowGuestJoin: room.allowGuestJoin,
    hostUserId: room.hostUserId,
    moderatorUserIds: Array.from(room.moderatorUserIds),
  });
});

app.post("/api/community/live-rooms/:roomId/recording/start", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const userId = req.auth?.userId;
  const role = req.auth?.role;
  if (!userId || !role) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const roomId = normalizeRoomId(String(req.params.roomId || ""));
  const room = ensureLiveRoom(roomId);
  if (!isLiveRoomModerator(room, userId, role)) {
    return res.status(403).json({ error: "Host/moderator access required." });
  }

  const participantId = String(req.body?.participantId || "").trim() || null;
  room.recording = {
    isRecording: true,
    startedAt: new Date().toISOString(),
    startedByParticipantId: participantId,
    stoppedAt: null,
  };

  return res.status(200).json({ recording: room.recording });
});

app.post("/api/community/live-rooms/:roomId/recording/stop", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const userId = req.auth?.userId;
  const role = req.auth?.role;
  if (!userId || !role) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const roomId = normalizeRoomId(String(req.params.roomId || ""));
  const room = ensureLiveRoom(roomId);
  if (!isLiveRoomModerator(room, userId, role)) {
    return res.status(403).json({ error: "Host/moderator access required." });
  }

  room.recording = {
    ...room.recording,
    isRecording: false,
    stoppedAt: new Date().toISOString(),
  };

  return res.status(200).json({ recording: room.recording });
});

app.post("/api/community/live-rooms/:roomId/transcript", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const userId = req.auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const roomId = normalizeRoomId(String(req.params.roomId || ""));
  const room = ensureLiveRoom(roomId);
  const participantId = String(req.body?.participantId || "").trim();
  const text = String(req.body?.text || "").trim();

  if (!participantId || !text) {
    return res.status(400).json({ error: "participantId and text are required." });
  }

  const participant = room.participants.get(participantId);
  if (!participant || participant.userId !== userId) {
    return res.status(403).json({ error: "Participant not found for this room." });
  }

  const entry: LiveRoomTranscriptEntry = {
    id: `tx-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    participantId,
    author: participant.displayName,
    text,
    createdAt: new Date().toISOString(),
  };

  room.transcript.push(entry);
  if (room.transcript.length > LIVE_ROOM_MAX_TRANSCRIPT_ENTRIES) {
    room.transcript.splice(0, room.transcript.length - LIVE_ROOM_MAX_TRANSCRIPT_ENTRIES);
  }

  return res.status(201).json({ entry });
});

const resolveRecordingExtension = (fileName: string, mimeType: string): string => {
  const byName = path.extname(fileName || "").toLowerCase();
  if (byName) return byName;

  const normalized = (mimeType || "").toLowerCase();
  if (normalized.includes("mp4")) return ".mp4";
  if (normalized.includes("wav")) return ".wav";
  if (normalized.includes("ogg")) return ".ogg";
  return ".webm";
};

const pushLiveRoomRecordingAsset = (
  room: LiveRoomState,
  participantId: string,
  author: string,
  fileUrl: string,
  fileName: string,
  mimeType: string,
  fileSize: number,
  durationMs: number | null
): LiveRoomRecordingAsset => {
  const recordingAsset: LiveRoomRecordingAsset = {
    id: `rec-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    participantId,
    author,
    fileUrl,
    fileName,
    mimeType,
    fileSize,
    durationMs,
    uploadedAt: new Date().toISOString(),
  };

  room.recordings.push(recordingAsset);
  if (room.recordings.length > LIVE_ROOM_MAX_RECORDINGS) {
    room.recordings.splice(0, room.recordings.length - LIVE_ROOM_MAX_RECORDINGS);
  }

  return recordingAsset;
};

app.post(
  "/api/community/live-rooms/:roomId/recordings/chunk",
  authMiddleware,
  liveRecordingChunkUpload.single("chunk"),
  async (req: AuthenticatedRequest, res) => {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    pruneLiveRoomRecordingUploads();

    const roomId = normalizeRoomId(String(req.params.roomId || ""));
    const room = ensureLiveRoom(roomId);
    const file = req.file;

    const participantId = String(req.body?.participantId || "").trim();
    const uploadIdRaw = String(req.body?.uploadId || "").trim();
    const chunkIndex = Number(req.body?.chunkIndex);
    const totalChunks = Number(req.body?.totalChunks);
    const fileName = String(req.body?.fileName || "recording.webm").trim() || "recording.webm";
    const mimeType = String(req.body?.mimeType || file?.mimetype || "video/webm").trim() || "video/webm";
    const durationMsRaw = Number(req.body?.durationMs || 0);
    const durationMs = Number.isFinite(durationMsRaw) && durationMsRaw > 0 ? Math.round(durationMsRaw) : null;

    if (!file || !participantId) {
      return res.status(400).json({ error: "participantId and chunk file are required." });
    }

    if (!Number.isInteger(chunkIndex) || chunkIndex < 0 || !Number.isInteger(totalChunks) || totalChunks < 1 || chunkIndex >= totalChunks) {
      return res.status(400).json({ error: "Invalid chunk metadata." });
    }

    const participant = room.participants.get(participantId);
    if (!participant || participant.userId !== userId) {
      return res.status(403).json({ error: "Participant not found for this room." });
    }

    let session: LiveRoomRecordingUploadSession | undefined;
    if (uploadIdRaw) {
      session = liveRoomRecordingUploads.get(uploadIdRaw);
      if (!session) {
        return res.status(404).json({ error: "Upload session not found." });
      }

      if (session.roomId !== roomId || session.participantId !== participantId || session.userId !== userId) {
        return res.status(403).json({ error: "Upload session does not belong to this participant." });
      }

      if (session.totalChunks !== totalChunks) {
        return res.status(400).json({ error: "totalChunks does not match existing upload session." });
      }
    } else {
      const uploadId = `upl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      const tempPath = path.join(uploadsDir, `live-recording-upload-${uploadId}.part`);
      session = {
        uploadId,
        roomId,
        participantId,
        userId,
        author: participant.displayName,
        fileName,
        mimeType,
        totalChunks,
        durationMs,
        tempPath,
        receivedChunks: new Set<number>(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      liveRoomRecordingUploads.set(uploadId, session);
    }

    const expectedChunkIndex = session.receivedChunks.size;
    if (session.receivedChunks.has(chunkIndex)) {
      session.updatedAt = Date.now();
      return res.status(200).json({
        uploadId: session.uploadId,
        receivedChunks: session.receivedChunks.size,
        totalChunks: session.totalChunks,
        complete: session.receivedChunks.size === session.totalChunks,
      });
    }

    if (chunkIndex !== expectedChunkIndex) {
      return res.status(409).json({
        error: `Unexpected chunk index. Expected ${expectedChunkIndex}.`,
        uploadId: session.uploadId,
        expectedChunkIndex,
      });
    }

    fs.appendFileSync(session.tempPath, file.buffer);
    session.receivedChunks.add(chunkIndex);
    session.updatedAt = Date.now();
    if (durationMs && durationMs > 0) {
      session.durationMs = durationMs;
    }

    return res.status(202).json({
      uploadId: session.uploadId,
      receivedChunks: session.receivedChunks.size,
      totalChunks: session.totalChunks,
      complete: session.receivedChunks.size === session.totalChunks,
    });
  }
);

app.get("/api/community/live-rooms/:roomId/recordings/upload/:uploadId", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const userId = req.auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  pruneLiveRoomRecordingUploads();

  const roomId = normalizeRoomId(String(req.params.roomId || ""));
  const participantId = String(req.query.participantId || "").trim();
  const uploadId = String(req.params.uploadId || "").trim();
  if (!participantId || !uploadId) {
    return res.status(400).json({ error: "participantId and uploadId are required." });
  }

  const room = ensureLiveRoom(roomId);
  const participant = room.participants.get(participantId);
  if (!participant || participant.userId !== userId) {
    return res.status(403).json({ error: "Participant not found for this room." });
  }

  const session = liveRoomRecordingUploads.get(uploadId);
  if (!session) {
    return res.status(404).json({ error: "Upload session not found." });
  }

  if (session.roomId !== roomId || session.participantId !== participantId || session.userId !== userId) {
    return res.status(403).json({ error: "Upload session does not belong to this participant." });
  }

  session.updatedAt = Date.now();
  return res.status(200).json({
    uploadId: session.uploadId,
    participantId: session.participantId,
    receivedChunks: session.receivedChunks.size,
    totalChunks: session.totalChunks,
    expectedChunkIndex: session.receivedChunks.size,
    complete: session.receivedChunks.size === session.totalChunks,
  });
});

app.post("/api/community/live-rooms/:roomId/recordings/finalize", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const userId = req.auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  pruneLiveRoomRecordingUploads();

  const roomId = normalizeRoomId(String(req.params.roomId || ""));
  const room = ensureLiveRoom(roomId);

  const participantId = String(req.body?.participantId || "").trim();
  const uploadId = String(req.body?.uploadId || "").trim();
  if (!participantId || !uploadId) {
    return res.status(400).json({ error: "participantId and uploadId are required." });
  }

  const participant = room.participants.get(participantId);
  if (!participant || participant.userId !== userId) {
    return res.status(403).json({ error: "Participant not found for this room." });
  }

  const session = liveRoomRecordingUploads.get(uploadId);
  if (!session) {
    return res.status(404).json({ error: "Upload session not found." });
  }

  if (session.roomId !== roomId || session.participantId !== participantId || session.userId !== userId) {
    return res.status(403).json({ error: "Upload session does not belong to this participant." });
  }

  if (session.receivedChunks.size !== session.totalChunks) {
    return res.status(400).json({ error: "Upload is incomplete." });
  }

  if (!fs.existsSync(session.tempPath)) {
    liveRoomRecordingUploads.delete(uploadId);
    return res.status(404).json({ error: "Upload file not found. Please re-upload." });
  }

  const ext = resolveRecordingExtension(session.fileName, session.mimeType);
  const finalFileName = `recording-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  const finalPath = path.join(uploadsDir, finalFileName);

  fs.renameSync(session.tempPath, finalPath);
  const stats = fs.statSync(finalPath);

  const recording = pushLiveRoomRecordingAsset(
    room,
    participantId,
    session.author,
    `/uploads/${finalFileName}`,
    session.fileName,
    session.mimeType,
    stats.size,
    session.durationMs
  );

  liveRoomRecordingUploads.delete(uploadId);
  return res.status(201).json({ recording });
});

app.post(
  "/api/community/live-rooms/:roomId/recordings",
  authMiddleware,
  liveRecordingUpload.single("recording"),
  async (req: AuthenticatedRequest, res) => {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const roomId = normalizeRoomId(String(req.params.roomId || ""));
    const room = ensureLiveRoom(roomId);
    pruneLiveRoomRecordingUploads();

    const participantId = String(req.body?.participantId || "").trim();
    const durationMsRaw = Number(req.body?.durationMs || 0);
    const durationMs = Number.isFinite(durationMsRaw) && durationMsRaw > 0 ? Math.round(durationMsRaw) : null;
    const file = req.file;

    if (!participantId || !file) {
      return res.status(400).json({ error: "participantId and recording file are required." });
    }

    const participant = room.participants.get(participantId);
    if (!participant || participant.userId !== userId) {
      return res.status(403).json({ error: "Participant not found for this room." });
    }

    const recordingAsset = pushLiveRoomRecordingAsset(
      room,
      participantId,
      participant.displayName,
      `/uploads/${file.filename}`,
      file.originalname,
      file.mimetype,
      file.size,
      durationMs
    );

    return res.status(201).json({ recording: recordingAsset });
  }
);

app.get("/api/community/live-rooms/:roomId/archive", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const userId = req.auth?.userId;
  const role = req.auth?.role;
  if (!userId || !role) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const roomId = normalizeRoomId(String(req.params.roomId || ""));
  const room = ensureLiveRoom(roomId);
  const isParticipant = Array.from(room.participants.values()).some((participant) => participant.userId === userId);

  if (!isParticipant && !isLiveRoomModerator(room, userId, role)) {
    return res.status(403).json({ error: "Participant or moderator access required." });
  }

  return res.status(200).json({
    roomId,
    title: room.title,
    hostUserId: room.hostUserId,
    roomLocked: room.isLocked,
    recording: room.recording,
    transcript: room.transcript,
    recordings: room.recordings,
  });
});

app.post("/api/community/live-rooms/:roomId/signal", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const userId = req.auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  pruneLiveRooms();
  const roomId = normalizeRoomId(String(req.params.roomId || ""));
  const room = ensureLiveRoom(roomId);

  const fromParticipantId = String(req.body?.fromParticipantId || "").trim();
  const toParticipantIdRaw = req.body?.toParticipantId;
  const toParticipantId = typeof toParticipantIdRaw === "string" && toParticipantIdRaw.trim().length > 0 ? toParticipantIdRaw.trim() : null;
  const typeRaw = String(req.body?.type || "").trim();
  const payload = req.body?.payload && typeof req.body.payload === "object" ? (req.body.payload as Record<string, unknown>) : {};

  if (!fromParticipantId || !["offer", "answer", "ice-candidate", "participant-joined", "participant-left"].includes(typeRaw)) {
    return res.status(400).json({ error: "Invalid signal payload." });
  }

  const sender = room.participants.get(fromParticipantId);
  if (!sender || sender.userId !== userId) {
    return res.status(403).json({ error: "Sender does not belong to this room." });
  }

  sender.lastSeenAt = new Date().toISOString();
  room.participants.set(fromParticipantId, sender);

  const signal = pushLiveRoomSignal(room, {
    fromParticipantId,
    toParticipantId,
    type: typeRaw as LiveRoomSignal["type"],
    payload,
  });

  return res.status(201).json({ signal });
});

app.get("/api/community/live-rooms/:roomId/signals", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const userId = req.auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  pruneLiveRooms();
  const roomId = normalizeRoomId(String(req.params.roomId || ""));
  const room = ensureLiveRoom(roomId);

  const participantId = String(req.query.participantId || "").trim();
  const since = Number(req.query.since || 0);
  if (!participantId || Number.isNaN(since)) {
    return res.status(400).json({ error: "participantId and valid since are required." });
  }

  const participant = room.participants.get(participantId);
  if (!participant || participant.userId !== userId) {
    return res.status(403).json({ error: "Participant not found for this room." });
  }

  participant.lastSeenAt = new Date().toISOString();
  room.participants.set(participantId, participant);

  const signals = room.signals.filter((signal) => {
    if (signal.seq <= since) return false;
    if (signal.fromParticipantId === participantId) return false;
    return !signal.toParticipantId || signal.toParticipantId === participantId;
  });

  return res.status(200).json({
    roomId,
    signals,
    latestSeq: room.signalSeq,
  });
});

app.post("/api/community/posts/:id/report", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const reporterId = req.auth?.userId;
  if (!reporterId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const reason = String(req.body?.reason || "").trim();
  if (reason.length < 6) {
    return res.status(400).json({ error: "Please provide a report reason with at least 6 characters." });
  }

  const postId = req.params.id;

  try {
    const existing = await prismaDynamic.communityPostReport.findFirst({
      where: {
        postId,
        reporterId,
      },
    });

    if (existing) {
      return res.status(409).json({ error: "You have already reported this post." });
    }

    await prismaDynamic.communityPostReport.create({
      data: {
        postId,
        reporterId,
        reason,
        status: "OPEN",
      },
    });

    const context = await resolveCommunityInteractionContext(postId);
    await recordCommunityInteraction(reporterId, {
      action: "post_report",
      itemId: postId,
      field: context.field ?? undefined,
      tokens: Array.from(new Set([...context.tokens, ...tokenizeInterestText(reason)])),
    });

    return res.status(201).json({ ok: true, message: "Report submitted for moderation review." });
  } catch (error) {
    console.error("Report community post error:", error);
    return res.status(500).json({ error: "Unable to report this post right now." });
  }
});

app.delete("/api/community/posts/:id", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const userId = req.auth?.userId;
  const userRole = req.auth?.role;
  if (!userId || !userRole) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const postId = String(req.params.id || "").trim();
  if (!postId) {
    return res.status(400).json({ error: "Post id is required." });
  }

  try {
    const existing = (await prismaDynamic.communityPost.findUnique({
      where: { id: postId },
    })) as CommunityPostRecord | null;

    if (!existing) {
      return res.status(404).json({ error: "Post not found." });
    }

    const canModerate = userRole === "ADMIN" || isModeratorRole(userRole);
    const isAuthor = existing.authorName === authUserDisplayName(req.auth);
    if (!canModerate && !isAuthor) {
      return res.status(403).json({ error: "You can only delete your own posts." });
    }

    await prismaDynamic.communityPost.delete({ where: { id: postId } });
    communityPostCache.delete(postId);
    communityCommentsCache.delete(postId);
    communityPostEngagementCache.delete(postId);

    const context = await resolveCommunityInteractionContext(postId);
    await recordCommunityInteraction(userId, {
      action: "post_delete",
      itemId: postId,
      field: context.field ?? existing.field,
      tokens: Array.from(new Set([...existing.interests, ...context.tokens])),
    });

    return res.status(200).json({ ok: true, id: postId });
  } catch (error) {
    console.error("Delete community post error:", error);
    return res.status(500).json({ error: "Unable to delete this post right now." });
  }
});

app.patch("/api/community/updates/:id/pin", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const userRole = req.auth?.role;
  if (!userRole) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!isModeratorRole(userRole)) {
    return res.status(403).json({ error: "Moderator access required" });
  }

  const isPinned = Boolean(req.body?.isPinned);

  try {
    const updated = await prismaDynamic.communityUpdate.update({
      where: { id: req.params.id },
      data: {
        isPinned,
        pinnedAt: isPinned ? new Date() : null,
      },
    });

    return res.status(200).json({
      id: updated.id,
      isPinned: updated.isPinned,
      pinnedAt: updated.pinnedAt,
    });
  } catch (error) {
    console.error("Pin community update error:", error);
    return res.status(500).json({ error: "Unable to pin this update right now." });
  }
});

app.patch("/api/community/ads/:id/approve", authMiddleware, adminOnlyMiddleware, async (req: AuthenticatedRequest, res) => {
  const userId = req.auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const isApproved = Boolean(req.body?.isApproved);

  try {
    const updated = await prismaDynamic.communityAd.update({
      where: { id: req.params.id },
      data: {
        isApproved,
        approvedAt: isApproved ? new Date() : null,
        approvedById: isApproved ? userId : null,
      },
    });

    return res.status(200).json({
      id: updated.id,
      isApproved: updated.isApproved,
      approvedAt: updated.approvedAt,
    });
  } catch (error) {
    console.error("Approve community ad error:", error);
    return res.status(500).json({ error: "Unable to update ad approval right now." });
  }
});

app.get("/api/team-members", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (shouldUseOfflineTeamMembers(userId)) {
      return res.json(getOrCreateOfflineTeamMembers(userId));
    }

    const existing = await prisma.teamMember.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "asc" },
    });

    if (existing.length > 0) {
      return res.json(existing);
    }

    await prisma.teamMember.createMany({
      data: DEFAULT_TEAM_MEMBERS.map((member) => ({
        ownerId: userId,
        name: member.name,
        email: member.email,
        role: member.role,
        projects: member.projects,
        avatar: getInitialsFromName(member.name),
      })),
    });

    const seeded = await prisma.teamMember.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "asc" },
    });

    return res.json(seeded);
  } catch (error) {
    console.error("Get team members error:", error);
    return res.status(500).json({ error: "Failed to fetch team members" });
  }
});

app.post("/api/team-members", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { name, email, role } = req.body as {
      name?: string;
      email?: string;
      role?: string;
    };

    const trimmedName = name?.trim();
    const normalizedEmail = email?.trim().toLowerCase();
    const trimmedRole = role?.trim();

    if (!trimmedName || !normalizedEmail || !trimmedRole) {
      return res.status(400).json({ error: "name, email and role are required" });
    }

    if (shouldUseOfflineTeamMembers(userId)) {
      const members = getOrCreateOfflineTeamMembers(userId);
      if (members.some((member) => member.email.toLowerCase() === normalizedEmail)) {
        return res.status(409).json({ error: "Member with this email already exists" });
      }

      const now = new Date();
      const created: TeamMemberRecord = {
        id: `${userId}-tm-${Date.now()}`,
        ownerId: userId,
        name: trimmedName,
        email: normalizedEmail,
        role: trimmedRole,
        projects: 0,
        avatar: getInitialsFromName(trimmedName),
        createdAt: now,
        updatedAt: now,
      };
      members.unshift(created);
      offlineTeamMembers.set(userId, members);
      return res.status(201).json(created);
    }

    const duplicate = await prisma.teamMember.findFirst({
      where: {
        ownerId: userId,
        email: normalizedEmail,
      },
    });

    if (duplicate) {
      return res.status(409).json({ error: "Member with this email already exists" });
    }

    const created = await prisma.teamMember.create({
      data: {
        ownerId: userId,
        name: trimmedName,
        email: normalizedEmail,
        role: trimmedRole,
        projects: 0,
        avatar: getInitialsFromName(trimmedName),
      },
    });

    return res.status(201).json(created);
  } catch (error) {
    console.error("Create team member error:", error);
    return res.status(500).json({ error: "Failed to create team member" });
  }
});

app.patch("/api/team-members/:id", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    const { role } = req.body as { role?: string };
    const trimmedRole = role?.trim();

    if (!trimmedRole) {
      return res.status(400).json({ error: "role is required" });
    }

    if (shouldUseOfflineTeamMembers(userId)) {
      const members = getOrCreateOfflineTeamMembers(userId);
      const index = members.findIndex((member) => member.id === id);
      if (index < 0) {
        return res.status(404).json({ error: "Team member not found" });
      }

      const updated: TeamMemberRecord = {
        ...members[index],
        role: trimmedRole,
        updatedAt: new Date(),
      };
      members[index] = updated;
      offlineTeamMembers.set(userId, members);
      return res.json(updated);
    }

    const existing = await prisma.teamMember.findUnique({ where: { id } });
    if (!existing || existing.ownerId !== userId) {
      return res.status(404).json({ error: "Team member not found" });
    }

    const updated = await prisma.teamMember.update({
      where: { id },
      data: { role: trimmedRole },
    });

    return res.json(updated);
  } catch (error) {
    console.error("Update team member error:", error);
    return res.status(500).json({ error: "Failed to update team member" });
  }
});

app.delete("/api/team-members/:id", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;

    if (shouldUseOfflineTeamMembers(userId)) {
      const members = getOrCreateOfflineTeamMembers(userId);
      const exists = members.some((member) => member.id === id);
      if (!exists) {
        return res.status(404).json({ error: "Team member not found" });
      }

      const filtered = members.filter((member) => member.id !== id);
      offlineTeamMembers.set(userId, filtered);
      return res.status(204).send();
    }

    const result = await prisma.teamMember.deleteMany({
      where: {
        id,
        ownerId: userId,
      },
    });

    if (result.count === 0) {
      return res.status(404).json({ error: "Team member not found" });
    }

    return res.status(204).send();
  } catch (error) {
    console.error("Delete team member error:", error);
    return res.status(500).json({ error: "Failed to remove team member" });
  }
});

// Update profile endpoint
app.put("/api/auth/profile", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { name, phone, bio, company, registrationNo, industry, location, twoFactorEnabled } = req.body;
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

    if (!dbAvailable) {
      const match = findInMemoryUser(userId, true);
      if (!match) {
        return res.status(404).json({ error: "User not found" });
      }

      if (typeof name === "string") {
        match.profile.name = name || match.profile.name;
      }
      if (typeof phone === "string") {
        match.profile.phone = phone || match.profile.phone;
      }
      if (typeof bio === "string") {
        match.profile.bio = bio || match.profile.bio;
      }
      if (typeof company === "string") {
        match.profile.company = company || match.profile.company;
      }
      if (typeof registrationNo === "string") {
        match.profile.registrationNo = registrationNo || null;
      }
      if (typeof industry === "string") {
        match.profile.industry = industry || null;
      }
      if (typeof location === "string") {
        match.profile.location = location || match.profile.location;
      }
      if (typeof twoFactorEnabled === "boolean") {
        offlineTwoFactorOverrides.set(match.id, twoFactorEnabled);
      }

      return res.json({ user: buildInMemorySafeUser(match.profile, match.id), mode: "offline" });
    }

    const twoFactorUpdate = typeof twoFactorEnabled === "boolean"
      ? {
          twoFactorEnabled,
          emailVerificationToken: twoFactorEnabled ? undefined : null,
          emailVerificationExpiry: twoFactorEnabled ? undefined : null,
        }
      : {};

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || undefined,
        phone: phone || undefined,
        bio: bio || undefined,
        company: company || undefined,
        registrationNo: registrationNo || undefined,
        industry: industry || undefined,
        location: location || undefined,
        ...twoFactorUpdate,
      },
    });

    return res.json({ user: toSafeUser(updatedUser) });
  } catch (error) {
    console.error("Profile update error:", error);
    return res.status(500).json({ error: "Failed to update profile" });
  }
});

// Project email reminder settings
app.get("/api/notifications/project-reminders/settings", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const userId = req.auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const settings = await getProjectReminderSettings(userId);
    return res.status(200).json(settings);
  } catch (error) {
    console.error("Project reminder settings fetch error:", error);
    return res.status(500).json({ error: "Failed to load project reminder settings" });
  }
});

app.put("/api/notifications/project-reminders/settings", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const userId = req.auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { enabled, frequency, quietHoursStart, quietHoursEnd } = req.body as {
    enabled?: unknown;
    frequency?: unknown;
    quietHoursStart?: unknown;
    quietHoursEnd?: unknown;
  };

  const hasEnabled = typeof enabled === "boolean";
  const hasFrequency = typeof frequency === "string";
  const hasQuietHoursStart = typeof quietHoursStart === "number";
  const hasQuietHoursEnd = typeof quietHoursEnd === "number";

  if (!hasEnabled && !hasFrequency && !hasQuietHoursStart && !hasQuietHoursEnd) {
    return res.status(400).json({
      error: "Provide at least one setting: enabled, frequency, quietHoursStart, or quietHoursEnd",
    });
  }

  if (hasFrequency && frequency !== "daily" && frequency !== "weekly") {
    return res.status(400).json({ error: "frequency must be either daily or weekly" });
  }

  if (hasQuietHoursStart && (!Number.isInteger(quietHoursStart) || quietHoursStart < 0 || quietHoursStart > 23)) {
    return res.status(400).json({ error: "quietHoursStart must be an integer from 0 to 23" });
  }

  if (hasQuietHoursEnd && (!Number.isInteger(quietHoursEnd) || quietHoursEnd < 0 || quietHoursEnd > 23)) {
    return res.status(400).json({ error: "quietHoursEnd must be an integer from 0 to 23" });
  }

  try {
    if (hasEnabled) {
      await setProjectReminderEnabled(userId, enabled as boolean);
    }

    if (hasFrequency) {
      await setProjectReminderFrequency(userId, frequency as ProjectReminderFrequency);
    }

    if (hasQuietHoursStart || hasQuietHoursEnd) {
      const current = await getProjectReminderSettings(userId);
      await setProjectReminderQuietHours(
        userId,
        hasQuietHoursStart ? (quietHoursStart as number) : current.quietHoursStart,
        hasQuietHoursEnd ? (quietHoursEnd as number) : current.quietHoursEnd,
      );
    }

    const settings = await getProjectReminderSettings(userId);
    return res.status(200).json(settings);
  } catch (error) {
    console.error("Project reminder settings update error:", error);
    return res.status(500).json({ error: "Failed to update project reminder settings" });
  }
});

app.post("/api/notifications/project-reminders/dispatch", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const userId = req.auth?.userId;
  const auth = req.auth;

  if (!userId || !auth) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { projects, clientLocalHour } = req.body as {
    projects?: ProjectReminderCandidate[];
    clientLocalHour?: unknown;
  };
  if (!Array.isArray(projects)) {
    return res.status(400).json({ error: "projects must be an array" });
  }

  let parsedClientLocalHour: number | undefined;
  if (clientLocalHour != null) {
    const candidateHour = Number(clientLocalHour);
    if (!Number.isInteger(candidateHour) || candidateHour < 0 || candidateHour > 23) {
      return res.status(400).json({ error: "clientLocalHour must be an integer from 0 to 23" });
    }
    parsedClientLocalHour = candidateHour;
  }

  try {
    const settings = await getProjectReminderSettings(userId);
    if (!settings.enabled) {
      return res.status(200).json({ sent: false, reason: "disabled", attentionCount: 0 });
    }

    const hourToEvaluate = parsedClientLocalHour ?? new Date().getHours();
    if (isWithinQuietHours(hourToEvaluate, settings.quietHoursStart, settings.quietHoursEnd)) {
      return res.status(200).json({
        sent: false,
        reason: "quiet_hours",
        attentionCount: 0,
        quietHoursStart: settings.quietHoursStart,
        quietHoursEnd: settings.quietHoursEnd,
      });
    }

    if (settings.lastSentAt) {
      const previousSentAtMs = Date.parse(settings.lastSentAt);
      if (!Number.isNaN(previousSentAtMs)) {
        const minIntervalMs = getProjectReminderMinIntervalMs(settings.frequency);
        if (Date.now() - previousSentAtMs < minIntervalMs) {
          return res.status(200).json({
            sent: false,
            reason: "throttled",
            attentionCount: 0,
            frequency: settings.frequency,
            lastSentAt: settings.lastSentAt,
          });
        }
      }
    }

    const attentionProjects = projects.filter(projectNeedsAttention);
    if (attentionProjects.length === 0) {
      return res.status(200).json({ sent: false, reason: "no_attention_projects", attentionCount: 0 });
    }

    const recipient = await resolveReminderRecipient(userId, auth);
    const message = formatProjectReminderMessage(attentionProjects);
    const dashboardUrl = process.env.FRONTEND_URL || process.env.APP_URL || "http://localhost:5173";

    const sent = await sendReminderEmail(
      recipient.email,
      "Project Attention Reminder",
      recipient.name,
      message,
      `${dashboardUrl.replace(/\/$/, "")}/dashboard/projects`
    );

    if (!sent) {
      return res.status(502).json({ sent: false, reason: "email_failed", attentionCount: attentionProjects.length });
    }

    const nowIso = new Date().toISOString();
    await setProjectReminderLastSent(userId, nowIso);

    return res.status(200).json({
      sent: true,
      attentionCount: attentionProjects.length,
      lastSentAt: nowIso,
      frequency: settings.frequency,
      projects: attentionProjects.map((project) => ({ name: project.name || "Unnamed project", progress: project.progress ?? null })),
    });
  } catch (error) {
    console.error("Project reminder dispatch error:", error);
    return res.status(500).json({ error: "Failed to dispatch project reminder email" });
  }
});

// Upload profile picture endpoint
app.post(
  "/api/auth/profile/picture",
  authMiddleware,
  profileUpload.single("profilePicture"),
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
const ENGINEERS_CACHE_TTL_MS = 60_000;
const engineersCache = new Map<string, { expiresAt: number; engineers: unknown[] }>();

// List engineers for search/discovery
app.get("/api/engineers", async (req, res) => {
  const query = String(req.query.q || "").trim();
  const cacheKey = query.toLowerCase();
  const now = Date.now();
  const cached = engineersCache.get(cacheKey);

  if (cached && cached.expiresAt > now) {
    return res.status(200).json({ engineers: cached.engineers, cached: true });
  }

  if (!dbAvailable) {
    const fallbackEngineers = SAMPLE_ENGINEERS
      .filter((engineer) => {
        if (!query) return true;
        const haystack = `${engineer.name} ${engineer.email} ${engineer.company} ${engineer.location} ${engineer.bio}`.toLowerCase();
        return haystack.includes(query.toLowerCase());
      })
      .map((engineer, index) => ({
        id: `offline-engineer-${index + 1}`,
        name: engineer.name,
        email: engineer.email,
        company: engineer.company,
        location: engineer.location,
        bio: engineer.bio,
        createdAt: new Date(0),
      }));

    engineersCache.set(cacheKey, {
      engineers: fallbackEngineers,
      expiresAt: now + ENGINEERS_CACHE_TTL_MS,
    });

    return res.status(200).json({ engineers: fallbackEngineers, cached: false, offline: true });
  }

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

    engineersCache.set(cacheKey, {
      engineers,
      expiresAt: now + ENGINEERS_CACHE_TTL_MS,
    });

    return res.status(200).json({ engineers, cached: false });
  } catch (error) {
    console.error("List engineers error:", error);

    if (cached) {
      return res.status(200).json({ engineers: cached.engineers, cached: true, stale: true });
    }

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

  if (!dbAvailable) {
    return res.status(201).json({
      id: `offline-inquiry-${Date.now()}`,
      recipientId,
      senderName,
      senderEmail,
      senderPhone: senderPhone || null,
      message,
      senderUserId: null,
      replyMessage: null,
      senderViewedAt: null,
      status: "PENDING",
      respondedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      offline: true,
    });
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
  } catch (error: any) {
    if (error?.code === "P2003") {
      return res.status(404).json({ error: "Recipient not found" });
    }

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
    await seedCommunityContent();
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
