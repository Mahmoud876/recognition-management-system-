document.addEventListener("DOMContentLoaded", async () => {
    const usersTableBody = document.getElementById("users-table-body");
    const searchBar = document.getElementById("search-bar");
    const areaSearchInput = document.getElementById("area-search");
    const dropdownList = document.getElementById("dropdown-list");
    const themeSwitch = document.getElementById("theme-switch");

    let allUsers = []; // Store all users fetched from the backend
    let areas = []; // List of unique areas

    // Fetch users and areas from the backend
    async function fetchUsers() {
        try {
            const response = await fetch('/api/users');
            const { areas: fetchedAreas, users } = await response.json();
            console.log("Fetched Areas:", fetchedAreas);
            console.log("Fetched Users:", users);

            areas = fetchedAreas; // Save areas for dropdown
            allUsers = users; // Save users for display and filtering
            populateDropdown(); // Populate areas dropdown
            populateUsers(allUsers); // Populate the users table
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    }

    // Populate users in the table
    function populateUsers(users) {
        usersTableBody.innerHTML = ""; // Clear previous content
        if (users.length === 0) {
            usersTableBody.innerHTML = `<tr><td colspan="2">No users found.</td></tr>`;
            return;
        }

        users.forEach((user) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${user}</td>
                <td><button onclick="removeUser('${user}')" class="remove-btn">Remove</button></td>
            `;
            usersTableBody.appendChild(row);
        });
    }

    // Populate the dropdown with area names
    function populateDropdown() {
        dropdownList.innerHTML = ""; // Clear previous options
        areas.forEach((area) => {
            const listItem = document.createElement("li");
            listItem.textContent = area;
            listItem.addEventListener("click", () => selectArea(area));
            dropdownList.appendChild(listItem);
        });
    }

    // Search users by area
    async function searchArea() {
        const area = areaSearchInput.value.trim().toLowerCase();
        console.log(`Searching area: ${area}`);

        try {
            const response = await fetch(`/api/users?area=${encodeURIComponent(area)}`);
            const { users } = await response.json();
            console.log(`Users for area "${area}":`, users);
            populateUsers(users); // Update the users table with filtered data
        } catch (error) {
            console.error("Error searching area:", error);
        }
    }

    // Select an area from the dropdown
    function selectArea(area) {
        areaSearchInput.value = area; // Set the selected area in the input field
        dropdownList.classList.remove("visible"); // Hide the dropdown
        searchArea(); // Trigger the backend search for the selected area
    }


    async function removeUser(username) {
        try {
            const response = await fetch(`/api/users/${username}`, { method: "DELETE" });
            if (!response.ok) {
                const { message } = await response.json();
                alert(`Error: ${message}`);
                return;
            }
            alert(`User ${username} removed successfully.`);
            // Refresh the user list after removal
            fetchUsers();
        } catch (error) {
            console.error(`Error removing user ${username}:`, error);
            alert("An error occurred while removing the user.");
        }
    }

    // Expose the removeUser function globally for onclick in buttons
    window.removeUser = removeUser;

    // Filter dropdown options as user types
    function filterDropdown() {
        const query = areaSearchInput.value.toLowerCase();
        const filteredAreas = areas.filter(area => area.toLowerCase().includes(query));
        dropdownList.innerHTML = ""; // Clear dropdown
        filteredAreas.forEach((area) => {
            const listItem = document.createElement("li");
            listItem.textContent = area;
            listItem.addEventListener("click", () => selectArea(area));
            dropdownList.appendChild(listItem);
        });
        dropdownList.classList.add("visible");
    }

    // Remove user functionality
    async function removeUser(username) {
        try {
            const response = await fetch(`/api/users/${username}`, { method: "DELETE" });
            if (!response.ok) {
                const { message } = await response.json();
                alert(`Error: ${message}`);
                return;
            }
            alert(`User ${username} removed successfully.`);
            fetchUsers(); // Refresh users list
        } catch (error) {
            console.error("Error removing user:", error);
        }
    }

    // Search users by name
    function searchUsers() {
        const query = searchBar.value.toLowerCase();
        const filteredUsers = allUsers.filter(user => user.toLowerCase().includes(query));
        populateUsers(filteredUsers);
    }

    // Handle theme persistence
    function applySavedTheme() {
        const savedTheme = localStorage.getItem("theme") || "light";
        if (savedTheme === "dark") {
            document.body.classList.add("dark-mode");
            themeSwitch.checked = true;
        } else {
            document.body.classList.remove("dark-mode");
        }
    }

    // Attach event listeners
    themeSwitch.addEventListener("change", () => {
        if (themeSwitch.checked) {
            document.body.classList.add("dark-mode");
            localStorage.setItem("theme", "dark");
        } else {
            document.body.classList.remove("dark-mode");
            localStorage.setItem("theme", "light");
        }
    });

    searchBar.addEventListener("input", searchUsers); // Trigger search on typing
    areaSearchInput.addEventListener("input", filterDropdown); // Show dropdown options as user types
    areaSearchInput.addEventListener("focus", () => dropdownList.classList.add("visible")); // Show dropdown on focus
    document.addEventListener("click", (event) => {
        if (!event.target.closest(".search-bar")) {
            dropdownList.classList.remove("visible"); // Hide dropdown if clicked outside
        }
    });

    // Trigger search for area on button click
    document.getElementById("search-area-button").addEventListener("click", searchArea);
    document.getElementById("search-button").addEventListener("click", searchUsers);

    // Initial data fetch
    applySavedTheme();
    fetchUsers();
});