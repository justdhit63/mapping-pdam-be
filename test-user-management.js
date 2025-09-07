import pool from './config/database.js';
import bcrypt from 'bcryptjs';

async function testUserManagement() {
    try {
        console.log('Testing User Management APIs...');

        // Test 1: Get all users
        console.log('\n=== TEST 1: Get All Users ===');
        const [users] = await pool.execute(`
            SELECT 
                u.id, u.email, u.full_name, u.role, u.position, u.phone, 
                u.is_active, u.created_at, u.last_login,
                COUNT(p.id) as total_pelanggan
            FROM users u
            LEFT JOIN pelanggan p ON u.id = p.user_id
            WHERE u.role != 'admin'
            GROUP BY u.id, u.email, u.full_name, u.role, u.position, u.phone, u.is_active, u.created_at, u.last_login
            ORDER BY u.created_at DESC
        `);
        console.log('Non-admin users:', users.length);
        users.forEach(user => {
            console.log(`  ${user.email} (${user.full_name}) - ${user.total_pelanggan} pelanggan`);
        });

        // Test 2: Create new user
        console.log('\n=== TEST 2: Create New User ===');
        const testEmail = 'test.user@pdam.co.id';
        
        // Check if test user exists
        const [existingUser] = await pool.execute('SELECT id FROM users WHERE email = ?', [testEmail]);
        
        if (existingUser.length === 0) {
            const hashedPassword = await bcrypt.hash('testpassword123', 10);
            const [result] = await pool.execute(`
                INSERT INTO users (email, full_name, role, position, phone, password) 
                VALUES (?, ?, 'user', ?, ?, ?)
            `, [testEmail, 'Test User', 'QA Tester', '08111222333', hashedPassword]);
            
            console.log(`✓ Created test user with ID: ${result.insertId}`);
        } else {
            console.log('Test user already exists');
        }

        // Test 3: Update user
        console.log('\n=== TEST 3: Update User ===');
        const [testUser] = await pool.execute('SELECT id FROM users WHERE email = ?', [testEmail]);
        if (testUser.length > 0) {
            await pool.execute(
                'UPDATE users SET position = ?, phone = ? WHERE id = ?',
                ['Senior QA Tester', '08999888777', testUser[0].id]
            );
            console.log('✓ Updated test user position and phone');
        }

        // Test 4: Toggle user status
        console.log('\n=== TEST 4: Toggle User Status ===');
        if (testUser.length > 0) {
            const [currentUser] = await pool.execute('SELECT is_active FROM users WHERE id = ?', [testUser[0].id]);
            const newStatus = !currentUser[0].is_active;
            
            await pool.execute('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, testUser[0].id]);
            console.log(`✓ User status changed to: ${newStatus ? 'Active' : 'Inactive'}`);
        }

        // Test 5: Test CASCADE DELETE (create pelanggan for test user)
        console.log('\n=== TEST 5: Test CASCADE DELETE ===');
        if (testUser.length > 0) {
            // Create test pelanggan
            const [pelangganResult] = await pool.execute(`
                INSERT INTO pelanggan (user_id, id_pelanggan, nama_pelanggan, alamat) 
                VALUES (?, ?, ?, ?)
            `, [testUser[0].id, 'TEST001', 'Test Pelanggan', 'Test Address']);
            console.log(`✓ Created test pelanggan with ID: ${pelangganResult.insertId}`);

            // Count pelanggan before delete
            const [beforeCount] = await pool.execute('SELECT COUNT(*) as count FROM pelanggan WHERE user_id = ?', [testUser[0].id]);
            console.log(`Pelanggan count before delete: ${beforeCount[0].count}`);

            // Delete user (should cascade delete pelanggan)
            await pool.execute('DELETE FROM users WHERE id = ?', [testUser[0].id]);
            console.log('✓ Deleted test user');

            // Count pelanggan after delete
            const [afterCount] = await pool.execute('SELECT COUNT(*) as count FROM pelanggan WHERE user_id = ?', [testUser[0].id]);
            console.log(`Pelanggan count after delete: ${afterCount[0].count}`);

            if (beforeCount[0].count > 0 && afterCount[0].count === 0) {
                console.log('✅ CASCADE DELETE is working correctly!');
            } else {
                console.log('❌ CASCADE DELETE may not be working');
            }
        }

        // Test 6: Final user count
        console.log('\n=== TEST 6: Final User Count ===');
        const [finalUsers] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE role != "admin"');
        console.log(`Final non-admin user count: ${finalUsers[0].count}`);

        console.log('\n✅ User Management test completed!');

    } catch (error) {
        console.error('❌ Error testing user management:', error.message);
    } finally {
        await pool.end();
    }
}

testUserManagement();
