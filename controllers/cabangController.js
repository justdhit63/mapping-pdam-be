import pool from '../config/database.js';

// ================== CABANG CRUD OPERATIONS ==================

// Get all cabang (Admin only)
export const getAllCabang = async (req, res) => {
    try {
        const [cabang] = await pool.execute(`
            SELECT 
                c.*,
                COUNT(u.id) as total_users
            FROM cabang c
            LEFT JOIN users u ON c.id = u.cabang_id
            GROUP BY c.id, c.kode_unit, c.nama_unit, c.alamat, c.telepon, c.is_active, c.created_at, c.updated_at
            ORDER BY c.kode_unit ASC
        `);
        res.json(cabang);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get cabang by ID (Admin only)
export const getCabangById = async (req, res) => {
    try {
        const { id } = req.params;
        const [cabang] = await pool.execute(`
            SELECT 
                c.*,
                COUNT(u.id) as total_users
            FROM cabang c
            LEFT JOIN users u ON c.id = u.cabang_id
            WHERE c.id = ?
            GROUP BY c.id, c.kode_unit, c.nama_unit, c.alamat, c.telepon, c.is_active, c.created_at, c.updated_at
        `, [id]);
        
        if (cabang.length === 0) {
            return res.status(404).json({ error: 'Cabang not found' });
        }
        
        // Get users in this cabang
        const [users] = await pool.execute(`
            SELECT id, email, full_name, role, position, phone, is_active, created_at
            FROM users 
            WHERE cabang_id = ?
            ORDER BY role DESC, full_name ASC
        `, [id]);
        
        res.json({
            ...cabang[0],
            users: users
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create new cabang (Admin only)
export const createCabang = async (req, res) => {
    try {
        const { kode_unit, nama_unit, alamat, telepon } = req.body;

        // Validate required fields
        if (!kode_unit || !nama_unit) {
            return res.status(400).json({ error: 'Kode unit and nama unit are required' });
        }

        // Check if kode_unit already exists
        const [existingCabang] = await pool.execute(
            'SELECT id FROM cabang WHERE kode_unit = ?',
            [kode_unit]
        );

        if (existingCabang.length > 0) {
            return res.status(400).json({ error: 'Kode unit already exists' });
        }

        // Insert new cabang
        const [result] = await pool.execute(`
            INSERT INTO cabang (kode_unit, nama_unit, alamat, telepon) 
            VALUES (?, ?, ?, ?)
        `, [kode_unit, nama_unit, alamat || null, telepon || null]);

        res.status(201).json({
            message: 'Cabang created successfully',
            cabangId: result.insertId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update cabang (Admin only)
export const updateCabang = async (req, res) => {
    try {
        const { id } = req.params;
        const { kode_unit, nama_unit, alamat, telepon, is_active } = req.body;

        // Check if cabang exists
        const [existingCabang] = await pool.execute(
            'SELECT id, kode_unit FROM cabang WHERE id = ?',
            [id]
        );

        if (existingCabang.length === 0) {
            return res.status(404).json({ error: 'Cabang not found' });
        }

        // Build update query dynamically
        const updateFields = [];
        const updateValues = [];

        if (kode_unit) {
            // Check if new kode_unit already exists (exclude current cabang)
            const [kodeCheck] = await pool.execute(
                'SELECT id FROM cabang WHERE kode_unit = ? AND id != ?',
                [kode_unit, id]
            );
            if (kodeCheck.length > 0) {
                return res.status(400).json({ error: 'Kode unit already exists' });
            }
            updateFields.push('kode_unit = ?');
            updateValues.push(kode_unit);
        }

        if (nama_unit) {
            updateFields.push('nama_unit = ?');
            updateValues.push(nama_unit);
        }

        if (alamat !== undefined) {
            updateFields.push('alamat = ?');
            updateValues.push(alamat);
        }

        if (telepon !== undefined) {
            updateFields.push('telepon = ?');
            updateValues.push(telepon);
        }

        if (is_active !== undefined) {
            updateFields.push('is_active = ?');
            updateValues.push(is_active);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        updateValues.push(id);

        await pool.execute(
            `UPDATE cabang SET ${updateFields.join(', ')} WHERE id = ?`,
            updateValues
        );

        res.json({ message: 'Cabang updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete cabang (Admin only)
export const deleteCabang = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if cabang exists
        const [existingCabang] = await pool.execute(
            'SELECT id, kode_unit, nama_unit FROM cabang WHERE id = ?',
            [id]
        );

        if (existingCabang.length === 0) {
            return res.status(404).json({ error: 'Cabang not found' });
        }

        // Check if cabang has users (optional - could set cabang_id to NULL instead)
        const [usersInCabang] = await pool.execute(
            'SELECT COUNT(*) as count FROM users WHERE cabang_id = ?',
            [id]
        );

        if (usersInCabang[0].count > 0) {
            // Set cabang_id to NULL for all users in this cabang before deleting
            await pool.execute(
                'UPDATE users SET cabang_id = NULL WHERE cabang_id = ?',
                [id]
            );
        }

        // Delete cabang
        await pool.execute('DELETE FROM cabang WHERE id = ?', [id]);

        res.json({ 
            message: 'Cabang deleted successfully',
            affectedUsers: usersInCabang[0].count
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Toggle cabang active status (Admin only)
export const toggleCabangStatus = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if cabang exists
        const [existingCabang] = await pool.execute(
            'SELECT id, is_active FROM cabang WHERE id = ?',
            [id]
        );

        if (existingCabang.length === 0) {
            return res.status(404).json({ error: 'Cabang not found' });
        }

        const newStatus = !existingCabang[0].is_active;

        await pool.execute(
            'UPDATE cabang SET is_active = ? WHERE id = ?',
            [newStatus, id]
        );

        res.json({ 
            message: `Cabang ${newStatus ? 'activated' : 'deactivated'} successfully`,
            is_active: newStatus
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ================== USER-CABANG ASSIGNMENT ==================

// Get users without cabang (Admin only)
export const getUsersWithoutCabang = async (req, res) => {
    try {
        const [users] = await pool.execute(`
            SELECT id, email, full_name, role, position, phone, is_active, created_at
            FROM users 
            WHERE cabang_id IS NULL AND role != 'admin'
            ORDER BY full_name ASC
        `);
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Assign user to cabang (Admin only)
export const assignUserToCabang = async (req, res) => {
    try {
        const { user_id, cabang_id } = req.body;

        if (!user_id || !cabang_id) {
            return res.status(400).json({ error: 'User ID and Cabang ID are required' });
        }

        // Check if user exists and is not admin
        const [user] = await pool.execute(
            'SELECT id, email, role FROM users WHERE id = ?',
            [user_id]
        );

        if (user.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user[0].role === 'admin') {
            return res.status(400).json({ error: 'Cannot assign cabang to admin users' });
        }

        // Check if cabang exists
        const [cabang] = await pool.execute(
            'SELECT id, kode_unit, nama_unit FROM cabang WHERE id = ?',
            [cabang_id]
        );

        if (cabang.length === 0) {
            return res.status(404).json({ error: 'Cabang not found' });
        }

        // Assign user to cabang
        await pool.execute(
            'UPDATE users SET cabang_id = ? WHERE id = ?',
            [cabang_id, user_id]
        );

        res.json({
            message: 'User assigned to cabang successfully',
            user: user[0].email,
            cabang: `${cabang[0].kode_unit} - ${cabang[0].nama_unit}`
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Transfer user to different cabang (Admin only)
export const transferUserToCabang = async (req, res) => {
    try {
        const { user_id, new_cabang_id } = req.body;

        if (!user_id || !new_cabang_id) {
            return res.status(400).json({ error: 'User ID and new cabang ID are required' });
        }

        // Get user with current cabang
        const [user] = await pool.execute(`
            SELECT u.id, u.email, u.role, c.kode_unit as current_cabang_kode, c.nama_unit as current_cabang_nama
            FROM users u
            LEFT JOIN cabang c ON u.cabang_id = c.id
            WHERE u.id = ?
        `, [user_id]);

        if (user.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user[0].role === 'admin') {
            return res.status(400).json({ error: 'Cannot transfer admin users' });
        }

        // Check if new cabang exists
        const [newCabang] = await pool.execute(
            'SELECT id, kode_unit, nama_unit FROM cabang WHERE id = ?',
            [new_cabang_id]
        );

        if (newCabang.length === 0) {
            return res.status(404).json({ error: 'New cabang not found' });
        }

        // Transfer user
        await pool.execute(
            'UPDATE users SET cabang_id = ? WHERE id = ?',
            [new_cabang_id, user_id]
        );

        res.json({
            message: 'User transferred successfully',
            user: user[0].email,
            from: user[0].current_cabang_kode ? `${user[0].current_cabang_kode} - ${user[0].current_cabang_nama}` : 'No Cabang',
            to: `${newCabang[0].kode_unit} - ${newCabang[0].nama_unit}`
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Bulk assign multiple users to cabang (Admin only)
export const bulkAssignUsersToCabang = async (req, res) => {
    try {
        const { user_ids, cabang_id } = req.body;

        if (!Array.isArray(user_ids) || user_ids.length === 0 || !cabang_id) {
            return res.status(400).json({ error: 'User IDs array and cabang ID are required' });
        }

        // Check if cabang exists
        const [cabang] = await pool.execute(
            'SELECT id, kode_unit, nama_unit FROM cabang WHERE id = ?',
            [cabang_id]
        );

        if (cabang.length === 0) {
            return res.status(404).json({ error: 'Cabang not found' });
        }

        // Update all specified users
        const placeholders = user_ids.map(() => '?').join(',');
        const [result] = await pool.execute(
            `UPDATE users SET cabang_id = ? WHERE id IN (${placeholders}) AND role != 'admin'`,
            [cabang_id, ...user_ids]
        );

        res.json({
            message: 'Bulk assignment completed successfully',
            cabang: `${cabang[0].kode_unit} - ${cabang[0].nama_unit}`,
            affectedRows: result.affectedRows
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
