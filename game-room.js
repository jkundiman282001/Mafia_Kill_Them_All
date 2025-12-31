document.addEventListener('DOMContentLoaded', () => {
    const playersGrid = document.getElementById('players-grid');
    const chatForm = document.getElementById('chat-form');
    const chatMessages = document.getElementById('chat-messages');
    const actionBar = document.getElementById('action-bar');
    const gameStatus = document.getElementById('game-status');

    // Mock Player Data
    const players = [
        { id: 1, name: 'ShadowWalker', alive: true, self: true },
        { id: 2, name: 'SilentNight', alive: true, self: false },
        { id: 3, name: 'DeadManWalking', alive: false, self: false },
        { id: 4, name: 'Townie123', alive: true, self: false },
        { id: 5, name: 'DarkJustice', alive: true, self: false },
        { id: 6, name: 'MysteryUser', alive: true, self: false },
        { id: 7, name: 'TheHealer', alive: true, self: false },
        { id: 8, name: 'LoneWolf', alive: true, self: false }
    ];

    let isNight = false;

    // Render Players
    function renderPlayers() {
        playersGrid.innerHTML = players.map(player => `
            <div class="player-card p-4 rounded-lg flex flex-col items-center gap-3 ${player.alive ? '' : 'dead'} ${player.self ? 'active' : ''}" data-id="${player.id}">
                <div class="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-2xl font-bold relative">
                    ${player.name.substring(0, 2).toUpperCase()}
                    ${player.self ? '<span class="absolute -top-1 -right-1 bg-blood text-[10px] px-1 rounded">YOU</span>' : ''}
                    ${!player.alive ? '<span class="absolute inset-0 flex items-center justify-center text-red-600 text-4xl">✕</span>' : ''}
                </div>
                <div class="text-center">
                    <p class="font-bold truncate w-24">${player.name}</p>
                    <p class="text-[10px] text-gray-500 uppercase">${player.alive ? 'Alive' : 'Eliminated'}</p>
                </div>
                ${player.alive && !player.self ? `
                    <button class="vote-btn mt-2 text-[10px] border border-gray-600 px-3 py-1 rounded hover:bg-blood hover:border-blood transition uppercase font-bold">
                        Vote
                    </button>
                ` : ''}
            </div>
        `).join('');

        // Add event listeners to vote buttons
        document.querySelectorAll('.vote-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const playerName = e.target.closest('.player-card').querySelector('.font-bold').textContent;
                addChatMessage('System', `You voted for ${playerName}`, 'text-yellow-500');
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
            addChatMessage('You', input.value.trim(), 'text-blue-500');
            input.value = '';
            
            // Mock response
            setTimeout(() => {
                addChatMessage('SilentNight', "I think ShadowWalker is acting suspicious...", 'text-gray-400');
            }, 1000);
        }
    });

    // Toggle Night/Day (Demo purpose)
    function toggleGamePhase() {
        isNight = !isNight;
        if (isNight) {
            document.body.classList.add('night-mode');
            gameStatus.innerHTML = `
                <span class="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></span>
                <span class="font-bold uppercase tracking-widest text-sm">Night 1 - Actions</span>
            `;
            actionBar.classList.remove('hidden');
            addChatMessage('System', 'The night has fallen. Perform your role action.', 'text-blue-400');
        } else {
            document.body.classList.remove('night-mode');
            gameStatus.innerHTML = `
                <span class="w-3 h-3 rounded-full bg-yellow-500 animate-pulse"></span>
                <span class="font-bold uppercase tracking-widest text-sm">Day 2 - Discussion</span>
            `;
            actionBar.classList.add('hidden');
            addChatMessage('System', 'Morning has come. Discussion begins.', 'text-yellow-500');
        }
    }

    // Initialize
    renderPlayers();

    // Mock phase transition after 10 seconds
    setTimeout(toggleGamePhase, 10000);

    // Action button logic
    document.getElementById('action-btn').addEventListener('click', () => {
        alert('Select a player to investigate!');
    });
});
