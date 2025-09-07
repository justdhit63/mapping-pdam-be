import pool from '../config/database.js';

export async function ensureCorrectSchema() {
    try {
        console.log('🔍 Checking database schema...');
        
        // Check current longitude column definition
        const [rows] = await pool.execute(`
            SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'pdam_mapping' 
            AND TABLE_NAME = 'pelanggan' 
            AND COLUMN_NAME = 'longitude'
        `);
        
        if (rows.length > 0) {
            const currentType = rows[0].COLUMN_TYPE;
            console.log('📊 Current longitude type:', currentType);
            
            if (currentType === 'decimal(10,8)') {
                console.log('🔧 Fixing longitude schema for Indonesian coordinates...');
                
                await pool.execute(`
                    ALTER TABLE pelanggan 
                    MODIFY COLUMN longitude DECIMAL(11,8) NULL
                `);
                
                console.log('✅ Longitude schema updated to DECIMAL(11,8)');
            } else {
                console.log('✅ Longitude schema is correct');
            }
        }
    } catch (error) {
        console.error('❌ Schema check error:', error.message);
    }
}
