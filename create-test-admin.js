import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';

async function createTestAdmin() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'pdam_mapping'
    });

    console.log('✅ Connected to MySQL database');

    // Hash the password
    const plainPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    
    console.log(`🔐 Plain password: ${plainPassword}`);
    console.log(`🔐 Hashed password: ${hashedPassword}`);

    // Create or update admin user
    const adminEmail = 'testadmin@pdam.com';
    
    // Delete if exists
    await connection.execute("DELETE FROM users WHERE email = ?", [adminEmail]);
    
    // Insert new admin
    await connection.execute(
      "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
      [adminEmail, hashedPassword, 'admin']
    );
    
    console.log(`✅ Test admin created:`);
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${plainPassword}`);
    console.log(`   Role: admin`);

    // Test password verification
    const [users] = await connection.execute("SELECT * FROM users WHERE email = ?", [adminEmail]);
    if (users.length > 0) {
      const user = users[0];
      const isValid = await bcrypt.compare(plainPassword, user.password);
      console.log(`🔐 Password verification: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    }

    await connection.end();
    console.log('\n✅ Test admin setup completed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTestAdmin();
