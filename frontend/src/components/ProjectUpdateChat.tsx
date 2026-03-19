import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { EngineerProject } from '@/lib/engineerProjectAgent';
import { apiUrl } from '@/lib/api';
import { authStorage } from '@/lib/auth';
import { Send } from 'lucide-react';
import { toast } from 'sonner';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ProjectUpdateChatProps {
  project: EngineerProject;
  onUpdate: (updates: Partial<EngineerProject>) => void;
}

export const ProjectUpdateChat = ({ project, onUpdate }: ProjectUpdateChatProps) => {
  const buildGreeting = useCallback(() => ({
    role: 'assistant' as const,
    content: `Hi! I can help you update "${project.name}". Ask me about any field (for example: "what is workers?") or update it conversationally (for example: "change it to 80").`,
  }), [project.name]);

  const [messages, setMessages] = useState<ChatMessage[]>([buildGreeting()]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setMessages([buildGreeting()]);
    setInput('');
  }, [buildGreeting, project.id]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const token = authStorage.getToken();
      const response = await fetch(apiUrl('/api/ai/process-project-update'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          projectId: project.id,
          userMessage: input,
          project: {
            id: project.id,
            name: project.name,
            location: project.location,
            client: project.client,
            teamSize: project.teamSize,
            startDate: project.startDate,
            dueDate: project.dueDate,
            progress: project.progress,
            status: project.status,
            priority: project.priority,
            projectType: project.projectType,
            serviceCategory: project.serviceCategory,
            budgetEstimate: project.budgetEstimate,
            siteAddress: project.siteAddress,
            contactPerson: project.contactPerson,
            contactPhone: project.contactPhone,
            durationWeeks: project.durationWeeks,
            scopeSummary: project.scopeSummary,
            deliverables: project.deliverables,
            risksNotes: project.risksNotes,
            customFields: project.customFields || [],
          },
          conversationHistory: messages,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = { role: 'assistant', content: data.message };
      setMessages((prev) => [...prev, assistantMessage]);

      // Apply updates if any
      if (data.updates && Object.keys(data.updates).length > 0) {
        onUpdate(data.updates);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to process your request');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-96 bg-slate-900 rounded-lg border border-slate-700">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-lime-600 text-white'
                  : 'bg-slate-700 text-slate-100'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-700 p-4 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !isLoading) {
              handleSendMessage();
            }
          }}
          placeholder="Ask me about fields or request changes..."
          disabled={isLoading}
          className="bg-slate-800 border-slate-600 text-white"
        />
        <Button
          onClick={handleSendMessage}
          disabled={isLoading || !input.trim()}
          size="icon"
          className="bg-lime-600 hover:bg-lime-700"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
