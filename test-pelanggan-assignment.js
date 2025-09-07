import pool from './config/database.js';

async function testPelangganAssignment() {
    try {
        console.log('Testing Pelanggan Assignment APIs...');

        // Test 1: Get available users
        console.log('\n=== TEST 1: Get Available Users ===');
        const [availableUsers] = await pool.execute(`
            SELECT 
                u.id, 
                u.email, 
                u.full_name, 
                u.position,
                u.is_active,
                COUNT(p.id) as total_pelanggan
            FROM users u
            LEFT JOIN pelanggan p ON u.id = p.user_id
            WHERE u.role != 'admin' AND u.is_active = TRUE
            GROUP BY u.id, u.email, u.full_name, u.position, u.is_active
            ORDER BY u.full_name ASC
        `);
        
        console.log(`Found ${availableUsers.length} available users:`);
        availableUsers.forEach(user => {
            console.log(`  ${user.full_name || user.email} (${user.position || 'No position'}) - ${user.total_pelanggan} pelanggan`);
        });

        if (availableUsers.length === 0) {
            console.log('⚠️ No available users found. Creating test user...');
            const bcrypt = await import('bcryptjs');
            const hashedPassword = await bcrypt.default.hash('testpass123', 10);
            
            const [result] = await pool.execute(`
                INSERT INTO users (email, full_name, role, position, phone, password) 
                VALUES (?, ?, 'user', ?, ?, ?)
            `, ['teststaff@pdam.co.id', 'Test Staff', 'Test Staff', '08555666777', hashedPassword]);
            
            console.log(`✓ Created test user with ID: ${result.insertId}`);
        }

        // Test 2: Create pelanggan for user
        console.log('\n=== TEST 2: Create Pelanggan for User ===');
        const targetUserId = availableUsers.length > 0 ? availableUsers[0].id : (await pool.execute('SELECT id FROM users WHERE role = "user" ORDER BY id DESC LIMIT 1'))[0][0].id;
        
        // Check if test pelanggan already exists
        const [existingPelanggan] = await pool.execute('SELECT id FROM pelanggan WHERE id_pelanggan = ?', ['TEST-ASSIGN-001']);
        
        if (existingPelanggan.length === 0) {
            const [result] = await pool.execute(`
                INSERT INTO pelanggan (
                    user_id, id_pelanggan, nama_pelanggan, no_telpon, alamat, 
                    jumlah_jiwa, jenis_meter, longitude, latitude
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                targetUserId, 'TEST-ASSIGN-001', 'Test Pelanggan Assignment', '08111222333',
                'Jalan Test Assignment No. 1', 4, 'Digital', 106.8456, -6.2088
            ]);
            
            console.log(`✓ Created test pelanggan with ID: ${result.insertId} for user ID: ${targetUserId}`);
        } else {
            console.log('Test pelanggan already exists');
        }

        // Test 3: Transfer pelanggan to different user
        console.log('\n=== TEST 3: Transfer Pelanggan ===');
        if (availableUsers.length >= 2) {
            const sourceUserId = availableUsers[0].id;
            const targetUserId = availableUsers[1].id;
            
            // Get pelanggan from source user
            const [sourcePelanggan] = await pool.execute(
                'SELECT id, nama_pelanggan FROM pelanggan WHERE user_id = ? LIMIT 1',
                [sourceUserId]
            );
            
            if (sourcePelanggan.length > 0) {
                // Transfer pelanggan
                await pool.execute(
                    'UPDATE pelanggan SET user_id = ? WHERE id = ?',
                    [targetUserId, sourcePelanggan[0].id]
                );
                
                console.log(`✓ Transferred pelanggan "${sourcePelanggan[0].nama_pelanggan}" from user ${sourceUserId} to user ${targetUserId}`);
                
                // Transfer back for next tests
                await pool.execute(
                    'UPDATE pelanggan SET user_id = ? WHERE id = ?',
                    [sourceUserId, sourcePelanggan[0].id]
                );
                console.log('✓ Transferred back for cleanup');
            } else {
                console.log('No pelanggan found for transfer test');
            }
        } else {
            console.log('Not enough users for transfer test');
        }

        // Test 4: Bulk assign pelanggan
        console.log('\n=== TEST 4: Bulk Assign Pelanggan ===');
        if (availableUsers.length > 0) {
            // Get some pelanggan IDs
            const [pelangganList] = await pool.execute(
                'SELECT id FROM pelanggan LIMIT 2'
            );
            
            if (pelangganList.length > 0) {
                const pelangganIds = pelangganList.map(p => p.id);
                const targetUserId = availableUsers[0].id;
                
                // Bulk assign
                const placeholders = pelangganIds.map(() => '?').join(',');
                const [result] = await pool.execute(
                    `UPDATE pelanggan SET user_id = ? WHERE id IN (${placeholders})`,
                    [targetUserId, ...pelangganIds]
                );
                
                console.log(`✓ Bulk assigned ${result.affectedRows} pelanggan to user ID: ${targetUserId}`);
            } else {
                console.log('No pelanggan found for bulk assign test');
            }
        }

        // Test 5: Final summary
        console.log('\n=== TEST 5: Final Summary ===');
        const [finalSummary] = await pool.execute(`
            SELECT 
                u.email,
                u.full_name,
                COUNT(p.id) as total_pelanggan
            FROM users u
            LEFT JOIN pelanggan p ON u.id = p.user_id
            WHERE u.role != 'admin'
            GROUP BY u.id, u.email, u.full_name
            ORDER BY total_pelanggan DESC
        `);
        
        console.log('Final pelanggan distribution:');
        finalSummary.forEach(user => {
            console.log(`  ${user.full_name || user.email}: ${user.total_pelanggan} pelanggan`);
        });

        console.log('\n✅ Pelanggan Assignment test completed!');

    } catch (error) {
        console.error('❌ Error testing pelanggan assignment:', error.message);
    } finally {
        await pool.end();
    }
}

testPelangganAssignment();
