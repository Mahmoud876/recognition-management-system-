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

// Read JSON file helper
const readJSON = (filePath) => {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

// Write JSON file helper
const writeJSON = (filePath, data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// API Endpoints

// 1. Get Dashboard Data (Users and Computers)
app.get('/api/dashboard', (req, res) => {
    const users = readJSON(usersFile);
    const computers = readJSON(computersFile);
    res.json({ users, computers });
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
            // Move the request to verified users
            users.push(requests[userIndex]);
        }
        // Remove from pending requests
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
    const users = readJSON(usersFile);
    res.json(users);
});

// 5. Remove a User
app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const users = readJSON(usersFile);
    const updatedUsers = users.filter((user) => user.id !== parseInt(id));

    if (users.length === updatedUsers.length) {
        res.status(404).json({ message: 'User not found.' });
    } else {
        writeJSON(usersFile, updatedUsers);
        res.json({ message: 'User removed successfully.' });
    }
});

// 6. Get Computers Data
app.get('/api/computers', (req, res) => {
    const computers = readJSON(computersFile);
    res.json(computers);
});

// 7. Update Computer Status
app.post('/api/computers/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // status = "online" or "offline"
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
