import pool from './config/database.js';

async function testRelations() {
    try {
        console.log('🔍 Testing User-Pelanggan Relations...\n');

        // 1. Show all users with their pelanggan count
        console.log('📊 USERS WITH PELANGGAN COUNT:');
        const [userStats] = await pool.execute(`
            SELECT 
                u.id as user_id,
                u.email,
                COUNT(p.id) as jumlah_pelanggan
            FROM users u
            LEFT JOIN pelanggan p ON u.id = p.user_id
            GROUP BY u.id, u.email
            ORDER BY u.id
        `);
        console.table(userStats);

        // 2. Show all pelanggan with their owner
        console.log('\n👥 ALL PELANGGAN WITH USERS:');
        const [pelangganWithUsers] = await pool.execute(`
            SELECT 
                p.id,
                p.id_pelanggan,
                p.nama_pelanggan,
                p.user_id,
                u.email as user_email
            FROM pelanggan p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.user_id, p.id
        `);
        console.table(pelangganWithUsers);

        // 3. Test relation constraints
        console.log('\n🧪 TESTING RELATION CONSTRAINTS:');
        
        // Test getting pelanggan for specific user (user_id = 1)
        const [adminPelanggan] = await pool.execute(`
            SELECT COUNT(*) as count 
            FROM pelanggan 
            WHERE user_id = 1
        `);
        console.log(`✅ Admin (user_id=1) has ${adminPelanggan[0].count} pelanggan`);

        // Test foreign key constraint
        try {
            await pool.execute(`
                INSERT INTO pelanggan (user_id, id_pelanggan, nama_pelanggan) 
                VALUES (999, 'TEST001', 'Test User')
            `);
        } catch (error) {
            console.log('✅ Foreign key constraint working:', error.message);
        }

        console.log('\n✨ Relations test completed successfully!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        process.exit();
    }
}

testRelations();
