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
    // ✅ FIXED Mobile Menu Toggle (Checkbox Method)
    const checkbox = document.getElementById("checkbox");
    const navContainer = document.querySelector(".nav-container");

    if (checkbox) {
        checkbox.addEventListener("change", function () {
            if (this.checked) {
                navContainer.style.display = "flex";
            } else {
                navContainer.style.display = "none";
            }
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
                showMessage("Please enter a Guest ID.");
                return;
            }
    
            try {
                let response = await fetch("https://darbyandcole.site/backend/verify_guest.php", {
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
                        location.reload();
                    } else {
                        showMessage("Guest ID verified!", "success");
    
                        // ✅ Render checkboxes for family members
                        const container = document.getElementById("guestCheckboxes");
                        container.innerHTML = "";

                        // Move the current RSVPing guest to the front
                        result.family.sort((a, b) => {
                            return a.id === result.guestID ? -1 : b.id === result.guestID ? 1 : 0;
                        });

                        result.family.forEach(guest => {
                            const isCurrentGuest = guest.id === result.guestID;
                            const alreadyRSVPed = guest.has_rsvped;
                        
                            const checkboxContainer = document.createElement("div");
                            const uniqueId = `cbx-${guest.id}`;
                        
                            checkboxContainer.innerHTML = `
                            <input type="checkbox" id="${uniqueId}" name="attending_guests[]" value="${guest.id}"
                                ${isCurrentGuest ? "checked" : ""}
                                ${alreadyRSVPed && !isCurrentGuest ? "disabled" : ""}
                                style="display: none;">
                            <label for="${uniqueId}" class="checkbox-pill ${alreadyRSVPed && !isCurrentGuest ? "disabled-pill" : ""}">
                                <div class="pill-content">
                                    <div class="check">
                                        <svg width="18px" height="18px" viewBox="0 0 18 18">
                                            <path d="M1,9 L1,3.5 C1,2 2,1 3.5,1 L14.5,1 C16,1 17,2 17,3.5 L17,14.5 C17,16 16,17 14.5,17 L3.5,17 C2,17 1,16 1,14.5 L1,9 Z"></path>
                                            <polyline points="1 9 7 14 15 4"></polyline>
                                        </svg>
                                    </div>
                                    <span class="guest-name">${guest.name}</span>
                                </div>
                                ${alreadyRSVPed && !isCurrentGuest ? '<div class="rsvped-overlay">RSVP’d</div>' : ''}
                            </label>
                        `;
                        
                        
                            container.appendChild(checkboxContainer);
                        });
    
                        rsvpModal.classList.remove("show");
                        rsvpFormModal.classList.add("show");
                    }
                } else {
                    showMessage("Invalid Guest ID. Please try again.", "error");
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
                let response = await fetch("https://darbyandcole.site/backend/rsvp.php", {
                    method: "POST",
                    body: formData
                });

                let result = await response.json();
                showMessage(result.message, result.success ? "success" : "error");

                if (result.success) {
                    updateRestrictedAccess();
                    setTimeout(() => {
                        rsvpFormModal.classList.remove("show");
                    }, 1500);
                }
            } catch (error) {
                console.error("Error submitting RSVP:", error);
                showMessage("Error submitting RSVP. Contact administration.", "error");
            }
        });
    }

    // Logout functionality
    const logout = document.getElementById("logout-btn");
    if (logout) {
        logout.addEventListener("click", function () {
            fetch("https://darbyandcole.site/backend/logout.php", {
                method: "POST",
                credentials: "include"
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Hide the restricted row completely
                    document.querySelector(".restricted-nav").classList.remove("show");

                    // Hide all restricted tabs
                    document.querySelectorAll(".restricted").forEach(item => {
                        item.style.display = "none";
                    });

                    // Hide logout button
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
        fetch("https://darbyandcole.site/backend/check_session.php")
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.guestID) {
                    // Show the restricted row
                    document.querySelector(".restricted-nav").classList.add("show");

                    // Show all restricted menu items
                    document.querySelectorAll(".restricted").forEach(item => {
                        item.style.display = "block";
                    });

                    // Show the logout button
                    document.getElementById("logout-btn").style.display = "block";
                } else {
                    // Hide the restricted row completely
                    document.querySelector(".restricted-nav").classList.remove("show");

                    // Hide all restricted menu items
                    document.querySelectorAll(".restricted").forEach(item => {
                        item.style.display = "none";
                    });

                    // Hide the logout button
                    document.getElementById("logout-btn").style.display = "none";
                }
            })
            .catch(error => console.error("Error checking session:", error));
    }

    function showMessage(message, type) {
        const rsvpMessage = document.getElementById("rsvpMessage");
    
        // Remove previous classes
        rsvpMessage.classList.remove("error-message", "success-message", "shake");
    
        // Set new message
        rsvpMessage.textContent = message;
    
        // Apply appropriate style
        if (type === "error") {
            rsvpMessage.classList.add("error-message", "shake");
    
            // Remove the shake class after the animation ends to allow re-triggering
            setTimeout(() => {
                rsvpMessage.classList.remove("shake");
            }, 300);
        } else if (type === "success") {
            rsvpMessage.classList.add("success-message");
        }
    }
    
});
