import pool from '../config/database.js';

// Get all pelanggan for current user
export const getAllPelanggan = async (req, res) => {
    try {
        const userId = req.user.id; // Dari JWT token
        const [rows] = await pool.execute(
            `SELECT p.*, u.email as user_email, 
                    c.kode_unit, c.nama_unit as cabang_nama,
                    d.nama_desa,
                    k.nama_kecamatan, k.kode_kecamatan,
                    r.nama_rayon, r.kode_rayon,
                    g.nama_golongan, g.kode_golongan,
                    kl.nama_kelompok, kl.kode_kelompok
             FROM pelanggan p 
             JOIN users u ON p.user_id = u.id 
             LEFT JOIN cabang c ON p.cabang_id = c.id
             LEFT JOIN desa d ON p.desa_id = d.id
             LEFT JOIN kecamatan k ON p.kecamatan_id = k.id
             LEFT JOIN rayon r ON p.rayon_id = r.id
             LEFT JOIN golongan g ON p.golongan_id = g.id
             LEFT JOIN kelompok kl ON p.kelompok_id = kl.id
             WHERE p.user_id = ? 
             ORDER BY p.created_at DESC`,
            [userId]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all pelanggan (Admin only)
export const getAllPelangganAdmin = async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT p.*, u.email as user_email, u.role as user_role, 
                    c.kode_unit, c.nama_unit as cabang_nama,
                    d.nama_desa,
                    k.nama_kecamatan, k.kode_kecamatan,
                    r.nama_rayon, r.kode_rayon,
                    g.nama_golongan, g.kode_golongan,
                    kl.nama_kelompok, kl.kode_kelompok
             FROM pelanggan p 
             JOIN users u ON p.user_id = u.id 
             LEFT JOIN cabang c ON p.cabang_id = c.id
             LEFT JOIN desa d ON p.desa_id = d.id
             LEFT JOIN kecamatan k ON p.kecamatan_id = k.id
             LEFT JOIN rayon r ON p.rayon_id = r.id
             LEFT JOIN golongan g ON p.golongan_id = g.id
             LEFT JOIN kelompok kl ON p.kelompok_id = kl.id
             ORDER BY u.role DESC, p.created_at DESC`
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get user statistics (Admin only)
export const getUserStats = async (req, res) => {
    try {
        const [userStats] = await pool.execute(`
            SELECT 
                u.id,
                u.email,
                u.role,
                COUNT(p.id) as total_pelanggan,
                u.created_at
            FROM users u
            LEFT JOIN pelanggan p ON u.id = p.user_id
            GROUP BY u.id, u.email, u.role, u.created_at
            ORDER BY u.role DESC, total_pelanggan DESC
        `);

        const [summaryStats] = await pool.execute(`
            SELECT 
                COUNT(DISTINCT u.id) as total_users,
                COUNT(DISTINCT CASE WHEN u.role = 'admin' THEN u.id END) as total_admins,
                COUNT(DISTINCT CASE WHEN u.role = 'user' THEN u.id END) as total_regular_users,
                COUNT(p.id) as total_pelanggan
            FROM users u
            LEFT JOIN pelanggan p ON u.id = p.user_id
        `);

        res.json({
            userStats,
            summary: summaryStats[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getPelangganById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id; // Dari JWT token
        const [rows] = await pool.execute(
            `SELECT p.*, u.email as user_email,
                    DATE_FORMAT(p.tanggal_pemasangan, '%Y-%m-%d') as tanggal_pemasangan_formatted
             FROM pelanggan p 
             JOIN users u ON p.user_id = u.id 
             WHERE p.id = ? AND p.user_id = ?`,
            [id, userId]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Pelanggan not found or access denied' });
        }
        
        // Format data for frontend
        const pelanggan = rows[0];
        if (pelanggan.tanggal_pemasangan_formatted) {
            pelanggan.tanggal_pemasangan = pelanggan.tanggal_pemasangan_formatted;
        }
        delete pelanggan.tanggal_pemasangan_formatted;
        
        res.json(pelanggan);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createPelanggan = async (req, res) => {
    try {
        const {
            id_pelanggan, nama_pelanggan, no_telpon, alamat,
            jumlah_jiwa, jenis_meter, tanggal_pemasangan,
            longitude, latitude, cabang_id, desa_id, kecamatan_id,
            rayon_id, golongan_id, kelompok_id,
            distribusi, sumber, kondisi_meter, kondisi_lingkungan,
            kategori, status_pelanggan
        } = req.body;

        const userId = req.user.id; // Dari JWT token

        let foto_rumah_url = null;
        if (req.file) {
            foto_rumah_url = `/uploads/images/${req.file.filename}`;
        }

        const [result] = await pool.execute(
            `INSERT INTO pelanggan 
            (user_id, id_pelanggan, nama_pelanggan, no_telpon, alamat, jumlah_jiwa, 
             jenis_meter, tanggal_pemasangan, longitude, latitude, foto_rumah_url, 
             cabang_id, desa_id, kecamatan_id, rayon_id, golongan_id, kelompok_id,
             distribusi, sumber, kondisi_meter, kondisi_lingkungan, kategori, status_pelanggan)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, id_pelanggan, nama_pelanggan, no_telpon, alamat, jumlah_jiwa,
             jenis_meter, tanggal_pemasangan, longitude, latitude, foto_rumah_url, 
             cabang_id || null, desa_id || null, kecamatan_id || null,
             rayon_id || null, golongan_id || null, kelompok_id || null,
             distribusi || null, sumber || null, kondisi_meter || null, kondisi_lingkungan || null,
             kategori || null, status_pelanggan || 'aktif']
        );

        res.status(201).json({
            message: 'Pelanggan created successfully',
            id: result.insertId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updatePelanggan = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id; // Dari JWT token
        
        // Debug logging
        console.log('UPDATE - Full body:', req.body);
        console.log('UPDATE - Files:', req.file);

        // Ambil semua field yang ada di req.body
        const fieldsToUpdate = {};
        const allowedFields = [
            'nama_pelanggan', 'no_telpon', 'alamat', 'jumlah_jiwa',
            'jenis_meter', 'tanggal_pemasangan', 'longitude', 'latitude',
            'cabang_id', 'desa_id', 'kecamatan_id', 'rayon_id', 'golongan_id', 'kelompok_id',
            'distribusi', 'sumber', 'kondisi_meter', 'kondisi_lingkungan',
            'kategori', 'status_pelanggan'
        ];

        // Hanya ambil field yang ada di req.body dan diperbolehkan
        for (const field of allowedFields) {
            if (Object.prototype.hasOwnProperty.call(req.body, field)) {
                fieldsToUpdate[field] = req.body[field];
            }
        }

        console.log('UPDATE - Fields to update:', fieldsToUpdate);

        // Handle numeric fields with proper parsing
        if (fieldsToUpdate.longitude !== undefined) {
            const longitude = fieldsToUpdate.longitude;
            console.log('UPDATE - Received longitude:', longitude, 'type:', typeof longitude);
            
            let parsedLongitude = longitude && longitude !== '' ? parseFloat(longitude) : null;
            
            // Protect against database decimal overflow for Indonesian coordinates
            if (parsedLongitude !== null) {
                if (parsedLongitude > 99.999999 && parsedLongitude < 180) {
                    console.log('Valid Indonesian longitude detected:', parsedLongitude);
                } else if (parsedLongitude === 99.999999 || isNaN(parsedLongitude)) {
                    console.error('LONGITUDE CORRUPTION DETECTED!');
                    console.error('Setting longitude to null to prevent corruption');
                    parsedLongitude = null;
                }
            }
            fieldsToUpdate.longitude = parsedLongitude;
        }

        if (fieldsToUpdate.latitude !== undefined) {
            const latitude = fieldsToUpdate.latitude;
            console.log('UPDATE - Received latitude:', latitude, 'type:', typeof latitude);
            
            let parsedLatitude = latitude && latitude !== '' ? parseFloat(latitude) : null;
            fieldsToUpdate.latitude = parsedLatitude;
        }

        if (fieldsToUpdate.jumlah_jiwa !== undefined) {
            const jumlah_jiwa = fieldsToUpdate.jumlah_jiwa;
            fieldsToUpdate.jumlah_jiwa = jumlah_jiwa && jumlah_jiwa !== '' ? parseInt(jumlah_jiwa) : null;
        }

        // Handle file upload
        if (req.file) {
            fieldsToUpdate.foto_rumah_url = `/uploads/images/${req.file.filename}`;
        }

        // Build dynamic query
        const updateFields = Object.keys(fieldsToUpdate);
        
        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        const setClause = updateFields.map(field => `${field} = ?`).join(', ');
        const values = updateFields.map(field => {
            const value = fieldsToUpdate[field];
            // Convert empty strings to null for certain fields
            if (value === '' && ['cabang_id', 'desa_id', 'kecamatan_id', 'rayon_id', 'golongan_id', 'kelompok_id'].includes(field)) {
                return null;
            }
            return value;
        });
        
        const updateQuery = `UPDATE pelanggan SET ${setClause} WHERE id = ? AND user_id = ?`;
        const params = [...values, id, userId];

        console.log('UPDATE - Dynamic query:', updateQuery);
        console.log('UPDATE - Params:', params);

        const [result] = await pool.execute(updateQuery, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Pelanggan not found or access denied' });
        }

        res.json({ message: 'Pelanggan updated successfully' });
    } catch (error) {
        console.error('UPDATE ERROR:', error);
        res.status(500).json({ error: error.message });
    }
};

export const deletePelanggan = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id; // Dari JWT token
        
        const [result] = await pool.execute(
            'DELETE FROM pelanggan WHERE id = ? AND user_id = ?', 
            [id, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Pelanggan not found or access denied' });
        }
        
        res.json({ message: 'Pelanggan deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// =============== ADMIN FUNCTIONS FOR PELANGGAN ASSIGNMENT ===============

// Create pelanggan and assign to specific user (Admin only)
export const createPelangganForUser = async (req, res) => {
    try {
        const { 
            user_id, 
            id_pelanggan, 
            nama_pelanggan, 
            no_telpon, 
            alamat, 
            jumlah_jiwa, 
            jenis_meter, 
            tanggal_pemasangan, 
            longitude, 
            latitude,
            cabang_id,
            desa_id
        } = req.body;

        // Validate required fields
        if (!user_id || !id_pelanggan || !nama_pelanggan) {
            return res.status(400).json({ 
                error: 'User ID, ID Pelanggan, and Nama Pelanggan are required' 
            });
        }

        // Check if target user exists and is not admin
        const [targetUser] = await pool.execute(
            'SELECT id, email, role FROM users WHERE id = ?',
            [user_id]
        );

        if (targetUser.length === 0) {
            return res.status(404).json({ error: 'Target user not found' });
        }

        if (targetUser[0].role === 'admin') {
            return res.status(400).json({ error: 'Cannot assign pelanggan to admin users' });
        }

        // Check if ID Pelanggan already exists
        const [existingPelanggan] = await pool.execute(
            'SELECT id FROM pelanggan WHERE id_pelanggan = ?',
            [id_pelanggan]
        );

        if (existingPelanggan.length > 0) {
            return res.status(400).json({ error: 'ID Pelanggan already exists' });
        }

        // Handle file upload URL
        let foto_rumah_url = null;
        if (req.file) {
            foto_rumah_url = `/uploads/images/${req.file.filename}`;
        }

        // Insert pelanggan
        const [result] = await pool.execute(`
            INSERT INTO pelanggan (
                user_id, id_pelanggan, nama_pelanggan, no_telpon, alamat, 
                jumlah_jiwa, jenis_meter, tanggal_pemasangan, longitude, 
                latitude, foto_rumah_url, cabang_id, desa_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            user_id, id_pelanggan, nama_pelanggan, no_telpon, alamat,
            jumlah_jiwa, jenis_meter, tanggal_pemasangan, longitude,
            latitude, foto_rumah_url, cabang_id || null, desa_id || null
        ]);

        res.status(201).json({ 
            message: 'Pelanggan created and assigned successfully',
            pelangganId: result.insertId,
            assignedTo: targetUser[0].email
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Transfer pelanggan to different user (Admin only)
export const transferPelanggan = async (req, res) => {
    try {
        const { id } = req.params; // pelanggan ID
        const { new_user_id } = req.body;

        if (!new_user_id) {
            return res.status(400).json({ error: 'New user ID is required' });
        }

        // Check if pelanggan exists
        const [existingPelanggan] = await pool.execute(
            `SELECT p.*, u.email as current_user_email 
             FROM pelanggan p 
             JOIN users u ON p.user_id = u.id 
             WHERE p.id = ?`,
            [id]
        );

        if (existingPelanggan.length === 0) {
            return res.status(404).json({ error: 'Pelanggan not found' });
        }

        // Check if target user exists and is not admin
        const [targetUser] = await pool.execute(
            'SELECT id, email, role FROM users WHERE id = ?',
            [new_user_id]
        );

        if (targetUser.length === 0) {
            return res.status(404).json({ error: 'Target user not found' });
        }

        if (targetUser[0].role === 'admin') {
            return res.status(400).json({ error: 'Cannot transfer pelanggan to admin users' });
        }

        // Transfer pelanggan
        await pool.execute(
            'UPDATE pelanggan SET user_id = ? WHERE id = ?',
            [new_user_id, id]
        );

        res.json({
            message: 'Pelanggan transferred successfully',
            from: existingPelanggan[0].current_user_email,
            to: targetUser[0].email,
            pelanggan: existingPelanggan[0].nama_pelanggan
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get available users for assignment (Admin only)
export const getAvailableUsers = async (req, res) => {
    try {
        console.log('🔍 getAvailableUsers called');
        console.log('User:', req.user);
        
        const [users] = await pool.execute(`
            SELECT 
                u.id, 
                u.email, 
                u.full_name, 
                u.position,
                u.is_active,
                COUNT(p.id) as total_pelanggan
            FROM users u
            LEFT JOIN pelanggan p ON u.id = p.user_id
            WHERE u.role != 'admin' AND u.is_active = TRUE
            GROUP BY u.id, u.email, u.full_name, u.position, u.is_active
            ORDER BY u.full_name ASC
        `);

        console.log('✅ Found users:', users.length);
        res.json(users);
    } catch (error) {
        console.error('❌ Error in getAvailableUsers:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// Bulk assign multiple pelanggan to user (Admin only)
export const bulkAssignPelanggan = async (req, res) => {
    try {
        const { user_id, pelanggan_ids } = req.body;

        if (!user_id || !Array.isArray(pelanggan_ids) || pelanggan_ids.length === 0) {
            return res.status(400).json({ 
                error: 'User ID and array of pelanggan IDs are required' 
            });
        }

        // Check if target user exists and is not admin
        const [targetUser] = await pool.execute(
            'SELECT id, email, role FROM users WHERE id = ?',
            [user_id]
        );

        if (targetUser.length === 0) {
            return res.status(404).json({ error: 'Target user not found' });
        }

        if (targetUser[0].role === 'admin') {
            return res.status(400).json({ error: 'Cannot assign pelanggan to admin users' });
        }

        // Update all specified pelanggan
        const placeholders = pelanggan_ids.map(() => '?').join(',');
        const [result] = await pool.execute(
            `UPDATE pelanggan SET user_id = ? WHERE id IN (${placeholders})`,
            [user_id, ...pelanggan_ids]
        );

        res.json({
            message: 'Bulk assignment completed successfully',
            assignedTo: targetUser[0].email,
            affectedRows: result.affectedRows
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get available cabang for pelanggan assignment
export const getAvailableCabang = async (req, res) => {
    try {
        const [cabang] = await pool.execute(`
            SELECT id, kode_unit, nama_unit, alamat, telepon, is_active
            FROM cabang 
            WHERE is_active = 1
            ORDER BY kode_unit ASC
        `);
        res.json(cabang);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
