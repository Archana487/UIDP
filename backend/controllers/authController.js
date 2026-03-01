const db = require('../config/db');

const authController = {
    register: async (req, res) => {
        const { username, password, role } = req.body;

        if (!username || !password || !role) {
            return res.status(400).json({ message: 'Username, password and role are required' });
        }

        try {
            // Check if user already exists
            const existingUser = await db.get('SELECT * FROM users WHERE username = ?', [username]);
            if (existingUser.row) {
                return res.status(400).json({ message: 'Username already taken' });
            }

            // Create new user
            const result = await db.run(
                'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
                [username, password, role]
            );

            res.status(201).json({
                message: 'User registered successfully',
                user: {
                    id: result.lastID,
                    username,
                    role
                }
            });
        } catch (err) {
            console.error('Registration error:', err);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    login: async (req, res) => {
        const { username, password, role } = req.body;

        try {
            // Find user
            const result = await db.get('SELECT * FROM users WHERE username = ?', [username]);
            const user = result.row;

            if (!user) {
                return res.status(401).json({ message: 'User not found. Please register first.' });
            }

            // Check password
            if (user.password !== password) {
                return res.status(401).json({ message: 'Invalid password' });
            }

            // Check role match
            if (user.role !== role) {
                return res.status(403).json({ message: `Access denied. Selected role '${role}' does not match your registered role.` });
            }

            res.status(200).json({
                message: 'Login successful',
                user: {
                    id: user.user_id,
                    username: user.username,
                    role: user.role
                }
            });
        } catch (err) {
            console.error('Login error:', err);
            res.status(500).json({ message: 'Internal server error', error: err.message, stack: err.stack });
        }
    }
};

module.exports = authController;
