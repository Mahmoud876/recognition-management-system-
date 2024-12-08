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
const usersFile = path.join(__dirname, 'data', 'users.json');
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
    const prefix = username.split("-")[0].toLowerCase(); // Normalize to lowercase
    return governorates[prefix] || "Unknown"; // Default to "Unknown" if not found
};

const extractIdFromUsername = (username) => {
    const idMatch = username.match(/\d+$/); // Extract trailing numbers from username
    return idMatch ? idMatch[0] : "undefined"; // Default to "undefined" if no numbers are found
};


// Helper: Ensure JSON file exists
const ensureFileExists = (filePath, defaultData = []) => {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    }
};

// Ensure required JSON files exist
ensureFileExists(usersFile);
ensureFileExists(computersFile);
ensureFileExists(requestsFile);
ensureFileExists(pendingUsersFile);
ensureFileExists(rejectedUsersFile);

// Helper: Read JSON file
const readJSON = (filePath) => {
    try {
        const data = fs.readFileSync(filePath, 'utf8'); // Read the file
        console.log(`File read successfully: ${filePath}`);
        return JSON.parse(data); // Parse and return JSON data
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
        return []; // Return an empty array if the file cannot be read
    }
};

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

// Log missing images
app.use('/images/pending', (req, res, next) => {
    console.log(`Image request: ${req.url}`);
    const filePath = path.join(pendingUsersImageFolder, req.url);
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
    }
    next();
});

// New API Endpoints for Pending Users

// Fetch pending users with images


// Accept or reject pending user
app.post('/api/verify_pending_users/:name', (req, res) => {
    const { name } = req.params;
    const { action } = req.body; // "accept" or "reject"
    const pendingUsers = readJSON(pendingUsersFile);
    const rejectedUsers = readJSON(rejectedUsersFile);
    const acceptedUsers = readJSON(usersFile);
    

    // Find the user in the pending list
    const userIndex = pendingUsers.findIndex((user) => user.name === name);

    if (userIndex === -1) {
        return res.status(404).json({ message: `User ${name} not found.` });
    }

    const [user] = pendingUsers.splice(userIndex, 1); // Remove the user from pending
    const imagePath = path.join(pendingUsersImageFolder, `${name}.png`);

    if (action === 'accept') {
        // Determine governorate and ID from username
        const area = getAreaFromUsername(name);
        const id = extractIdFromUsername(name);
        const newUser = {
            id: parseInt(id, 10),
            name: user.name,
            username: user.name,
            area: area,
        };
        

        // Add user to accepted list
        acceptedUsers.push(newUser);
        writeJSON(usersFile, acceptedUsers);

        // Move image to "users" folder
        const newImagePath = path.join(acceptedUsersImageFolder, `${name}.png`);
        if (fs.existsSync(imagePath)) {
            try {
                fs.renameSync(imagePath, newImagePath);
            } catch (error) {
                console.error(`Error moving image for accepted user: ${error.message}`);
            }
        }
    } else if (action === 'reject') {
        // Add user to rejected list
        rejectedUsers.push(user);
        writeJSON(rejectedUsersFile, rejectedUsers);

        // Move image to "rejected" folder
        const newImagePath = path.join(rejectedUsersImageFolder, `${name}.png`);
        if (fs.existsSync(imagePath)) {
            try {
                fs.renameSync(imagePath, newImagePath);
            } catch (error) {
                console.error(`Error moving image for rejected user: ${error.message}`);
            }
        }
    }

    // Update pending_users.json
    writeJSON(pendingUsersFile, pendingUsers);

    res.json({ message: `User ${name} has been ${action === 'accept' ? 'accepted' : 'rejected'}.` });
});



// Original API Endpoints (Unchanged)

// 1. Get Dashboard Data (Users and Computers)
app.get('/api/dashboard', (req, res) => {
    const users = readJSON(usersFile);
    const computers = readJSON(computersFile);

    const totalUsers = users.length;
    const totalComputers = computers.length;

    res.json({ 
        totalUsers, 
        totalComputers, 
        users, 
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
    const users = readJSON(usersFile);

    const userIndex = requests.findIndex((r) => r.id === parseInt(id));

    if (userIndex !== -1) {
        if (action === "accept") {
            users.push(requests[userIndex]);
        }
        requests.splice(userIndex, 1);
        writeJSON(requestsFile, requests);
        writeJSON(usersFile, users);
        res.json({ message: `User ${action === 'accept' ? 'accepted' : 'rejected'}.` });
    } else {
        res.status(404).json({ message: 'User not found in requests.' });
    }
});

// 4. Get All Users
app.get('/api/users', (req, res) => {
    const search = (req.query.search || '').toLowerCase().trim();
    const area = (req.query.area || '').toLowerCase().trim();
    const users = readJSON(usersFile);

    let filteredUsers = users;

    // Filter by area
    if (area) {
        filteredUsers = filteredUsers.filter(user => 
            user.area && user.area.toLowerCase().includes(area)
        );
    }

    // Filter by search query
    if (search) {
        filteredUsers = filteredUsers.filter(user =>
            user.name.toLowerCase().includes(search) ||
            user.id.toString().includes(search)
        );
    }

    const areas = [...new Set(users.map(user => user.area))];
    res.json({ areas, users: filteredUsers });
});



// 5. Remove a User
app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const numericId = parseInt(id, 10);

    const users = readJSON(usersFile);
    const updatedUsers = users.filter(user => user.id !== numericId);

    if (users.length === updatedUsers.length) {
        return res.status(404).json({ message: `User with ID ${numericId} not found.` });
    }

    writeJSON(usersFile, updatedUsers);
    res.json({ message: `User with ID ${numericId} removed successfully.` });
});

// 6. Add a New User
app.post('/api/users', (req, res) => {
    const users = readJSON(usersFile); // Read the current users
    const { id, name, username, area } = req.body;

    // Ensure the ID is converted to an integer
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
        return res.status(400).json({ message: "ID must be a valid integer." });
    }

    // Check for duplicate IDs
    if (users.some(user => user.id === numericId)) {
        return res.status(400).json({ message: "User with this ID already exists." });
    }

    // Create a new user object with numeric ID
    const newUser = { id: numericId, name, username, area };
    users.push(newUser);

    // Write the updated list back to users.json
    writeJSON(usersFile, users);

    res.json({ message: "User added successfully.", user: newUser });
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
