import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bot, MessageCircle, Minimize2, Plus, Send, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { askAssistant, type AssistantChatMessage } from "@/lib/aiAssistant";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  deleteAssistantConversation,
  getAssistantConversation,
  listAssistantConversations,
  type AssistantConversationSummary,
} from "@/lib/assistantConversations";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const ICDBOAssistantWidget = () => {
  const { user } = useAuth();
  const firstName = useMemo(() => user?.name?.split(" ")[0] || "there", [user?.name]);

  const [isOpen, setIsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [conversations, setConversations] = useState<AssistantConversationSummary[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [chatLimit, setChatLimit] = useState<number | null>(null);
  const [remainingChats, setRemainingChats] = useState<number | null>(null);
  const [dailyLimit, setDailyLimit] = useState<number | null>(null);
  const [remainingDailyMessages, setRemainingDailyMessages] = useState<number | null>(null);
  const [messages, setMessages] = useState<AssistantChatMessage[]>([
    {
      role: "assistant",
      content: `Hi ${firstName}. How can I help you today? You can ask me to find engineers, explain ICDBO packages, or help you plan a project.`,
    },
  ]);

  const buildGreeting = useCallback(() => ({
    role: "assistant" as const,
    content: `Hi ${firstName}. How can I help you today? You can ask me to find engineers, explain ICDBO packages, or help you plan a project.`,
  }), [firstName]);

  const quickPrompts = [
    "List engineers in Nairobi",
    "Show ICDBO pricing packages",
    "Who are ICDBO target stakeholders?",
    "List all my messages",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isLoading, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const loadConversations = async () => {
      setIsHistoryLoading(true);
      try {
        const payload = await listAssistantConversations();
        setConversations(payload.conversations);
        setChatLimit(payload.limit);
        setRemainingChats(payload.remainingChats);
        setDailyLimit(payload.dailyLimit);
        setRemainingDailyMessages(payload.remainingDailyMessages);

        if (!activeConversationId && payload.conversations.length > 0) {
          const firstConversation = payload.conversations[0];
          setActiveConversationId(firstConversation.id);
          const detail = await getAssistantConversation(firstConversation.id);
          const loadedMessages = detail.messages.length > 0 ? detail.messages : [buildGreeting()];
          setMessages(loadedMessages.map((item) => ({ role: item.role, content: item.content })));
        }
      } catch (error) {
        console.error("Load assistant conversations error:", error);
      } finally {
        setIsHistoryLoading(false);
      }
    };

    void loadConversations();
  }, [activeConversationId, buildGreeting, isOpen]);

  const hasReachedLimit = Boolean(chatLimit !== null && remainingChats !== null && remainingChats <= 0);
  const hasReachedDailyLimit = Boolean(
    dailyLimit !== null && remainingDailyMessages !== null && remainingDailyMessages <= 0
  );

  const startNewChat = () => {
    if (hasReachedLimit) {
      toast.error(`Saved chat limit reached (${chatLimit}). Delete an old chat to start a new one.`);
      return;
    }

    setActiveConversationId(null);
    setMessages([buildGreeting()]);
    setMessage("");
  };

  const selectConversation = async (conversationId: string) => {
    setIsHistoryLoading(true);
    try {
      const detail = await getAssistantConversation(conversationId);
      setActiveConversationId(detail.id);
      const loadedMessages = detail.messages.length > 0 ? detail.messages : [buildGreeting()];
      setMessages(loadedMessages.map((item) => ({ role: item.role, content: item.content })));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to open chat";
      toast.error(errorMessage);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const removeConversation = async (conversationId: string) => {
    try {
      const payload = await deleteAssistantConversation(conversationId);
      setRemainingChats(payload.remainingChats);
      setConversations((prev) => prev.filter((item) => item.id !== conversationId));

      if (activeConversationId === conversationId) {
        const next = conversations.find((item) => item.id !== conversationId);
        if (next) {
          await selectConversation(next.id);
        } else {
          setActiveConversationId(null);
          setMessages([buildGreeting()]);
        }
      }

      toast.success("Chat deleted");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete chat";
      toast.error(errorMessage);
    }
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading || hasReachedDailyLimit) return;

    const nextMessages: AssistantChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setMessage("");
    setIsLoading(true);

    try {
      const response = await askAssistant({
        message: trimmed,
        history: nextMessages,
        conversationId: activeConversationId || undefined,
      });

      setMessages((prev) => [...prev, { role: "assistant", content: response.reply }]);

      if (response.conversationId && response.conversationId !== activeConversationId) {
        setActiveConversationId(response.conversationId);
      }

      if (typeof response.limit === "number") {
        setChatLimit(response.limit);
      }
      if (typeof response.remainingChats === "number") {
        setRemainingChats(response.remainingChats);
      }
      if (typeof response.dailyLimit === "number") {
        setDailyLimit(response.dailyLimit);
      }
      if (typeof response.remainingDailyMessages === "number") {
        setRemainingDailyMessages(response.remainingDailyMessages);
      }

      const listPayload = await listAssistantConversations();
      setConversations(listPayload.conversations);
      setChatLimit(listPayload.limit);
      setRemainingChats(listPayload.remainingChats);
      setDailyLimit(listPayload.dailyLimit);
      setRemainingDailyMessages(listPayload.remainingDailyMessages);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Assistant error";
      toast.error(errorMessage);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I could not process that right now. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (typeof document === "undefined") {
    return null;
  }

  if (!isOpen) {
    return createPortal(
      <div className="fixed bottom-24 right-3 z-[1000] sm:right-4 md:bottom-4 md:right-4">
        <Button onClick={() => setIsOpen(true)} className="rounded-full h-12 px-4 gradient-primary text-primary-foreground">
          <MessageCircle className="h-4 w-4 mr-2" />
          Open AI Assistant
        </Button>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className="fixed bottom-24 right-3 z-[1000] w-[860px] max-w-[calc(100vw-1.5rem)] sm:right-4 sm:max-w-[calc(100vw-2rem)] md:bottom-4 md:right-4">
      <Card className="shadow-xl border-border/60 bg-background/95 backdrop-blur overflow-hidden">
        <CardHeader className="py-3 px-4 border-b flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">ICDBO AI Assistant</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
            <Minimize2 className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          <div className="grid grid-cols-12 min-h-[28rem]">
            <div className="col-span-4 border-r border-border/60 bg-muted/20">
              <div className="p-3 space-y-2">
                <Button size="sm" className="w-full" onClick={startNewChat} disabled={hasReachedLimit && !activeConversationId}>
                  <Plus className="h-4 w-4 mr-1" /> New chat
                </Button>
                {chatLimit !== null && remainingChats !== null && (
                  <p className="text-[11px] text-muted-foreground">
                    Saved chats: {chatLimit - remainingChats}/{chatLimit}
                  </p>
                )}
                {hasReachedLimit && (
                  <p className="text-[11px] text-destructive">
                    Limit reached. Delete an old chat to create another.
                  </p>
                )}
                {dailyLimit !== null && remainingDailyMessages !== null && (
                  <p className="text-[11px] text-muted-foreground">
                    Daily messages left: {remainingDailyMessages}/{dailyLimit}
                  </p>
                )}
                {hasReachedDailyLimit && (
                  <p className="text-[11px] text-destructive">
                    Daily limit reached. You can continue tomorrow.
                  </p>
                )}
              </div>

              <Separator />

              <ScrollArea className="h-[22.5rem] px-2 pb-2">
                <div className="space-y-1">
                  {conversations.map((item) => (
                    <div
                      key={item.id}
                      className={`group rounded-md p-2 cursor-pointer border ${
                        activeConversationId === item.id ? "border-primary bg-primary/5" : "border-transparent hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <button
                          type="button"
                          className="text-left flex-1 min-w-0"
                          onClick={() => {
                            void selectConversation(item.id);
                          }}
                        >
                          <p className="text-xs font-medium truncate">{item.title}</p>
                          <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{item.preview || "No messages yet"}</p>
                        </button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-70 hover:opacity-100"
                          onClick={() => {
                            void removeConversation(item.id);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {!isHistoryLoading && conversations.length === 0 && (
                    <p className="text-xs text-muted-foreground px-1 py-2">No previous chats yet.</p>
                  )}
                </div>
              </ScrollArea>
            </div>

            <div className="col-span-8 flex flex-col">
              <div className="h-[24rem] overflow-y-auto space-y-2 px-3 py-3 pr-2">
                {messages.map((item, index) => (
                  <div key={`${item.role}-${index}`} className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[88%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap break-words ${
                        item.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {item.content}
                    </div>
                  </div>
                ))}
                {isLoading && <p className="text-xs text-muted-foreground">Thinking...</p>}
                <div ref={messagesEndRef} />
              </div>

              {messages.length <= 2 && (
                <div className="px-3 pb-3 flex flex-wrap gap-2 border-t border-border/60 pt-3">
                  {quickPrompts.map((prompt) => (
                    <Button
                      key={prompt}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        void sendMessage(prompt);
                      }}
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              )}

              <div className="px-3 py-3 border-t border-border/60 flex items-center gap-2 bg-background/80">
                <Input
                  placeholder="How can I help you?"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void sendMessage(message);
                    }
                  }}
                  disabled={isLoading || (hasReachedLimit && !activeConversationId) || hasReachedDailyLimit}
                />
                <Button
                  size="icon"
                  onClick={() => {
                    void sendMessage(message);
                  }}
                  disabled={isLoading || !message.trim() || (hasReachedLimit && !activeConversationId) || hasReachedDailyLimit}
                  className="gradient-primary text-primary-foreground"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>,
    document.body
  );
};

export default ICDBOAssistantWidget;
