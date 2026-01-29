import { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { RoomPage } from './components/RoomPage';
import { Toaster } from '@/components/ui/sonner';

interface AppState {
  roomId: string | null;
  userName: string | null;
}

function App() {
  const [appState, setAppState] = useState<AppState>({
    roomId: null,
    userName: null,
  });

  // Check for room ID in URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomId = params.get('room');
    if (roomId) {
      setAppState(prev => ({ ...prev, roomId }));
    }
  }, []);

  const handleJoinRoom = (roomId: string, userName: string) => {
    setAppState({ roomId, userName });
    // Update URL with room ID
    const url = new URL(window.location.href);
    url.searchParams.set('room', roomId);
    window.history.pushState({}, '', url);
  };

  const handleLeaveRoom = () => {
    setAppState({ roomId: null, userName: null });
    // Remove room ID from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('room');
    window.history.pushState({}, '', url);
  };

  return (
    <>
      {appState.roomId && appState.userName ? (
        <RoomPage
          roomId={appState.roomId}
          userName={appState.userName}
          onLeaveRoom={handleLeaveRoom}
        />
      ) : (
        <LandingPage onJoinRoom={handleJoinRoom} />
      )}
      <Toaster />
    </>
  );
}

export default App;
