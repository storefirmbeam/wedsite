document.addEventListener("DOMContentLoaded", function () {

   updateRestrictedAccess(); // Ensure this runs on every page load

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
    updateCountdown();

    // Mobile Menu Toggle
    document.querySelector(".menu-toggle").addEventListener("click", function () {
        document.getElementById("nav-menu").classList.toggle("show");
    });

    // RSVP Button Modal Handling
    const rsvpButton = document.getElementById("rsvpButton");
    const rsvpModal = document.getElementById("rsvpModal");
    const rsvpFormModal = document.getElementById("rsvpFormModal");
    const closeButtons = document.querySelectorAll(".close");

    rsvpButton.addEventListener("click", () => {
        rsvpModal.classList.add("show");
    });

    closeButtons.forEach(button => {
        button.addEventListener("click", () => {
            rsvpModal.classList.remove("show");
            rsvpFormModal.classList.remove("show");
        });
    });

    window.addEventListener("click", event => {
        if (event.target === rsvpModal) {
            rsvpModal.classList.remove("show");
        }
        if (event.target === rsvpFormModal) {
            console.log("Prevented accidental modal closing.");
        }
    });

    // Guest ID Verification
    document.getElementById("verifyGuest").addEventListener("click", async function (event) {
        event.preventDefault();
        const guestID = document.getElementById("guestID").value;

        if (!guestID) {
            document.getElementById("rsvpMessage").textContent = "Please enter a Guest ID.";
            return;
        }

        try {
            //let response = await fetch("http://localhost:8000/local_api/verify_guest.php", { //Keep this line for local testing
            let response = await fetch("https://darbyandcole.site/verify_guest.php", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `guest_id=${guestID}`
            });

            let result = await response.json();

            if (result.valid) {
                sessionStorage.setItem("guestID", guestID);
                if (result.first_name && result.last_name) {
                    sessionStorage.setItem("guestName", `${result.first_name} ${result.last_name}`);
                }
                document.getElementById("rsvpMessage").textContent = "Guest ID verified!";
                rsvpModal.classList.remove("show");
                rsvpFormModal.classList.add("show");
            } else {
                document.getElementById("rsvpMessage").textContent = "Invalid Guest ID. Please try again.";
            }
        } catch (error) {
            console.error("Error verifying Guest ID:", error);
            document.getElementById("rsvpMessage").textContent = "Error contacting server. Contact administration.";
        }
    });

    // RSVP Form Submission
    document.getElementById("rsvpForm").addEventListener("submit", async function(event) {
        event.preventDefault();
        let formData = new FormData(this);
        formData.append("guest_id", sessionStorage.getItem("guestID"));

        try {
            //let response = await fetch("http://localhost:8000/local_api/rsvp.php", { //Keep this line commented out
            let response = await fetch("https://darbyandcole.site/rsvp.php", {
                method: "POST",
                body: formData
            });

            let result = await response.json();
            document.getElementById("confirmationMessage").textContent = result.message;

            if (result.success) {
                sessionStorage.setItem("rsvpStatus", "confirmed");
                updateRestrictedAccess();
                setTimeout(() => {
                    rsvpFormModal.classList.remove("show");
                }, 1500);
            }
        } catch (error) {
            console.error("Error submitting RSVP:", error);
            document.getElementById("confirmationMessage").textContent = "Error submitting RSVP. Contact administration.";
        }
    });

    // Function to update restricted page access
    function updateRestrictedAccess() {
        const guestID = sessionStorage.getItem("guestID");
        const rsvpStatus = sessionStorage.getItem("rsvpStatus");
    
        if (guestID) {
            console.log("User is a verified guest...")
            document.querySelectorAll(".restricted").forEach(item => {
                item.style.display = "block"; // Show restricted menu items
            });
        } else {
            document.querySelectorAll(".restricted").forEach(item => {
                item.style.display = "none"; // Hide restricted menu items if not verified
            });
        }
    }

    if (sessionStorage.getItem("rsvpStatus") === "confirmed") {
        updateRestrictedAccess();
    }
});
