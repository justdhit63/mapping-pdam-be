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
            kategori, status_pelanggan,
            stand_meter, nomer_water_meter, merk_meter, ukuran_water_meter, kondisi_water_meter
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
             distribusi, sumber, kondisi_meter, kondisi_lingkungan, kategori, status_pelanggan,
             stand_meter, nomer_water_meter, merk_meter, ukuran_water_meter, kondisi_water_meter)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, id_pelanggan, nama_pelanggan, no_telpon, alamat, jumlah_jiwa,
             jenis_meter, tanggal_pemasangan, longitude, latitude, foto_rumah_url, 
             cabang_id || null, desa_id || null, kecamatan_id || null,
             rayon_id || null, golongan_id || null, kelompok_id || null,
             distribusi || null, sumber || null, kondisi_meter || null, kondisi_lingkungan || null,
             kategori || null, status_pelanggan || 'aktif',
             stand_meter || null, nomer_water_meter || null, merk_meter || null, 
             ukuran_water_meter || null, kondisi_water_meter || null]
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
            'kategori', 'status_pelanggan',
            'stand_meter', 'nomer_water_meter', 'merk_meter', 'ukuran_water_meter', 'kondisi_water_meter'
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

// ==================== REGISTRATION FUNCTIONS ====================

// Generate next registration number
const generateRegistrationNumber = async () => {
    try {
        console.log('🔢 Generating registration number...');
        
        // First, try to check if the table and column exist
        const [checkColumn] = await pool.execute(`
            SELECT COUNT(*) as count 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'pdam_mapping' 
            AND TABLE_NAME = 'pelanggan' 
            AND COLUMN_NAME = 'no_registrasi'
        `);
        
        if (checkColumn[0].count === 0) {
            console.log('⚠️  no_registrasi column does not exist, creating...');
            await pool.execute(`ALTER TABLE pelanggan ADD COLUMN no_registrasi VARCHAR(10) NULL UNIQUE`);
        }
        
        const [rows] = await pool.execute(`
            SELECT MAX(CAST(SUBSTRING(no_registrasi, 1, 5) AS UNSIGNED)) as max_num 
            FROM pelanggan 
            WHERE no_registrasi IS NOT NULL AND no_registrasi != ''
        `);
        
        const nextNum = (rows[0]?.max_num || 0) + 1;
        const regNumber = nextNum.toString().padStart(5, '0');
        
        console.log('✅ Generated registration number:', regNumber);
        return regNumber;
    } catch (error) {
        console.error('💥 Error generating registration number:');
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        
        // Fallback: use timestamp-based number
        const fallbackNum = Date.now().toString().slice(-5);
        console.log('🔄 Using fallback registration number:', fallbackNum);
        return fallbackNum;
    }
};

// Create new pelanggan registration
export const createPelangganRegistration = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User tidak terautentikasi'
            });
        }

        const {
            nama_pelanggan, email, no_telpon, alamat, 
            latitude, longitude, jumlah_jiwa, catatan_registrasi,
            desa_id, kecamatan_id
        } = req.body;

        console.log('📥 Registration data received:', {
            nama_pelanggan: nama_pelanggan || 'NOT SET',
            email: email || 'NOT SET', 
            no_telpon: no_telpon || 'NOT SET',
            alamat: alamat || 'NOT SET',
            latitude: latitude || 'NOT SET',
            longitude: longitude || 'NOT SET',
            jumlah_jiwa: jumlah_jiwa || 'NOT SET',
            catatan_registrasi: catatan_registrasi || 'NOT SET',
            desa_id: desa_id || 'NOT SET',
            kecamatan_id: kecamatan_id || 'NOT SET'
        });
        console.log('📁 Files received:', req.files);

        // Validate required fields
        if (!nama_pelanggan?.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Nama pelanggan wajib diisi'
            });
        }

        if (!email?.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Email wajib diisi'
            });
        }

        if (!no_telpon?.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Nomor telepon wajib diisi'
            });
        }

        if (!alamat?.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Alamat wajib diisi'
            });
        }

        if (!latitude || latitude === '' || !longitude || longitude === '') {
            return res.status(400).json({
                success: false,
                message: 'Lokasi (latitude & longitude) wajib dipilih di peta'
            });
        }

        // Validate required files
        if (!req.files?.foto_rumah?.[0] || !req.files?.foto_ktp?.[0] || !req.files?.foto_kk?.[0]) {
            return res.status(400).json({
                success: false,
                message: 'Foto rumah, KTP, dan KK wajib diupload'
            });
        }

        // Generate registration number
        const noRegistrasi = await generateRegistrationNumber();
        
        // Validate and sanitize all parameters
        const cleanNama = nama_pelanggan?.trim() || null;
        const cleanEmail = email?.trim() || null;
        const cleanTelpon = no_telpon?.trim() || null;
        const cleanAlamat = alamat?.trim() || null;
        const cleanCatatan = catatan_registrasi?.trim() || null;

        // Parse coordinates with validation
        const parsedLatitude = latitude && latitude !== '' ? parseFloat(latitude) : null;
        const parsedLongitude = longitude && longitude !== '' ? parseFloat(longitude) : null;
        const parsedJumlahJiwa = jumlah_jiwa && jumlah_jiwa !== '' ? parseInt(jumlah_jiwa) : 1;
        const parsedDesaId = desa_id && desa_id !== '' ? parseInt(desa_id) : null;
        const parsedKecamatanId = kecamatan_id && kecamatan_id !== '' ? parseInt(kecamatan_id) : null;

        // Validate coordinates are valid numbers
        if (parsedLatitude !== null && (isNaN(parsedLatitude) || parsedLatitude < -90 || parsedLatitude > 90)) {
            return res.status(400).json({
                success: false,
                message: 'Latitude tidak valid'
            });
        }
        
        if (parsedLongitude !== null && (isNaN(parsedLongitude) || parsedLongitude < -180 || parsedLongitude > 180)) {
            return res.status(400).json({
                success: false,
                message: 'Longitude tidak valid'
            });
        }

        // Prepare file paths with null safety
        const fotoRumahUrl = req.files?.foto_rumah?.[0]?.filename ? `/uploads/images/${req.files.foto_rumah[0].filename}` : null;
        const fotoKtpUrl = req.files?.foto_ktp?.[0]?.filename ? `/uploads/images/${req.files.foto_ktp[0].filename}` : null;
        const fotoKkUrl = req.files?.foto_kk?.[0]?.filename ? `/uploads/images/${req.files.foto_kk[0].filename}` : null;

        // Debug logging
        console.log('📝 Registration parameters:');
        console.log('noRegistrasi:', noRegistrasi);
        console.log('cleanNama:', cleanNama);
        console.log('cleanEmail:', cleanEmail);
        console.log('cleanTelpon:', cleanTelpon);
        console.log('cleanAlamat:', cleanAlamat);
        console.log('parsedLatitude:', parsedLatitude);
        console.log('parsedLongitude:', parsedLongitude);
        console.log('parsedJumlahJiwa:', parsedJumlahJiwa);
        console.log('parsedDesaId:', parsedDesaId);
        console.log('parsedKecamatanId:', parsedKecamatanId);
        console.log('cleanCatatan:', cleanCatatan);
        console.log('fotoRumahUrl:', fotoRumahUrl);
        console.log('fotoKtpUrl:', fotoKtpUrl);
        console.log('fotoKkUrl:', fotoKkUrl);
        console.log('userId:', userId);

        // Insert registration
        const [result] = await pool.execute(`
            INSERT INTO pelanggan (
                no_registrasi, nama_pelanggan, email, no_telpon, alamat,
                latitude, longitude, jumlah_jiwa, catatan_registrasi,
                foto_rumah_url, foto_ktp_url, foto_kk_url,
                desa_id, kecamatan_id,
                status_registrasi, status_pelanggan, user_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'tidak aktif', ?)
        `, [
            noRegistrasi || null,
            cleanNama,
            cleanEmail, 
            cleanTelpon,
            cleanAlamat,
            parsedLatitude,
            parsedLongitude, 
            parsedJumlahJiwa,
            cleanCatatan,
            fotoRumahUrl,
            fotoKtpUrl,
            fotoKkUrl,
            parsedDesaId,
            parsedKecamatanId,
            userId || null
        ]);

        res.status(201).json({
            success: true,
            message: 'Registrasi berhasil disubmit',
            no_registrasi: noRegistrasi,
            registrationId: result.insertId
        });
    } catch (error) {
        console.error('💥 Error creating registration:');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('Error stack:', error.stack);
        
        let errorMessage = 'Error creating registration';
        
        if (error.code === 'ER_NO_SUCH_TABLE') {
            errorMessage = 'Database table not found';
        } else if (error.code === 'ER_BAD_FIELD_ERROR') {
            errorMessage = 'Database field not found - please run migrations';
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            errorMessage = 'Database access denied';
        } else if (error.code === 'ECONNREFUSED') {
            errorMessage = 'Database connection refused';
        }
        
        res.status(500).json({
            success: false,
            message: errorMessage + ': ' + error.message,
            error_code: error.code,
            error_details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Get registration by ID (admin only)
export const getRegistrationById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [rows] = await pool.execute(`
            SELECT p.*, u.full_name as user_name, u.email as user_email
            FROM pelanggan p
            LEFT JOIN users u ON p.user_id = u.id
            WHERE p.id = ? AND p.status_registrasi IS NOT NULL
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Registration not found'
            });
        }

        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Error fetching registration:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching registration'
        });
    }
};

// Approve registration (admin only)
export const approveRegistration = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            id_pelanggan, cabang_id, rayon_id, golongan_id, kelompok_id,
            jenis_meter, tanggal_pemasangan, distribusi, sumber,
            kondisi_meter, kondisi_lingkungan, kategori
        } = req.body;
        const adminId = req.user.id;

        // Validate required fields for approval
        if (!id_pelanggan) {
            return res.status(400).json({
                success: false,
                message: 'ID Pelanggan (No SL) wajib diisi untuk approval'
            });
        }

        // Check if registration exists and is pending
        const [existing] = await pool.execute(
            'SELECT * FROM pelanggan WHERE id = ? AND status_registrasi = "pending"',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Registration not found or not pending'
            });
        }

        // Check if id_pelanggan already exists
        const [duplicate] = await pool.execute(
            'SELECT id FROM pelanggan WHERE id_pelanggan = ? AND id != ?',
            [id_pelanggan, id]
        );

        if (duplicate.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'ID Pelanggan sudah digunakan'
            });
        }

        // Update registration with approval data
        await pool.execute(`
            UPDATE pelanggan SET 
                status_registrasi = 'approved',
                id_pelanggan = ?,
                status_pelanggan = 'aktif',
                cabang_id = ?,
                rayon_id = ?,
                golongan_id = ?,
                kelompok_id = ?,
                jenis_meter = ?,
                tanggal_pemasangan = ?,
                distribusi = ?,
                sumber = ?,
                kondisi_meter = ?,
                kondisi_lingkungan = ?,
                kategori = ?,
                approved_by = ?,
                approved_at = NOW()
            WHERE id = ?
        `, [
            id_pelanggan, cabang_id || null, rayon_id || null, 
            golongan_id || null, kelompok_id || null, jenis_meter || null,
            tanggal_pemasangan || null, distribusi || null, sumber || null,
            kondisi_meter || null, kondisi_lingkungan || null, 
            kategori || 'jadwal harian', adminId, id
        ]);

        res.json({
            success: true,
            message: 'Registrasi berhasil disetujui'
        });
    } catch (error) {
        console.error('Error approving registration:', error);
        res.status(500).json({
            success: false,
            message: 'Error approving registration: ' + error.message
        });
    }
};

// Get pending registrations (admin only)
export const getPendingRegistrations = async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT p.*, u.email as user_email, 
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
            WHERE p.status_registrasi = 'pending'
            ORDER BY p.created_at DESC
        `);

        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Error fetching pending registrations:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching pending registrations: ' + error.message
        });
    }
};

// Get registration statistics (admin only)
export const getRegistrationStats = async (req, res) => {
    try {
        const [stats] = await pool.execute(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status_registrasi = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status_registrasi = 'approved' THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status_registrasi = 'rejected' THEN 1 ELSE 0 END) as rejected,
                SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as today
            FROM pelanggan 
            WHERE no_registrasi IS NOT NULL
        `);

        res.json({
            success: true,
            data: stats[0]
        });
    } catch (error) {
        console.error('Error fetching registration stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching registration stats: ' + error.message
        });
    }
};

// Get all registrations (admin only)
export const getAllRegistrations = async (req, res) => {
    try {
        const { status } = req.query;
        let whereClause = 'WHERE p.no_registrasi IS NOT NULL';
        let params = [];

        if (status && status !== 'all') {
            whereClause += ' AND p.status_registrasi = ?';
            params.push(status);
        }

        const [rows] = await pool.execute(`
            SELECT p.*, u.email as user_email, 
                   c.kode_unit, c.nama_unit as cabang_nama,
                   d.nama_desa,
                   k.nama_kecamatan, k.kode_kecamatan,
                   r.nama_rayon, r.kode_rayon,
                   g.nama_golongan, g.kode_golongan,
                   kl.nama_kelompok, kl.kode_kelompok,
                   approved_user.full_name as approved_by_name
            FROM pelanggan p 
            JOIN users u ON p.user_id = u.id 
            LEFT JOIN users approved_user ON p.approved_by = approved_user.id
            LEFT JOIN cabang c ON p.cabang_id = c.id
            LEFT JOIN desa d ON p.desa_id = d.id
            LEFT JOIN kecamatan k ON p.kecamatan_id = k.id
            LEFT JOIN rayon r ON p.rayon_id = r.id
            LEFT JOIN golongan g ON p.golongan_id = g.id
            LEFT JOIN kelompok kl ON p.kelompok_id = kl.id
            ${whereClause}
            ORDER BY p.created_at DESC
        `, params);

        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Error fetching all registrations:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching registrations: ' + error.message
        });
    }
};

// Update registration status (admin only)
export const updateRegistrationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, ...updateData } = req.body;
        const adminId = req.user.id;

        // Validate status
        const validStatuses = ['pending', 'approved', 'rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be pending, approved, or rejected'
            });
        }

        // Check if registration exists
        const [existing] = await pool.execute(
            'SELECT * FROM pelanggan WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Registration not found'
            });
        }

        // Prepare update fields
        let updateFields = ['status_registrasi = ?'];
        let updateValues = [status];

        if (status === 'approved' || status === 'rejected') {
            updateFields.push('approved_by = ?', 'approved_at = NOW()');
            updateValues.push(adminId);
        }

        // Add additional fields from updateData
        Object.keys(updateData).forEach(key => {
            updateFields.push(`${key} = ?`);
            updateValues.push(updateData[key]);
        });

        updateValues.push(id);

        await pool.execute(`
            UPDATE pelanggan SET ${updateFields.join(', ')}
            WHERE id = ?
        `, updateValues);

        res.json({
            success: true,
            message: `Registrasi berhasil diubah ke status ${status}`
        });
    } catch (error) {
        console.error('Error updating registration status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating registration status: ' + error.message
        });
    }
};

// Reject registration (admin only)
export const rejectRegistration = async (req, res) => {
    try {
        const { id } = req.params;
        const { rejected_reason } = req.body;
        const adminId = req.user.id;

        if (!rejected_reason) {
            return res.status(400).json({
                success: false,
                message: 'Alasan penolakan wajib diisi'
            });
        }

        // Check if registration exists and is pending
        const [existing] = await pool.execute(
            'SELECT * FROM pelanggan WHERE id = ? AND status_registrasi = "pending"',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Registration not found or not pending'
            });
        }

        // Update registration with rejection
        await pool.execute(`
            UPDATE pelanggan SET 
                status_registrasi = 'rejected',
                rejected_reason = ?,
                approved_by = ?,
                approved_at = NOW()
            WHERE id = ?
        `, [rejected_reason, adminId, id]);

        res.json({
            success: true,
            message: 'Registrasi berhasil ditolak'
        });
    } catch (error) {
        console.error('Error rejecting registration:', error);
        res.status(500).json({
            success: false,
            message: 'Error rejecting registration: ' + error.message
        });
    }
};
