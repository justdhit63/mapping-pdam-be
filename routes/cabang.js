import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import {
    getAllCabang,
    getCabangById,
    createCabang,
    updateCabang,
    deleteCabang,
    toggleCabangStatus,
    getUsersWithoutCabang,
    assignUserToCabang,
    transferUserToCabang,
    bulkAssignUsersToCabang
} from '../controllers/cabangController.js';

const router = express.Router();

// ================== CABANG CRUD ROUTES ==================
// All cabang routes require admin role

// Get all cabang (Admin only)
router.get('/', authenticateToken, requireAdmin, getAllCabang);

// Get cabang by ID with users (Admin only)
router.get('/:id', authenticateToken, requireAdmin, getCabangById);

// Create new cabang (Admin only)
router.post('/', authenticateToken, requireAdmin, createCabang);

// Update cabang (Admin only)
router.put('/:id', authenticateToken, requireAdmin, updateCabang);

// Delete cabang (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, deleteCabang);

// Toggle cabang active status (Admin only)
router.patch('/:id/toggle-status', authenticateToken, requireAdmin, toggleCabangStatus);

// ================== USER-CABANG ASSIGNMENT ROUTES ==================

// Get users without cabang (Admin only)
router.get('/assignments/unassigned-users', authenticateToken, requireAdmin, getUsersWithoutCabang);

// Assign user to cabang (Admin only)
router.post('/assignments/assign', authenticateToken, requireAdmin, assignUserToCabang);

// Transfer user to different cabang (Admin only)
router.put('/assignments/transfer', authenticateToken, requireAdmin, transferUserToCabang);

// Bulk assign multiple users to cabang (Admin only)
router.post('/assignments/bulk-assign', authenticateToken, requireAdmin, bulkAssignUsersToCabang);

export default router;
