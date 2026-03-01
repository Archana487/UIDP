const db = require('../config/db');

// Get all assets with filtering
exports.getAllAssets = async (req, res) => {
    try {
        const { type, ward, status, search } = req.query;
        let query = "SELECT *, (strftime('%s', 'now') - strftime('%s', last_maintenance_date)) > (365 * 24 * 60 * 60) as maintenance_required FROM infrastructure_assets WHERE 1=1";
        let params = [];

        if (type) {
            query += " AND asset_type = ?";
            params.push(type);
        }
        if (ward) {
            query += " AND ward_no = ?";
            params.push(parseInt(ward));
        }
        if (status) {
            query += " AND condition_status = ?";
            params.push(status);
        }
        if (search) {
            query += " AND (asset_name LIKE ? OR location LIKE ?)";
            params.push(`%${search}%`, `%${search}%`);
        }

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get single asset
exports.getAssetById = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM infrastructure_assets WHERE asset_id = ?', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Asset not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create asset
exports.createAsset = async (req, res) => {
    try {
        const { asset_name, asset_type, location, ward_no, installation_date, condition_status, responsible_department, description } = req.body;
        const result = await db.run(
            'INSERT INTO infrastructure_assets (asset_name, asset_type, location, ward_no, installation_date, condition_status, responsible_department, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [asset_name, asset_type, location, ward_no, installation_date, condition_status, responsible_department, description]
        );
        res.status(201).json({ asset_id: result.lastID, ...req.body });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update asset
exports.updateAsset = async (req, res) => {
    try {
        const { asset_name, asset_type, location, ward_no, condition_status, responsible_department, description } = req.body;
        await db.run(
            'UPDATE infrastructure_assets SET asset_name=?, asset_type=?, location=?, ward_no=?, condition_status=?, responsible_department=?, description=? WHERE asset_id=?',
            [asset_name, asset_type, location, ward_no, condition_status, responsible_department, description, req.params.id]
        );
        res.json({ asset_id: req.params.id, ...req.body });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete asset
exports.deleteAsset = async (req, res) => {
    try {
        await db.run('DELETE FROM infrastructure_assets WHERE asset_id = ?', [req.params.id]);
        res.json({ message: 'Asset deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Dashboard Stats
exports.getDashboardStats = async (req, res) => {
    try {
        const totalResult = await db.query('SELECT COUNT(*) as count FROM infrastructure_assets');
        const byTypeResult = await db.query('SELECT asset_type, COUNT(*) as count FROM infrastructure_assets GROUP BY asset_type');
        const poorResult = await db.query("SELECT COUNT(*) as count FROM infrastructure_assets WHERE condition_status = 'Poor'");
        const workingResult = await db.query("SELECT COUNT(*) as count FROM infrastructure_assets WHERE condition_status IN ('Good', 'Moderate')");
        const pendingResult = await db.query("SELECT COUNT(*) as count FROM maintenance_records WHERE issue_status = 'Open'");
        const inProgressResult = await db.query("SELECT COUNT(*) as count FROM maintenance_records WHERE issue_status = 'In Progress'");

        res.json({
            total: totalResult.rows[0].count,
            byType: byTypeResult.rows,
            damaged: poorResult.rows[0].count,
            working: workingResult.rows[0].count,
            pendingIssues: pendingResult.rows[0].count,
            underMaintenance: inProgressResult.rows[0].count
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
