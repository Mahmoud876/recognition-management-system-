document.addEventListener("DOMContentLoaded", async () => {
    const usersTableBody = document.getElementById("users-table-body");
    const searchBar = document.getElementById("search-bar");

    async function fetchUsers(query = "") {
        try {
            const response = await fetch(`/api/users?search=${query}`);
            const users = await response.json();

            usersTableBody.innerHTML = "";
            users.forEach(user => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.name}</td>
                    <td><button onclick="removeUser(${user.id})">Remove</button></td>
                `;
                usersTableBody.appendChild(row);
            });
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    }

    async function removeUser(userId) {
        try {
            await fetch(`/api/users/${userId}`, { method: "DELETE" });
            alert("User removed successfully.");
            fetchUsers();
        } catch (error) {
            console.error("Error removing user:", error);
        }
    }

    searchBar.addEventListener("input", () => fetchUsers(searchBar.value));

    window.removeUser = removeUser;

    fetchUsers();
});
