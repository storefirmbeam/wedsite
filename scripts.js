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

// Submit RSVP to InfinityFree
/*
document.getElementById("rsvpForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    let guest_id = document.getElementById("guest_id").value;
    let attending = document.getElementById("attending").value;
    let guest_count = document.getElementById("guest_count").value;
    let message = document.getElementById("message").value;

    let formData = new FormData();
    formData.append("guest_id", guest_id);
    formData.append("attending", attending);
    formData.append("guest_count", guest_count);
    formData.append("message", message);

    let response = await fetch("http://big-john.infinityfreeapp.com/rsvp.php", {
        method: "POST",
        body: formData
    });

    let result = await response.json();
    document.getElementById("rsvpMessage").innerText = result.message;
});

// Load Q&A Entries from InfinityFree
async function loadQnA() {
    let response = await fetch("http://big-john.infinityfreeapp.com/get_qna.php");
    let qna = await response.json();

    let qnaSection = document.getElementById("qna");
    qna.forEach(item => {
        qnaSection.innerHTML += `<p><strong>Q:</strong> ${item.question} <br> <strong>A:</strong> ${item.admin_response}</p>`;
    });
}
loadQnA();
*/