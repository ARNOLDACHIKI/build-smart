import { apiUrl } from "@/lib/api";
import { authStorage } from "@/lib/auth";

export type AssistantChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type AssistantResponse = {
  reply: string;
  source?: string;
  fallbackReason?: string | null;
  model?: string;
  conversationId?: string | null;
  limit?: number;
  remainingChats?: number;
  dailyLimit?: number;
  remainingDailyMessages?: number;
};

export const askAssistant = async (input: {
  message: string;
  history: AssistantChatMessage[];
  conversationId?: string;
}): Promise<AssistantResponse> => {
  const token = authStorage.getToken();
  const response = await fetch(apiUrl("/api/ai/assistant"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(payload.error || "Assistant request failed");
  }

  const payload = (await response.json()) as AssistantResponse;
  return payload;
};
