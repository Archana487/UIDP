const fs = require('fs');
const path = require('path');
const db = require('./config/db');

const seedData = async () => {
    try {
        console.log('Clearing existing data...');
        await db.exec('DELETE FROM infrastructure_assets;');

        const csvPath = path.join(__dirname, 'data.csv');
        const content = fs.readFileSync(csvPath, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());

        // Skip header
        const dataRows = lines.slice(1);

        console.log(`Found ${dataRows.length} records in data.csv. Starting insertion...`);

        for (const line of dataRows) {
            const [id, name, type, area, ward, installDate, status, lastMaintDate, dept] = line.split('\t');

            if (!name) continue;

            // Format dates if needed (they seem to be DD-MM-YYYY in the CSV, but DB might prefer YYYY-MM-DD)
            const formatDate = (dateStr) => {
                if (!dateStr || dateStr === 'undefined') return null;
                const [d, m, y] = dateStr.split('-');
                if (!y) return dateStr; // Fallback if already in wrong/different format
                return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
            };

            const formattedInstallDate = formatDate(installDate);
            const formattedLastMaintDate = formatDate(lastMaintDate);

            await db.run(
                'INSERT INTO infrastructure_assets (asset_name, asset_type, location, ward_no, installation_date, condition_status, last_maintenance_date, responsible_department) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [name, type, area, parseInt(ward), formattedInstallDate, status, formattedLastMaintDate, dept]
            );
        }

        console.log('Seeding completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding data:', err);
        process.exit(1);
    }
};

seedData();
