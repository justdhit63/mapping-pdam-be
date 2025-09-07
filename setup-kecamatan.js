import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupKecamatan() {
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
    const sqlFile = path.join(__dirname, 'setup_kecamatan.sql');
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
          if (error.code === 'ER_TABLE_EXISTS_ERROR' || error.code === 'ER_DUP_KEYNAME' || error.code === 'ER_DUP_ENTRY') {
            console.log('⚠️  Table/Index/Data already exists, skipping...');
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

    // Check kecamatan table structure
    try {
      const [kecamatanColumns] = await connection.execute("DESCRIBE kecamatan");
      console.log('\n🏛️  Kecamatan table structure:');
      kecamatanColumns.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? '(NOT NULL)' : ''} ${col.Key ? `(${col.Key})` : ''}`);
      });
    } catch (error) {
      console.log('❌ Kecamatan table not found');
    }

    // Check desa table for kecamatan_id column
    try {
      const [desaColumns] = await connection.execute("DESCRIBE desa");
      const kecamatanIdColumn = desaColumns.find(col => col.Field === 'kecamatan_id');
      if (kecamatanIdColumn) {
        console.log('\n🏘️  Desa table has kecamatan_id column:');
        console.log(`  - ${kecamatanIdColumn.Field}: ${kecamatanIdColumn.Type} ${kecamatanIdColumn.Null === 'NO' ? '(NOT NULL)' : ''} ${kecamatanIdColumn.Key ? `(${kecamatanIdColumn.Key})` : ''}`);
      }
    } catch (error) {
      console.log('❌ Error checking desa table');
    }

    // Check pelanggan table for kecamatan_id column
    try {
      const [pelangganColumns] = await connection.execute("DESCRIBE pelanggan");
      const kecamatanIdColumn = pelangganColumns.find(col => col.Field === 'kecamatan_id');
      if (kecamatanIdColumn) {
        console.log('\n👥 Pelanggan table has kecamatan_id column:');
        console.log(`  - ${kecamatanIdColumn.Field}: ${kecamatanIdColumn.Type} ${kecamatanIdColumn.Null === 'NO' ? '(NOT NULL)' : ''} ${kecamatanIdColumn.Key ? `(${kecamatanIdColumn.Key})` : ''}`);
      }
    } catch (error) {
      console.log('❌ Error checking pelanggan table');
    }

    // Check sample data
    try {
      const [kecamatanData] = await connection.execute("SELECT COUNT(*) as count FROM kecamatan");
      console.log(`\n📊 Total kecamatan records: ${kecamatanData[0].count}`);
      
      if (kecamatanData[0].count > 0) {
        const [sampleKecamatan] = await connection.execute("SELECT * FROM kecamatan LIMIT 5");
        console.log('\n🏛️  Sample kecamatan data:');
        sampleKecamatan.forEach(kecamatan => {
          console.log(`  - ID: ${kecamatan.id}, Name: ${kecamatan.nama_kecamatan}, Code: ${kecamatan.kode_kecamatan}, Status: ${kecamatan.is_active ? 'Active' : 'Inactive'}`);
        });
      }
    } catch (error) {
      console.log('❌ Error checking kecamatan data:', error.message);
    }

    // Check relationships
    try {
      const [relationData] = await connection.execute(`
        SELECT 
          k.nama_kecamatan,
          COUNT(DISTINCT d.id) as desa_count,
          COUNT(DISTINCT p.id) as pelanggan_count
        FROM kecamatan k
        LEFT JOIN desa d ON k.id = d.kecamatan_id
        LEFT JOIN pelanggan p ON k.id = p.kecamatan_id
        GROUP BY k.id, k.nama_kecamatan
        LIMIT 5
      `);
      
      console.log('\n🔗 Sample relationship data:');
      relationData.forEach(rel => {
        console.log(`  - ${rel.nama_kecamatan}: ${rel.desa_count} desa, ${rel.pelanggan_count} pelanggan`);
      });
    } catch (error) {
      console.log('❌ Error checking relationships:', error.message);
    }

    await connection.end();
    console.log('\n✅ Kecamatan database setup completed successfully!');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

setupKecamatan();
