import pool from '../config/database.js';

// ================== KELOMPOK CRUD FUNCTIONS (ADMIN ONLY) ==================

export const getAllKelompok = async (req, res) => {
    try {
        const [kelompok] = await pool.execute(`
            SELECT 
                k.id,
                k.kode_kelompok,
                k.nama_kelompok,
                k.is_active,
                k.created_at,
                k.updated_at,
                COUNT(p.id) as total_pelanggan
            FROM kelompok k
            LEFT JOIN pelanggan p ON k.id = p.kelompok_id
            GROUP BY k.id
            ORDER BY k.kode_kelompok ASC
        `);

        res.json({ success: true, data: kelompok });
    } catch (error) {
        console.error('Error getting all kelompok:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

export const getKelompokById = async (req, res) => {
    try {
        const { id } = req.params;

        // Get kelompok with pelanggan details
        const [kelompok] = await pool.execute(`
            SELECT 
                k.id,
                k.kode_kelompok,
                k.nama_kelompok,
                k.is_active,
                k.created_at,
                k.updated_at,
                COUNT(p.id) as total_pelanggan
            FROM kelompok k
            LEFT JOIN pelanggan p ON k.id = p.kelompok_id
            WHERE k.id = ?
            GROUP BY k.id
        `, [id]);

        if (kelompok.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Kelompok not found' 
            });
        }

        // Get pelanggan list for this kelompok
        const [pelanggan] = await pool.execute(`
            SELECT 
                p.id,
                p.nama_pelanggan,
                p.nomor_sambungan,
                p.alamat,
                d.nama_desa,
                k.nama_kecamatan
            FROM pelanggan p
            JOIN desa d ON p.desa_id = d.id
            JOIN kecamatan k ON d.kecamatan_id = k.id
            WHERE p.kelompok_id = ?
            ORDER BY p.nama_pelanggan ASC
        `, [id]);

        res.json({ 
            success: true, 
            data: {
                ...kelompok[0],
                pelanggan
            }
        });
    } catch (error) {
        console.error('Error getting kelompok by id:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

export const createKelompok = async (req, res) => {
    try {
        const { kode_kelompok, nama_kelompok, is_active = true } = req.body;

        if (!kode_kelompok || !nama_kelompok) {
            return res.status(400).json({ 
                success: false, 
                message: 'Kode kelompok and nama kelompok are required' 
            });
        }

        // Check if kode_kelompok already exists
        const [existing] = await pool.execute(
            'SELECT id FROM kelompok WHERE kode_kelompok = ?',
            [kode_kelompok]
        );

        if (existing.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Kode kelompok already exists' 
            });
        }

        // Insert new kelompok
        const [result] = await pool.execute(
            'INSERT INTO kelompok (kode_kelompok, nama_kelompok, is_active) VALUES (?, ?, ?)',
            [kode_kelompok, nama_kelompok, is_active]
        );

        res.status(201).json({ 
            success: true, 
            message: 'Kelompok created successfully',
            data: { 
                id: result.insertId, 
                kode_kelompok, 
                nama_kelompok, 
                is_active 
            }
        });
    } catch (error) {
        console.error('Error creating kelompok:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

export const updateKelompok = async (req, res) => {
    try {
        const { id } = req.params;
        const { kode_kelompok, nama_kelompok, is_active } = req.body;

        // Check if kelompok exists
        const [existing] = await pool.execute(
            'SELECT id FROM kelompok WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Kelompok not found' 
            });
        }

        // Check if kode_kelompok already exists (exclude current id)
        if (kode_kelompok) {
            const [duplicateKode] = await pool.execute(
                'SELECT id FROM kelompok WHERE kode_kelompok = ? AND id != ?',
                [kode_kelompok, id]
            );

            if (duplicateKode.length > 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Kode kelompok already exists' 
                });
            }
        }

        // Build update query dynamically
        const updates = [];
        const values = [];

        if (kode_kelompok !== undefined) {
            updates.push('kode_kelompok = ?');
            values.push(kode_kelompok);
        }
        if (nama_kelompok !== undefined) {
            updates.push('nama_kelompok = ?');
            values.push(nama_kelompok);
        }
        if (is_active !== undefined) {
            updates.push('is_active = ?');
            values.push(is_active);
        }

        if (updates.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'No fields to update' 
            });
        }

        values.push(id);

        // Update kelompok
        await pool.execute(
            `UPDATE kelompok SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            values
        );

        res.json({ 
            success: true, 
            message: 'Kelompok updated successfully' 
        });
    } catch (error) {
        console.error('Error updating kelompok:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

export const deleteKelompok = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if kelompok exists
        const [existing] = await pool.execute(
            'SELECT id FROM kelompok WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Kelompok not found' 
            });
        }

        // Check if kelompok has associated pelanggan
        const [pelanggan] = await pool.execute(
            'SELECT id FROM pelanggan WHERE kelompok_id = ?',
            [id]
        );

        if (pelanggan.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: `Cannot delete kelompok. ${pelanggan.length} pelanggan are assigned to this kelompok. Please reassign them first.` 
            });
        }

        // Delete kelompok
        await pool.execute('DELETE FROM kelompok WHERE id = ?', [id]);

        res.json({ 
            success: true, 
            message: 'Kelompok deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting kelompok:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

export const toggleKelompokStatus = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if kelompok exists and get current status
        const [existing] = await pool.execute(
            'SELECT id, is_active FROM kelompok WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Kelompok not found' 
            });
        }

        const newStatus = !existing[0].is_active;

        // Update status
        await pool.execute(
            'UPDATE kelompok SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [newStatus, id]
        );

        res.json({ 
            success: true, 
            message: `Kelompok ${newStatus ? 'activated' : 'deactivated'} successfully`,
            data: { is_active: newStatus }
        });
    } catch (error) {
        console.error('Error toggling kelompok status:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

// ================== PUBLIC DROPDOWN FUNCTIONS ==================

export const getKelompokDropdown = async (req, res) => {
    try {
        const [kelompok] = await pool.execute(`
            SELECT id, kode_kelompok, nama_kelompok
            FROM kelompok 
            WHERE is_active = true 
            ORDER BY kode_kelompok ASC
        `);

        res.json({ 
            success: true, 
            data: kelompok 
        });
    } catch (error) {
        console.error('Error getting kelompok dropdown:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

// ================== STATISTICS FUNCTIONS ==================

export const getKelompokStats = async (req, res) => {
    try {
        const [stats] = await pool.execute(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive
            FROM kelompok
        `);

        const [pelangganStats] = await pool.execute(`
            SELECT 
                COUNT(DISTINCT p.id) as total_pelanggan_assigned,
                COUNT(DISTINCT CASE WHEN p.kelompok_id IS NULL THEN p.id END) as pelanggan_unassigned
            FROM pelanggan p
        `);

        res.json({ 
            success: true, 
            data: {
                kelompok: stats[0],
                pelanggan: pelangganStats[0]
            }
        });
    } catch (error) {
        console.error('Error getting kelompok stats:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};
