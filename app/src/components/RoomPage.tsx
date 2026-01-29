import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { VideoPlayer } from './VideoPlayer';
import { Chat } from './Chat';
import { Participants } from './Participants';
import { useSocket } from '@/hooks/useSocket';
import type { User, ChatMessage, VideoState } from '@/types';
import { Link2, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RoomPageProps {
  roomId: string;
  userName: string;
  onLeaveRoom: () => void;
}

export function RoomPage({ roomId, userName, onLeaveRoom }: RoomPageProps) {
  const [videoUrl, setVideoUrl] = useState('');
  const [tempVideoUrl, setTempVideoUrl] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentUserId, setCurrentUserId] = useState('');
  const [externalVideoState, setExternalVideoState] = useState<(VideoState & { userId: string }) | undefined>();
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  const handleUserJoined = useCallback((user: User) => {
    setUsers(prev => {
      if (prev.find(u => u.id === user.id)) return prev;
      return [...prev, user];
    });
    
    // Add system message
    const systemMessage: ChatMessage = {
      id: `system-${Date.now()}`,
      userId: 'system',
      userName: 'System',
      message: `${user.name} joined the room`,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, systemMessage]);
  }, []);

  const handleUserLeft = useCallback((userId: string) => {
    setUsers(prev => {
      const user = prev.find(u => u.id === userId);
      if (user) {
        const systemMessage: ChatMessage = {
          id: `system-${Date.now()}`,
          userId: 'system',
          userName: 'System',
          message: `${user.name} left the room`,
          timestamp: Date.now(),
        };
        setMessages(msgs => [...msgs, systemMessage]);
      }
      return prev.filter(u => u.id !== userId);
    });
  }, []);

  const handleVideoStateChange = useCallback((state: VideoState & { userId: string }) => {
    if (state.userId !== currentUserId) {
      setExternalVideoState(state);
    }
  }, [currentUserId]);

  const handleChatMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const handleRoomUsers = useCallback((roomUsers: User[]) => {
    setUsers(roomUsers);
    const currentUser = roomUsers.find(u => u.name === userName);
    if (currentUser) {
      setCurrentUserId(currentUser.id);
    }
    setConnectionStatus('connected');
  }, [userName]);

  const { 
    error, 
    sendVideoStateChange, 
    sendChatMessage,
    updateUserMedia 
  } = useSocket({
    roomId,
    userName,
    onUserJoined: handleUserJoined,
    onUserLeft: handleUserLeft,
    onVideoStateChange: handleVideoStateChange,
    onChatMessage: handleChatMessage,
    onRoomUsers: handleRoomUsers,
  });

  useEffect(() => {
    if (error) {
      setConnectionStatus('error');
    }
  }, [error]);

  const handleVideoStateChangeLocal = useCallback((state: VideoState) => {
    sendVideoStateChange(state);
  }, [sendVideoStateChange]);

  const handleSendMessage = useCallback((message: string) => {
    sendChatMessage(message);
  }, [sendChatMessage]);

  const handleToggleCamera = useCallback((isOn: boolean) => {
    updateUserMedia(isOn, users.find(u => u.id === currentUserId)?.isMicOn || false);
  }, [updateUserMedia, currentUserId, users]);

  const handleToggleMic = useCallback((isOn: boolean) => {
    updateUserMedia(users.find(u => u.id === currentUserId)?.isCameraOn || false, isOn);
  }, [updateUserMedia, currentUserId, users]);

  const loadVideo = () => {
    if (tempVideoUrl.trim()) {
      setVideoUrl(tempVideoUrl.trim());
      setShowVideoDialog(false);
      setTempVideoUrl('');
    }
  };

  const isHost = users.find(u => u.id === currentUserId)?.isHost || false;

  if (connectionStatus === 'connecting') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto" />
          <p className="text-white text-lg">Connecting to room...</p>
        </div>
      </div>
    );
  }

  if (connectionStatus === 'error') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            {error || 'Failed to connect to the room. Please try again.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
      {/* Header */}
      <header className="w-full p-4 border-b border-white/10 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <div>
              <span className="text-white font-semibold">WatchTogether</span>
              <span className="text-slate-400 text-sm ml-2">Room: {roomId}</span>
            </div>
          </div>
          
          {!videoUrl && (
            <Button
              onClick={() => setShowVideoDialog(true)}
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              <Link2 className="w-4 h-4 mr-2" />
              Load Video
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Video & Participants */}
            <div className="lg:col-span-2 space-y-6">
              {/* Video Player */}
              {videoUrl ? (
                <VideoPlayer
                  videoUrl={videoUrl}
                  isHost={isHost}
                  onVideoStateChange={handleVideoStateChangeLocal}
                  externalVideoState={externalVideoState}
                />
              ) : (
                <div className="aspect-video bg-slate-800/50 rounded-xl border border-dashed border-white/20 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
                    <Link2 className="w-8 h-8 text-purple-400" />
                  </div>
                  <p className="text-white text-lg font-medium mb-2">No video loaded</p>
                  <p className="text-slate-400 text-sm mb-4">Load a video to start watching together</p>
                  <Button
                    onClick={() => setShowVideoDialog(true)}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Load Video URL
                  </Button>
                </div>
              )}

              {/* Participants */}
              <div className="h-64 lg:h-80">
                <Participants
                  users={users}
                  currentUserId={currentUserId}
                  roomId={roomId}
                  onLeaveRoom={onLeaveRoom}
                  onToggleCamera={handleToggleCamera}
                  onToggleMic={handleToggleMic}
                />
              </div>
            </div>

            {/* Right Column - Chat */}
            <div className="h-[500px] lg:h-auto lg:min-h-[600px]">
              <Chat
                messages={messages}
                currentUserId={currentUserId}
                users={users}
                onSendMessage={handleSendMessage}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Load Video Dialog */}
      <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
        <DialogContent className="bg-slate-900 border-white/20 text-white">
          <DialogHeader>
            <DialogTitle>Load Video</DialogTitle>
            <DialogDescription className="text-slate-400">
              Enter a video URL to watch together. Supports direct video links and YouTube.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              placeholder="https://example.com/video.mp4 or YouTube URL"
              value={tempVideoUrl}
              onChange={(e) => setTempVideoUrl(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
              onKeyPress={(e) => e.key === 'Enter' && loadVideo()}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowVideoDialog(false)}
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={loadVideo}
                disabled={!tempVideoUrl.trim()}
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
              >
                Load Video
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
