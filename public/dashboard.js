document.addEventListener("DOMContentLoaded", async () => {
    const quickAccessList = document.getElementById("quick-access-list");
    const notificationsList = document.getElementById("notifications-list");

    // Fetch data from backend
    async function fetchData() {
        try {
            const response = await fetch("/api/dashboard");
            const data = await response.json();

            // Populate Quick Access
            quickAccessList.innerHTML = "";
            data.quickAccess.forEach(item => {
                const li = document.createElement("li");
                li.textContent = item;
                quickAccessList.appendChild(li);
            });

            // Populate Notifications
            notificationsList.innerHTML = "";
            data.notifications.forEach(notification => {
                const p = document.createElement("p");
                const a = document.createElement("a");
                a.textContent = notification.message;
                a.href = `monitor.html?computer=${notification.computerId}`;
                p.appendChild(a);
                notificationsList.appendChild(p);
            });

            // Update Charts
            updateCharts(data.chartData);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        }
    }

    function updateCharts(chartData) {
        // Users Bar Chart
        new Chart(document.getElementById("usersBarChart").getContext("2d"), {
            type: "bar",
            data: {
                labels: chartData.areas,
                datasets: [{
                    label: "Users Online",
                    data: chartData.usersOnline,
                    backgroundColor: "rgba(167, 139, 250, 0.7)"
                }]
            }
        });

        // Active Users Doughnut Chart
        new Chart(document.getElementById("activeUsersDoughnut").getContext("2d"), {
            type: "doughnut",
            data: {
                labels: ["Online", "Offline"],
                datasets: [{
                    data: chartData.activeUsers,
                    backgroundColor: ["rgba(113, 202, 148, 0.7)", "rgba(255, 99, 132, 0.7)"]
                }]
            }
        });
    }

    fetchData();
});
