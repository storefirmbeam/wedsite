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
    // Check if the menu toggle button exists before adding an event listener
    const menuToggle = document.querySelector(".menu-toggle");
    if (menuToggle) {
        menuToggle.addEventListener("click", function () {
            document.getElementById("nav-menu").classList.toggle("show");
        });
    }

    // RSVP Button Modal Handling
    const rsvpButton = document.getElementById("rsvpButton");
    const rsvpModal = document.getElementById("rsvpModal");
    const rsvpFormModal = document.getElementById("rsvpFormModal");
    const closeButtons = document.querySelectorAll(".close");

    // Fix for RSVP Button (if it exists on the page)
    if (rsvpButton) {
        rsvpButton.addEventListener("click", () => {
            const rsvpModal = document.getElementById("rsvpModal");
            if (rsvpModal) rsvpModal.classList.add("show");
        });
    }

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
    const verifyGuestBtn = document.getElementById("verifyGuest");
    if (verifyGuestBtn) {
        verifyGuestBtn.addEventListener("click", async function (event) {
            event.preventDefault();
            const guestID = document.getElementById("guestID").value;

            if (!guestID) {
                document.getElementById("rsvpMessage").textContent = "Please enter a Guest ID.";
                return;
            }

            try {
                let response = await fetch("https://darbyandcole.site/verify_guest.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: `guest_id=${encodeURIComponent(guestID)}`
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                let result = await response.json();
                
                // If valid guest ID, show RSVP form unless user already submitted rsvp
                if (result.valid) {
                    if (result.rsvped) {
                        // If the guest has already RSVP'd, refresh the page to load restricted content
                        location.reload();
                    } else {
                        // If not RSVP'd, show the RSVP modal
                        document.getElementById("rsvpMessage").textContent = "Guest ID verified!";
                        rsvpModal.classList.remove("show");
                        rsvpFormModal.classList.add("show");
                    }
                } else {
                    document.getElementById("rsvpMessage").textContent = "Invalid Guest ID. Please try again.";
                }
            } catch (error) {
                console.error("Error verifying Guest ID:", error);
                document.getElementById("rsvpMessage").textContent = "Error contacting server. Contact administration.";
            }
        });
    }

    // RSVP Form Submission
    const rsvpForm = document.getElementById("rsvpForm");
    if (rsvpForm) {
        rsvpForm.addEventListener("submit", async function(event) {
            event.preventDefault();
            let formData = new FormData(this);

            try {
                let response = await fetch("https://darbyandcole.site/rsvp.php", {
                    method: "POST",
                    body: formData
                });

                let result = await response.json();
                document.getElementById("confirmationMessage").textContent = result.message;

                if (result.success) {
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
    }

    // Logout functionality
    const logout = document.getElementById("logout-btn");
    if (logout) {
        logout.addEventListener("click", function () {
            fetch("https://darbyandcole.site/logout.php", {
                method: "POST",
                credentials: "include"
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Hide restricted pages and logout button
                    document.querySelectorAll(".restricted").forEach(item => {
                        item.style.display = "none";
                    });
                    document.getElementById("logout-btn").style.display = "none";
                } else {
                    alert("Logout failed. Try again.");
                }
            })
            .catch(error => console.error("Error during logout:", error));
        });
    }
    // Function to update restricted page access
    function updateRestrictedAccess() {
        fetch("https://darbyandcole.site/check_session.php")
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.guestID) {
                    document.querySelectorAll(".restricted").forEach(item => {
                        item.style.display = "block"; // Show restricted menu items
                    });
                } else {
                    document.querySelectorAll(".restricted").forEach(item => {
                        item.style.display = "none"; // Hide restricted menu items if not verified
                    });
                }
            })
            .catch(error => console.error("Error checking session:", error));
    }
});
