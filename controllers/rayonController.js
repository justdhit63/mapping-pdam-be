import pool from '../config/database.js';

// ================== RAYON CRUD FUNCTIONS (ADMIN ONLY) ==================

export const getAllRayon = async (req, res) => {
    try {
        const [rayon] = await pool.execute(`
            SELECT 
                r.id,
                r.nama_rayon,
                r.kode_rayon,
                r.deskripsi,
                r.is_active,
                r.created_at,
                r.updated_at,
                COUNT(p.id) as total_pelanggan
            FROM rayon r
            LEFT JOIN pelanggan p ON r.id = p.rayon_id
            GROUP BY r.id
            ORDER BY r.nama_rayon ASC
        `);

        res.json({ success: true, data: rayon });
    } catch (error) {
        console.error('Error getting all rayon:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

export const getRayonById = async (req, res) => {
    try {
        const { id } = req.params;

        // Get rayon with pelanggan details
        const [rayon] = await pool.execute(`
            SELECT 
                r.id,
                r.nama_rayon,
                r.kode_rayon,
                r.deskripsi,
                r.is_active,
                r.created_at,
                r.updated_at,
                COUNT(p.id) as total_pelanggan
            FROM rayon r
            LEFT JOIN pelanggan p ON r.id = p.rayon_id
            WHERE r.id = ?
            GROUP BY r.id
        `, [id]);

        if (rayon.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Rayon not found' 
            });
        }

        // Get pelanggan in this rayon
        const [pelanggan] = await pool.execute(`
            SELECT 
                p.id,
                p.nama,
                p.nomor_meter,
                p.alamat,
                p.status_pelanggan,
                d.nama_desa,
                k.nama_kecamatan
            FROM pelanggan p
            LEFT JOIN desa d ON p.desa_id = d.id
            LEFT JOIN kecamatan k ON p.kecamatan_id = k.id
            WHERE p.rayon_id = ?
            ORDER BY p.nama ASC
        `, [id]);

        res.json({ 
            success: true, 
            data: { 
                ...rayon[0], 
                pelanggan 
            } 
        });
    } catch (error) {
        console.error('Error getting rayon by id:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

export const createRayon = async (req, res) => {
    try {
        const { nama_rayon, kode_rayon, deskripsi } = req.body;

        // Validation
        if (!nama_rayon || !kode_rayon) {
            return res.status(400).json({ 
                success: false, 
                message: 'Nama rayon and kode rayon are required' 
            });
        }

        // Check if kode_rayon already exists
        const [existingRayon] = await pool.execute(
            'SELECT id FROM rayon WHERE kode_rayon = ?',
            [kode_rayon]
        );

        if (existingRayon.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Kode rayon already exists' 
            });
        }

        const [result] = await pool.execute(
            'INSERT INTO rayon (nama_rayon, kode_rayon, deskripsi) VALUES (?, ?, ?)',
            [nama_rayon, kode_rayon, deskripsi || null]
        );

        res.status(201).json({ 
            success: true, 
            message: 'Rayon created successfully',
            rayonId: result.insertId 
        });
    } catch (error) {
        console.error('Error creating rayon:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

export const updateRayon = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama_rayon, kode_rayon, deskripsi } = req.body;

        // Validation
        if (!nama_rayon || !kode_rayon) {
            return res.status(400).json({ 
                success: false, 
                message: 'Nama rayon and kode rayon are required' 
            });
        }

        // Check if rayon exists
        const [existingRayon] = await pool.execute(
            'SELECT id FROM rayon WHERE id = ?',
            [id]
        );

        if (existingRayon.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Rayon not found' 
            });
        }

        // Check if kode_rayon already exists (excluding current rayon)
        const [duplicateKode] = await pool.execute(
            'SELECT id FROM rayon WHERE kode_rayon = ? AND id != ?',
            [kode_rayon, id]
        );

        if (duplicateKode.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Kode rayon already exists' 
            });
        }

        await pool.execute(
            'UPDATE rayon SET nama_rayon = ?, kode_rayon = ?, deskripsi = ? WHERE id = ?',
            [nama_rayon, kode_rayon, deskripsi || null, id]
        );

        res.json({ 
            success: true, 
            message: 'Rayon updated successfully' 
        });
    } catch (error) {
        console.error('Error updating rayon:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

export const deleteRayon = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if rayon exists
        const [existingRayon] = await pool.execute(
            'SELECT id FROM rayon WHERE id = ?',
            [id]
        );

        if (existingRayon.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Rayon not found' 
            });
        }

        // Check if rayon has pelanggan
        const [pelangganCount] = await pool.execute(
            'SELECT COUNT(*) as count FROM pelanggan WHERE rayon_id = ?',
            [id]
        );

        if (pelangganCount[0].count > 0) {
            return res.status(400).json({ 
                success: false, 
                message: `Cannot delete rayon. ${pelangganCount[0].count} pelanggan are assigned to this rayon` 
            });
        }

        await pool.execute('DELETE FROM rayon WHERE id = ?', [id]);

        res.json({ 
            success: true, 
            message: 'Rayon deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting rayon:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

export const toggleRayonStatus = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if rayon exists
        const [existingRayon] = await pool.execute(
            'SELECT id, is_active FROM rayon WHERE id = ?',
            [id]
        );

        if (existingRayon.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Rayon not found' 
            });
        }

        const newStatus = !existingRayon[0].is_active;

        await pool.execute(
            'UPDATE rayon SET is_active = ? WHERE id = ?',
            [newStatus, id]
        );

        res.json({ 
            success: true, 
            message: `Rayon ${newStatus ? 'activated' : 'deactivated'} successfully` 
        });
    } catch (error) {
        console.error('Error toggling rayon status:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

// ================== PUBLIC/DROPDOWN FUNCTIONS ==================

export const getAvailableRayon = async (req, res) => {
    try {
        const [rayon] = await pool.execute(`
            SELECT 
                id,
                nama_rayon,
                kode_rayon
            FROM rayon 
            WHERE is_active = true 
            ORDER BY nama_rayon ASC
        `);

        res.json({ success: true, data: rayon });
    } catch (error) {
        console.error('Error getting available rayon:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

export const getRayonStatistics = async (req, res) => {
    try {
        const [stats] = await pool.execute(`
            SELECT 
                COUNT(*) as total_rayon,
                COUNT(CASE WHEN is_active = true THEN 1 END) as active_rayon,
                COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_rayon,
                (SELECT COUNT(*) FROM pelanggan WHERE rayon_id IS NOT NULL) as total_pelanggan_assigned,
                (SELECT COUNT(*) FROM pelanggan WHERE rayon_id IS NULL) as total_pelanggan_unassigned
            FROM rayon
        `);

        res.json({ success: true, data: stats[0] });
    } catch (error) {
        console.error('Error getting rayon statistics:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};
