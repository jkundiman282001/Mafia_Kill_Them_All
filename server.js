const Pusher = require("pusher");
const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, ".")));

// Explicitly serve index.html for the root route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// NOTE: You need to get these from pusher.com (Free Tier)
// and set them in your Vercel Environment Variables
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || "YOUR_APP_ID",
  key: process.env.PUSHER_KEY || "YOUR_KEY",
  secret: process.env.PUSHER_SECRET || "YOUR_SECRET",
  cluster: process.env.PUSHER_CLUSTER || "YOUR_CLUSTER",
  useTLS: true
});

// Mock Database (In-memory, will reset on serverless function sleep)
// For production persistence, use Supabase or MongoDB
const rooms = {};

// API Routes for game actions
app.post("/api/join-room", (req, res) => {
    const { roomCode, username, socketId } = req.body;
    
    if (!rooms[roomCode]) {
        rooms[roomCode] = {
            players: [],
            phase: 'day',
            day: 1
        };
    }

    const player = {
        id: socketId,
        username: username || `Player ${rooms[roomCode].players.length + 1}`,
        role: 'Townsfolk',
        alive: true,
        isHost: rooms[roomCode].players.length === 0
    };

    rooms[roomCode].players.push(player);
    
    // Trigger Pusher event
    pusher.trigger(`room-${roomCode}`, "room-update", rooms[roomCode]);
    
    res.json({ success: true, player });
});

app.post("/api/send-chat", (req, res) => {
    const { roomCode, message, username } = req.body;
    
    pusher.trigger(`room-${roomCode}`, "new-chat", {
        user: username,
        message: message,
        color: 'text-gray-400'
    });
    
    res.json({ success: true });
});

app.post("/api/vote", (req, res) => {
    const { roomCode, voterName } = req.body;
    
    pusher.trigger(`room-${roomCode}`, "new-chat", {
        user: 'System',
        message: `${voterName} voted for someone!`,
        color: 'text-yellow-500'
    });
    
    res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
