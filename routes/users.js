import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import {
    getAllUsers,
    getUserById,
    createUser,
    createBulkUsers,
    updateUser,
    deleteUser,
    deleteBulkUsers,
    toggleUserStatus
} from '../controllers/userController.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticateToken);
router.use(requireAdmin);

// Get all users
router.get('/', getAllUsers);

// Get user by ID
router.get('/:id', getUserById);

// Create single user
router.post('/', createUser);

// Create multiple users (bulk)
router.post('/bulk', createBulkUsers);

// Update user
router.put('/:id', updateUser);

// Delete user
router.delete('/:id', deleteUser);

// Delete multiple users (bulk)
router.delete('/bulk/delete', deleteBulkUsers);

// Toggle user active status
router.patch('/:id/toggle-status', toggleUserStatus);

export default router;
