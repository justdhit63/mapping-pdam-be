const mysql = require('mysql2/promise');

async function fixSchema() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '', // sesuaikan dengan password MySQL Anda
        database: 'pdam_mapping'
    });

    try {
        console.log('🔧 Fixing longitude schema...');
        
        await connection.execute(`
            ALTER TABLE pelanggan 
            MODIFY COLUMN longitude DECIMAL(11,8) NULL
        `);
        
        console.log('✅ Longitude schema fixed!');
        
        const [rows] = await connection.execute('DESCRIBE pelanggan');
        const coordCols = rows.filter(r => r.Field === 'longitude' || r.Field === 'latitude');
        console.table(coordCols);
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await connection.end();
    }
}

fixSchema();
