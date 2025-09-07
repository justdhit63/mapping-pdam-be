import pool from './config/database.js';

async function testConnection() {
    try {
        console.log('Testing database connection...');
        const [rows] = await pool.execute('SELECT 1 as test');
        console.log('✅ Database connection successful!', rows);
        
        // Test if tables exist
        const [tables] = await pool.execute('SHOW TABLES');
        console.log('📋 Available tables:', tables);
        
        // Test users table
        const [users] = await pool.execute('SELECT COUNT(*) as count FROM users');
        console.log('👤 Users count:', users[0].count);
        
        // Test pelanggan table
        const [pelanggan] = await pool.execute('SELECT COUNT(*) as count FROM pelanggan');
        console.log('👥 Pelanggan count:', pelanggan[0].count);
        
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Make sure MySQL server is running');
        }
        if (error.code === 'ER_BAD_DB_ERROR') {
            console.log('💡 Database "pdam_mapping" does not exist. Please create it first.');
        }
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('💡 Check your MySQL username and password in .env file');
        }
    } finally {
        process.exit();
    }
}

testConnection();
