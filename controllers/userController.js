import bcrypt from 'bcryptjs';
import pool from '../config/database.js';

// Get all users (Admin only)
export const getAllUsers = async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                u.id, u.email, u.full_name, u.role, u.position, u.phone, 
                u.is_active, u.created_at, u.last_login,
                COUNT(p.id) as total_pelanggan
            FROM users u
            LEFT JOIN pelanggan p ON u.id = p.user_id
            WHERE u.role != 'admin'
            GROUP BY u.id, u.email, u.full_name, u.role, u.position, u.phone, u.is_active, u.created_at, u.last_login
            ORDER BY u.created_at DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get user by ID (Admin only)
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute(`
            SELECT 
                u.id, u.email, u.full_name, u.role, u.position, u.phone, 
                u.is_active, u.created_at, u.last_login,
                COUNT(p.id) as total_pelanggan
            FROM users u
            LEFT JOIN pelanggan p ON u.id = p.user_id
            WHERE u.id = ? AND u.role != 'admin'
            GROUP BY u.id, u.email, u.full_name, u.role, u.position, u.phone, u.is_active, u.created_at, u.last_login
        `, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create new user (Admin only)
export const createUser = async (req, res) => {
    try {
        const { email, full_name, position, phone, password } = req.body;

        // Validate required fields
        if (!email || !full_name || !password) {
            return res.status(400).json({ error: 'Email, full name, and password are required' });
        }

        // Check if email already exists
        const [existingUser] = await pool.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const [result] = await pool.execute(`
            INSERT INTO users (email, full_name, role, position, phone, password) 
            VALUES (?, ?, 'user', ?, ?, ?)
        `, [email, full_name, position || null, phone || null, hashedPassword]);

        res.status(201).json({
            message: 'User created successfully',
            userId: result.insertId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Bulk create users (Admin only)
export const createBulkUsers = async (req, res) => {
    try {
        const { users } = req.body; // Array of user objects
        
        if (!Array.isArray(users) || users.length === 0) {
            return res.status(400).json({ error: 'Users array is required' });
        }

        const createdUsers = [];
        const errors = [];

        for (const userData of users) {
            try {
                const { email, full_name, position, phone, password } = userData;

                // Validate required fields
                if (!email || !full_name || !password) {
                    errors.push({ email, error: 'Email, full name, and password are required' });
                    continue;
                }

                // Check if email already exists
                const [existingUser] = await pool.execute(
                    'SELECT id FROM users WHERE email = ?',
                    [email]
                );

                if (existingUser.length > 0) {
                    errors.push({ email, error: 'Email already exists' });
                    continue;
                }

                // Hash password
                const hashedPassword = await bcrypt.hash(password, 10);

                // Insert new user
                const [result] = await pool.execute(`
                    INSERT INTO users (email, full_name, role, position, phone, password) 
                    VALUES (?, ?, 'user', ?, ?, ?)
                `, [email, full_name, position || null, phone || null, hashedPassword]);

                createdUsers.push({
                    id: result.insertId,
                    email,
                    full_name,
                    position,
                    phone
                });

            } catch (error) {
                errors.push({ email: userData.email, error: error.message });
            }
        }

        res.status(201).json({
            message: `Bulk user creation completed. ${createdUsers.length} users created, ${errors.length} errors.`,
            createdUsers,
            errors
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update user (Admin only)
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, full_name, position, phone, is_active, password } = req.body;

        // Check if user exists and is not admin
        const [existingUser] = await pool.execute(
            'SELECT id, role FROM users WHERE id = ?',
            [id]
        );

        if (existingUser.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (existingUser[0].role === 'admin') {
            return res.status(403).json({ error: 'Cannot modify admin users' });
        }

        // Build update query dynamically
        const updateFields = [];
        const updateValues = [];

        if (email) {
            // Check if new email already exists
            const [emailCheck] = await pool.execute(
                'SELECT id FROM users WHERE email = ? AND id != ?',
                [email, id]
            );
            if (emailCheck.length > 0) {
                return res.status(400).json({ error: 'Email already exists' });
            }
            updateFields.push('email = ?');
            updateValues.push(email);
        }

        if (full_name) {
            updateFields.push('full_name = ?');
            updateValues.push(full_name);
        }

        if (position !== undefined) {
            updateFields.push('position = ?');
            updateValues.push(position);
        }

        if (phone !== undefined) {
            updateFields.push('phone = ?');
            updateValues.push(phone);
        }

        if (is_active !== undefined) {
            updateFields.push('is_active = ?');
            updateValues.push(is_active);
        }

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateFields.push('password = ?');
            updateValues.push(hashedPassword);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        updateValues.push(id);

        await pool.execute(
            `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
            updateValues
        );

        res.json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete user (Admin only) - Will cascade delete pelanggan
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if user exists and is not admin
        const [existingUser] = await pool.execute(
            'SELECT id, role, email FROM users WHERE id = ?',
            [id]
        );

        if (existingUser.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (existingUser[0].role === 'admin') {
            return res.status(403).json({ error: 'Cannot delete admin users' });
        }

        // Get pelanggan count before deletion (for logging)
        const [pelangganCount] = await pool.execute(
            'SELECT COUNT(*) as count FROM pelanggan WHERE user_id = ?',
            [id]
        );

        // Delete user (will cascade delete pelanggan due to foreign key constraint)
        await pool.execute('DELETE FROM users WHERE id = ?', [id]);

        res.json({ 
            message: 'User deleted successfully',
            deletedPelanggan: pelangganCount[0].count
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Bulk delete users (Admin only)
export const deleteBulkUsers = async (req, res) => {
    try {
        const { userIds } = req.body; // Array of user IDs
        
        if (!Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ error: 'User IDs array is required' });
        }

        const deletedUsers = [];
        const errors = [];
        let totalDeletedPelanggan = 0;

        for (const userId of userIds) {
            try {
                // Check if user exists and is not admin
                const [existingUser] = await pool.execute(
                    'SELECT id, role, email FROM users WHERE id = ?',
                    [userId]
                );

                if (existingUser.length === 0) {
                    errors.push({ userId, error: 'User not found' });
                    continue;
                }

                if (existingUser[0].role === 'admin') {
                    errors.push({ userId, error: 'Cannot delete admin users' });
                    continue;
                }

                // Get pelanggan count before deletion
                const [pelangganCount] = await pool.execute(
                    'SELECT COUNT(*) as count FROM pelanggan WHERE user_id = ?',
                    [userId]
                );

                // Delete user (will cascade delete pelanggan)
                await pool.execute('DELETE FROM users WHERE id = ?', [userId]);

                deletedUsers.push({
                    userId,
                    email: existingUser[0].email,
                    deletedPelanggan: pelangganCount[0].count
                });

                totalDeletedPelanggan += pelangganCount[0].count;

            } catch (error) {
                errors.push({ userId, error: error.message });
            }
        }

        res.json({
            message: `Bulk user deletion completed. ${deletedUsers.length} users deleted, ${errors.length} errors.`,
            deletedUsers,
            totalDeletedPelanggan,
            errors
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Toggle user active status (Admin only)
export const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if user exists and is not admin
        const [existingUser] = await pool.execute(
            'SELECT id, role, is_active FROM users WHERE id = ?',
            [id]
        );

        if (existingUser.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (existingUser[0].role === 'admin') {
            return res.status(403).json({ error: 'Cannot modify admin users' });
        }

        const newStatus = !existingUser[0].is_active;

        await pool.execute(
            'UPDATE users SET is_active = ? WHERE id = ?',
            [newStatus, id]
        );

        res.json({ 
            message: `User ${newStatus ? 'activated' : 'deactivated'} successfully`,
            is_active: newStatus
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
