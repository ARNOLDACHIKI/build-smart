import { apiUrl } from "@/lib/api";
import { authStorage } from "@/lib/auth";

export type MediaItem = {
  url: string;
  mediaType: "image" | "video" | "audio" | "document";
  fileName: string;
  thumbnailUrl?: string;
};

export type CommunityPost = {
  id: string;
  type: string;
  title: string;
  summary: string;
  author: string;
  field: string;
  interests: string[];
  stats: string;
  verified?: boolean;
  media?: MediaItem[];
  liveSession?: {
    title: string;
    startsAt: string;
    roomUrl: string;
    roomId?: string;
    description?: string;
  } | null;
  createdAt: string;
};

export type CommunityLiveSession = {
  postId: string;
  title: string;
  startsAt: string;
  roomUrl: string;
  roomId: string | null;
  description: string;
  author: string;
  field: string;
  createdAt: string;
};

export type CommunityLiveRoomParticipant = {
  participantId: string;
  displayName: string;
  joinedAt: string;
};

export type CommunityLiveRoomSignal = {
  seq: number;
  fromParticipantId: string;
  toParticipantId: string | null;
  type: "offer" | "answer" | "ice-candidate" | "participant-joined" | "participant-left";
  payload: Record<string, unknown>;
  createdAt: string;
};

export type CommunityLiveRoomRecording = {
  isRecording: boolean;
  startedAt: string | null;
  startedByParticipantId: string | null;
  stoppedAt: string | null;
};

export type CommunityTranscriptEntry = {
  id: string;
  participantId: string;
  author: string;
  text: string;
  createdAt: string;
};

export type CommunityRecordingAsset = {
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

type CommunityRecordingChunkUploadResult = {
  uploadId: string;
  receivedChunks: number;
  totalChunks: number;
  complete: boolean;
};

type CommunityRecordingChunkConflict = {
  uploadId: string;
  expectedChunkIndex: number;
};

type CommunityRecordingUploadStatus = {
  uploadId: string;
  participantId: string;
  receivedChunks: number;
  totalChunks: number;
  expectedChunkIndex: number;
  complete: boolean;
};

export type CommunityRecordingUploadTelemetry = {
  uploadId: string | null;
  retryCount: number;
  lastError: string | null;
  lastBackoffMs: number | null;
  updatedAt: string;
};

const LIVE_RECORDING_CHUNK_SIZE_BYTES = 5 * 1024 * 1024;
const LIVE_RECORDING_CHUNK_MAX_RETRIES = 3;
const LIVE_RECORDING_CHUNK_RETRY_BASE_DELAY_MS = 40;
const LIVE_RECORDING_CHUNK_RETRY_MAX_DELAY_MS = 1200;

const getRecordingUploadSessionStorage = (): Storage | null => {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
};

const buildRecordingUploadSessionKey = (
  roomId: string,
  participantId: string,
  fileName: string,
  blobSize: number
): string => {
  return `community.liveRecordingUpload.${roomId}.${participantId}.${fileName}.${blobSize}`;
};

const buildRecordingUploadTelemetryKey = (uploadSessionKey: string): string => {
  return `${uploadSessionKey}.telemetry`;
};

const getDefaultRecordingUploadTelemetry = (): CommunityRecordingUploadTelemetry => ({
  uploadId: null,
  retryCount: 0,
  lastError: null,
  lastBackoffMs: null,
  updatedAt: new Date().toISOString(),
});

const readRecordingUploadTelemetry = (
  storage: Storage | null,
  telemetryKey: string
): CommunityRecordingUploadTelemetry => {
  if (!storage) return getDefaultRecordingUploadTelemetry();

  const raw = storage.getItem(telemetryKey);
  if (!raw) return getDefaultRecordingUploadTelemetry();

  try {
    const parsed = JSON.parse(raw) as Partial<CommunityRecordingUploadTelemetry>;
    return {
      uploadId: typeof parsed.uploadId === "string" ? parsed.uploadId : null,
      retryCount: Number.isFinite(parsed.retryCount) ? Number(parsed.retryCount) : 0,
      lastError: typeof parsed.lastError === "string" ? parsed.lastError : null,
      lastBackoffMs: Number.isFinite(parsed.lastBackoffMs) ? Number(parsed.lastBackoffMs) : null,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch {
    return getDefaultRecordingUploadTelemetry();
  }
};

const writeRecordingUploadTelemetry = (
  storage: Storage | null,
  telemetryKey: string,
  updater: (current: CommunityRecordingUploadTelemetry) => CommunityRecordingUploadTelemetry
): void => {
  if (!storage) return;
  const next = updater(readRecordingUploadTelemetry(storage, telemetryKey));
  storage.setItem(telemetryKey, JSON.stringify(next));
};

const wait = async (ms: number): Promise<void> => {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const computeChunkRetryDelayMs = (retryAttempt: number): number => {
  const exponent = Math.max(0, retryAttempt - 1);
  const delay = LIVE_RECORDING_CHUNK_RETRY_BASE_DELAY_MS * Math.pow(2, exponent);
  return Math.min(LIVE_RECORDING_CHUNK_RETRY_MAX_DELAY_MS, delay);
};

export const getCommunityLiveRecordingUploadTelemetry = (
  roomId: string,
  participantId: string,
  fileName: string,
  blobSize: number
): CommunityRecordingUploadTelemetry | null => {
  const storage = getRecordingUploadSessionStorage();
  if (!storage) return null;

  const uploadSessionKey = buildRecordingUploadSessionKey(roomId, participantId, fileName, blobSize);
  const telemetryKey = buildRecordingUploadTelemetryKey(uploadSessionKey);
  return readRecordingUploadTelemetry(storage, telemetryKey);
};

const uploadCommunityLiveRecordingChunk = async (
  roomId: string,
  formData: FormData
): Promise<{ ok: true; data: CommunityRecordingChunkUploadResult } | { ok: false; conflict: CommunityRecordingChunkConflict } > => {
  const token = authStorage.getToken();
  const response = await fetch(apiUrl(`/api/community/live-rooms/${roomId}/recordings/chunk`), {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
    uploadId?: string;
    expectedChunkIndex?: number;
    receivedChunks?: number;
    totalChunks?: number;
    complete?: boolean;
  };

  if (response.ok) {
    return {
      ok: true,
      data: {
        uploadId: String(payload.uploadId || ""),
        receivedChunks: Number(payload.receivedChunks || 0),
        totalChunks: Number(payload.totalChunks || 0),
        complete: Boolean(payload.complete),
      },
    };
  }

  if (response.status === 409 && payload.uploadId && Number.isInteger(payload.expectedChunkIndex)) {
    return {
      ok: false,
      conflict: {
        uploadId: String(payload.uploadId),
        expectedChunkIndex: Number(payload.expectedChunkIndex),
      },
    };
  }

  throw new Error(payload.error || "Community request failed");
};

const getCommunityLiveRecordingUploadStatus = async (
  roomId: string,
  uploadId: string,
  participantId: string
): Promise<CommunityRecordingUploadStatus> => {
  const query = new URLSearchParams({ participantId });
  return authorizedRequest<CommunityRecordingUploadStatus>(
    `/api/community/live-rooms/${roomId}/recordings/upload/${uploadId}?${query.toString()}`
  );
};

export type CommunityUpdate = {
  id: string;
  title: string;
  body: string;
  isPinned: boolean;
  createdAt: string;
};

export type CommunityAd = {
  id: string;
  title: string;
  copy: string;
  ctaUrl: string;
  approvedAt: string | null;
};

export type CommunityRecommendation = {
  id: string;
  title: string;
  format: string;
  field: string;
};

export type CommunityFeedResponse = {
  posts: CommunityPost[];
  updates: CommunityUpdate[];
  ads: CommunityAd[];
  recommendations: CommunityRecommendation[];
  state: {
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
  personalization: {
    role: string;
    inferredField: string;
    interestTokens: string[];
  };
  moderation: {
    canPinUpdates: boolean;
    canApproveAds: boolean;
  };
  mode?: "fallback";
};

export type CommunityState = CommunityFeedResponse["state"];

export type CommunityBookmarkResponse = {
  itemId: string;
  bookmarked: boolean;
  state: CommunityState;
};

export type CommunityFollowResponse = {
  itemId: string;
  following: boolean;
  state: CommunityState;
};

export type CommunityVoteResponse = {
  itemId: string;
  vote: "up" | "down" | null;
  state: CommunityState;
};

export type CommunityPollVoteResponse = {
  itemId: string;
  choice: string | null;
  state: CommunityState;
};

export type CommunityChatResponse = {
  messages: CommunityState["chatMessages"];
};

const authorizedRequest = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const token = authStorage.getToken();
  const isFormData = typeof FormData !== "undefined" && init?.body instanceof FormData;
  const response = await fetch(apiUrl(path), {
    ...init,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });

  const payload = (await response.json().catch(() => ({}))) as { error?: string } & T;
  if (!response.ok) {
    throw new Error(payload.error || "Community request failed");
  }

  return payload as T;
};

export const getCommunityFeed = async (params?: {
  q?: string;
  field?: string;
}): Promise<CommunityFeedResponse> => {
  const query = new URLSearchParams();
  if (params?.q) query.set("q", params.q);
  if (params?.field) query.set("field", params.field);
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return authorizedRequest<CommunityFeedResponse>(`/api/community/feed${suffix}`);
};

export const getCommunityState = async (): Promise<CommunityState> => {
  return authorizedRequest<CommunityState>("/api/community/state");
};

export const toggleCommunityBookmark = async (
  itemId: string,
  bookmarked?: boolean
): Promise<CommunityBookmarkResponse> => {
  return authorizedRequest<CommunityBookmarkResponse>(`/api/community/bookmarks/${itemId}`, {
    method: "PUT",
    body: JSON.stringify({ bookmarked }),
  });
};

export const toggleCommunityFollow = async (
  itemId: string,
  following?: boolean
): Promise<CommunityFollowResponse> => {
  return authorizedRequest<CommunityFollowResponse>(`/api/community/follows/${itemId}`, {
    method: "PUT",
    body: JSON.stringify({ following }),
  });
};

export const castCommunityVote = async (
  itemId: string,
  vote: "up" | "down" | null
): Promise<CommunityVoteResponse> => {
  return authorizedRequest<CommunityVoteResponse>(`/api/community/votes/${itemId}`, {
    method: "PUT",
    body: JSON.stringify({ vote }),
  });
};

export const voteCommunityPoll = async (itemId: string, choice: string): Promise<CommunityPollVoteResponse> => {
  return authorizedRequest<CommunityPollVoteResponse>(`/api/community/polls/${itemId}/vote`, {
    method: "PUT",
    body: JSON.stringify({ choice }),
  });
};

export const getCommunityChat = async (): Promise<CommunityChatResponse> => {
  return authorizedRequest<CommunityChatResponse>("/api/community/chat");
};

export const sendCommunityChatMessage = async (message: string): Promise<{ message: CommunityChatResponse["messages"][number] }> => {
  return authorizedRequest<{ message: CommunityChatResponse["messages"][number] }>("/api/community/chat/messages", {
    method: "POST",
    body: JSON.stringify({ message }),
  });
};

export const reportCommunityPost = async (postId: string, reason: string): Promise<{ ok: boolean; message: string }> => {
  return authorizedRequest<{ ok: boolean; message: string }>(`/api/community/posts/${postId}/report`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
};

export const pinCommunityUpdate = async (
  updateId: string,
  isPinned: boolean
): Promise<{ id: string; isPinned: boolean; pinnedAt: string | null }> => {
  return authorizedRequest<{ id: string; isPinned: boolean; pinnedAt: string | null }>(
    `/api/community/updates/${updateId}/pin`,
    {
      method: "PATCH",
      body: JSON.stringify({ isPinned }),
    }
  );
};

export const approveCommunityAd = async (
  adId: string,
  isApproved: boolean
): Promise<{ id: string; isApproved: boolean; approvedAt: string | null }> => {
  return authorizedRequest<{ id: string; isApproved: boolean; approvedAt: string | null }>(
    `/api/community/ads/${adId}/approve`,
    {
      method: "PATCH",
      body: JSON.stringify({ isApproved }),
    }
  );
};

export type CreateCommunityPostPayload = {
  title: string;
  content: string;
  contentTypes: string[];
  scheduledAt?: string;
  mediaFiles?: File[];
  isLiveSession?: boolean;
  liveTitle?: string;
  liveStartsAt?: string;
  liveRoomUrl?: string;
  liveDescription?: string;
};

export const createCommunityPost = async (
  payload: CreateCommunityPostPayload
): Promise<{ post: CommunityPost; scheduledAt: string | null }> => {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("content", payload.content);
  formData.append("contentTypes", JSON.stringify(payload.contentTypes));

  if (payload.scheduledAt) formData.append("scheduledAt", payload.scheduledAt);
  if (payload.mediaFiles?.length) {
    payload.mediaFiles.forEach((file) => formData.append("media", file));
  }

  if (payload.isLiveSession) {
    formData.append("isLiveSession", "true");
    if (payload.liveTitle) formData.append("liveTitle", payload.liveTitle);
    if (payload.liveStartsAt) formData.append("liveStartsAt", payload.liveStartsAt);
    if (payload.liveRoomUrl) formData.append("liveRoomUrl", payload.liveRoomUrl);
    if (payload.liveDescription) formData.append("liveDescription", payload.liveDescription);
  }

  return authorizedRequest<{ post: CommunityPost; scheduledAt: string | null }>("/api/community/posts", {
    method: "POST",
    body: formData,
  });
};

export const getCommunityLiveSessions = async (): Promise<{ sessions: CommunityLiveSession[] }> => {
  return authorizedRequest<{ sessions: CommunityLiveSession[] }>("/api/community/live-sessions");
};

export const joinCommunityLiveRoom = async (
  roomId: string,
  displayName: string
): Promise<{
  roomId: string;
  participantId: string;
  participants: CommunityLiveRoomParticipant[];
  roomLocked: boolean;
  canModerate: boolean;
  isHost: boolean;
  recording: CommunityLiveRoomRecording;
}> => {
  return authorizedRequest<{
    roomId: string;
    participantId: string;
    participants: CommunityLiveRoomParticipant[];
    roomLocked: boolean;
    canModerate: boolean;
    isHost: boolean;
    recording: CommunityLiveRoomRecording;
  }>(
    `/api/community/live-rooms/${roomId}/join`,
    {
      method: "POST",
      body: JSON.stringify({ displayName }),
    }
  );
};

export const leaveCommunityLiveRoom = async (roomId: string, participantId: string): Promise<{ ok: boolean }> => {
  return authorizedRequest<{ ok: boolean }>(`/api/community/live-rooms/${roomId}/leave`, {
    method: "POST",
    body: JSON.stringify({ participantId }),
  });
};

export const getCommunityLiveRoomPresence = async (
  roomId: string,
  participantId?: string
): Promise<{
  roomId: string;
  participantCount: number;
  participants: CommunityLiveRoomParticipant[];
  roomLocked: boolean;
  canModerate: boolean;
  isHost: boolean;
  recording: CommunityLiveRoomRecording;
}> => {
  const query = participantId ? `?participantId=${encodeURIComponent(participantId)}` : "";
  return authorizedRequest<{
    roomId: string;
    participantCount: number;
    participants: CommunityLiveRoomParticipant[];
    roomLocked: boolean;
    canModerate: boolean;
    isHost: boolean;
    recording: CommunityLiveRoomRecording;
  }>(
    `/api/community/live-rooms/${roomId}/presence${query}`
  );
};

export const sendCommunityLiveSignal = async (
  roomId: string,
  payload: {
    fromParticipantId: string;
    toParticipantId?: string | null;
    type: CommunityLiveRoomSignal["type"];
    payload: Record<string, unknown>;
  }
): Promise<{ signal: CommunityLiveRoomSignal }> => {
  return authorizedRequest<{ signal: CommunityLiveRoomSignal }>(`/api/community/live-rooms/${roomId}/signal`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const getCommunityLiveSignals = async (
  roomId: string,
  participantId: string,
  since: number
): Promise<{ roomId: string; signals: CommunityLiveRoomSignal[]; latestSeq: number }> => {
  const query = `?participantId=${encodeURIComponent(participantId)}&since=${encodeURIComponent(String(since))}`;
  return authorizedRequest<{ roomId: string; signals: CommunityLiveRoomSignal[]; latestSeq: number }>(
    `/api/community/live-rooms/${roomId}/signals${query}`
  );
};

export const getCommunityLiveIceConfig = async (): Promise<{
  iceServers: Array<{ urls: string | string[]; username?: string; credential?: string; credentialType?: string }>;
  hasTurn: boolean;
}> => {
  return authorizedRequest<{
    iceServers: Array<{ urls: string | string[]; username?: string; credential?: string; credentialType?: string }>;
    hasTurn: boolean;
  }>("/api/community/live-rooms/ice-config");
};

export const updateCommunityLiveRoomAccess = async (
  roomId: string,
  payload: {
    lock?: boolean;
    allowGuestJoin?: boolean;
    moderatorUserId?: string;
    action?: "add-moderator" | "remove-moderator";
  }
): Promise<{
  roomId: string;
  roomLocked: boolean;
  allowGuestJoin: boolean;
  hostUserId: string | null;
  moderatorUserIds: string[];
}> => {
  return authorizedRequest<{
    roomId: string;
    roomLocked: boolean;
    allowGuestJoin: boolean;
    hostUserId: string | null;
    moderatorUserIds: string[];
  }>(`/api/community/live-rooms/${roomId}/access`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

export const startCommunityLiveRecording = async (
  roomId: string,
  participantId: string
): Promise<{ recording: CommunityLiveRoomRecording }> => {
  return authorizedRequest<{ recording: CommunityLiveRoomRecording }>(`/api/community/live-rooms/${roomId}/recording/start`, {
    method: "POST",
    body: JSON.stringify({ participantId }),
  });
};

export const stopCommunityLiveRecording = async (roomId: string): Promise<{ recording: CommunityLiveRoomRecording }> => {
  return authorizedRequest<{ recording: CommunityLiveRoomRecording }>(`/api/community/live-rooms/${roomId}/recording/stop`, {
    method: "POST",
  });
};

export const submitCommunityLiveTranscript = async (
  roomId: string,
  payload: { participantId: string; text: string }
): Promise<{ entry: CommunityTranscriptEntry }> => {
  return authorizedRequest<{ entry: CommunityTranscriptEntry }>(`/api/community/live-rooms/${roomId}/transcript`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const getCommunityLiveArchive = async (
  roomId: string
): Promise<{
  roomId: string;
  title: string;
  hostUserId: string | null;
  roomLocked: boolean;
  recording: CommunityLiveRoomRecording;
  transcript: CommunityTranscriptEntry[];
    recordings: CommunityRecordingAsset[];
}> => {
  return authorizedRequest<{
    roomId: string;
    title: string;
    hostUserId: string | null;
    roomLocked: boolean;
    recording: CommunityLiveRoomRecording;
    transcript: CommunityTranscriptEntry[];
    recordings: CommunityRecordingAsset[];
  }>(`/api/community/live-rooms/${roomId}/archive`);
};

export const uploadCommunityLiveRecording = async (
  roomId: string,
  payload: {
    participantId: string;
    recordingBlob: Blob;
    fileName: string;
    durationMs?: number;
  }
): Promise<{ recording: CommunityRecordingAsset }> => {
  if (payload.recordingBlob.size > LIVE_RECORDING_CHUNK_SIZE_BYTES) {
    const totalChunks = Math.ceil(payload.recordingBlob.size / LIVE_RECORDING_CHUNK_SIZE_BYTES);
    const storage = getRecordingUploadSessionStorage();
    const uploadSessionKey = buildRecordingUploadSessionKey(
      roomId,
      payload.participantId,
      payload.fileName,
      payload.recordingBlob.size
    );
    const telemetryKey = buildRecordingUploadTelemetryKey(uploadSessionKey);

    writeRecordingUploadTelemetry(storage, telemetryKey, (current) => ({
      ...current,
      updatedAt: new Date().toISOString(),
    }));

    let uploadId: string | null = null;
    let startChunkIndex = 0;

    const persistedUploadId = storage?.getItem(uploadSessionKey) || null;
    if (persistedUploadId) {
      try {
        const status = await getCommunityLiveRecordingUploadStatus(roomId, persistedUploadId, payload.participantId);
        if (!status.complete && status.totalChunks === totalChunks) {
          uploadId = status.uploadId;
          startChunkIndex = Math.min(totalChunks, Math.max(0, status.expectedChunkIndex));
          writeRecordingUploadTelemetry(storage, telemetryKey, (current) => ({
            ...current,
            uploadId,
            lastError: null,
            lastBackoffMs: null,
            updatedAt: new Date().toISOString(),
          }));
        }
      } catch {
        storage?.removeItem(uploadSessionKey);
        storage?.removeItem(telemetryKey);
      }
    }

    for (let chunkIndex = startChunkIndex; chunkIndex < totalChunks; chunkIndex += 1) {
      const start = chunkIndex * LIVE_RECORDING_CHUNK_SIZE_BYTES;
      const end = Math.min(start + LIVE_RECORDING_CHUNK_SIZE_BYTES, payload.recordingBlob.size);
      const chunkBlob = payload.recordingBlob.slice(start, end, payload.recordingBlob.type);
      let attempt = 0;

      while (attempt <= LIVE_RECORDING_CHUNK_MAX_RETRIES) {
        try {
          const chunkForm = new FormData();
          chunkForm.append("participantId", payload.participantId);
          chunkForm.append("chunkIndex", String(chunkIndex));
          chunkForm.append("totalChunks", String(totalChunks));
          chunkForm.append("fileName", payload.fileName);
          chunkForm.append("mimeType", payload.recordingBlob.type || "video/webm");
          if (typeof payload.durationMs === "number") {
            chunkForm.append("durationMs", String(payload.durationMs));
          }
          if (uploadId) {
            chunkForm.append("uploadId", uploadId);
          }

          chunkForm.append("chunk", chunkBlob, `${payload.fileName}.part${chunkIndex}`);

          const chunkResult = await uploadCommunityLiveRecordingChunk(roomId, chunkForm);
          if ("conflict" in chunkResult) {
            const conflict = chunkResult.conflict;
            uploadId = conflict.uploadId;
            storage?.setItem(uploadSessionKey, uploadId);
            writeRecordingUploadTelemetry(storage, telemetryKey, (current) => ({
              ...current,
              uploadId,
              lastError: null,
              lastBackoffMs: null,
              updatedAt: new Date().toISOString(),
            }));
            chunkIndex = Math.max(chunkIndex, conflict.expectedChunkIndex) - 1;
            break;
          }

          uploadId = chunkResult.data.uploadId;
          storage?.setItem(uploadSessionKey, uploadId);
          writeRecordingUploadTelemetry(storage, telemetryKey, (current) => ({
            ...current,
            uploadId,
            lastError: null,
            lastBackoffMs: null,
            updatedAt: new Date().toISOString(),
          }));
          break;
        } catch (error) {
          attempt += 1;
          const errorMessage = error instanceof Error ? error.message : "Chunk upload failed";
          if (attempt > LIVE_RECORDING_CHUNK_MAX_RETRIES) {
            writeRecordingUploadTelemetry(storage, telemetryKey, (current) => ({
              ...current,
              uploadId,
              lastError: errorMessage,
              lastBackoffMs: null,
              updatedAt: new Date().toISOString(),
            }));
            throw new Error(`Recording upload failed after retries: ${errorMessage}`);
          }

          const retryDelayMs = computeChunkRetryDelayMs(attempt);
          writeRecordingUploadTelemetry(storage, telemetryKey, (current) => ({
            ...current,
            uploadId,
            retryCount: current.retryCount + 1,
            lastError: errorMessage,
            lastBackoffMs: retryDelayMs,
            updatedAt: new Date().toISOString(),
          }));
          await wait(retryDelayMs);
        }
      }
    }

    const finalized = await authorizedRequest<{ recording: CommunityRecordingAsset }>(`/api/community/live-rooms/${roomId}/recordings/finalize`, {
      method: "POST",
      body: JSON.stringify({
        participantId: payload.participantId,
        uploadId,
      }),
    });

    storage?.removeItem(uploadSessionKey);
    storage?.removeItem(telemetryKey);
    return finalized;
  }

  const formData = new FormData();
  formData.append("participantId", payload.participantId);
  formData.append("durationMs", String(payload.durationMs || 0));
  formData.append("recording", payload.recordingBlob, payload.fileName);

  return authorizedRequest<{ recording: CommunityRecordingAsset }>(`/api/community/live-rooms/${roomId}/recordings`, {
    method: "POST",
    body: formData,
  });
};
