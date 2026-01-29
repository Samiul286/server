import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import type { User } from '@/types';
import { 
  Mic, 
  MicOff, 
  Camera, 
  CameraOff, 
  PhoneOff,
  Copy,
  Check,
  Users,
  Crown
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ParticipantsProps {
  users: User[];
  currentUserId: string;
  roomId: string;
  onLeaveRoom: () => void;
  onToggleCamera: (isOn: boolean) => void;
  onToggleMic: (isOn: boolean) => void;
}

export function Participants({ 
  users, 
  currentUserId, 
  roomId, 
  onLeaveRoom,
  onToggleCamera,
  onToggleMic
}: ParticipantsProps) {
  const [copied, setCopied] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: isMicOn 
      });
      setLocalStream(stream);
      setIsCameraOn(true);
      onToggleCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Failed to access camera:', err);
      alert('Could not access camera. Please check permissions.');
    }
  };

  const stopCamera = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => track.stop());
      if (!isMicOn) {
        localStream.getAudioTracks().forEach(track => track.stop());
      }
    }
    setIsCameraOn(false);
    onToggleCamera(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [localStream, isMicOn, onToggleCamera]);

  const toggleCamera = async () => {
    if (isCameraOn) {
      stopCamera();
    } else {
      await startCamera();
    }
  };

  const toggleMic = async () => {
    if (isMicOn) {
      // Turn off mic
      if (localStream) {
        localStream.getAudioTracks().forEach(track => track.stop());
      }
      setIsMicOn(false);
      onToggleMic(false);
    } else {
      // Turn on mic
      try {
        let stream = localStream;
        if (!stream) {
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: isCameraOn, 
            audio: true 
          });
          setLocalStream(stream);
          if (videoRef.current && isCameraOn) {
            videoRef.current.srcObject = stream;
          }
        } else {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const audioTrack = audioStream.getAudioTracks()[0];
          stream.addTrack(audioTrack);
        }
        setIsMicOn(true);
        onToggleMic(true);
      } catch (err) {
        console.error('Failed to access microphone:', err);
        alert('Could not access microphone. Please check permissions.');
      }
    }
  };

  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [localStream]);

  const getUserColor = (userId: string) => {
    const colors = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-emerald-500',
      'from-yellow-500 to-orange-500',
      'from-red-500 to-rose-500',
      'from-indigo-500 to-violet-500',
    ];
    const index = userId.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const currentUser = users.find(u => u.id === currentUserId);
  const otherUsers = users.filter(u => u.id !== currentUserId);

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full bg-slate-900/50 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-slate-800/50">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Users className="w-4 h-4" />
              Participants
              <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                {users.length}
              </span>
            </h3>
            
            {/* Room Code */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-sm">Room:</span>
              <code className="bg-slate-700 px-2 py-1 rounded text-white font-mono text-sm">
                {roomId}
              </code>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={copyRoomId}
                    className="h-6 w-6 text-slate-400 hover:text-white"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{copied ? 'Copied!' : 'Copy room code'}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Participants Grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            {/* Current User */}
            <div className="relative aspect-video bg-slate-800 rounded-lg overflow-hidden border-2 border-purple-500">
              {isCameraOn ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${getUserColor(currentUserId)} flex items-center justify-center`}>
                  <span className="text-3xl font-bold text-white">
                    {currentUser?.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              
              {/* User Info Overlay */}
              <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm font-medium flex items-center gap-1">
                    {currentUser?.name} (You)
                    {currentUser?.isHost && <Crown className="w-3 h-3 text-yellow-400" />}
                  </span>
                  <div className="flex gap-1">
                    {isMicOn ? (
                      <Mic className="w-3 h-3 text-green-400" />
                    ) : (
                      <MicOff className="w-3 h-3 text-red-400" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Other Users */}
            {otherUsers.map((user) => (
              <div 
                key={user.id} 
                className="relative aspect-video bg-slate-800 rounded-lg overflow-hidden border border-white/10"
              >
                <div className={`w-full h-full bg-gradient-to-br ${getUserColor(user.id)} flex items-center justify-center`}>
                  <span className="text-3xl font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                
                {/* User Info Overlay */}
                <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm font-medium flex items-center gap-1">
                      {user.name}
                      {user.isHost && <Crown className="w-3 h-3 text-yellow-400" />}
                    </span>
                    <div className="flex gap-1">
                      {user.isMicOn ? (
                        <Mic className="w-3 h-3 text-green-400" />
                      ) : (
                        <MicOff className="w-3 h-3 text-red-400" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Empty Slots */}
            {Array.from({ length: Math.max(0, 4 - users.length) }).map((_, i) => (
              <div 
                key={`empty-${i}`}
                className="aspect-video bg-slate-800/50 rounded-lg border border-dashed border-white/10 flex items-center justify-center"
              >
                <span className="text-slate-500 text-sm">Waiting...</span>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 border-t border-white/10 bg-slate-800/50">
          <div className="flex items-center justify-center gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isMicOn ? 'default' : 'destructive'}
                  size="icon"
                  onClick={toggleMic}
                  className={`rounded-full w-12 h-12 ${isMicOn ? 'bg-slate-700 hover:bg-slate-600' : ''}`}
                >
                  {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isMicOn ? 'Mute microphone' : 'Unmute microphone'}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isCameraOn ? 'default' : 'destructive'}
                  size="icon"
                  onClick={toggleCamera}
                  className={`rounded-full w-12 h-12 ${isCameraOn ? 'bg-slate-700 hover:bg-slate-600' : ''}`}
                >
                  {isCameraOn ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isCameraOn ? 'Turn off camera' : 'Turn on camera'}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={onLeaveRoom}
                  className="rounded-full w-12 h-12 bg-red-600 hover:bg-red-700"
                >
                  <PhoneOff className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Leave room</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
