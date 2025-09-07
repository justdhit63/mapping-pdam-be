import pool from '../config/database.js';

// ================== GOLONGAN CRUD FUNCTIONS (ADMIN ONLY) ==================

export const getAllGolongan = async (req, res) => {
    try {
        const [golongan] = await pool.execute(`
            SELECT 
                g.id,
                g.kode_golongan,
                g.nama_golongan,
                g.is_active,
                g.created_at,
                g.updated_at,
                COUNT(p.id) as total_pelanggan
            FROM golongan g
            LEFT JOIN pelanggan p ON g.id = p.golongan_id
            GROUP BY g.id
            ORDER BY g.kode_golongan ASC
        `);

        res.json({ success: true, data: golongan });
    } catch (error) {
        console.error('Error getting all golongan:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

export const getGolonganById = async (req, res) => {
    try {
        const { id } = req.params;

        // Get golongan with pelanggan details
        const [golongan] = await pool.execute(`
            SELECT 
                g.id,
                g.kode_golongan,
                g.nama_golongan,
                g.is_active,
                g.created_at,
                g.updated_at,
                COUNT(p.id) as total_pelanggan
            FROM golongan g
            LEFT JOIN pelanggan p ON g.id = p.golongan_id
            WHERE g.id = ?
            GROUP BY g.id
        `, [id]);

        if (golongan.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Golongan not found' 
            });
        }

        // Get pelanggan in this golongan
        const [pelanggan] = await pool.execute(`
            SELECT 
                p.id,
                p.nama,
                p.nomor_meter,
                p.alamat,
                p.status_pelanggan,
                d.nama_desa,
                k.nama_kecamatan,
                r.nama_rayon
            FROM pelanggan p
            LEFT JOIN desa d ON p.desa_id = d.id
            LEFT JOIN kecamatan k ON p.kecamatan_id = k.id
            LEFT JOIN rayon r ON p.rayon_id = r.id
            WHERE p.golongan_id = ?
            ORDER BY p.nama ASC
        `, [id]);

        res.json({ 
            success: true, 
            data: { 
                ...golongan[0], 
                pelanggan 
            } 
        });
    } catch (error) {
        console.error('Error getting golongan by id:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

export const createGolongan = async (req, res) => {
    try {
        const { kode_golongan, nama_golongan } = req.body;

        // Validation
        if (!kode_golongan || !nama_golongan) {
            return res.status(400).json({ 
                success: false, 
                message: 'Kode golongan and nama golongan are required' 
            });
        }

        // Check if kode_golongan already exists
        const [existingGolongan] = await pool.execute(
            'SELECT id FROM golongan WHERE kode_golongan = ?',
            [kode_golongan]
        );

        if (existingGolongan.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Kode golongan already exists' 
            });
        }

        const [result] = await pool.execute(
            'INSERT INTO golongan (kode_golongan, nama_golongan) VALUES (?, ?)',
            [kode_golongan, nama_golongan]
        );

        res.status(201).json({ 
            success: true, 
            message: 'Golongan created successfully',
            golonganId: result.insertId 
        });
    } catch (error) {
        console.error('Error creating golongan:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

export const updateGolongan = async (req, res) => {
    try {
        const { id } = req.params;
        const { kode_golongan, nama_golongan } = req.body;

        // Validation
        if (!kode_golongan || !nama_golongan) {
            return res.status(400).json({ 
                success: false, 
                message: 'Kode golongan and nama golongan are required' 
            });
        }

        // Check if golongan exists
        const [existingGolongan] = await pool.execute(
            'SELECT id FROM golongan WHERE id = ?',
            [id]
        );

        if (existingGolongan.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Golongan not found' 
            });
        }

        // Check if kode_golongan already exists (excluding current golongan)
        const [duplicateKode] = await pool.execute(
            'SELECT id FROM golongan WHERE kode_golongan = ? AND id != ?',
            [kode_golongan, id]
        );

        if (duplicateKode.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Kode golongan already exists' 
            });
        }

        await pool.execute(
            'UPDATE golongan SET kode_golongan = ?, nama_golongan = ? WHERE id = ?',
            [kode_golongan, nama_golongan, id]
        );

        res.json({ 
            success: true, 
            message: 'Golongan updated successfully' 
        });
    } catch (error) {
        console.error('Error updating golongan:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

export const deleteGolongan = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if golongan exists
        const [existingGolongan] = await pool.execute(
            'SELECT id FROM golongan WHERE id = ?',
            [id]
        );

        if (existingGolongan.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Golongan not found' 
            });
        }

        // Check if golongan has pelanggan
        const [pelangganCount] = await pool.execute(
            'SELECT COUNT(*) as count FROM pelanggan WHERE golongan_id = ?',
            [id]
        );

        if (pelangganCount[0].count > 0) {
            return res.status(400).json({ 
                success: false, 
                message: `Cannot delete golongan. ${pelangganCount[0].count} pelanggan are assigned to this golongan` 
            });
        }

        await pool.execute('DELETE FROM golongan WHERE id = ?', [id]);

        res.json({ 
            success: true, 
            message: 'Golongan deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting golongan:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

export const toggleGolonganStatus = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if golongan exists
        const [existingGolongan] = await pool.execute(
            'SELECT id, is_active FROM golongan WHERE id = ?',
            [id]
        );

        if (existingGolongan.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Golongan not found' 
            });
        }

        const newStatus = !existingGolongan[0].is_active;

        await pool.execute(
            'UPDATE golongan SET is_active = ? WHERE id = ?',
            [newStatus, id]
        );

        res.json({ 
            success: true, 
            message: `Golongan ${newStatus ? 'activated' : 'deactivated'} successfully` 
        });
    } catch (error) {
        console.error('Error toggling golongan status:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

// ================== PUBLIC/DROPDOWN FUNCTIONS ==================

export const getAvailableGolongan = async (req, res) => {
    try {
        const [golongan] = await pool.execute(`
            SELECT 
                id,
                kode_golongan,
                nama_golongan
            FROM golongan 
            WHERE is_active = true 
            ORDER BY kode_golongan ASC
        `);

        res.json({ success: true, data: golongan });
    } catch (error) {
        console.error('Error getting available golongan:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

export const getGolonganStatistics = async (req, res) => {
    try {
        const [stats] = await pool.execute(`
            SELECT 
                COUNT(*) as total_golongan,
                COUNT(CASE WHEN is_active = true THEN 1 END) as active_golongan,
                COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_golongan,
                (SELECT COUNT(*) FROM pelanggan WHERE golongan_id IS NOT NULL) as total_pelanggan_assigned,
                (SELECT COUNT(*) FROM pelanggan WHERE golongan_id IS NULL) as total_pelanggan_unassigned
            FROM golongan
        `);

        res.json({ success: true, data: stats[0] });
    } catch (error) {
        console.error('Error getting golongan statistics:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};
