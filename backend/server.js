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
            console.log('Adding initial data set (from data.csv)...');

            // Create default admin
            await db.run("INSERT INTO users (username, password, role) VALUES ('admin', 'password', 'admin')");
            console.log('Initial admin user created.');

            // Load CSV Data
            const csvPath = path.join(__dirname, 'data.csv');
            if (fs.existsSync(csvPath)) {
                const content = fs.readFileSync(csvPath, 'utf8');
                const lines = content.split('\n').filter(l => l.trim());
                const headers = lines[0].split('\t').map(h => h.trim());

                let count = 0;
                for (let i = 1; i < lines.length; i++) {
                    const cols = lines[i].split('\t').map(c => c.trim());
                    if (cols.length < headers.length) continue;

                    const row = {};
                    headers.forEach((h, idx) => { row[h] = cols[idx]; });

                    await db.run(
                        `INSERT INTO infrastructure_assets 
                         (asset_name, asset_type, location, ward_no, installation_date, condition_status, last_maintenance_date, responsible_department)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            row['asset_name'] || 'Unknown Asset',
                            row['asset_type'] || 'Other',
                            row['location'] || 'Unknown Location',
                            parseInt(row['ward_no']) || 1,
                            row['installation_date'] || '2020-01-01',
                            row['condition_status'] || 'Good',
                            row['last_maintenance_date'] || null,
                            row['responsible_department'] || 'General Maintenance'
                        ]
                    );
                    count++;
                }
                console.log(`✅ ${count} records loaded from data.csv successfully.`);
            } else {
                console.warn('⚠️ data.csv not found. Skipping infrastructure data seed.');
            }
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
