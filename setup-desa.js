import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDesa() {
  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'pdam_mapping'
    });

    console.log('✅ Connected to MySQL database');

    // Read SQL file
    const sqlFile = path.join(__dirname, 'setup_desa.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Split SQL commands by semicolon and execute one by one
    const commands = sql.split(';').filter(cmd => cmd.trim() !== '');
    
    for (const command of commands) {
      if (command.trim()) {
        try {
          await connection.execute(command);
          console.log('✅ Executed SQL command successfully');
        } catch (error) {
          // Ignore "table already exists" errors
          if (error.code === 'ER_TABLE_EXISTS_ERROR' || error.code === 'ER_DUP_KEYNAME') {
            console.log('⚠️  Table or index already exists, skipping...');
          } else {
            console.error('❌ Error executing command:', error.message);
          }
        }
      }
    }

    // Test the setup by checking tables
    const [tables] = await connection.execute("SHOW TABLES");
    console.log('\n📋 Current tables in database:');
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });

    // Check desa table structure
    try {
      const [desaColumns] = await connection.execute("DESCRIBE desa");
      console.log('\n🏘️  Desa table structure:');
      desaColumns.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? '(NOT NULL)' : ''} ${col.Key ? `(${col.Key})` : ''}`);
      });
    } catch (error) {
      console.log('❌ Desa table not found');
    }

    // Check pelanggan table for desa_id column
    try {
      const [pelangganColumns] = await connection.execute("DESCRIBE pelanggan");
      const desaIdColumn = pelangganColumns.find(col => col.Field === 'desa_id');
      if (desaIdColumn) {
        console.log('\n👥 Pelanggan table has desa_id column:');
        console.log(`  - ${desaIdColumn.Field}: ${desaIdColumn.Type} ${desaIdColumn.Null === 'NO' ? '(NOT NULL)' : ''} ${desaIdColumn.Key ? `(${desaIdColumn.Key})` : ''}`);
      }
    } catch (error) {
      console.log('❌ Error checking pelanggan table');
    }

    // Check sample data
    try {
      const [desaData] = await connection.execute("SELECT COUNT(*) as count FROM desa");
      console.log(`\n📊 Total desa records: ${desaData[0].count}`);
      
      if (desaData[0].count > 0) {
        const [sampleDesa] = await connection.execute("SELECT * FROM desa LIMIT 5");
        console.log('\n🏘️  Sample desa data:');
        sampleDesa.forEach(desa => {
          console.log(`  - ID: ${desa.id}, Name: ${desa.nama_desa}, Status: ${desa.is_active ? 'Active' : 'Inactive'}`);
        });
      }
    } catch (error) {
      console.log('❌ Error checking desa data:', error.message);
    }

    await connection.end();
    console.log('\n✅ Database setup completed successfully!');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

setupDesa();
