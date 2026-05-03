import { io, type Socket } from 'socket.io-client';
import { API_BASE_URL } from '@/lib/api';

export type RealtimeUser = {
  id: string;
  name?: string | null;
  email: string;
  profilePicture?: string | null;
  role?: string;
  location?: string | null;
};

export type ChatAttachment = {
  id: string;
  fileUrl: string;
  fileType: string;
  fileName: string;
  mimeType?: string | null;
  fileSize?: number | null;
  createdAt?: string;
};

export type ChatMessage = {
  id: string;
  senderId: string;
  receiverId?: string | null;
  projectId?: string | null;
  message: string;
  timestamp: string;
  readAt?: string | null;
  sender?: RealtimeUser;
  receiver?: RealtimeUser | null;
  attachments?: ChatAttachment[];
};

export type RealtimeNotification = {
  id?: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
};

export type PresenceState = {
  userId: string;
  online: boolean;
  lastSeen: string | null;
};

type SocketState = {
  socket: Socket | null;
  token: string | null;
};

const state: SocketState = {
  socket: null,
  token: null,
};

const getRealtimeBaseUrl = () => {
  if (API_BASE_URL) {
    return API_BASE_URL;
  }

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return 'http://localhost:3000';
};

export const getRealtimeSocket = (token: string) => {
  if (state.socket && state.token === token) {
    return state.socket;
  }

  state.socket?.disconnect();
  state.token = token;
  state.socket = io(getRealtimeBaseUrl(), {
    auth: { token },
    transports: ['websocket'],
    withCredentials: true,
  });

  return state.socket;
};

export const disconnectRealtimeSocket = () => {
  state.socket?.disconnect();
  state.socket = null;
  state.token = null;
};

export const joinProjectRoom = (projectId: string) => {
  if (!state.socket) return;
  state.socket.emit('chat:join', { projectId });
};

export const joinDirectRoom = (peerId: string) => {
  if (!state.socket) return;
  state.socket.emit('chat:join', { peerId });
};

export const setTypingState = (payload: { projectId?: string; peerId?: string; isTyping: boolean }) => {
  if (!state.socket) return;
  state.socket.emit('chat:typing', payload);
};

export const onRealtimeEvent = <T,>(eventName: string, handler: (payload: T) => void) => {
  if (!state.socket) {
    return () => undefined;
  }

  state.socket.on(eventName, handler);
  return () => state.socket?.off(eventName, handler);
};

export const getActiveRealtimeSocket = () => state.socket;
