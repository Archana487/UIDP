const db = require('../config/db');

// Get all maintenance records
exports.getAllMaintenance = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM maintenance_records ORDER BY maintenance_date DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Add maintenance record
exports.addMaintenanceRecord = async (req, res) => {
    const { asset_id, maintenance_date, maintenance_cost, remarks, new_status, image_data, issue_status } = req.body;

    try {
        await db.exec('BEGIN TRANSACTION');

        const result = await db.run(
            'INSERT INTO maintenance_records (asset_id, maintenance_date, maintenance_cost, remarks, image_data, issue_status) VALUES (?, ?, ?, ?, ?, ?)',
            [asset_id, maintenance_date, maintenance_cost, remarks, image_data || null, issue_status || 'Open']
        );

        // Update the asset
        await db.run(
            'UPDATE infrastructure_assets SET last_maintenance_date = ?, condition_status = ? WHERE asset_id = ?',
            [maintenance_date, new_status, asset_id]
        );

        await db.exec('COMMIT');
        res.status(201).json({ maintenance_id: result.lastID, ...req.body });
    } catch (err) {
        await db.exec('ROLLBACK');
        res.status(500).json({ error: err.message });
    }
};

// Get history for an asset
exports.getMaintenanceHistory = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM maintenance_records WHERE asset_id = ? ORDER BY maintenance_date DESC',
            [req.params.assetId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update issue status
exports.updateStatus = async (req, res) => {
    try {
        const { issue_status } = req.body;
        await db.run(
            'UPDATE maintenance_records SET issue_status = ? WHERE maintenance_id = ?',
            [issue_status, req.params.id]
        );
        res.json({ message: 'Status updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
