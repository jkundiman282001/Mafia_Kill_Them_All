document.addEventListener('DOMContentLoaded', () => {
    // Replace with your actual Pusher Key from the Pusher Dashboard
    const PUSHER_KEY = '73d0d3970172a67873b4';
    const PUSHER_CLUSTER = 'ap1';

    const pusher = new Pusher(PUSHER_KEY, {
        cluster: PUSHER_CLUSTER
    });

    const playersGrid = document.getElementById('players-grid');
    const chatForm = document.getElementById('chat-form');
    const chatMessages = document.getElementById('chat-messages');
    const actionBar = document.getElementById('action-bar');
    const gameStatus = document.getElementById('game-status');
    const playerRoleDisplay = document.getElementById('player-role');

    const urlParams = new URLSearchParams(window.location.search);
    const roomCode = urlParams.get('room');
    const username = localStorage.getItem('mafia-username') || 'Anonymous';

    if (!roomCode) {
        window.location.href = 'index.html';
        return;
    }

    let myId = null;
    let currentPlayers = [];

    // Subscribe to the room channel
    const channel = pusher.subscribe(`room-${roomCode}`);

    // Wait for connection to get socketId
    pusher.connection.bind('connected', () => {
        myId = pusher.connection.socket_id;
        
        // Join the room via API
        fetch('/api/join-room', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomCode, username, socketId: myId })
        });
    });

    // Room Updates
    channel.bind('room-update', (data) => {
        currentPlayers = data.players;
        renderPlayers();
        
        const me = currentPlayers.find(p => p.id === myId);
        if (me) {
            playerRoleDisplay.textContent = me.role.toUpperCase();
        }
    });

    // Chat Updates
    channel.bind('new-chat', (data) => {
        addChatMessage(data.user, data.message, data.color);
    });

    // Render Players
    function renderPlayers() {
        playersGrid.innerHTML = currentPlayers.map(player => `
            <div class="player-card p-4 rounded-lg flex flex-col items-center gap-3 ${player.alive ? '' : 'dead'} ${player.id === myId ? 'active' : ''}" data-id="${player.id}">
                <div class="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-2xl font-bold relative">
                    ${player.username.substring(0, 2).toUpperCase()}
                    ${player.id === myId ? '<span class="absolute -top-1 -right-1 bg-blood text-[10px] px-1 rounded">YOU</span>' : ''}
                    ${!player.alive ? '<span class="absolute inset-0 flex items-center justify-center text-red-600 text-4xl">✕</span>' : ''}
                </div>
                <div class="text-center">
                    <p class="font-bold truncate w-24">${player.username}</p>
                    <p class="text-[10px] text-gray-500 uppercase">${player.alive ? 'Alive' : 'Eliminated'}</p>
                </div>
                ${player.alive && player.id !== myId ? `
                    <button class="vote-btn mt-2 text-[10px] border border-gray-600 px-3 py-1 rounded hover:bg-blood hover:border-blood transition uppercase font-bold" data-target="${player.id}">
                        Vote
                    </button>
                ` : ''}
            </div>
        `).join('');

        // Add event listeners to vote buttons
        document.querySelectorAll('.vote-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetId = e.target.dataset.target;
                fetch('/api/vote', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ roomCode, targetId, voterName: username })
                });
            });
        });
    }

    // Chat Logic
    function addChatMessage(user, message, colorClass = 'text-blood') {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'bg-[#1a1a1a] p-3 rounded animate-fade-in';
        msgDiv.innerHTML = `
            <span class="${colorClass} font-bold">${user}:</span>
            <span class="text-gray-400">${message}</span>
        `;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = chatForm.querySelector('input');
        if (input.value.trim()) {
            fetch('/api/send-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomCode, message: input.value.trim(), username })
            });
            input.value = '';
        }
    });

    // Action button logic
    document.getElementById('action-btn').addEventListener('click', () => {
        alert('Select a player to investigate!');
    });
});
