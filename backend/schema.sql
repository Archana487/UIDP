-- SMART CITY MANAGEMENT Schema (SQLite Compatible)

-- Table: users
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user'
);

-- Table: infrastructure_assets
CREATE TABLE IF NOT EXISTS infrastructure_assets (
    asset_id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_name VARCHAR(255) NOT NULL,
    asset_type VARCHAR(50) NOT NULL, -- Road, Utility, Facility
    location VARCHAR(255) NOT NULL,
    ward_no INTEGER NOT NULL,
    installation_date DATE NOT NULL,
    condition_status VARCHAR(50) DEFAULT 'Good', -- Good, Moderate, Poor
    last_maintenance_date DATE,
    responsible_department VARCHAR(255) NOT NULL,
    description TEXT
);

-- Table: maintenance_records
CREATE TABLE IF NOT EXISTS maintenance_records (
    maintenance_id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id INTEGER REFERENCES infrastructure_assets(asset_id) ON DELETE CASCADE,
    maintenance_date DATE NOT NULL,
    maintenance_cost DECIMAL(12, 2) NOT NULL,
    remarks TEXT,
    image_data TEXT,
    issue_status VARCHAR(50) DEFAULT 'Open',
    reported_by VARCHAR(255) DEFAULT 'admin'
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_asset_type ON infrastructure_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_ward_no ON infrastructure_assets(ward_no);
CREATE INDEX IF NOT EXISTS idx_condition_status ON infrastructure_assets(condition_status);

-- Initial Admin (optional, will be auto-created if login attempted)
-- INSERT INTO users (username, password, role) VALUES ('admin', 'admin123', 'admin');
