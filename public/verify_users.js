document.addEventListener("DOMContentLoaded", async () => {
    const requestsContainer = document.getElementById("requests-container");

    // Fetch pending user requests
    async function fetchRequests() {
        try {
            const response = await fetch("/api/verify_users");
            const requests = await response.json();

            requestsContainer.innerHTML = "";
            requests.forEach(request => {
                const card = document.createElement("div");
                card.classList.add("request-card");
                card.innerHTML = `
                    <img src="${request.image}" alt="${request.name}">
                    <h3>${request.name}</h3>
                    <p>ID: ${request.id}</p>
                    <div>
                        <button class="accept-btn" onclick="acceptRequest(${request.id})">Accept</button>
                        <button class="reject-btn" onclick="rejectRequest(${request.id})">Reject</button>
                    </div>
                `;
                requestsContainer.appendChild(card);
            });
        } catch (error) {
            console.error("Error fetching user requests:", error);
        }
    }

    async function acceptRequest(userId) {
        try {
            await fetch(`/api/verify_users/${userId}`, { method: "PUT" });
            alert("User accepted successfully.");
            fetchRequests();
        } catch (error) {
            console.error("Error accepting user:", error);
        }
    }

    async function rejectRequest(userId) {
        try {
            await fetch(`/api/verify_users/${userId}`, { method: "DELETE" });
            alert("User rejected successfully.");
            fetchRequests();
        } catch (error) {
            console.error("Error rejecting user:", error);
        }
    }

    window.acceptRequest = acceptRequest;
    window.rejectRequest = rejectRequest;

    fetchRequests();
});
