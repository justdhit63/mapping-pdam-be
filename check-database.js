import pool from './config/database.js';

async function checkDatabase() {
    try {
        console.log('Checking current database structure...');

        // Check users table
        console.log('\n=== USERS TABLE ===');
        const [usersColumns] = await pool.execute('DESCRIBE users');
        console.log('Columns:');
        usersColumns.forEach(col => {
            console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
        });

        // Check pelanggan table
        console.log('\n=== PELANGGAN TABLE ===');
        const [pelangganColumns] = await pool.execute('DESCRIBE pelanggan');
        console.log('Columns:');
        pelangganColumns.forEach(col => {
            console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
        });

        // Check foreign keys
        console.log('\n=== FOREIGN KEY CONSTRAINTS ===');
        const [foreignKeys] = await pool.execute(`
            SELECT 
                CONSTRAINT_NAME, 
                COLUMN_NAME, 
                REFERENCED_TABLE_NAME, 
                REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE TABLE_NAME = 'pelanggan' 
                AND TABLE_SCHEMA = 'pdam_mapping' 
                AND REFERENCED_TABLE_NAME IS NOT NULL
        `);
        
        if (foreignKeys.length > 0) {
            foreignKeys.forEach(fk => {
                console.log(`  ${fk.CONSTRAINT_NAME}: ${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
            });
        } else {
            console.log('  No foreign key constraints found');
        }

        // Check current users
        console.log('\n=== CURRENT USERS ===');
        const [users] = await pool.execute('SELECT id, email, role, created_at FROM users ORDER BY created_at');
        users.forEach(user => {
            console.log(`  ID: ${user.id}, Email: ${user.email}, Role: ${user.role}, Created: ${user.created_at}`);
        });

        console.log('\n✅ Database check completed!');

    } catch (error) {
        console.error('❌ Error checking database:', error.message);
    } finally {
        await pool.end();
    }
}

checkDatabase();
