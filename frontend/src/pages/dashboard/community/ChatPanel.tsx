import ChatModal from './ChatModal';

type ChatMessage = {
  id: string;
  author: string;
  message: string;
  createdAt: string;
};

type ChatPanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messages: ChatMessage[];
  onSend: (message: string) => Promise<void>;
  isMutating: boolean;
};

const ChatPanel = (props: ChatPanelProps) => {
  return <ChatModal {...props} />;
};

export default ChatPanel;
