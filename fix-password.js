import pool from './config/database.js';
import bcrypt from 'bcryptjs';

async function fixPassword() {
    try {
        console.log('🔧 Fixing admin password...');
        
        const email = 'admin@pdam.com';
        const password = 'admin123';
        
        // Generate correct hash
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('🔐 New hash generated:', hashedPassword);
        
        // Update in database
        const [result] = await pool.execute(
            'UPDATE users SET password = ? WHERE email = ?',
            [hashedPassword, email]
        );
        
        console.log('✅ Password updated for:', email);
        console.log('📝 Rows affected:', result.affectedRows);
        
        // Verify the update
        const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        const isValid = await bcrypt.compare(password, rows[0].password);
        console.log('🧪 Verification - Password match:', isValid);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        process.exit();
    }
}

fixPassword();
