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
            phase: 'waiting',
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

app.post("/api/start-game", (req, res) => {
    const { roomCode } = req.body;
    const room = rooms[roomCode];
    
    if (room && room.players.length >= 4) {
        room.phase = 'day';
        
        // Assign roles (1 Killer, 1 Detective, 1 Doctor, others Townsfolk)
        const players = [...room.players];
        const shuffled = players.sort(() => 0.5 - Math.random());
        
        shuffled[0].role = 'Killer';
        shuffled[1].role = 'Detective';
        shuffled[2].role = 'Doctor';
        for (let i = 3; i < shuffled.length; i++) {
            shuffled[i].role = 'Townsfolk';
        }
        
        room.players = shuffled;
        
        pusher.trigger(`room-${roomCode}`, "room-update", room);
        pusher.trigger(`room-${roomCode}`, "phase-change", { phase: 'day', day: 1 });
        pusher.trigger(`room-${roomCode}`, "new-chat", {
            user: 'System',
            message: 'Game Started! Role assignments have been sent.',
            color: 'text-green-500 font-bold'
        });
        
        res.json({ success: true });
    } else {
        res.status(400).json({ success: false, message: 'Need at least 4 players to start' });
    }
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
