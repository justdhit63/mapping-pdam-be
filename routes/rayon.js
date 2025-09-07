import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import {
    getAllRayon,
    getRayonById,
    createRayon,
    updateRayon,
    deleteRayon,
    toggleRayonStatus,
    getAvailableRayon,
    getRayonStatistics
} from '../controllers/rayonController.js';

const router = express.Router();

// ================== RAYON CRUD ROUTES (ADMIN ONLY) ==================

// Get all rayon (Admin only)
router.get('/admin/all', authenticateToken, requireAdmin, getAllRayon);

// Get rayon statistics (Admin only)
router.get('/admin/stats', authenticateToken, requireAdmin, getRayonStatistics);

// Get rayon by ID with pelanggan (Admin only)
router.get('/admin/:id', authenticateToken, requireAdmin, getRayonById);

// Create new rayon (Admin only)
router.post('/admin', authenticateToken, requireAdmin, createRayon);

// Update rayon (Admin only)
router.put('/admin/:id', authenticateToken, requireAdmin, updateRayon);

// Delete rayon (Admin only)
router.delete('/admin/:id', authenticateToken, requireAdmin, deleteRayon);

// Toggle rayon active status (Admin only)
router.patch('/admin/:id/toggle-status', authenticateToken, requireAdmin, toggleRayonStatus);

// ================== PUBLIC/DROPDOWN ROUTES ==================

// Get rayon for dropdown (Public - no auth required)
router.get('/dropdown', getAvailableRayon);

// Get available rayon for dropdown (Admin and User)
router.get('/available', authenticateToken, getAvailableRayon);

export default router;
