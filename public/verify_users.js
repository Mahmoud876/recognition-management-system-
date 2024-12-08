document.addEventListener("DOMContentLoaded", async () => {
    const requestsContainer = document.getElementById("requests-container");

    // Fetch and populate pending requests
    async function fetchRequests() {
        try {
            const response = await fetch("/api/verify_pending_users");
            if (!response.ok) throw new Error("Failed to fetch pending users.");

            const pendingUsers = await response.json();
            populateRequests(pendingUsers);
        } catch (error) {
            console.error("Error fetching user requests:", error);
            requestsContainer.innerHTML = "<p>Error loading data. Please try again later.</p>";
        }
    }

    // Render requests dynamically
    function populateRequests(requests = []) {
        requestsContainer.innerHTML = ""; // Clear existing requests

        if (requests.length === 0) {
            requestsContainer.innerHTML = "<p>No pending requests at the moment.</p>";
            return;
        }

        requests.forEach((request) => {
            const card = document.createElement("div");
            card.classList.add("request-card");
            card.innerHTML = `
                <img src="${request.image}" alt="${request.name}" onerror="this.src='https://via.placeholder.com/100'">
                <h3>${request.name}</h3>
                <div>
                    <button class="accept-btn" onclick="acceptRequest('${request.name}', this)">Accept</button>
                    <button class="reject-btn" onclick="rejectRequest('${request.name}', this)">Reject</button>
                </div>
            `;
            requestsContainer.appendChild(card);
        });
    }

    // Accept user
    async function acceptRequest(userName, buttonElement) {
        try {
            const response = await fetch(`/api/verify_pending_users/${userName}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "accept" }),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to accept user.");
            }
    
            const result = await response.json();
            alert(result.message);
    
            // Remove the user card from the UI
            const userCard = buttonElement.closest(".request-card");
            if (userCard) userCard.remove();
        } catch (error) {
            console.error(`Error accepting user ${userName}:`, error);
            alert(error.message || "An error occurred while accepting the user. Please try again.");
        }
    }
    
    async function rejectRequest(userName, buttonElement) {
        try {
            const response = await fetch(`/api/verify_pending_users/${userName}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "reject" }),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to reject user.");
            }
    
            const result = await response.json();
            alert(result.message);
    
            // Remove the user card from the UI
            const userCard = buttonElement.closest(".request-card");
            if (userCard) userCard.remove();
        } catch (error) {
            console.error(`Error rejecting user ${userName}:`, error);
            alert(error.message || "An error occurred while rejecting the user. Please try again.");
        }
    }
    
    
    // Attach the accept and reject functions to the global window object
    window.acceptRequest = acceptRequest;
    window.rejectRequest = rejectRequest;

    // Initial fetch of pending requests
    fetchRequests();
});
