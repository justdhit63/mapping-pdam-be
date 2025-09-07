import pool from './config/database.js';

async function fixLongitudeSchema() {
    try {
        console.log('🔧 Fixing longitude column schema...');
        
        // Ubah longitude dari decimal(10,8) ke decimal(11,8) untuk menampung 3 digit sebelum koma
        await pool.execute(`
            ALTER TABLE pelanggan 
            MODIFY COLUMN longitude DECIMAL(11,8) NULL
        `);
        
        console.log('✅ Longitude column schema fixed successfully!');
        console.log('📋 New schema: longitude DECIMAL(11,8) - can store values like 107.12345678');
        
        // Tampilkan schema yang sudah diperbaiki
        const [rows] = await pool.execute(`
            DESCRIBE pelanggan 
        `);
        
        const coordCols = rows.filter(r => r.Field.includes('long') || r.Field.includes('lat'));
        console.log('📊 Updated coordinate columns:');
        console.table(coordCols);
        
    } catch (error) {
        console.error('❌ Error fixing schema:', error.message);
    } finally {
        process.exit(0);
    }
}

fixLongitudeSchema();
