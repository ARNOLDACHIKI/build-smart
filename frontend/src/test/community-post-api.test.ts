import { beforeEach, describe, expect, it, vi } from "vitest";
import { authStorage } from "@/lib/auth";
import {
  createCommunityPost,
  getCommunityLiveRecordingUploadTelemetry,
  getCommunityLiveArchive,
  getCommunityLiveIceConfig,
  getCommunityLiveRoomPresence,
  getCommunityLiveSessions,
  getCommunityLiveSignals,
  joinCommunityLiveRoom,
  leaveCommunityLiveRoom,
  sendCommunityLiveSignal,
  startCommunityLiveRecording,
  stopCommunityLiveRecording,
  submitCommunityLiveTranscript,
  uploadCommunityLiveRecording,
  updateCommunityLiveRoomAccess,
} from "@/lib/community";

const mockFetch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  mockFetch.mockReset();
  vi.stubGlobal("fetch", mockFetch);
  localStorage.clear();
  authStorage.setToken("test-token");
});

describe("community post API", () => {
  it("submits media + live session fields as multipart form data", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        post: {
          id: "post-1",
          type: "Live Session",
          title: "Weekly safety room",
          summary: "Agenda for this week.",
          author: "Tester",
          field: "Engineering",
          interests: ["safety"],
          stats: "Live session",
          media: [],
          liveSession: {
            title: "Weekly safety room",
            startsAt: "2026-04-10T08:00:00.000Z",
            roomUrl: "https://meet.example.com/weekly",
          },
          createdAt: "2026-04-06T08:00:00.000Z",
        },
        scheduledAt: null,
      }),
    });

    const file = new File(["video-bytes"], "safety-update.mp4", { type: "video/mp4" });

    await createCommunityPost({
      title: "Weekly safety room",
      content: "Agenda for this week.",
      contentTypes: ["video", "text"],
      mediaFiles: [file],
      isLiveSession: true,
      liveTitle: "Weekly safety room",
      liveStartsAt: "2026-04-10T08:00",
      liveRoomUrl: "https://meet.example.com/weekly",
      liveDescription: "Risk review + blockers",
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [path, init] = mockFetch.mock.calls[0] as [string, RequestInit];

    expect(path).toContain("/api/community/posts");
    expect(init.method).toBe("POST");
    expect(init.body).toBeInstanceOf(FormData);

    const headers = (init.headers || {}) as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer test-token");
    expect(headers["Content-Type"]).toBeUndefined();

    const formData = init.body as FormData;
    expect(formData.get("title")).toBe("Weekly safety room");
    expect(formData.get("isLiveSession")).toBe("true");
    expect(formData.get("liveRoomUrl")).toBe("https://meet.example.com/weekly");
    expect(formData.get("media")).toBe(file);

    const contentTypes = JSON.parse(String(formData.get("contentTypes")));
    expect(contentTypes).toEqual(["video", "text"]);
  });

  it("fetches live sessions list", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ sessions: [] }),
    });

    await getCommunityLiveSessions();

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [path] = mockFetch.mock.calls[0] as [string];
    expect(path).toContain("/api/community/live-sessions");
  });

  it("supports live room join and signaling APIs", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ roomId: "room-1", participantId: "p-1", participants: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ signal: { seq: 1 } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ roomId: "room-1", participantCount: 1, participants: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ roomId: "room-1", signals: [], latestSeq: 1 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true }),
      });

    await joinCommunityLiveRoom("room-1", "Tester");
    await sendCommunityLiveSignal("room-1", {
      fromParticipantId: "p-1",
      toParticipantId: "p-2",
      type: "offer",
      payload: { sdp: { type: "offer" } },
    });
    await getCommunityLiveRoomPresence("room-1", "p-1");
    await getCommunityLiveSignals("room-1", "p-1", 0);
    await leaveCommunityLiveRoom("room-1", "p-1");

    expect(mockFetch).toHaveBeenCalledTimes(5);
    expect((mockFetch.mock.calls[0] as [string])[0]).toContain("/api/community/live-rooms/room-1/join");
    expect((mockFetch.mock.calls[1] as [string])[0]).toContain("/api/community/live-rooms/room-1/signal");
    expect((mockFetch.mock.calls[2] as [string])[0]).toContain("/api/community/live-rooms/room-1/presence");
    expect((mockFetch.mock.calls[3] as [string])[0]).toContain("/api/community/live-rooms/room-1/signals");
    expect((mockFetch.mock.calls[4] as [string])[0]).toContain("/api/community/live-rooms/room-1/leave");
  });

  it("supports ice config, room access controls, and archive APIs", async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ iceServers: [], hasTurn: false }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ roomId: "room-1", roomLocked: true, allowGuestJoin: false, hostUserId: "u1", moderatorUserIds: ["u1"] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ recording: { isRecording: true, startedAt: "2026-04-06", startedByParticipantId: "p-1", stoppedAt: null } }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ entry: { id: "tx-1", participantId: "p-1", author: "Tester", text: "Hello", createdAt: "2026-04-06" } }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ recording: { isRecording: false, startedAt: "2026-04-06", startedByParticipantId: "p-1", stoppedAt: "2026-04-06" } }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ roomId: "room-1", title: "Room", hostUserId: "u1", roomLocked: true, recording: { isRecording: false, startedAt: null, startedByParticipantId: null, stoppedAt: null }, transcript: [] }) });

    await getCommunityLiveIceConfig();
    await updateCommunityLiveRoomAccess("room-1", { lock: true, allowGuestJoin: false });
    await startCommunityLiveRecording("room-1", "p-1");
    await submitCommunityLiveTranscript("room-1", { participantId: "p-1", text: "Hello" });
    await stopCommunityLiveRecording("room-1");
    await getCommunityLiveArchive("room-1");

    expect(mockFetch).toHaveBeenCalledTimes(6);
    expect((mockFetch.mock.calls[0] as [string])[0]).toContain("/api/community/live-rooms/ice-config");
    expect((mockFetch.mock.calls[1] as [string])[0]).toContain("/api/community/live-rooms/room-1/access");
    expect((mockFetch.mock.calls[2] as [string])[0]).toContain("/api/community/live-rooms/room-1/recording/start");
    expect((mockFetch.mock.calls[3] as [string])[0]).toContain("/api/community/live-rooms/room-1/transcript");
    expect((mockFetch.mock.calls[4] as [string])[0]).toContain("/api/community/live-rooms/room-1/recording/stop");
    expect((mockFetch.mock.calls[5] as [string])[0]).toContain("/api/community/live-rooms/room-1/archive");
  });

  it("uploads recorded media as multipart form data", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        recording: {
          id: "rec-1",
          participantId: "p-1",
          author: "Tester",
          fileUrl: "/uploads/recording-1.webm",
          fileName: "recording.webm",
          mimeType: "video/webm",
          fileSize: 10,
          durationMs: 1000,
          uploadedAt: "2026-04-06T00:00:00.000Z",
        },
      }),
    });

    const blob = new Blob(["bytes"], { type: "video/webm" });
    await uploadCommunityLiveRecording("room-1", {
      participantId: "p-1",
      recordingBlob: blob,
      fileName: "recording.webm",
      durationMs: 1000,
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [path, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(path).toContain("/api/community/live-rooms/room-1/recordings");
    expect(init.method).toBe("POST");
    expect(init.body).toBeInstanceOf(FormData);
  });

  it("uploads large recordings in chunks and finalizes", async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ uploadId: "upl-1", receivedChunks: 1, totalChunks: 2, complete: false }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ uploadId: "upl-1", receivedChunks: 2, totalChunks: 2, complete: true }) })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          recording: {
            id: "rec-2",
            participantId: "p-1",
            author: "Tester",
            fileUrl: "/uploads/recording-2.webm",
            fileName: "recording-large.webm",
            mimeType: "video/webm",
            fileSize: 20,
            durationMs: 2000,
            uploadedAt: "2026-04-06T00:00:00.000Z",
          },
        }),
      });

    const largeBytes = new Uint8Array(6 * 1024 * 1024);
    const blob = new Blob([largeBytes], { type: "video/webm" });
    await uploadCommunityLiveRecording("room-1", {
      participantId: "p-1",
      recordingBlob: blob,
      fileName: "recording-large.webm",
      durationMs: 2000,
    });

    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect((mockFetch.mock.calls[0] as [string])[0]).toContain("/api/community/live-rooms/room-1/recordings/chunk");
    expect((mockFetch.mock.calls[1] as [string])[0]).toContain("/api/community/live-rooms/room-1/recordings/chunk");
    expect((mockFetch.mock.calls[2] as [string])[0]).toContain("/api/community/live-rooms/room-1/recordings/finalize");
  });

  it("resumes chunk upload from persisted upload id", async () => {
    const largeBytes = new Uint8Array(6 * 1024 * 1024);
    const blob = new Blob([largeBytes], { type: "video/webm" });
    const sessionKey = `community.liveRecordingUpload.room-1.p-1.recording-large.webm.${blob.size}`;
    sessionStorage.setItem(sessionKey, "upl-1");

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          uploadId: "upl-1",
          participantId: "p-1",
          receivedChunks: 1,
          totalChunks: 2,
          expectedChunkIndex: 1,
          complete: false,
        }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ uploadId: "upl-1", receivedChunks: 2, totalChunks: 2, complete: true }) })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          recording: {
            id: "rec-3",
            participantId: "p-1",
            author: "Tester",
            fileUrl: "/uploads/recording-3.webm",
            fileName: "recording-large.webm",
            mimeType: "video/webm",
            fileSize: 20,
            durationMs: 2000,
            uploadedAt: "2026-04-06T00:00:00.000Z",
          },
        }),
      });

    await uploadCommunityLiveRecording("room-1", {
      participantId: "p-1",
      recordingBlob: blob,
      fileName: "recording-large.webm",
      durationMs: 2000,
    });

    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect((mockFetch.mock.calls[0] as [string])[0]).toContain("/api/community/live-rooms/room-1/recordings/upload/upl-1");
    expect((mockFetch.mock.calls[1] as [string])[0]).toContain("/api/community/live-rooms/room-1/recordings/chunk");
    expect((mockFetch.mock.calls[2] as [string])[0]).toContain("/api/community/live-rooms/room-1/recordings/finalize");
    expect(sessionStorage.getItem(sessionKey)).toBeNull();
  });

  it("retries chunk upload with backoff and then succeeds", async () => {
    const largeBytes = new Uint8Array(6 * 1024 * 1024);
    const blob = new Blob([largeBytes], { type: "video/webm" });

    mockFetch
      .mockResolvedValueOnce({ ok: false, json: async () => ({ error: "Temporary network issue" }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ uploadId: "upl-2", receivedChunks: 1, totalChunks: 2, complete: false }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ uploadId: "upl-2", receivedChunks: 2, totalChunks: 2, complete: true }) })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          recording: {
            id: "rec-4",
            participantId: "p-1",
            author: "Tester",
            fileUrl: "/uploads/recording-4.webm",
            fileName: "recording-large.webm",
            mimeType: "video/webm",
            fileSize: 20,
            durationMs: 2000,
            uploadedAt: "2026-04-06T00:00:00.000Z",
          },
        }),
      });

    await uploadCommunityLiveRecording("room-1", {
      participantId: "p-1",
      recordingBlob: blob,
      fileName: "recording-large.webm",
      durationMs: 2000,
    });

    expect(mockFetch).toHaveBeenCalledTimes(4);
    expect((mockFetch.mock.calls[0] as [string])[0]).toContain("/api/community/live-rooms/room-1/recordings/chunk");
    expect((mockFetch.mock.calls[1] as [string])[0]).toContain("/api/community/live-rooms/room-1/recordings/chunk");
    expect((mockFetch.mock.calls[2] as [string])[0]).toContain("/api/community/live-rooms/room-1/recordings/chunk");
    expect((mockFetch.mock.calls[3] as [string])[0]).toContain("/api/community/live-rooms/room-1/recordings/finalize");

    const telemetry = getCommunityLiveRecordingUploadTelemetry("room-1", "p-1", "recording-large.webm", blob.size);
    expect(telemetry?.retryCount).toBe(0);
    expect(telemetry?.lastError).toBeNull();
  });

  it("stores retry telemetry when chunk retries are exhausted", async () => {
    const largeBytes = new Uint8Array(6 * 1024 * 1024);
    const blob = new Blob([largeBytes], { type: "video/webm" });

    mockFetch
      .mockResolvedValueOnce({ ok: false, json: async () => ({ error: "t1" }) })
      .mockResolvedValueOnce({ ok: false, json: async () => ({ error: "t2" }) })
      .mockResolvedValueOnce({ ok: false, json: async () => ({ error: "t3" }) })
      .mockResolvedValueOnce({ ok: false, json: async () => ({ error: "t4" }) });

    await expect(
      uploadCommunityLiveRecording("room-1", {
        participantId: "p-1",
        recordingBlob: blob,
        fileName: "recording-fail.webm",
        durationMs: 2000,
      })
    ).rejects.toThrow("Recording upload failed after retries");

    const telemetry = getCommunityLiveRecordingUploadTelemetry("room-1", "p-1", "recording-fail.webm", blob.size);
    expect(telemetry?.retryCount).toBe(3);
    expect(telemetry?.lastError).toBe("t4");
    expect(typeof telemetry?.lastBackoffMs === "number" || telemetry?.lastBackoffMs === null).toBe(true);
  });
});
