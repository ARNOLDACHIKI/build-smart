import { useEffect, useMemo, useRef, useState } from 'react';
import { Paperclip, Send, UploadCloud, Clock3, Circle, CircleDot, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { apiUrl } from '@/lib/api';
import {
  getRealtimeSocket,
  joinDirectRoom,
  joinProjectRoom,
  onRealtimeEvent,
  setTypingState,
  type ChatAttachment,
  type ChatMessage,
  type PresenceState,
  type RealtimeUser,
} from '@/lib/realtime';

type ChatPanelProps = {
  projectId?: string;
  peerId?: string;
  title?: string;
  participants?: RealtimeUser[];
};

type ChatResponse = {
  messages: ChatMessage[];
};

type FileUploadResponse = {
  files: ChatAttachment[];
};

const formatTime = (value?: string | null) => {
  if (!value) return 'Just now';
  return new Date(value).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const isImageAttachment = (attachment: ChatAttachment) => /image\//i.test(attachment.mimeType || attachment.fileType) || ['image', 'jpeg', 'jpg', 'png', 'gif', 'webp'].includes(attachment.fileType);

const ChatPanel = ({ projectId, peerId, title, participants = [] }: ChatPanelProps) => {
  const { token, user } = useAuth();
  const { toast } = useToast();
  const socketRef = useRef<ReturnType<typeof getRealtimeSocket> | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageDraft, setMessageDraft] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUserIds, setTypingUserIds] = useState<string[]>([]);
  const [presence, setPresence] = useState<Record<string, PresenceState>>({});

  const roomLabel = useMemo(() => {
    if (title) return title;
    if (projectId) return 'Project room';
    if (peerId) return 'Direct chat';
    return 'Live chat';
  }, [peerId, projectId, title]);

  const currentSocket = () => {
    if (!token) return null;
    if (!socketRef.current) {
      socketRef.current = getRealtimeSocket(token);
    }
    return socketRef.current;
  };

  useEffect(() => {
    if (!token) return;

    const socket = currentSocket();
    if (!socket) return;

    if (projectId) {
      joinProjectRoom(projectId);
    } else if (peerId) {
      joinDirectRoom(peerId);
    }
  }, [peerId, projectId, token]);

  useEffect(() => {
    if (!token) return;

    let active = true;
    const loadMessages = async () => {
      try {
        setLoading(true);
        const suffix = projectId ? `projectId=${encodeURIComponent(projectId)}` : `peerId=${encodeURIComponent(peerId || '')}`;
        const response = await fetch(apiUrl(`/api/chat/messages?${suffix}`), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Failed to load messages');
        }

        const data = (await response.json()) as ChatResponse;
        if (active) {
          setMessages(data.messages || []);
        }
      } catch (error) {
        toast({
          title: 'Unable to load chat',
          description: error instanceof Error ? error.message : 'Please try again.',
          variant: 'destructive',
        });
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadMessages();
    return () => {
      active = false;
    };
  }, [peerId, projectId, token, toast]);

  useEffect(() => {
    if (!token) return;

    const socket = currentSocket();
    if (!socket) return;

    const offMessage = onRealtimeEvent<ChatMessage>('chat:message', (message) => {
      const isRelevant = projectId ? message.projectId === projectId : peerId ? (message.senderId === peerId || message.receiverId === peerId) : false;
      if (!isRelevant) return;
      setMessages((current) => [...current, message]);
    });

    const offTyping = onRealtimeEvent<{ userId: string; isTyping: boolean }>('chat:typing', (payload) => {
      const isRelevant = projectId ? true : peerId ? payload.userId === peerId : false;
      if (!isRelevant) return;
      setTypingUserIds((current) => {
        const next = new Set(current);
        if (payload.isTyping) next.add(payload.userId);
        else next.delete(payload.userId);
        return Array.from(next);
      });
    });

    const offPresence = onRealtimeEvent<PresenceState>('presence:updated', (payload) => {
      setPresence((current) => ({
        ...current,
        [payload.userId]: payload,
      }));
    });

    return () => {
      offMessage();
      offTyping();
      offPresence();
    };
  }, [peerId, projectId, token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, typingUserIds]);

  useEffect(() => {
    if (!token || participants.length === 0) return;

    const loadPresence = async () => {
      const entries = await Promise.all(
        participants
          .filter((participant) => participant.id !== user?.id)
          .map(async (participant) => {
            try {
              const response = await fetch(apiUrl(`/api/presence/${participant.id}`), {
                headers: { Authorization: `Bearer ${token}` },
              });

              if (!response.ok) return null;
              const data = (await response.json()) as PresenceState;
              return data;
            } catch {
              return null;
            }
          })
      );

      const next = Object.fromEntries(entries.filter(Boolean).map((entry) => [entry!.userId, entry]));
      setPresence((current) => ({ ...current, ...next }));
    };

    void loadPresence();
  }, [participants, token, user?.id]);

  const handleTyping = (value: string) => {
    setMessageDraft(value);
    setTypingState({
      projectId,
      peerId,
      isTyping: value.trim().length > 0,
    });
  };

  const handleSend = async () => {
    if (!token) return;
    const trimmed = messageDraft.trim();
    if (!trimmed && selectedFiles.length === 0) return;

    setSending(true);
    try {
      let attachmentIds: string[] = [];

      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach((file) => formData.append('files', file));
        if (projectId) formData.append('projectId', projectId);

        const uploadResponse = await fetch(apiUrl('/api/files/upload'), {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload files');
        }

        const uploadData = (await uploadResponse.json()) as FileUploadResponse;
        attachmentIds = uploadData.files.map((file) => file.id);
      }

      const response = await fetch(apiUrl('/api/chat/messages'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: trimmed,
          projectId,
          peerId,
          attachmentIds,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      if (data.message) {
        setMessages((current) => [...current, data.message]);
      }

      setMessageDraft('');
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setTypingState({ projectId, peerId, isTyping: false });
    } catch (error) {
      toast({
        title: 'Message not sent',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const currentUserId = user?.id;
  const remoteTyping = typingUserIds.filter((id) => id !== currentUserId);

  return (
    <div className="rounded-3xl border border-border/60 bg-background/80 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div>
          <p className="text-sm font-semibold">{roomLabel}</p>
          <p className="text-xs text-muted-foreground">
            {participants.length > 0
              ? participants
                  .filter((participant) => participant.id !== currentUserId)
                  .map((participant) => {
                    const state = presence[participant.id];
                    return `${participant.name || participant.email} ${state?.online ? '(online)' : state?.lastSeen ? `(last seen ${formatTime(state.lastSeen)})` : '(offline)'}`;
                  })
                  .join(' · ')
              : 'Project-specific conversation'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CircleDot className="h-3.5 w-3.5 text-emerald-500" /> Live
        </div>
      </div>

      <div className="max-h-[28rem] space-y-3 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 px-4 py-10 text-center text-sm text-muted-foreground">
            No messages yet. Start the conversation.
          </div>
        ) : (
          messages.map((message) => {
            const isMine = message.senderId === currentUserId;
            return (
              <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[82%] rounded-3xl px-4 py-3 shadow-sm ${isMine ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                  <div className="mb-2 flex items-center gap-2 text-[11px] opacity-80">
                    <span className="font-semibold">{isMine ? 'You' : message.sender?.name || message.sender?.email || 'Participant'}</span>
                    <span>•</span>
                    <span>{formatTime(message.timestamp)}</span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-6">{message.message}</p>

                  {message.attachments?.length ? (
                    <div className="mt-3 space-y-2">
                      {message.attachments.map((attachment) => (
                        <a
                          key={attachment.id}
                          href={attachment.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="block overflow-hidden rounded-2xl border border-black/10 bg-background/80 text-foreground"
                        >
                          {isImageAttachment(attachment) ? (
                            <img src={attachment.fileUrl} alt={attachment.fileName} className="max-h-64 w-full object-cover" />
                          ) : null}
                          <div className="flex items-center justify-between gap-3 px-3 py-2 text-xs">
                            <span className="truncate font-medium">{attachment.fileName}</span>
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <UploadCloud className="h-3.5 w-3.5" /> Download
                            </span>
                          </div>
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
        {remoteTyping.length > 0 ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock3 className="h-3.5 w-3.5" /> Someone is typing...
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border/60 px-4 py-4">
        <div className="flex flex-wrap gap-2 pb-3">
          {selectedFiles.map((file) => (
            <span key={`${file.name}-${file.size}`} className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              {file.name}
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple
            onChange={(event) => setSelectedFiles(Array.from(event.target.files || []))}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-border/60 px-4 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
          >
            <Paperclip className="mr-2 h-4 w-4" /> Attach
          </button>
          <textarea
            value={messageDraft}
            onChange={(event) => handleTyping(event.target.value)}
            onBlur={() => setTypingState({ projectId, peerId, isTyping: false })}
            placeholder="Write a message, share a report, or drop a site photo..."
            rows={2}
            className="min-h-11 flex-1 resize-none rounded-2xl border border-border/60 bg-background px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary/40"
          />
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={sending}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
