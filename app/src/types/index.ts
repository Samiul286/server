export interface User {
  id: string;
  name: string;
  isHost?: boolean;
  isCameraOn?: boolean;
  isMicOn?: boolean;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: number;
}

export interface Room {
  id: string;
  users: User[];
  videoUrl?: string;
  isPlaying: boolean;
  currentTime: number;
}

export interface VideoState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
}

export type SocketEvent = 
  | 'join-room'
  | 'leave-room'
  | 'user-joined'
  | 'user-left'
  | 'video-state-change'
  | 'video-state-sync'
  | 'chat-message'
  | 'chat-history'
  | 'room-users'
  | 'error';
