document.addEventListener("DOMContentLoaded", async () => {
    const areasContainer = document.getElementById("areas-container");
    const computerList = document.getElementById("computer-list");
    const recentActivity = document.getElementById("recent-activity");

    async function fetchAreas() {
        try {
            const response = await fetch("/api/monitor_areas");
            const areas = await response.json();

            areasContainer.innerHTML = "";
            areas.forEach(area => {
                const button = document.createElement("button");
                button.textContent = area.name;
                button.addEventListener("click", () => displayComputers(area.id));
                areasContainer.appendChild(button);
            });
        } catch (error) {
            console.error("Error fetching areas:", error);
        }
    }

    async function displayComputers(areaId) {
        try {
            const response = await fetch(`/api/monitor_areas/${areaId}`);
            const computers = await response.json();

            computerList.innerHTML = "";
            computers.forEach(computer => {
                const li = document.createElement("li");
                li.innerHTML = `
                    ${computer.name} <span class="${computer.status === "online" ? "status-online" : "status-offline"}">
                    ${computer.status}
                    </span>`;
                computerList.appendChild(li);
            });
        } catch (error) {
            console.error("Error fetching computers:", error);
        }
    }

    async function fetchRecentActivity() {
        try {
            const response = await fetch("/api/recent_activity");
            const activity = await response.json();

            recentActivity.innerHTML = `
                <h3>Recent Activity</h3>
                <ul>
                    ${activity.map(act => `<li>${act}</li>`).join("")}
                </ul>
            `;
        } catch (error) {
            console.error("Error fetching recent activity:", error);
        }
    }

    fetchAreas();
    fetchRecentActivity();
});
