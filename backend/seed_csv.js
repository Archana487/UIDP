const db = require('./config/db');
const fs = require('fs');
const path = require('path');

const loadCSV = async () => {
    try {
        console.log('Waiting for database initialization...');
        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log('Reading data.csv...');
        const csvPath = path.join(__dirname, 'data.csv');

        if (!fs.existsSync(csvPath)) {
            console.warn('⚠️ data.csv not found. Skipping database seed process.');
            process.exit(0);
        }

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
        process.exit(0);
    } catch (err) {
        console.error('Error loading CSV data:', err);
        process.exit(1);
    }
};

loadCSV();



