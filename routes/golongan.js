import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import {
    getAllGolongan,
    getGolonganById,
    createGolongan,
    updateGolongan,
    deleteGolongan,
    toggleGolonganStatus,
    getAvailableGolongan,
    getGolonganStatistics
} from '../controllers/golonganController.js';

const router = express.Router();

// ================== GOLONGAN CRUD ROUTES (ADMIN ONLY) ==================

// Get all golongan (Admin only)
router.get('/admin/all', authenticateToken, requireAdmin, getAllGolongan);

// Get golongan statistics (Admin only)
router.get('/admin/stats', authenticateToken, requireAdmin, getGolonganStatistics);

// Get golongan by ID with pelanggan (Admin only)
router.get('/admin/:id', authenticateToken, requireAdmin, getGolonganById);

// Create new golongan (Admin only)
router.post('/admin', authenticateToken, requireAdmin, createGolongan);

// Update golongan (Admin only)
router.put('/admin/:id', authenticateToken, requireAdmin, updateGolongan);

// Delete golongan (Admin only)
router.delete('/admin/:id', authenticateToken, requireAdmin, deleteGolongan);

// Toggle golongan active status (Admin only)
router.patch('/admin/:id/toggle-status', authenticateToken, requireAdmin, toggleGolonganStatus);

// ================== PUBLIC/DROPDOWN ROUTES ==================

// Get golongan for dropdown (Public - no auth required)
router.get('/dropdown', getAvailableGolongan);

// Get available golongan for dropdown (Admin and User)
router.get('/available', authenticateToken, getAvailableGolongan);

export default router;
