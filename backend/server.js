const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const assetRoutes = require('./routes/assetRoutes');
const maintRoutes = require('./routes/maintRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/assets', assetRoutes);
app.use('/api/maintenance', maintRoutes);
app.use('/api/auth', authRoutes);

// Health check
app.get('/', (req, res) => {
    res.send('Smart City Management API is running...');
});

const initializeDatabase = async () => {
    const fs = require('fs');
    const path = require('path');
    const db = require('./config/db');

    try {
        console.log('Initializing database schema...');
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaCode = fs.readFileSync(schemaPath, 'utf8');
        await db.exec(schemaCode);

        console.log('Checking for missing data...');
        const check = await db.get('SELECT COUNT(*) as count FROM infrastructure_assets');

        if (check.row && check.row.count === 0) {
            console.log('Adding initial data set (fallback seed)...');
            // Basic fallback data inside server.js to guarantee the DB is usable
            await db.run("INSERT INTO users (username, password, role) VALUES ('admin', 'password', 'admin')");
            console.log('Initial admin user created.');
        }

        console.log('Database initialized successfully.');
    } catch (error) {
        console.error('Failed to initialize database during startup:', error);
    }
};

initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
