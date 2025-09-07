import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import {
    getAllDesa,
    getDesaById,
    createDesa,
    updateDesa,
    deleteDesa,
    toggleDesaStatus,
    getAvailableDesa,
    getDesaStatistics
} from '../controllers/desaController.js';

const router = express.Router();

// ================== DESA CRUD ROUTES (ADMIN ONLY) ==================

// Get all desa (Admin only)
router.get('/admin/all', authenticateToken, requireAdmin, getAllDesa);

// Get desa statistics (Admin only)
router.get('/admin/stats', authenticateToken, requireAdmin, getDesaStatistics);

// Get desa by ID with pelanggan (Admin only)
router.get('/admin/:id', authenticateToken, requireAdmin, getDesaById);

// Create new desa (Admin only)
router.post('/admin', authenticateToken, requireAdmin, createDesa);

// Update desa (Admin only)
router.put('/admin/:id', authenticateToken, requireAdmin, updateDesa);

// Delete desa (Admin only)
router.delete('/admin/:id', authenticateToken, requireAdmin, deleteDesa);

// Toggle desa active status (Admin only)
router.patch('/admin/:id/toggle-status', authenticateToken, requireAdmin, toggleDesaStatus);

// ================== PUBLIC ROUTES ==================

// Get available desa for dropdown (Admin and User)
router.get('/available', authenticateToken, getAvailableDesa);

export default router;
