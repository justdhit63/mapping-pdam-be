import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import {
    getAllKelompok,
    getKelompokById,
    createKelompok,
    updateKelompok,
    deleteKelompok,
    toggleKelompokStatus,
    getKelompokDropdown,
    getKelompokStats
} from '../controllers/kelompokController.js';

const router = express.Router();

// ================== KELOMPOK CRUD ROUTES (ADMIN ONLY) ==================

// Get all kelompok (Admin only)
router.get('/admin/all', authenticateToken, requireAdmin, getAllKelompok);

// Get kelompok statistics (Admin only)
router.get('/admin/stats', authenticateToken, requireAdmin, getKelompokStats);

// Get kelompok by ID with pelanggan (Admin only)
router.get('/admin/:id', authenticateToken, requireAdmin, getKelompokById);

// Create new kelompok (Admin only)
router.post('/admin', authenticateToken, requireAdmin, createKelompok);

// Update kelompok (Admin only)
router.put('/admin/:id', authenticateToken, requireAdmin, updateKelompok);

// Delete kelompok (Admin only)
router.delete('/admin/:id', authenticateToken, requireAdmin, deleteKelompok);

// Toggle kelompok status (Admin only)
router.patch('/admin/:id/toggle-status', authenticateToken, requireAdmin, toggleKelompokStatus);

// ================== PUBLIC ROUTES ==================

// Get kelompok dropdown (for forms)
router.get('/dropdown', getKelompokDropdown);

export default router;
