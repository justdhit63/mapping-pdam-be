import pool from './config/database.js';
import bcrypt from 'bcryptjs';

async function debugAuth() {
    try {
        console.log('🔍 Debugging authentication...');
        
        // Check users in database
        const [users] = await pool.execute('SELECT id, email, password FROM users');
        console.log('👥 Users in database:', users);
        
        // Test the specific user
        const testEmail = 'admin@pdam.com';
        const testPassword = 'admin123';
        
        console.log(`\n🧪 Testing login with: ${testEmail} / ${testPassword}`);
        
        const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [testEmail]);
        
        if (rows.length === 0) {
            console.log('❌ User not found in database');
        } else {
            console.log('✅ User found:', { id: rows[0].id, email: rows[0].email });
            
            const storedHash = rows[0].password;
            console.log('🔐 Stored hash:', storedHash);
            
            // Test password comparison
            const isValid = await bcrypt.compare(testPassword, storedHash);
            console.log('🔑 Password match:', isValid);
            
            if (!isValid) {
                // Create new hash for comparison
                const newHash = await bcrypt.hash(testPassword, 10);
                console.log('🆕 New hash would be:', newHash);
            }
        }
        
    } catch (error) {
        console.error('❌ Debug error:', error.message);
    } finally {
        process.exit();
    }
}

debugAuth();
