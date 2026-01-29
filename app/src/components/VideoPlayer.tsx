import { useRef, useEffect, useState, useCallback } from 'react';
import type { VideoState } from '@/types';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

interface VideoPlayerProps {
  videoUrl: string;
  isHost: boolean;
  onVideoStateChange: (state: VideoState) => void;
  externalVideoState?: VideoState & { userId: string };
}

export function VideoPlayer({ videoUrl, isHost, onVideoStateChange, externalVideoState }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSeekingRef = useRef(false);

  // Handle external video state changes (from other users)
  useEffect(() => {
    if (!externalVideoState || !videoRef.current || isHost) return;
    
    const video = videoRef.current;
    const { isPlaying: externalIsPlaying, currentTime: externalCurrentTime } = externalVideoState;
    
    // Only sync if difference is significant (> 2 seconds)
    const timeDiff = Math.abs(video.currentTime - externalCurrentTime);
    
    if (timeDiff > 2) {
      video.currentTime = externalCurrentTime;
    }
    
    if (externalIsPlaying && video.paused) {
      video.play().catch(() => {});
    } else if (!externalIsPlaying && !video.paused) {
      video.pause();
    }
  }, [externalVideoState, isHost]);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    onVideoStateChange({
      isPlaying: true,
      currentTime: videoRef.current?.currentTime || 0,
      duration: duration || 0,
      volume,
    });
  }, [onVideoStateChange, duration, volume]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
    onVideoStateChange({
      isPlaying: false,
      currentTime: videoRef.current?.currentTime || 0,
      duration: duration || 0,
      volume,
    });
  }, [onVideoStateChange, duration, volume]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current && !isSeekingRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, []);

  const handleSeek = useCallback((value: number[]) => {
    if (videoRef.current) {
      isSeekingRef.current = true;
      const newTime = value[0];
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      
      onVideoStateChange({
        isPlaying: !videoRef.current.paused,
        currentTime: newTime,
        duration: duration || 0,
        volume,
      });
      
      setTimeout(() => {
        isSeekingRef.current = false;
      }, 100);
    }
  }, [onVideoStateChange, duration, volume]);

  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      setIsMuted(newMuted);
      videoRef.current.volume = newMuted ? 0 : volume;
      if (!newMuted && volume === 0) {
        setVolume(0.5);
        videoRef.current.volume = 0.5;
      }
    }
  }, [isMuted, volume]);

  const toggleFullscreen = useCallback(() => {
    const videoContainer = document.getElementById('video-container');
    if (videoContainer) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoContainer.requestFullscreen();
      }
    }
  }, []);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  }, [isPlaying]);

  const skip = useCallback((seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');

  if (isYouTube) {
    // Extract YouTube video ID
    const videoId = videoUrl.includes('v=') 
      ? videoUrl.split('v=')[1]?.split('&')[0]
      : videoUrl.split('/').pop();
    
    return (
      <div 
        id="video-container" 
        className="relative w-full aspect-video bg-black rounded-xl overflow-hidden group"
        onMouseMove={handleMouseMove}
      >
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&controls=1`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div 
      id="video-container" 
      className="relative w-full aspect-video bg-black rounded-xl overflow-hidden group"
      onMouseMove={handleMouseMove}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full"
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onClick={() => isPlaying ? videoRef.current?.pause() : videoRef.current?.play()}
      />
      
      {/* Custom Controls Overlay */}
      <div 
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Progress Bar */}
        <div className="mb-4">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
        </div>
        
        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => skip(-10)}
              className="text-white hover:bg-white/20"
            >
              <SkipBack className="w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => isPlaying ? videoRef.current?.pause() : videoRef.current?.play()}
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => skip(10)}
              className="text-white hover:bg-white/20"
            >
              <SkipForward className="w-5 h-5" />
            </Button>
            
            {/* Volume Control */}
            <div className="flex items-center gap-2 ml-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="text-white hover:bg-white/20"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
              <div className="w-20 hidden sm:block">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                />
              </div>
            </div>
            
            {/* Time Display */}
            <span className="text-white text-sm ml-2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="text-white hover:bg-white/20"
          >
            <Maximize className="w-5 h-5" />
          </Button>
        </div>
      </div>
      
      {/* Center Play Button (when paused) */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => videoRef.current?.play()}
            className="w-20 h-20 rounded-full bg-white/20 hover:bg-white/30 text-white"
          >
            <Play className="w-10 h-10 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
