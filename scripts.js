document.addEventListener("DOMContentLoaded", function () {
    // Countdown Timer
    const weddingDate = new Date("May 30, 2026 00:00:00");
    const countdownElement = document.querySelector(".countdown");

    function updateCountdown() {
        const now = new Date();
        const timeRemaining = weddingDate - now;

        if (timeRemaining <= 0) {
            countdownElement.textContent = "The big day is here!";
            return;
        }

        const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
        countdownElement.textContent = `${daysRemaining} Days to Go!`;
    }

    setInterval(updateCountdown, 1000);
    updateCountdown(); // Run immediately to show initial countdown

    // Mobile Menu Toggle
    document.querySelector(".menu-toggle").addEventListener("click", function () {
        document.getElementById("nav-menu").classList.toggle("show");
    });
});
