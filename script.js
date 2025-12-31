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
            window.location.href = 'game-room.html';
        });
    }

    if (joinButton) {
        joinButton.addEventListener('click', () => {
            const roomCode = prompt('Enter Room Code:');
            if (roomCode) {
                window.location.href = 'game-room.html';
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
