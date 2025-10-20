import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from server directory
dotenv.config({ path: join(__dirname, '..', '.env') });

console.log('🔍 Database Environment Variables:');
console.log('DB_HOST:', process.env.DB_HOST || 'NOT SET');
console.log('DB_USER:', process.env.DB_USER || 'NOT SET');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***SET***' : 'NOT SET');
console.log('DB_NAME:', process.env.DB_NAME || 'NOT SET');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '', // Empty string for no password
    database: process.env.DB_NAME || 'pdam_mapping',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

console.log('🔍 Final DB Config:');
console.log('Host:', dbConfig.host);
console.log('User:', dbConfig.user);
console.log('Password:', dbConfig.password ? '***SET***' : 'EMPTY');
console.log('Database:', dbConfig.database);

const pool = mysql.createPool(dbConfig);

export default pool;
