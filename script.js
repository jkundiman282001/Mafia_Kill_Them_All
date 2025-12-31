document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Button click handlers
    const startButton = document.querySelector('button.bg-blood.px-10');
    const joinButton = document.querySelector('button.border-2.border-white');

    if (startButton) {
        startButton.addEventListener('click', () => {
            const username = prompt('Enter your name:') || 'Player';
            const roomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
            localStorage.setItem('mafia-username', username);
            localStorage.setItem('mafia-room', roomCode);
            window.location.href = `game-room.html?room=${roomCode}`;
        });
    }

    if (joinButton) {
        joinButton.addEventListener('click', () => {
            const username = prompt('Enter your name:') || 'Player';
            const roomCode = prompt('Enter Room Code:').toUpperCase();
            if (roomCode) {
                localStorage.setItem('mafia-username', username);
                localStorage.setItem('mafia-room', roomCode);
                window.location.href = `game-room.html?room=${roomCode}`;
            }
        });
    }

    // Role card hover effects (optional - handled by Tailwind mostly)
    const roleCards = document.querySelectorAll('.role-card');
    roleCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            // Add any additional JS-based animations here
        });
    });
});
