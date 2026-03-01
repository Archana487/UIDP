const db = require('./config/db');
const fs = require('fs');
const path = require('path');

const initDB = async () => {
    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('Initializing database schema...');
        // Split by semicolon to run individually for better error tracking if needed
        // But SQLite exec can handle multiple statements
        await db.exec(schema);

        console.log('Database tables verified/created successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error initializing database:', err);
        process.exit(1);
    }
};

initDB();
