import mysql from 'mysql2/promise';

async function checkUsers() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'pdam_mapping'
    });

    console.log('✅ Connected to MySQL database');

    // Check users table
    const [users] = await connection.execute("SELECT id, email, role, created_at FROM users ORDER BY id");
    console.log('\n👥 Users in database:');
    users.forEach(user => {
      console.log(`  - ID: ${user.id}, Email: ${user.email}, Role: ${user.role}, Created: ${user.created_at}`);
    });

    // Check if admin exists
    const [adminUsers] = await connection.execute("SELECT * FROM users WHERE role = 'admin'");
    console.log(`\n🔑 Admin users found: ${adminUsers.length}`);

    if (adminUsers.length === 0) {
      console.log('\n❌ No admin users found. Creating default admin...');
      
      // Create default admin
      const adminEmail = 'admin@admin.com';
      const adminPassword = 'admin123';
      
      await connection.execute(
        "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
        [adminEmail, adminPassword, 'admin']
      );
      
      console.log(`✅ Default admin created with email: ${adminEmail} and password: ${adminPassword}`);
    }

    await connection.end();
    console.log('\n✅ Check completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUsers();
