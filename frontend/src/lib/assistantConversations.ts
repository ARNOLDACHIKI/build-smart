import { apiUrl } from "@/lib/api";
import { authStorage } from "@/lib/auth";
import type { AssistantChatMessage } from "@/lib/aiAssistant";

export type AssistantConversationSummary = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
  messageCount: number;
  preview: string;
  previewRole: "user" | "assistant" | null;
};

export type AssistantConversationDetail = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
  messages: Array<AssistantChatMessage & { id?: string; createdAt?: string }>;
};

export type AssistantConversationListResponse = {
  conversations: AssistantConversationSummary[];
  limit: number;
  remainingChats: number;
  dailyLimit: number;
  remainingDailyMessages: number;
};

const authorizedRequest = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const token = authStorage.getToken();
  const response = await fetch(apiUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { error?: string; code?: string };
    const error = new Error(payload.error || "Assistant conversation request failed") as Error & { code?: string };
    error.code = payload.code;
    throw error;
  }

  return (await response.json()) as T;
};

export const listAssistantConversations = async (): Promise<AssistantConversationListResponse> => {
  return authorizedRequest<AssistantConversationListResponse>("/api/ai/conversations");
};

export const getAssistantConversation = async (conversationId: string): Promise<AssistantConversationDetail> => {
  return authorizedRequest<AssistantConversationDetail>(`/api/ai/conversations/${conversationId}`);
};

export const deleteAssistantConversation = async (
  conversationId: string
): Promise<{ ok: boolean; remainingChats: number; limit: number }> => {
  return authorizedRequest<{ ok: boolean; remainingChats: number; limit: number }>(`/api/ai/conversations/${conversationId}`, {
    method: "DELETE",
  });
};
