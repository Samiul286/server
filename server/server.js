const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);

// CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || '*',
  methods: ['GET', 'POST'],
  credentials: true,
};

app.use(cors(corsOptions));

const io = new Server(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling'],
});

// In-memory storage for rooms and users
const rooms = new Map();
const users = new Map();

// Helper functions
const getRoomUsers = (roomId) => {
  const room = rooms.get(roomId);
  if (!room) return [];
  return Array.from(room.users.values());
};

const broadcastRoomUsers = (roomId) => {
  const roomUsers = getRoomUsers(roomId);
  io.to(roomId).emit('room-users', roomUsers);
};

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join room
  socket.on('join-room', ({ roomId, userName }) => {
    try {
      // Validate input
      if (!roomId || !userName) {
        socket.emit('error', { message: 'Room ID and user name are required' });
        return;
      }

      // Create room if it doesn't exist
      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          id: roomId,
          users: new Map(),
          videoState: {
            isPlaying: false,
            currentTime: 0,
            duration: 0,
            volume: 1,
          },
          messages: [],
        });
      }

      const room = rooms.get(roomId);
      
      // Check if room is full (max 10 users)
      if (room.users.size >= 10) {
        socket.emit('error', { message: 'Room is full (max 10 users)' });
        return;
      }

      // Create user
      const user = {
        id: socket.id,
        name: userName.slice(0, 20), // Limit name length
        isHost: room.users.size === 0, // First user is host
        isCameraOn: false,
        isMicOn: false,
      };

      // Store user and join room
      users.set(socket.id, { ...user, roomId });
      room.users.set(socket.id, user);
      socket.join(roomId);

      // Send chat history to new user
      socket.emit('chat-history', room.messages);

      // Notify others
      socket.to(roomId).emit('user-joined', user);

      // Send current room users to all
      broadcastRoomUsers(roomId);

      console.log(`User ${userName} joined room ${roomId}`);
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // Leave room
  socket.on('leave-room', ({ roomId }) => {
    try {
      const user = users.get(socket.id);
      if (!user || user.roomId !== roomId) return;

      const room = rooms.get(roomId);
      if (room) {
        room.users.delete(socket.id);
        
        // Assign new host if host left
        if (user.isHost && room.users.size > 0) {
          const newHost = room.users.values().next().value;
          newHost.isHost = true;
        }

        // Delete room if empty
        if (room.users.size === 0) {
          rooms.delete(roomId);
        } else {
          socket.to(roomId).emit('user-left', socket.id);
          broadcastRoomUsers(roomId);
        }
      }

      users.delete(socket.id);
      socket.leave(roomId);

      console.log(`User ${user?.name} left room ${roomId}`);
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  });

  // Video state change
  socket.on('video-state-change', ({ roomId, ...state }) => {
    try {
      const user = users.get(socket.id);
      if (!user || user.roomId !== roomId) return;

      const room = rooms.get(roomId);
      if (room) {
        // Update room video state
        room.videoState = { ...state };
        
        // Broadcast to others (excluding sender)
        socket.to(roomId).emit('video-state-change', {
          ...state,
          userId: socket.id,
        });
      }
    } catch (error) {
      console.error('Error handling video state change:', error);
    }
  });

  // Chat message
  socket.on('chat-message', ({ roomId, message }) => {
    try {
      const user = users.get(socket.id);
      if (!user || user.roomId !== roomId) return;

      const room = rooms.get(roomId);
      if (room) {
        const chatMessage = {
          id: uuidv4(),
          userId: socket.id,
          userName: user.name,
          message: message.slice(0, 200), // Limit message length
          timestamp: Date.now(),
        };

        // Store message (keep last 100)
        room.messages.push(chatMessage);
        if (room.messages.length > 100) {
          room.messages.shift();
        }

        // Broadcast to all in room
        io.to(roomId).emit('chat-message', chatMessage);
      }
    } catch (error) {
      console.error('Error handling chat message:', error);
    }
  });

  // Update user media state
  socket.on('update-user-media', ({ roomId, isCameraOn, isMicOn }) => {
    try {
      const user = users.get(socket.id);
      if (!user || user.roomId !== roomId) return;

      const room = rooms.get(roomId);
      if (room) {
        const roomUser = room.users.get(socket.id);
        if (roomUser) {
          roomUser.isCameraOn = isCameraOn;
          roomUser.isMicOn = isMicOn;
          broadcastRoomUsers(roomId);
        }
      }
    } catch (error) {
      console.error('Error updating user media:', error);
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    try {
      const user = users.get(socket.id);
      if (user) {
        const { roomId } = user;
        const room = rooms.get(roomId);
        
        if (room) {
          room.users.delete(socket.id);
          
          // Assign new host if host left
          if (user.isHost && room.users.size > 0) {
            const newHost = room.users.values().next().value;
            newHost.isHost = true;
          }

          // Delete room if empty
          if (room.users.size === 0) {
            rooms.delete(roomId);
          } else {
            socket.to(roomId).emit('user-left', socket.id);
            broadcastRoomUsers(roomId);
          }
        }

        users.delete(socket.id);
        console.log(`User ${user?.name} disconnected from room ${user?.roomId}`);
      }
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    activeRooms: rooms.size,
    activeUsers: users.size,
  });
});

// Get room info endpoint
app.get('/room/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = rooms.get(roomId);
  
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  res.json({
    id: room.id,
    userCount: room.users.size,
    users: Array.from(room.users.values()).map(u => ({
      name: u.name,
      isHost: u.isHost,
    })),
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 WatchTogether Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
