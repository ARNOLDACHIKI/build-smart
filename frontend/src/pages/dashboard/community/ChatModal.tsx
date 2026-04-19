import { MessageSquare, Send } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';

type ChatMessage = {
  id: string;
  author: string;
  message: string;
  createdAt: string;
};

type ChatModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messages: ChatMessage[];
  onSend: (message: string) => Promise<void>;
  isMutating: boolean;
};

const ChatModal = ({ open, onOpenChange, messages, onSend, isMutating }: ChatModalProps) => {
  const [text, setText] = useState('');

  const send = async () => {
    const value = text.trim();
    if (!value) return;
    await onSend(value);
    setText('');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="h-full w-full border-l border-[#2A2D3C] bg-[#121420] text-slate-100 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:w-[400px] sm:max-w-[400px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-slate-100">
            <MessageSquare className="h-4 w-4 text-primary" /> Community Chat
          </SheetTitle>
          <SheetDescription className="text-slate-400">Chat opens only when requested so default view stays focused.</SheetDescription>
        </SheetHeader>

        <div className="mt-4 flex h-[calc(100%-3rem)] min-h-0 flex-col gap-3">
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto rounded-xl border border-[#2A2D3C] bg-[#1A1D2B] p-3">
            {messages.length === 0 ? (
              <p className="text-sm text-slate-400">No messages yet. Start the room.</p>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="rounded-md border border-[#2A2D3C] bg-[#121420] px-3 py-2">
                  <p className="text-xs font-semibold text-slate-100">{message.author}</p>
                  <p className="text-sm text-slate-300">{message.message}</p>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2">
            <Input
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Type a message"
              className="border-[#2A2D3C] bg-[#1A1D2B] text-slate-100 placeholder:text-slate-500"
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void send();
                }
              }}
            />
            <Button onClick={() => void send()} disabled={isMutating || !text.trim()} className="border-0 bg-[#BED234] text-[#121420] hover:brightness-95">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ChatModal;
