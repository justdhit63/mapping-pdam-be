import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Routes
import authRoutes from './routes/auth.js';
import pelangganRoutes from './routes/pelanggan.js';
import userRoutes from './routes/users.js';
import cabangRoutes from './routes/cabang.js';
import desaRoutes from './routes/desa.js';
import kecamatanRoutes from './routes/kecamatan.js';
import rayonRoutes from './routes/rayon.js';
import golonganRoutes from './routes/golongan.js';
import kelompokRoutes from './routes/kelompok.js';
import { ensureCorrectSchema } from './utils/schemaFix.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/pelanggan', pelangganRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cabang', cabangRoutes);
app.use('/api/desa', desaRoutes);
app.use('/api/kecamatan', kecamatanRoutes);
app.use('/api/rayon', rayonRoutes);
app.use('/api/golongan', golonganRoutes);
app.use('/api/kelompok', kelompokRoutes);

// Debug routes
console.log('🔍 Registered routes:');
console.log('  /api/auth/*');
console.log('  /api/pelanggan/*');
console.log('  /api/users/*');
console.log('  /api/cabang/*');
console.log('  /api/desa/*');
console.log('  /api/kecamatan/*');
console.log('  /api/rayon/*');
console.log('  /api/golongan/*');
console.log('  /api/kelompok/*');

app.get('/', (req, res) => {
    res.json({ message: 'PDAM Mapping API Server is running!' });
});

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    
    // Ensure database schema is correct for Indonesian coordinates
    await ensureCorrectSchema();
});
