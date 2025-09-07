import pool from '../config/database.js';

// ================== DESA CRUD OPERATIONS ==================

// Get all desa (Admin only)
export const getAllDesa = async (req, res) => {
    try {
        const [desa] = await pool.execute(`
            SELECT 
                d.*,
                k.nama_kecamatan as kecamatan_nama,
                k.kode_kecamatan as kecamatan_kode,
                COUNT(p.id) as total_pelanggan
            FROM desa d
            LEFT JOIN kecamatan k ON d.kecamatan_id = k.id
            LEFT JOIN pelanggan p ON d.id = p.desa_id
            GROUP BY d.id, d.nama_desa, d.is_active, d.created_at, d.updated_at, k.nama_kecamatan, k.kode_kecamatan
            ORDER BY d.nama_desa ASC
        `);
        res.json(desa);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get desa by ID (Admin only)
export const getDesaById = async (req, res) => {
    try {
        const { id } = req.params;
        const [desa] = await pool.execute(`
            SELECT 
                d.*,
                k.nama_kecamatan as kecamatan_nama,
                k.kode_kecamatan as kecamatan_kode,
                COUNT(p.id) as total_pelanggan
            FROM desa d
            LEFT JOIN kecamatan k ON d.kecamatan_id = k.id
            LEFT JOIN pelanggan p ON d.id = p.desa_id
            WHERE d.id = ?
            GROUP BY d.id, d.nama_desa, d.is_active, d.created_at, d.updated_at, k.nama_kecamatan, k.kode_kecamatan
        `, [id]);
        
        if (desa.length === 0) {
            return res.status(404).json({ error: 'Desa not found' });
        }
        
        // Get pelanggan in this desa
        const [pelanggan] = await pool.execute(`
            SELECT 
                p.id,
                p.nama_pelanggan,
                p.alamat,
                p.no_telpon,
                u.full_name as user_name,
                c.nama_unit as cabang_nama,
                p.created_at
            FROM pelanggan p
            LEFT JOIN users u ON p.user_id = u.id
            LEFT JOIN cabang c ON p.cabang_id = c.id
            WHERE p.desa_id = ?
            ORDER BY p.nama_pelanggan ASC
        `, [id]);
        
        res.json({
            ...desa[0],
            pelanggan: pelanggan
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create new desa (Admin only)
export const createDesa = async (req, res) => {
    try {
        const { nama_desa, kecamatan_id } = req.body;

        // Validate required fields
        if (!nama_desa) {
            return res.status(400).json({ error: 'Nama desa is required' });
        }

        if (!kecamatan_id) {
            return res.status(400).json({ error: 'Kecamatan is required' });
        }

        // Check if nama_desa already exists
        const [existingDesa] = await pool.execute(
            'SELECT id FROM desa WHERE nama_desa = ?',
            [nama_desa]
        );

        if (existingDesa.length > 0) {
            return res.status(400).json({ error: 'Nama desa already exists' });
        }

        // Check if kecamatan exists
        const [existingKecamatan] = await pool.execute(
            'SELECT id FROM kecamatan WHERE id = ?',
            [kecamatan_id]
        );

        if (existingKecamatan.length === 0) {
            return res.status(400).json({ error: 'Kecamatan not found' });
        }

        // Insert new desa
        const [result] = await pool.execute(
            'INSERT INTO desa (nama_desa, kecamatan_id) VALUES (?, ?)',
            [nama_desa, kecamatan_id]
        );

        res.status(201).json({
            message: 'Desa created successfully',
            desaId: result.insertId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update desa (Admin only)
export const updateDesa = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama_desa, kecamatan_id, is_active } = req.body;

        // Check if desa exists
        const [existingDesa] = await pool.execute(
            'SELECT id, nama_desa FROM desa WHERE id = ?',
            [id]
        );

        if (existingDesa.length === 0) {
            return res.status(404).json({ error: 'Desa not found' });
        }

        // Build update query dynamically
        const updateFields = [];
        const updateValues = [];

        if (nama_desa) {
            // Check if new nama_desa already exists (exclude current desa)
            const [namaCheck] = await pool.execute(
                'SELECT id FROM desa WHERE nama_desa = ? AND id != ?',
                [nama_desa, id]
            );
            if (namaCheck.length > 0) {
                return res.status(400).json({ error: 'Nama desa already exists' });
            }
            updateFields.push('nama_desa = ?');
            updateValues.push(nama_desa);
        }

        if (kecamatan_id !== undefined) {
            // Check if kecamatan exists
            const [kecamatanCheck] = await pool.execute(
                'SELECT id FROM kecamatan WHERE id = ?',
                [kecamatan_id]
            );
            if (kecamatan_id && kecamatanCheck.length === 0) {
                return res.status(400).json({ error: 'Kecamatan not found' });
            }
            updateFields.push('kecamatan_id = ?');
            updateValues.push(kecamatan_id || null);
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
            `UPDATE desa SET ${updateFields.join(', ')} WHERE id = ?`,
            updateValues
        );

        res.json({ message: 'Desa updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete desa (Admin only)
export const deleteDesa = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if desa exists
        const [existingDesa] = await pool.execute(
            'SELECT id, nama_desa FROM desa WHERE id = ?',
            [id]
        );

        if (existingDesa.length === 0) {
            return res.status(404).json({ error: 'Desa not found' });
        }

        // Check if desa has pelanggan (optional - could set desa_id to NULL instead)
        const [pelangganInDesa] = await pool.execute(
            'SELECT COUNT(*) as count FROM pelanggan WHERE desa_id = ?',
            [id]
        );

        if (pelangganInDesa[0].count > 0) {
            // Set desa_id to NULL for all pelanggan in this desa before deleting
            await pool.execute(
                'UPDATE pelanggan SET desa_id = NULL WHERE desa_id = ?',
                [id]
            );
        }

        // Delete desa
        await pool.execute('DELETE FROM desa WHERE id = ?', [id]);

        res.json({ 
            message: 'Desa deleted successfully',
            affectedPelanggan: pelangganInDesa[0].count
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Toggle desa active status (Admin only)
export const toggleDesaStatus = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if desa exists
        const [existingDesa] = await pool.execute(
            'SELECT id, is_active FROM desa WHERE id = ?',
            [id]
        );

        if (existingDesa.length === 0) {
            return res.status(404).json({ error: 'Desa not found' });
        }

        const newStatus = !existingDesa[0].is_active;

        await pool.execute(
            'UPDATE desa SET is_active = ? WHERE id = ?',
            [newStatus, id]
        );

        res.json({ 
            message: `Desa ${newStatus ? 'activated' : 'deactivated'} successfully`,
            is_active: newStatus
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ================== UTILITY FUNCTIONS ==================

// Get available desa for pelanggan assignment (Admin and User)
export const getAvailableDesa = async (req, res) => {
    try {
        const [desa] = await pool.execute(`
            SELECT id, nama_desa
            FROM desa 
            WHERE is_active = 1
            ORDER BY nama_desa ASC
        `);
        res.json(desa);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get desa statistics (Admin only)
export const getDesaStatistics = async (req, res) => {
    try {
        const [stats] = await pool.execute(`
            SELECT 
                COUNT(DISTINCT d.id) as total_desa,
                COUNT(DISTINCT CASE WHEN d.is_active = 1 THEN d.id END) as active_desa,
                COUNT(DISTINCT p.id) as total_pelanggan,
                AVG(pelanggan_count) as avg_pelanggan_per_desa
            FROM desa d
            LEFT JOIN (
                SELECT desa_id, COUNT(*) as pelanggan_count
                FROM pelanggan 
                WHERE desa_id IS NOT NULL
                GROUP BY desa_id
            ) pc ON d.id = pc.desa_id
            LEFT JOIN pelanggan p ON d.id = p.desa_id
        `);

        const [topDesa] = await pool.execute(`
            SELECT 
                d.nama_desa,
                COUNT(p.id) as total_pelanggan
            FROM desa d
            LEFT JOIN pelanggan p ON d.id = p.desa_id
            GROUP BY d.id, d.nama_desa
            ORDER BY total_pelanggan DESC
            LIMIT 5
        `);

        res.json({
            summary: stats[0],
            topDesa: topDesa
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
