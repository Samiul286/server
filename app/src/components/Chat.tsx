import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ChatMessage, User } from '@/types';
import { Send, Smile } from 'lucide-react';

interface ChatProps {
  messages: ChatMessage[];
  currentUserId: string;
  users: User[];
  onSendMessage: (message: string) => void;
}

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😡', '🔥', '🎉'];

export function Chat({ messages, currentUserId, onSendMessage }: ChatProps) {
  const [newMessage, setNewMessage] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
      setShowEmojis(false);
    }
  };

  const handleEmojiClick = (emoji: string) => {
    onSendMessage(emoji);
    setShowEmojis(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getUserColor = (userId: string) => {
    const colors = [
      'bg-purple-500',
      'bg-pink-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-indigo-500',
      'bg-teal-500',
    ];
    const index = userId.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-slate-800/50">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Live Chat
          <span className="text-slate-400 text-sm font-normal">
            ({messages.length} messages)
          </span>
        </h3>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              <p>No messages yet</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isCurrentUser = message.userId === currentUserId;
              return (
                <div
                  key={message.id}
                  className={`flex gap-2 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full ${getUserColor(message.userId)} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white text-xs font-bold">
                      {message.userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  {/* Message Bubble */}
                  <div className={`max-w-[75%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs ${isCurrentUser ? 'text-purple-400' : 'text-slate-400'}`}>
                        {isCurrentUser ? 'You' : message.userName}
                      </span>
                      <span className="text-xs text-slate-500">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    <div
                      className={`px-3 py-2 rounded-2xl text-sm ${
                        isCurrentUser
                          ? 'bg-purple-500 text-white rounded-br-none'
                          : 'bg-slate-700 text-white rounded-bl-none'
                      }`}
                    >
                      {message.message}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10 bg-slate-800/50">
        {/* Emoji Picker */}
        {showEmojis && (
          <div className="flex gap-2 mb-3 p-2 bg-slate-700/50 rounded-lg">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmojiClick(emoji)}
                className="text-xl hover:scale-125 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
        
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowEmojis(!showEmojis)}
            className="text-slate-400 hover:text-white hover:bg-white/10"
          >
            <Smile className="w-5 h-5" />
          </Button>
          
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-slate-400"
            maxLength={200}
          />
          
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="bg-purple-500 hover:bg-purple-600 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
