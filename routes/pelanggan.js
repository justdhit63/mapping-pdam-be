import express from 'express';
import { authenticateToken, authenticateAdmin } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import {
    getAllPelanggan,
    getAllPelangganAdmin,
    getUserStats,
    getPelangganById,
    createPelanggan,
    updatePelanggan,
    deletePelanggan,
    createPelangganForUser,
    transferPelanggan,
    getAvailableUsers,
    bulkAssignPelanggan,
    getAvailableCabang,
    // Registration functions
    createPelangganRegistration,
    getAllRegistrations,
    getPendingRegistrations,
    getRegistrationById,
    getRegistrationStats,
    approveRegistration,
    rejectRegistration,
    updateRegistrationStatus
} from '../controllers/pelangganController.js';

const router = express.Router();

// Debug: Log all routes being registered
console.log('🔍 Registering pelanggan routes:');
console.log('  GET /admin/available-users');
console.log('  GET /admin/available-cabang');
console.log('  POST /admin/create-for-user');
console.log('  PUT /admin/transfer/:id');
console.log('  PUT /admin/bulk-assign');
console.log('  POST /registration');
console.log('  GET /registrations');
console.log('  GET /registrations/pending');

// Registration routes (HARUS DI ATAS route dengan parameter)
router.post('/registration', authenticateToken, upload.fields([
    { name: 'foto_rumah', maxCount: 1 },
    { name: 'foto_ktp', maxCount: 1 },
    { name: 'foto_kk', maxCount: 1 }
]), createPelangganRegistration);

// Admin registration management routes
router.get('/registrations', authenticateAdmin, getAllRegistrations);
router.get('/registrations/pending', authenticateAdmin, getPendingRegistrations);
router.get('/registrations/stats', authenticateAdmin, getRegistrationStats);
router.get('/registration/:id', authenticateAdmin, getRegistrationById);
router.patch('/registration/:id/approve', authenticateAdmin, approveRegistration);
router.patch('/registration/:id/reject', authenticateAdmin, rejectRegistration);
router.patch('/registration/:id/status', authenticateAdmin, updateRegistrationStatus);

// Routes khusus admin (HARUS DI ATAS route dengan parameter)
router.get('/admin/all', authenticateAdmin, getAllPelangganAdmin);
router.get('/admin/stats', authenticateAdmin, getUserStats);
router.get('/admin/available-users', authenticateAdmin, getAvailableUsers);
router.get('/admin/available-cabang', authenticateAdmin, getAvailableCabang);
router.post('/admin/create-for-user', authenticateAdmin, upload.single('foto_rumah'), createPelangganForUser);
router.put('/admin/transfer/:id', authenticateAdmin, transferPelanggan);
router.put('/admin/bulk-assign', authenticateAdmin, bulkAssignPelanggan);

// Routes untuk user dan admin - get available cabang
router.get('/available-cabang', authenticateToken, getAvailableCabang);

// Routes untuk user biasa (hanya data mereka sendiri)
router.get('/', authenticateToken, getAllPelanggan);
router.get('/:id', authenticateToken, getPelangganById);
router.post('/', authenticateToken, upload.single('foto_rumah'), createPelanggan);
router.put('/:id', authenticateToken, upload.single('foto_rumah'), updatePelanggan);
router.delete('/:id', authenticateToken, deletePelanggan);

export default router;
