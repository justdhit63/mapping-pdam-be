// Test database connection
import dotenv from 'dotenv';
import pool from './config/database.js';

dotenv.config();

async function testConnection() {
    try {
        console.log('\n🧪 Testing database connection...\n');
        
        const connection = await pool.getConnection();
        console.log('✅ Database connection successful!');
        
        // Test simple query
        const [rows] = await connection.execute('SELECT 1 as test');
        console.log('✅ Test query successful:', rows[0]);
        
        // Test if pdam_mapping database exists
        const [databases] = await connection.execute('SHOW DATABASES LIKE "pdam_mapping"');
        if (databases.length > 0) {
            console.log('✅ pdam_mapping database exists');
            
            // Test if pelanggan table exists
            const [tables] = await connection.execute('SHOW TABLES FROM pdam_mapping LIKE "pelanggan"');
            if (tables.length > 0) {
                console.log('✅ pelanggan table exists');
                
                // Check if registration fields exist
                const [columns] = await connection.execute(`
                    SELECT COLUMN_NAME 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_SCHEMA = 'pdam_mapping' 
                    AND TABLE_NAME = 'pelanggan' 
                    AND COLUMN_NAME IN ('no_registrasi', 'email', 'foto_ktp_url', 'foto_kk_url', 'status_registrasi')
                `);
                
                console.log('📋 Registration fields found:', columns.map(c => c.COLUMN_NAME));
                
                if (columns.length < 5) {
                    console.log('⚠️  Some registration fields are missing. You may need to run the SQL migration.');
                }
            } else {
                console.log('❌ pelanggan table not found');
            }
        } else {
            console.log('❌ pdam_mapping database not found');
        }
        
        connection.release();
        console.log('\n🎉 Database test completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Database test failed:');
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('\n💡 Troubleshooting tips:');
            console.log('1. Check if MySQL is running');
            console.log('2. Verify DB_USER and DB_PASSWORD in .env file');
            console.log('3. Try connecting with MySQL Workbench or command line first');
            console.log('4. Common passwords: empty string, "root", "admin"');
        }
        
        process.exit(1);
    }
}

testConnection();