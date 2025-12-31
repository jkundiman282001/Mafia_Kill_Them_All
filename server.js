const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '.')));

// Game State
const rooms = {};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join-room', ({ roomCode, username }) => {
        socket.join(roomCode);
        
        if (!rooms[roomCode]) {
            rooms[roomCode] = {
                players: [],
                phase: 'day',
                day: 1
            };
        }

        const player = {
            id: socket.id,
            username: username || `Player ${rooms[roomCode].players.length + 1}`,
            role: 'Townsfolk', // Default for now
            alive: true,
            isHost: rooms[roomCode].players.length === 0
        };

        rooms[roomCode].players.push(player);
        
        // Notify everyone in the room
        io.to(roomCode).emit('room-update', rooms[roomCode]);
        
        console.log(`${player.username} joined room ${roomCode}`);

        socket.on('disconnect', () => {
            rooms[roomCode].players = rooms[roomCode].players.filter(p => p.id !== socket.id);
            if (rooms[roomCode].players.length === 0) {
                delete rooms[roomCode];
            } else {
                io.to(roomCode).emit('room-update', rooms[roomCode]);
            }
            console.log('User disconnected');
        });
    });

    socket.on('send-chat', ({ roomCode, message, username }) => {
        io.to(roomCode).emit('new-chat', {
            user: username,
            message: message,
            color: 'text-gray-400'
        });
    });

    socket.on('vote', ({ roomCode, targetId, voterName }) => {
        io.to(roomCode).emit('new-chat', {
            user: 'System',
            message: `${voterName} voted for someone!`,
            color: 'text-yellow-500'
        });
    });
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
