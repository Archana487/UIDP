const db = require('./config/db');

async function migrate() {
    try {
        console.log("Migrating infrastructure_assets...");
        await db.exec(`ALTER TABLE infrastructure_assets ADD COLUMN description TEXT;`);
    } catch (e) {
        console.log("description column might already exist", e.message);
    }

    try {
        console.log("Migrating maintenance_records: image_data...");
        await db.exec(`ALTER TABLE maintenance_records ADD COLUMN image_data TEXT;`);
    } catch (e) {
        console.log("image_data column might already exist", e.message);
    }

    try {
        console.log("Migrating maintenance_records: issue_status...");
        await db.exec(`ALTER TABLE maintenance_records ADD COLUMN issue_status VARCHAR(50) DEFAULT 'Open';`);
    } catch (e) {
        console.log("issue_status column might already exist", e.message);
    }

    console.log("Migration complete.");
}

migrate();
