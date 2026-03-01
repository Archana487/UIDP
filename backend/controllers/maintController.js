const db = require('../config/db');

// Get all maintenance records — filtered by username for citizens
exports.getAllMaintenance = async (req, res) => {
    try {
        const { username } = req.query;
        let query = 'SELECT * FROM maintenance_records';
        let params = [];

        if (username) {
            query += ' WHERE reported_by = ?';
            params.push(username);
        }

        query += ' ORDER BY maintenance_date DESC';
        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Add maintenance record — store who reported it
exports.addMaintenanceRecord = async (req, res) => {
    const { asset_id, maintenance_date, maintenance_cost, remarks, new_status, image_data, issue_status, reported_by } = req.body;

    try {
        await db.exec('BEGIN TRANSACTION');

        const result = await db.run(
            'INSERT INTO maintenance_records (asset_id, maintenance_date, maintenance_cost, remarks, image_data, issue_status, reported_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [asset_id, maintenance_date, maintenance_cost, remarks, image_data || null, issue_status || 'Open', reported_by || 'admin']
        );

        // Update the asset condition
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
