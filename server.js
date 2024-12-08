const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// File paths
const availableClientsFile = path.join(__dirname, 'data', 'available_clients.json');
const computersFile = path.join(__dirname, 'data', 'computers.json');
const requestsFile = path.join(__dirname, 'data', 'requests.json');
const pendingUsersFile = path.join(__dirname, 'data', 'pending_users.json');
const rejectedUsersFile = path.join(__dirname, 'data', 'rejected.json');

// Image folders
const pendingUsersImageFolder = "C:/regonation face/data/pending_users";
const rejectedUsersImageFolder = path.join(__dirname, 'data', 'rejected');
const acceptedUsersImageFolder = path.join(__dirname, 'data', 'users');

// Governorates List
const governorates = {
    an: "Aswan",
    au: "Asyut",
    ax: "Alexandria",
    bh: "Beheira",
    bn: "Beni Suef",
    ci: "Cairo",
    dk: "Dakahlia",
    dm: "Damietta",
    fi: "Faiyum",
    ga: "Gharbia",
    gz: "Giza",
    im: "Ismailia",
    kh: "Kafr El Sheikh",
    lx: "Luxor",
    sr: "Sharqia",
    sz: "Suez",
    nv: "Wadi Gedid",
    mo: "Monufia",
    mt: "Matrouh",
    mn: "Minya",
    ql: "Qalyubia",
    ns: "North Sinai",
    ss: "South Sinai",
    sh: "Sohag",
    pr: "Port Said",
    rd: "Red Sea",
    qn: "Qena"
};

// Function to get governorate from username (case-insensitive)
const getAreaFromUsername = (username) => {
    const prefix = username.split("-")[0].toLowerCase(); // Extract first two letters
    const area = governorates[prefix] || "Unknown"; // Match with governorates or return 'Unknown'
    console.log(`Mapping username "${username}" to area "${area}"`); // Debugging
    return area;
};

const extractIdFromUsername = (username) => {
    const idMatch = username.match(/\d+$/); // Extract trailing numbers from username
    return idMatch ? idMatch[0] : "undefined"; // Default to "undefined" if no numbers are found
};

// Helper: Ensure JSON file exists
const ensureFileExists = (filePath, defaultData = {}) => {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    }
};

// Ensure required JSON files exist
ensureFileExists(availableClientsFile, { clients: [] });
ensureFileExists(computersFile, []);
ensureFileExists(requestsFile, []);
ensureFileExists(pendingUsersFile, {});
ensureFileExists(rejectedUsersFile, []);

// Helper: Read JSON file
const readJSON = (filePath) => {
    try {
        const data = fs.readFileSync(filePath, 'utf8'); // Read the file
        console.log(`File read successfully: ${filePath}`);
        return JSON.parse(data); // Parse and return JSON data
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
        return {}; // Return an empty object if the file cannot be read
    }
};

// Helper: Write JSON file
const writeJSON = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2)); // Write data in JSON format
        console.log(`File written successfully to ${filePath}`);
    } catch (error) {
        console.error(`Error writing file ${filePath}:`, error);
    }
};

// Middleware to log requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Serve images from folders
app.use('/images/pending', express.static(pendingUsersImageFolder));
app.use('/images/rejected', express.static(rejectedUsersImageFolder));
app.use('/images/users', express.static(acceptedUsersImageFolder));

// New API Endpoints for Pending Users

// Fetch pending users with images
app.get('/api/verify_pending_users', (req, res) => {
    const pendingUsers = readJSON(pendingUsersFile);

    // Transform the pending users into the correct format
    const data = Object.entries(pendingUsers).map(([name, filePath]) => {
        const folderPath = path.dirname(filePath); // Extract folder path
        return {
            name,
            image: `/images/pending/${name}/1.jpg`, // Map to server-hosted image path
            folder: folderPath // Add folder path if needed for further processing
        };
    });

    console.log("Transformed Pending Users:", data); // Debugging log
    res.json(data);
});






// Accept or reject pending user
// Fetch pending users with images
// app.get('/api/verify_pending_users', (req, res) => {
//     const pendingUsers = readJSON(pendingUsersFile);

//     // Transform pending users to the correct format
//     const data = Object.entries(pendingUsers).map(([name, filePath]) => ({
//         name,
//         image: `/images/pending/${path.basename(filePath)}`, // Serve the image from the pending folder
//     }));

//     console.log("Transformed Pending Users:", data); // Debugging
//     res.json(data);
// });

// Accept or reject pending user
app.post('/api/verify_pending_users/:name', (req, res) => {
    const { name } = req.params;
    const { action } = req.body;

    const pendingUsers = readJSON(pendingUsersFile);
    const availableClients = readJSON(availableClientsFile);

    const userFolderPath = path.join(pendingUsersImageFolder, name);
    const userImagePath = path.join(userFolderPath, '1.jpg');

    if (!fs.existsSync(userImagePath)) {
        return res.status(400).json({ message: `Image for user ${name} not found.` });
    }

    if (action === 'accept') {
        // Add user to available_clients.json
        availableClients.clients = availableClients.clients || [];
        if (!availableClients.clients.includes(name)) {
            availableClients.clients.push(name);
            writeJSON(availableClientsFile, availableClients);
        }

        // Move the entire folder to Users_DataBase
        const targetFolderPath = path.join(__dirname, 'data', 'Users_DataBase', name);
        if (fs.existsSync(userFolderPath)) {
            try {
                fs.renameSync(userFolderPath, targetFolderPath);
            } catch (error) {
                console.error(`Error moving folder for user ${name}:`, error.message);
                return res.status(500).json({ message: `Failed to move folder for user ${name}.` });
            }
        } else {
            return res.status(400).json({ message: `Folder for user ${name} not found.` });
        }
    } else if (action === 'reject') {
        // Optionally handle rejection logic here
        return res.json({ message: `User ${name} has been rejected.` });
    } else {
        return res.status(400).json({ message: `Invalid action: ${action}` });
    }

    // Remove the user from pending_users.json
    delete pendingUsers[name];
    writeJSON(pendingUsersFile, pendingUsers);

    res.json({ message: `User ${name} has been ${action}.` });
});
// 1. Get Dashboard Data (Users and Computers)
app.get('/api/dashboard', (req, res) => {
    const availableClients = readJSON(availableClientsFile);
    const computers = readJSON(computersFile);

    const totalUsers = availableClients.clients.length;
    const totalComputers = computers.length;

    res.json({ 
        totalUsers, 
        totalComputers, 
        clients: availableClients.clients, 
        computers 
    });
});

// 2. Verify Users - Get Pending Requests
app.get('/api/verify_users', (req, res) => {
    const requests = readJSON(requestsFile);
    res.json(requests);
});

// 3. Verify Users - Accept/Reject Request
app.post('/api/verify_users/:id', (req, res) => {
    const { id } = req.params;
    const { action } = req.body; // action = "accept" or "reject"
    const requests = readJSON(requestsFile);
    const availableClients = readJSON(availableClientsFile);

    const userIndex = requests.findIndex((r) => r.id === parseInt(id));

    if (userIndex !== -1) {
        if (action === "accept") {
            availableClients.clients.push(requests[userIndex].username);
        }
        requests.splice(userIndex, 1);
        writeJSON(requestsFile, requests);
        writeJSON(availableClientsFile, availableClients);
        res.json({ message: `User ${action === 'accept' ? 'accepted' : 'rejected'}.` });
    } else {
        res.status(404).json({ message: 'User not found in requests.' });
    }
});

// 4. Get All Users
app.get('/api/users', (req, res) => {
    const search = (req.query.search || '').toLowerCase().trim();
    const area = (req.query.area || '').toLowerCase().trim();
    const availableClients = readJSON(availableClientsFile);

    // Filter users by area and search query
    const filteredClients = availableClients.clients.filter((client) => {
        const clientArea = getAreaFromUsername(client).toLowerCase(); // Map username to area
        return (
            (!area || clientArea.includes(area)) && // Area filter
            (!search || client.toLowerCase().includes(search)) // Search query filter
        );
    });

    // Extract unique areas for dropdown population
    const areas = [...new Set(availableClients.clients.map(getAreaFromUsername))];

    console.log(`Filtered Clients:`, filteredClients); // Debugging
    console.log(`Areas:`, areas); // Debugging

    res.json({ areas, users: filteredClients });
});
// 5. Remove a User
app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;

    const availableClients = readJSON(availableClientsFile);
    const updatedClients = availableClients.clients.filter(client => client !== id);

    if (availableClients.clients.length === updatedClients.length) {
        return res.status(404).json({ message: `User with ID ${id} not found.` });
    }

    // Remove user's folder and files (optional)
    const userFolder = path.join(acceptedUsersImageFolder, id);
    if (fs.existsSync(userFolder)) {
        try {
            fs.rmdirSync(userFolder, { recursive: true });
            console.log(`Deleted folder for user ${id}`);
        } catch (error) {
            console.error(`Error deleting folder for user ${id}:`, error.message);
        }
    }

    availableClients.clients = updatedClients;
    writeJSON(availableClientsFile, availableClients);

    res.json({ message: `User with ID ${id} removed successfully.` });
});


// 6. Add a New User
app.post('/api/users', (req, res) => {
    const availableClients = readJSON(availableClientsFile); // Read the current users
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ message: "Username is required." });
    }

    if (availableClients.clients.includes(username)) {
        return res.status(400).json({ message: "User with this username already exists." });
    }

    availableClients.clients.push(username);

    // Write the updated list back to available_clients.json
    writeJSON(availableClientsFile, availableClients);

    res.json({ message: "User added successfully.", username });
});

// 7. Get Computers Data
app.get('/api/computers', (req, res) => {
    const computers = readJSON(computersFile);
    res.json(computers);
});

// 8. Update Computer Status
app.post('/api/computers/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const computers = readJSON(computersFile);

    const computerIndex = computers.findIndex((c) => c.id === parseInt(id));
    if (computerIndex !== -1) {
        computers[computerIndex].status = status;
        writeJSON(computersFile, computers);
        res.json({ message: `Computer ${id} status updated to ${status}.` });
    } else {
        res.status(404).json({ message: 'Computer not found.' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
