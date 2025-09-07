import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import {
    getAllKecamatan,
    getKecamatanById,
    createKecamatan,
    updateKecamatan,
    deleteKecamatan,
    toggleKecamatanStatus,
    getAvailableKecamatan,
    getKecamatanByDesaId,
    getKecamatanStatistics
} from '../controllers/kecamatanController.js';

const router = express.Router();

// ================== KECAMATAN CRUD ROUTES (ADMIN ONLY) ==================

// Get all kecamatan (Admin only)
router.get('/admin/all', authenticateToken, requireAdmin, getAllKecamatan);

// Get kecamatan statistics (Admin only)
router.get('/admin/stats', authenticateToken, requireAdmin, getKecamatanStatistics);

// Get kecamatan by ID with desa and pelanggan (Admin only)
router.get('/admin/:id', authenticateToken, requireAdmin, getKecamatanById);

// Create new kecamatan (Admin only)
router.post('/admin', authenticateToken, requireAdmin, createKecamatan);

// Update kecamatan (Admin only)
router.put('/admin/:id', authenticateToken, requireAdmin, updateKecamatan);

// Delete kecamatan (Admin only)
router.delete('/admin/:id', authenticateToken, requireAdmin, deleteKecamatan);

// Toggle kecamatan active status (Admin only)
router.patch('/admin/:id/toggle-status', authenticateToken, requireAdmin, toggleKecamatanStatus);

// ================== PUBLIC/DROPDOWN ROUTES ==================

// Get kecamatan for dropdown (Public - no auth required)
router.get('/dropdown', getAvailableKecamatan);

// Get available kecamatan for dropdown (Admin and User)
router.get('/available', authenticateToken, getAvailableKecamatan);

// Get kecamatan by desa ID for dynamic dropdown (Admin and User)
router.get('/by-desa/:desaId', authenticateToken, getKecamatanByDesaId);

export default router;
