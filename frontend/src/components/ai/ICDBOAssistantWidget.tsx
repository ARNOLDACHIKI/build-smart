import { useMemo, useState } from "react";
import { Bot, MessageCircle, Minimize2, Send } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { askAssistant, type AssistantChatMessage } from "@/lib/aiAssistant";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const ICDBOAssistantWidget = () => {
  const { user } = useAuth();
  const firstName = useMemo(() => user?.name?.split(" ")[0] || "there", [user?.name]);

  const [isOpen, setIsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<AssistantChatMessage[]>([
    {
      role: "assistant",
      content: `Hi ${firstName}. How can I help you today? You can ask me to find engineers, explain ICDBO packages, or help you plan a project.`,
    },
  ]);

  const quickPrompts = [
    "List engineers in Nairobi",
    "Show ICDBO pricing packages",
    "Who are ICDBO target stakeholders?",
  ];

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const nextMessages: AssistantChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setMessage("");
    setIsLoading(true);

    try {
      const response = await askAssistant({
        message: trimmed,
        history: nextMessages,
      });

      setMessages((prev) => [...prev, { role: "assistant", content: response.reply }]);
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

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button onClick={() => setIsOpen(true)} className="rounded-full h-12 px-4 gradient-primary text-primary-foreground">
          <MessageCircle className="h-4 w-4 mr-2" />
          Open AI Assistant
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[360px] max-w-[calc(100vw-2rem)]">
      <Card className="shadow-xl border-border/60 bg-background/95 backdrop-blur">
        <CardHeader className="py-3 px-4 border-b flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">ICDBO AI Assistant</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
            <Minimize2 className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-3">
          <div className="h-80 overflow-y-auto space-y-2 pr-1">
            {messages.map((item, index) => (
              <div key={`${item.role}-${index}`} className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
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
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
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

          <div className="mt-3 flex items-center gap-2">
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
              disabled={isLoading}
            />
            <Button
              size="icon"
              onClick={() => {
                void sendMessage(message);
              }}
              disabled={isLoading || !message.trim()}
              className="gradient-primary text-primary-foreground"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ICDBOAssistantWidget;
