# WatchTogether - Real-time Video Watch Party App

A modern web application that allows users to create private rooms and watch videos together in perfect synchronization. Features real-time chat, camera/microphone controls, and a responsive design.

![WatchTogether Preview](preview.png)

## Features

- **Create/Join Rooms**: Generate unique room codes or join existing ones
- **Video Synchronization**: Play, pause, and seek are synced across all participants
- **Real-time Chat**: Send messages and reactions to other room members
- **Video & Audio Controls**: Toggle camera and microphone with visual indicators
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **YouTube Support**: Play YouTube videos directly in the app
- **Host Controls**: First user becomes host with video control privileges

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Socket.io Client** for real-time communication

### Backend
- **Node.js** with Express
- **Socket.io** for WebSocket connections
- **CORS** for cross-origin requests

## Project Structure

```
watchtogether/
├── app/                    # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── LandingPage.tsx
│   │   │   ├── RoomPage.tsx
│   │   │   ├── VideoPlayer.tsx
│   │   │   ├── Chat.tsx
│   │   │   └── Participants.tsx
│   │   ├── hooks/
│   │   │   └── useSocket.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── ...
├── server/                 # Backend Node.js server
│   ├── server.js
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd watchtogether
```

### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Start the server (development mode)
npm run dev

# Or start in production mode
npm start
```

The server will start on `http://localhost:3001` by default.

### 3. Frontend Setup

```bash
# Navigate to app directory (in a new terminal)
cd app

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start on `http://localhost:5173` by default.

### 4. Environment Variables

Create a `.env` file in the `app` directory:

```env
VITE_SOCKET_SERVER_URL=http://localhost:3001
```

For production, update this to your deployed server URL.

## Deployment

### Deploy Backend (Render/Railway/Heroku)

1. **Render** (Recommended - Free tier available):
   - Create a new Web Service
   - Connect your GitHub repository
   - Set root directory to `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Add environment variable: `CLIENT_URL` = your frontend URL

2. **Railway**:
   - Connect your repository
   - Set root directory to `server`
   - Deploy automatically

3. **Heroku**:
   ```bash
   cd server
   heroku create your-app-name
   git subtree push --prefix server heroku main
   ```

### Deploy Frontend (Vercel/Netlify)

#### Vercel (Recommended)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   cd app
   vercel
   ```

3. Or connect your GitHub repository on Vercel dashboard:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. Add environment variable in Vercel dashboard:
   - `VITE_SOCKET_SERVER_URL` = your backend URL

#### Netlify

1. Install Netlify CLI:
   ```bash
   npm i -g netlify-cli
   ```

2. Deploy:
   ```bash
   cd app
   npm run build
   netlify deploy --prod --dir=dist
   ```

3. Or connect your GitHub repository on Netlify dashboard:
   - Build Command: `npm run build`
   - Publish Directory: `dist`

## API Endpoints

### Health Check
```
GET /health
Response: { status: 'ok', timestamp: '...', activeRooms: 0, activeUsers: 0 }
```

### Room Info
```
GET /room/:roomId
Response: { id: '...', userCount: 0, users: [...] }
```

## Socket.IO Events

### Client to Server
- `join-room` - Join a room
- `leave-room` - Leave a room
- `video-state-change` - Update video playback state
- `chat-message` - Send a chat message
- `update-user-media` - Update camera/mic status

### Server to Client
- `user-joined` - New user joined
- `user-left` - User left
- `video-state-change` - Video state updated
- `chat-message` - New chat message
- `chat-history` - Previous chat messages
- `room-users` - List of room users
- `error` - Error message

## Customization

### Styling

The app uses Tailwind CSS with custom CSS variables. Modify `app/src/index.css` to change:

- Color scheme
- Animations
- Scrollbar styles
- Glass effects

### Video Player

The VideoPlayer component supports:
- Direct video URLs (MP4, WebM, etc.)
- YouTube URLs (embedded iframe)

To add more video sources, modify the `VideoPlayer.tsx` component.

## Troubleshooting

### Common Issues

1. **Socket connection fails**:
   - Check that the server is running
   - Verify `VITE_SOCKET_SERVER_URL` is correct
   - Check browser console for CORS errors

2. **Video not loading**:
   - Ensure video URL is accessible (CORS enabled)
   - For YouTube, use full URLs (not shortened)

3. **Camera/Mic not working**:
   - Check browser permissions
   - Ensure HTTPS is used (required for getUserMedia)

### Development Tips

- Use `npm run dev` in both `app` and `server` directories for hot reload
- Check server logs for debugging
- Use browser DevTools Network tab to inspect WebSocket traffic

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ using React, Node.js, and Socket.io
