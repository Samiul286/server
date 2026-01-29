import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { v4 as uuidv4 } from 'uuid';
import { Users, Video, MessageSquare, Radio, Copy, Check } from 'lucide-react';

interface LandingPageProps {
  onJoinRoom: (roomId: string, userName: string) => void;
}

export function LandingPage({ onJoinRoom }: LandingPageProps) {
  const [userName, setUserName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [generatedRoomId, setGeneratedRoomId] = useState('');
  const [copied, setCopied] = useState(false);

  const generateRoomId = () => {
    const newRoomId = uuidv4().slice(0, 8).toUpperCase();
    setGeneratedRoomId(newRoomId);
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(generatedRoomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateRoom = () => {
    if (userName.trim() && generatedRoomId) {
      onJoinRoom(generatedRoomId, userName.trim());
    }
  };

  const handleJoinRoom = () => {
    if (userName.trim() && roomId.trim()) {
      onJoinRoom(roomId.trim().toUpperCase(), userName.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="w-full p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">WatchTogether</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Info */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
                Watch Videos
                <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Together
                </span>
              </h1>
              <p className="text-lg text-slate-300 max-w-md">
                Create a private room, invite your friends, and watch videos in perfect sync. 
                Chat in real-time and enjoy the moment together.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Multi-User</p>
                  <p className="text-slate-400 text-sm">Up to 10 people</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
                  <Radio className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Real-time</p>
                  <p className="text-slate-400 text-sm">Perfect sync</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Live Chat</p>
                  <p className="text-slate-400 text-sm">Instant messages</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Video className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Video Call</p>
                  <p className="text-slate-400 text-sm">Camera & mic</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <Card className="bg-white/10 backdrop-blur-xl border-white/20">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Get Started</CardTitle>
              <CardDescription className="text-slate-300">
                Create a new room or join an existing one
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                <label className="text-sm font-medium text-white">Your Name</label>
                <Input
                  placeholder="Enter your name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                  maxLength={20}
                />
              </div>

              <Tabs defaultValue="create" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-white/10">
                  <TabsTrigger value="create" className="data-[state=active]:bg-purple-500">Create Room</TabsTrigger>
                  <TabsTrigger value="join" className="data-[state=active]:bg-purple-500">Join Room</TabsTrigger>
                </TabsList>

                <TabsContent value="create" className="space-y-4 mt-4">
                  {!generatedRoomId ? (
                    <Button
                      onClick={generateRoomId}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      Generate Room Code
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 p-3 bg-white/10 rounded-lg text-center">
                          <span className="text-2xl font-mono font-bold text-white tracking-wider">
                            {generatedRoomId}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={copyRoomId}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                      <Button
                        onClick={handleCreateRoom}
                        disabled={!userName.trim()}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        Create & Join Room
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="join" className="space-y-4 mt-4">
                  <Input
                    placeholder="Enter room code (e.g., ABC12345)"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                    className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 uppercase"
                    maxLength={8}
                  />
                  <Button
                    onClick={handleJoinRoom}
                    disabled={!userName.trim() || !roomId.trim()}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    Join Room
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full p-6 text-center text-slate-400 text-sm">
        <p>WatchTogether - Watch videos with friends in real-time</p>
      </footer>
    </div>
  );
}
