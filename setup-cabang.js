import pool from './config/database.js';

async function setupCabang() {
    try {
        console.log('🏢 Setting up Cabang system...');

        // 1. Create cabang table
        console.log('Creating cabang table...');
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS cabang (
                id INT PRIMARY KEY AUTO_INCREMENT,
                kode_unit VARCHAR(10) NOT NULL UNIQUE,
                nama_unit VARCHAR(255) NOT NULL,
                alamat TEXT,
                telepon VARCHAR(20),
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Cabang table created');

        // 2. Check if cabang_id column exists in users table
        const [columns] = await pool.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'users' 
                AND TABLE_SCHEMA = 'pdam_mapping' 
                AND COLUMN_NAME = 'cabang_id'
        `);

        if (columns.length === 0) {
            console.log('Adding cabang_id to users table...');
            await pool.execute(`
                ALTER TABLE users 
                ADD COLUMN cabang_id INT NULL AFTER role
            `);
            console.log('✅ Added cabang_id column to users table');

            // Add foreign key constraint
            await pool.execute(`
                ALTER TABLE users 
                ADD CONSTRAINT fk_users_cabang 
                FOREIGN KEY (cabang_id) REFERENCES cabang(id) 
                ON DELETE SET NULL ON UPDATE CASCADE
            `);
            console.log('✅ Added foreign key constraint');
        } else {
            console.log('⚠️ cabang_id column already exists in users table');
        }

        // 3. Insert sample cabang data
        console.log('Inserting sample cabang data...');
        const sampleCabang = [
            {
                kode_unit: 'PDM001',
                nama_unit: 'PDAM Cabang Pusat',
                alamat: 'Jl. Merdeka No. 1, Jakarta Pusat',
                telepon: '021-1234567'
            },
            {
                kode_unit: 'PDM002',
                nama_unit: 'PDAM Cabang Utara',
                alamat: 'Jl. Kelapa Gading No. 25, Jakarta Utara',
                telepon: '021-2345678'
            },
            {
                kode_unit: 'PDM003',
                nama_unit: 'PDAM Cabang Selatan',
                alamat: 'Jl. Fatmawati No. 15, Jakarta Selatan',
                telepon: '021-3456789'
            },
            {
                kode_unit: 'PDM004',
                nama_unit: 'PDAM Cabang Timur',
                alamat: 'Jl. Rawamangun No. 30, Jakarta Timur',
                telepon: '021-4567890'
            },
            {
                kode_unit: 'PDM005',
                nama_unit: 'PDAM Cabang Barat',
                alamat: 'Jl. Kebon Jeruk No. 40, Jakarta Barat',
                telepon: '021-5678901'
            }
        ];

        for (const cabang of sampleCabang) {
            try {
                const [existingCabang] = await pool.execute(
                    'SELECT id FROM cabang WHERE kode_unit = ?',
                    [cabang.kode_unit]
                );

                if (existingCabang.length === 0) {
                    await pool.execute(`
                        INSERT INTO cabang (kode_unit, nama_unit, alamat, telepon) 
                        VALUES (?, ?, ?, ?)
                    `, [cabang.kode_unit, cabang.nama_unit, cabang.alamat, cabang.telepon]);
                    console.log(`✅ Created cabang: ${cabang.kode_unit} - ${cabang.nama_unit}`);
                } else {
                    console.log(`⚠️ Cabang already exists: ${cabang.kode_unit}`);
                }
            } catch (error) {
                console.log(`❌ Error creating cabang ${cabang.kode_unit}:`, error.message);
            }
        }

        // 4. Update existing users to have cabang (sample assignment)
        console.log('Assigning users to cabang...');
        const userAssignments = [
            { userEmail: 'admin@pdam.com', cabangKode: 'PDM001' },
            { userEmail: 'superadmin@pdam.com', cabangKode: 'PDM001' },
            { userEmail: 'user1@pdam.com', cabangKode: 'PDM002' },
            { userEmail: 'user2@pdam.com', cabangKode: 'PDM003' },
            { userEmail: 'john.doe@pdam.co.id', cabangKode: 'PDM004' },
            { userEmail: 'jane.smith@pdam.co.id', cabangKode: 'PDM005' },
            { userEmail: 'bob.wilson@pdam.co.id', cabangKode: 'PDM002' }
        ];

        for (const assignment of userAssignments) {
            try {
                // Get cabang ID
                const [cabang] = await pool.execute(
                    'SELECT id FROM cabang WHERE kode_unit = ?',
                    [assignment.cabangKode]
                );

                if (cabang.length > 0) {
                    await pool.execute(
                        'UPDATE users SET cabang_id = ? WHERE email = ?',
                        [cabang[0].id, assignment.userEmail]
                    );
                    console.log(`✅ Assigned ${assignment.userEmail} to ${assignment.cabangKode}`);
                }
            } catch (error) {
                console.log(`❌ Error assigning ${assignment.userEmail}:`, error.message);
            }
        }

        // 5. Verify setup
        console.log('\n📊 Verification Results:');
        
        // Check cabang table
        const [allCabang] = await pool.execute('SELECT * FROM cabang ORDER BY kode_unit');
        console.log(`\n🏢 Cabang Table (${allCabang.length} records):`);
        allCabang.forEach(cabang => {
            console.log(`  ${cabang.kode_unit}: ${cabang.nama_unit}`);
        });

        // Check users with cabang
        const [usersWithCabang] = await pool.execute(`
            SELECT u.email, u.role, u.full_name, c.kode_unit, c.nama_unit 
            FROM users u 
            LEFT JOIN cabang c ON u.cabang_id = c.id 
            ORDER BY u.role DESC, c.kode_unit
        `);
        console.log(`\n👥 Users with Cabang Assignment (${usersWithCabang.length} users):`);
        usersWithCabang.forEach(user => {
            const cabangInfo = user.kode_unit ? `${user.kode_unit} - ${user.nama_unit}` : 'No Cabang';
            console.log(`  ${user.email} (${user.role}) → ${cabangInfo}`);
        });

        // Check cabang user counts
        const [cabangStats] = await pool.execute(`
            SELECT 
                c.kode_unit,
                c.nama_unit,
                COUNT(u.id) as total_users
            FROM cabang c
            LEFT JOIN users u ON c.id = u.cabang_id
            GROUP BY c.id, c.kode_unit, c.nama_unit
            ORDER BY c.kode_unit
        `);
        console.log(`\n📈 Cabang Statistics:`);
        cabangStats.forEach(stat => {
            console.log(`  ${stat.kode_unit}: ${stat.total_users} users`);
        });

        console.log('\n🎉 Cabang system setup completed successfully!');

    } catch (error) {
        console.error('❌ Error setting up cabang system:', error);
        console.error('Error details:', error.message);
        console.error('Stack trace:', error.stack);
    } finally {
        await pool.end();
    }
}

setupCabang();
