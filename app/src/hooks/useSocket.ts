import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { User, ChatMessage, VideoState } from '@/types';

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_SERVER_URL || 'http://localhost:3001';

interface UseSocketProps {
  roomId: string;
  userName: string;
  onUserJoined?: (user: User) => void;
  onUserLeft?: (userId: string) => void;
  onVideoStateChange?: (state: VideoState & { userId: string }) => void;
  onChatMessage?: (message: ChatMessage) => void;
  onRoomUsers?: (users: User[]) => void;
}

export function useSocket({
  roomId,
  userName,
  onUserJoined,
  onUserLeft,
  onVideoStateChange,
  onChatMessage,
  onRoomUsers,
}: UseSocketProps) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      setError(null);
      socket.emit('join-room', { roomId, userName });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      setError('Failed to connect to server. Please try again.');
      console.error('Socket connection error:', err);
    });

    socket.on('user-joined', (user: User) => {
      onUserJoined?.(user);
    });

    socket.on('user-left', (userId: string) => {
      onUserLeft?.(userId);
    });

    socket.on('video-state-change', (state: VideoState & { userId: string }) => {
      onVideoStateChange?.(state);
    });

    socket.on('chat-message', (message: ChatMessage) => {
      onChatMessage?.(message);
    });

    socket.on('room-users', (users: User[]) => {
      onRoomUsers?.(users);
    });

    socket.on('error', (err: { message: string }) => {
      setError(err.message);
    });

    return () => {
      socket.emit('leave-room', { roomId });
      socket.disconnect();
    };
  }, [roomId, userName]);

  const sendVideoStateChange = useCallback((state: VideoState) => {
    socketRef.current?.emit('video-state-change', {
      roomId,
      ...state,
    });
  }, [roomId]);

  const sendChatMessage = useCallback((message: string) => {
    socketRef.current?.emit('chat-message', {
      roomId,
      message,
    });
  }, [roomId]);

  const updateUserMedia = useCallback((isCameraOn: boolean, isMicOn: boolean) => {
    socketRef.current?.emit('update-user-media', {
      roomId,
      isCameraOn,
      isMicOn,
    });
  }, [roomId]);

  return {
    socket: socketRef.current,
    isConnected,
    error,
    sendVideoStateChange,
    sendChatMessage,
    updateUserMedia,
  };
}
