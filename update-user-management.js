import pool from './config/database.js';

async function updateUserManagement() {
    try {
        console.log('Starting user management database update...');

        // Drop existing foreign key constraint
        console.log('Dropping existing foreign key constraint...');
        try {
            await pool.execute(`
                ALTER TABLE pelanggan 
                DROP FOREIGN KEY pelanggan_ibfk_1
            `);
            console.log('✓ Dropped existing foreign key constraint');
        } catch (error) {
            console.log('Note: Foreign key constraint may not exist:', error.message);
        }

        // Add new foreign key constraint with CASCADE DELETE
        console.log('Adding new foreign key constraint with CASCADE DELETE...');
        await pool.execute(`
            ALTER TABLE pelanggan 
            ADD CONSTRAINT pelanggan_user_fk 
            FOREIGN KEY (user_id) REFERENCES users(id) 
            ON DELETE CASCADE ON UPDATE CASCADE
        `);
        console.log('✓ Added CASCADE DELETE foreign key constraint');

        // Add new columns for user management
        console.log('Adding user management columns...');
        
        try {
            await pool.execute(`
                ALTER TABLE users 
                ADD COLUMN full_name VARCHAR(255) AFTER email
            `);
            console.log('✓ Added full_name column');
        } catch (error) {
            console.log('Note: full_name column may already exist');
        }

        try {
            await pool.execute(`
                ALTER TABLE users 
                ADD COLUMN position VARCHAR(100) AFTER role
            `);
            console.log('✓ Added position column');
        } catch (error) {
            console.log('Note: position column may already exist');
        }

        try {
            await pool.execute(`
                ALTER TABLE users 
                ADD COLUMN phone VARCHAR(20) AFTER position
            `);
            console.log('✓ Added phone column');
        } catch (error) {
            console.log('Note: phone column may already exist');
        }

        try {
            await pool.execute(`
                ALTER TABLE users 
                ADD COLUMN is_active BOOLEAN DEFAULT TRUE AFTER phone
            `);
            console.log('✓ Added is_active column');
        } catch (error) {
            console.log('Note: is_active column may already exist');
        }

        try {
            await pool.execute(`
                ALTER TABLE users 
                ADD COLUMN last_login TIMESTAMP NULL AFTER is_active
            `);
            console.log('✓ Added last_login column');
        } catch (error) {
            console.log('Note: last_login column may already exist');
        }

        try {
            await pool.execute(`
                ALTER TABLE users 
                ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER last_login
            `);
            console.log('✓ Added updated_at column');
        } catch (error) {
            console.log('Note: updated_at column may already exist');
        }

        // Insert sample employee users
        console.log('Inserting sample employee users...');
        const sampleUsers = [
            {
                email: 'john.doe@pdam.co.id',
                full_name: 'John Doe',
                position: 'Staff Lapangan',
                phone: '08123456789',
                password: '$2a$10$GHwW8R2dB1zkDbQGGbsOOOEo0PWqKd8y6f2/Z3h2F5uFrI9XVYEY6' // password123
            },
            {
                email: 'jane.smith@pdam.co.id',
                full_name: 'Jane Smith',
                position: 'Supervisor',
                phone: '08198765432',
                password: '$2a$10$GHwW8R2dB1zkDbQGGbsOOOEo0PWqKd8y6f2/Z3h2F5uFrI9XVYEY6' // password123
            },
            {
                email: 'bob.wilson@pdam.co.id',
                full_name: 'Bob Wilson',
                position: 'Teknisi',
                phone: '08567890123',
                password: '$2a$10$GHwW8R2dB1zkDbQGGbsOOOEo0PWqKd8y6f2/Z3h2F5uFrI9XVYEY6' // password123
            }
        ];

        for (const user of sampleUsers) {
            try {
                const [existingUser] = await pool.execute(
                    'SELECT id FROM users WHERE email = ?',
                    [user.email]
                );

                if (existingUser.length === 0) {
                    await pool.execute(`
                        INSERT INTO users (email, full_name, role, position, phone, password) 
                        VALUES (?, ?, 'user', ?, ?, ?)
                    `, [user.email, user.full_name, user.position, user.phone, user.password]);
                    console.log(`✓ Created user: ${user.email}`);
                } else {
                    console.log(`- User already exists: ${user.email}`);
                }
            } catch (error) {
                console.log(`Error creating user ${user.email}:`, error.message);
            }
        }

        // Verify database structure
        console.log('\nVerifying database structure...');
        const [usersColumns] = await pool.execute('DESCRIBE users');
        console.log('Users table columns:');
        usersColumns.forEach(col => {
            console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
        });

        const [foreignKeys] = await pool.execute(`
            SELECT 
                CONSTRAINT_NAME, 
                COLUMN_NAME, 
                REFERENCED_TABLE_NAME, 
                REFERENCED_COLUMN_NAME,
                DELETE_RULE,
                UPDATE_RULE
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE TABLE_NAME = 'pelanggan' 
                AND TABLE_SCHEMA = 'pdam_mapping' 
                AND REFERENCED_TABLE_NAME IS NOT NULL
        `);
        
        console.log('\nForeign key constraints:');
        foreignKeys.forEach(fk => {
            console.log(`  ${fk.CONSTRAINT_NAME}: ${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME} (DELETE: ${fk.DELETE_RULE}, UPDATE: ${fk.UPDATE_RULE})`);
        });

        console.log('\n✅ User management database update completed successfully!');

    } catch (error) {
        console.error('❌ Error updating database:', error.message);
    } finally {
        await pool.end();
    }
}

updateUserManagement();
