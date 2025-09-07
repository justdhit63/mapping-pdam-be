import db from '../config/database.js';

// ================== KECAMATAN CRUD OPERATIONS ==================

// Get all kecamatan with desa count
export const getAllKecamatan = async (req, res) => {
    try {
        const query = `
            SELECT 
                k.*,
                COUNT(d.id) as desa_count,
                COUNT(p.id) as pelanggan_count
            FROM kecamatan k
            LEFT JOIN desa d ON k.id = d.kecamatan_id 
            LEFT JOIN pelanggan p ON k.id = p.kecamatan_id
            GROUP BY k.id
            ORDER BY k.nama_kecamatan ASC
        `;
        
        const [kecamatan] = await db.execute(query);
        res.json({ data: kecamatan, message: 'Kecamatan retrieved successfully' });
    } catch (error) {
        console.error('Error getting kecamatan:', error);
        res.status(500).json({ error: 'Failed to get kecamatan data' });
    }
};

// Get kecamatan by ID with related desa and pelanggan
export const getKecamatanById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get kecamatan details
        const [kecamatan] = await db.execute(
            'SELECT * FROM kecamatan WHERE id = ?', 
            [id]
        );
        
        if (kecamatan.length === 0) {
            return res.status(404).json({ error: 'Kecamatan not found' });
        }
        
        // Get related desa
        const [desa] = await db.execute(
            'SELECT * FROM desa WHERE kecamatan_id = ? ORDER BY nama_desa',
            [id]
        );
        
        // Get related pelanggan
        const [pelanggan] = await db.execute(
            'SELECT * FROM pelanggan WHERE kecamatan_id = ? ORDER BY nama_pelanggan',
            [id]
        );
        
        res.json({
            data: {
                ...kecamatan[0],
                desa: desa,
                pelanggan: pelanggan
            },
            message: 'Kecamatan details retrieved successfully'
        });
    } catch (error) {
        console.error('Error getting kecamatan by ID:', error);
        res.status(500).json({ error: 'Failed to get kecamatan details' });
    }
};

// Create new kecamatan
export const createKecamatan = async (req, res) => {
    try {
        const { nama_kecamatan, kode_kecamatan } = req.body;
        
        if (!nama_kecamatan) {
            return res.status(400).json({ error: 'Nama kecamatan is required' });
        }
        
        const [result] = await db.execute(
            'INSERT INTO kecamatan (nama_kecamatan, kode_kecamatan) VALUES (?, ?)',
            [nama_kecamatan, kode_kecamatan || null]
        );
        
        res.status(201).json({
            data: { id: result.insertId, nama_kecamatan, kode_kecamatan },
            message: 'Kecamatan created successfully'
        });
    } catch (error) {
        console.error('Error creating kecamatan:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ error: 'Kecamatan name or code already exists' });
        } else {
            res.status(500).json({ error: 'Failed to create kecamatan' });
        }
    }
};

// Update kecamatan
export const updateKecamatan = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama_kecamatan, kode_kecamatan, is_active } = req.body;
        
        // Check if kecamatan exists
        const [existing] = await db.execute('SELECT * FROM kecamatan WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Kecamatan not found' });
        }
        
        const [result] = await db.execute(
            'UPDATE kecamatan SET nama_kecamatan = ?, kode_kecamatan = ?, is_active = ? WHERE id = ?',
            [nama_kecamatan, kode_kecamatan, is_active, id]
        );
        
        res.json({ message: 'Kecamatan updated successfully' });
    } catch (error) {
        console.error('Error updating kecamatan:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ error: 'Kecamatan name or code already exists' });
        } else {
            res.status(500).json({ error: 'Failed to update kecamatan' });
        }
    }
};

// Delete kecamatan
export const deleteKecamatan = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if kecamatan exists
        const [existing] = await db.execute('SELECT * FROM kecamatan WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Kecamatan not found' });
        }
        
        // Check if kecamatan has related desa or pelanggan
        const [relatedCount] = await db.execute(
            `SELECT 
                (SELECT COUNT(*) FROM desa WHERE kecamatan_id = ?) as desa_count,
                (SELECT COUNT(*) FROM pelanggan WHERE kecamatan_id = ?) as pelanggan_count
            `, 
            [id, id]
        );
        
        const { desa_count, pelanggan_count } = relatedCount[0];
        
        if (desa_count > 0 || pelanggan_count > 0) {
            return res.status(400).json({ 
                error: `Cannot delete kecamatan. It has ${desa_count} desa and ${pelanggan_count} pelanggan related to it.` 
            });
        }
        
        await db.execute('DELETE FROM kecamatan WHERE id = ?', [id]);
        res.json({ message: 'Kecamatan deleted successfully' });
    } catch (error) {
        console.error('Error deleting kecamatan:', error);
        res.status(500).json({ error: 'Failed to delete kecamatan' });
    }
};

// Toggle kecamatan active status
export const toggleKecamatanStatus = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if kecamatan exists and get current status
        const [existing] = await db.execute('SELECT is_active FROM kecamatan WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Kecamatan not found' });
        }
        
        const newStatus = existing[0].is_active ? 0 : 1;
        
        await db.execute('UPDATE kecamatan SET is_active = ? WHERE id = ?', [newStatus, id]);
        
        res.json({ 
            message: `Kecamatan ${newStatus ? 'activated' : 'deactivated'} successfully`,
            is_active: newStatus
        });
    } catch (error) {
        console.error('Error toggling kecamatan status:', error);
        res.status(500).json({ error: 'Failed to toggle kecamatan status' });
    }
};

// ================== PUBLIC/DROPDOWN ROUTES ==================

// Get available kecamatan for dropdown
export const getAvailableKecamatan = async (req, res) => {
    try {
        const [kecamatan] = await db.execute(
            'SELECT id, nama_kecamatan, kode_kecamatan FROM kecamatan WHERE is_active = 1 ORDER BY nama_kecamatan ASC'
        );
        res.json({ data: kecamatan, message: 'Available kecamatan retrieved successfully' });
    } catch (error) {
        console.error('Error getting available kecamatan:', error);
        res.status(500).json({ error: 'Failed to get available kecamatan' });
    }
};

// Get kecamatan by desa ID (for dynamic dropdown)
export const getKecamatanByDesaId = async (req, res) => {
    try {
        const { desaId } = req.params;
        
        const [result] = await db.execute(
            `SELECT k.id, k.nama_kecamatan, k.kode_kecamatan 
             FROM kecamatan k
             JOIN desa d ON k.id = d.kecamatan_id 
             WHERE d.id = ? AND k.is_active = 1`,
            [desaId]
        );
        
        if (result.length === 0) {
            return res.status(404).json({ error: 'Kecamatan not found for this desa' });
        }
        
        res.json({ data: result[0], message: 'Kecamatan for desa retrieved successfully' });
    } catch (error) {
        console.error('Error getting kecamatan by desa:', error);
        res.status(500).json({ error: 'Failed to get kecamatan for desa' });
    }
};

// Get statistics for admin dashboard
export const getKecamatanStatistics = async (req, res) => {
    try {
        const [stats] = await db.execute(`
            SELECT 
                COUNT(*) as total_kecamatan,
                COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_kecamatan,
                COUNT(CASE WHEN is_active = 0 THEN 1 END) as inactive_kecamatan
            FROM kecamatan
        `);
        
        const [desaStats] = await db.execute(`
            SELECT COUNT(*) as total_desa_with_kecamatan 
            FROM desa WHERE kecamatan_id IS NOT NULL
        `);
        
        const [pelangganStats] = await db.execute(`
            SELECT COUNT(*) as total_pelanggan_with_kecamatan 
            FROM pelanggan WHERE kecamatan_id IS NOT NULL
        `);
        
        const [avgStats] = await db.execute(`
            SELECT 
                AVG(desa_count) as avg_desa_per_kecamatan,
                AVG(pelanggan_count) as avg_pelanggan_per_kecamatan
            FROM (
                SELECT 
                    k.id,
                    COUNT(DISTINCT d.id) as desa_count,
                    COUNT(DISTINCT p.id) as pelanggan_count
                FROM kecamatan k
                LEFT JOIN desa d ON k.id = d.kecamatan_id
                LEFT JOIN pelanggan p ON k.id = p.kecamatan_id
                GROUP BY k.id
            ) as kec_stats
        `);
        
        res.json({
            summary: {
                total_kecamatan: stats[0].total_kecamatan,
                active_kecamatan: stats[0].active_kecamatan,
                inactive_kecamatan: stats[0].inactive_kecamatan,
                total_desa_with_kecamatan: desaStats[0].total_desa_with_kecamatan,
                total_pelanggan_with_kecamatan: pelangganStats[0].total_pelanggan_with_kecamatan,
                avg_desa_per_kecamatan: parseFloat(avgStats[0].avg_desa_per_kecamatan || 0).toFixed(2),
                avg_pelanggan_per_kecamatan: parseFloat(avgStats[0].avg_pelanggan_per_kecamatan || 0).toFixed(2)
            },
            message: 'Kecamatan statistics retrieved successfully'
        });
    } catch (error) {
        console.error('Error getting kecamatan statistics:', error);
        res.status(500).json({ error: 'Failed to get kecamatan statistics' });
    }
};
