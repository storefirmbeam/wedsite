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
            const famID = document.getElementById("guestID").value;
    
            if (!guestID) {
                showMessage("Please enter a Family ID.");
                return;
            }
    
            try {
                let response = await fetch("https://darbyandcole.site/backend/verify_guest.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: `fam_id=${encodeURIComponent(famID)}`
                });
    
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
    
                let result = await response.json();
    
                // If valid guest ID, show RSVP form unless user already submitted rsvp
                if (result.valid) {
                    if (result.all_rsvped) {
                        location.reload();  // Everyone RSVP'd → go home
                    } else {
                        //showMessage("Select who will be attending.", "success");
    
                        // ✅ Render checkboxes for family members
                        const container = document.getElementById("guestCheckboxes");
                        container.innerHTML = "";

                        result.family.forEach(guest => {
                            const isCurrentGuest = guest.id === result.guestID;
                            const alreadyRSVPed = guest.has_rsvped;
                        
                            const checkboxContainer = document.createElement("div");
                            const uniqueId = `cbx-${guest.id}`;
                        
                            checkboxContainer.innerHTML = `
                            <input type="checkbox" id="${uniqueId}" name="attending_guests[]" value="${guest.id}"
                                ${guest.has_rsvped ? "disabled" : ""}
                            <label for="${uniqueId}" class="checkbox-pill ${guest.has_rsvped ? "disabled-pill" : ""}">
                                <div class="pill-content">
                                    <div class="check">
                                        <svg width="18px" height="18px" viewBox="0 0 18 18">
                                            <path d="M1,9 L1,3.5 C1,2 2,1 3.5,1 L14.5,1 C16,1 17,2 17,3.5 L17,14.5 C17,16 16,17 14.5,17 L3.5,17 C2,17 1,16 1,14.5 L1,9 Z"></path>
                                            <polyline points="1 9 7 14 15 4"></polyline>
                                        </svg>
                                    </div>
                                    <span class="guest-name">${guest.name}</span>
                                </div>
                                ${guest.has_rsvped ? '<div class="rsvped-overlay">RSVP’d</div>' : ''}
                            </label>

                        `;
                            container.appendChild(checkboxContainer);
                        });
    
                        rsvpModal.classList.remove("show");
                        rsvpFormModal.classList.add("show");

                        // 🔁 Create hidden input with all RSVP-able guest IDs (non-disabled)
                        const allGuestIDs = result.family

                        .filter(guest => !guest.has_rsvped)
                        .map(guest => guest.id);

                        const hiddenGuestListInput = document.createElement("input");
                        hiddenGuestListInput.type = "hidden";
                        hiddenGuestListInput.name = "all_guest_ids";
                        hiddenGuestListInput.value = allGuestIDs.join(",");
                        rsvpForm.appendChild(hiddenGuestListInput);
                        const markAllBtn = document.getElementById("markAllNotAttending");

                        if (markAllBtn) {
                            markAllBtn.addEventListener("click", () => {
                                const checkboxes = document.querySelectorAll('#guestCheckboxes input[type="checkbox"]:not(:disabled)');
                                checkboxes.forEach(cb => cb.checked = false);
                            });
                        }
                    }
                } else {
                    showMessage("Invalid Family ID. Please try again.", "error");
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
        rsvpForm.addEventListener("submit", function(event) {
            event.preventDefault();
        
            const checked = Array.from(document.querySelectorAll('#guestCheckboxes input[type="checkbox"]:checked'));
            const unchecked = Array.from(document.querySelectorAll('#guestCheckboxes input[type="checkbox"]:not(:checked):not(:disabled)'));
        
            if (unchecked.length > 0) {
                const names = unchecked.map(cb => cb.nextElementSibling.querySelector('.guest-name').textContent.trim());
                const message = `It looks like ${names.join(" and ")} ${names.length > 1 ? "haven’t" : "hasn’t"} been selected. Not Attending?`;
        
                document.getElementById("unselectedMessage").textContent = message;
                document.getElementById("unselectedModal").classList.add("show");
            } else {
                submitRSVPForm(); // No missing guests — proceed
            }
        });
    }

    function submitRSVPForm() {
        const rsvpFormElement = document.getElementById("rsvpForm");
        const formData = new FormData(rsvpFormElement);

        // Manually collect all checked guest IDs since hidden checkboxes don't auto-submit
        const checked = Array.from(document.querySelectorAll('#guestCheckboxes input[type="checkbox"]:checked'));
        const checkedIDs = checked.map(cb => cb.value);

        // Clear any old copies of attending_guests[]
        formData.delete("attending_guests[]");

        // Append selected IDs
        checkedIDs.forEach(id => {
            formData.append("attending_guests[]", id);
        });

        const selectedGuests = checked.length;

        fetch("https://darbyandcole.site/backend/rsvp.php", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                const confirmationText = selectedGuests > 0
                    ? `You RSVP’d for ${selectedGuests} ${selectedGuests === 1 ? 'guest' : 'guests'}. We’re so excited to celebrate with you!`
                    : `You RSVP’d with no attendees. We’ll miss you, but thank you for letting us know!`;

                const confirmationPara = document.getElementById("confirmationMessage");
                confirmationPara.textContent = confirmationText;
                confirmationPara.classList.add("show");

                setTimeout(() => {
                    document.getElementById("rsvpFormModal").classList.remove("show");
                    confirmationPara.textContent = "";
                    confirmationPara.classList.remove("show");
                }, 3000);
            } else {
                showMessage(result.message, "error");
            }
        })
        .catch(error => {
            console.error("Error submitting RSVP:", error);
            showMessage("Error submitting RSVP. Contact administration.", "error");
        });
    }
      
    // Handle confirm or go-back from unselected modal
    document.getElementById("confirmNotComing").addEventListener("click", function () {
        document.getElementById("unselectedModal").classList.remove("show");
        submitRSVPForm();
    });
    
    document.getElementById("goBackToSelection").addEventListener("click", function () {
        document.getElementById("unselectedModal").classList.remove("show");
    });
    
    document.getElementById("unselectedClose").addEventListener("click", function () {
        document.getElementById("unselectedModal").classList.remove("show");
    });
    

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
