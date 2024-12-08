document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    const errorMessage = document.getElementById("error-message");

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault(); // Prevent default form submission

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();

        // Clear any previous error message
        errorMessage.textContent = "";

        try {
            // Make a POST request to the login API
            const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const result = await response.json();

                // Redirect based on the role from the server
                if (result.role === "superadmin") {
                    window.location.href = "/index.html"; // Super Admin Dashboard
                } else if (result.role === "admin") {
                    window.location.href = "/admin.html"; // Admin Dashboard
                } else {
                    errorMessage.textContent = "Invalid role. Please contact support.";
                }
            } else {
                // Handle non-OK responses
                const errorData = await response.json();
                errorMessage.textContent = errorData.message || "Invalid username or password.";
            }
        } catch (error) {
            // Handle network or server errors
            console.error("Error during login:", error);
            errorMessage.textContent = "An error occurred. Please try again.";
        }
    });
});
