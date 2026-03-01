const db = require('./config/db');
const fs = require('fs');
const path = require('path');

const loadCSV = async () => {
    try {
        console.log('Waiting for database initialization...');
        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log('Reading data.csv...');
        const csvPath = path.join(__dirname, 'data.csv');
        const content = fs.readFileSync(csvPath, 'utf8');
        const lines = content.split('\n').filter(l => l.trim());
        const headers = lines[0].split('\t').map(h => h.trim());

        console.log('Clearing old data...');
        await db.exec('DELETE FROM maintenance_records; DELETE FROM infrastructure_assets;');
        console.log('Tables cleared.');

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
                    row['asset_name'],
                    row['asset_type'],
                    row['location'],
                    parseInt(row['ward_no']),
                    row['installation_date'],
                    row['condition_status'],
                    row['last_maintenance_date'],
                    row['responsible_department']
                ]
            );
            count++;
        }

        console.log(`✅ ${count} records loaded from data.csv successfully.`);
        process.exit(0);
    } catch (err) {
        console.error('Error loading CSV data:', err);
        process.exit(1);
    }
};

loadCSV();



