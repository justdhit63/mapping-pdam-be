import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function setupKelompok() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'pdam_mapping'
    });

    try {
        console.log('Setting up kelompok table...');

        // Create kelompok table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS kelompok (
                id INT AUTO_INCREMENT PRIMARY KEY,
                kode_kelompok VARCHAR(10) NOT NULL UNIQUE,
                nama_kelompok VARCHAR(100) NOT NULL,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Check if kelompok_id column exists in pelanggan table
        const [columns] = await connection.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'pdam_mapping' 
            AND TABLE_NAME = 'pelanggan' 
            AND COLUMN_NAME = 'kelompok_id'
        `);

        if (columns.length === 0) {
            // Add kelompok_id to pelanggan table
            await connection.execute(`
                ALTER TABLE pelanggan 
                ADD COLUMN kelompok_id INT,
                ADD FOREIGN KEY (kelompok_id) REFERENCES kelompok(id) ON DELETE SET NULL
            `);
            console.log('Added kelompok_id column to pelanggan table');
        } else {
            console.log('kelompok_id column already exists in pelanggan table');
        }

        // Check if kelompok data exists
        const [existingKelompok] = await connection.execute('SELECT COUNT(*) as count FROM kelompok');
        
        if (existingKelompok[0].count === 0) {
            // Insert sample kelompok data
            await connection.execute(`
                INSERT INTO kelompok (kode_kelompok, nama_kelompok) VALUES
                ('K1', 'Kelompok 1 - Domestik Rendah'),
                ('K2', 'Kelompok 2 - Domestik Menengah'),
                ('K3', 'Kelompok 3 - Domestik Tinggi'),
                ('K4', 'Kelompok 4 - Komersial Kecil'),
                ('K5', 'Kelompok 5 - Komersial Menengah'),
                ('K6', 'Kelompok 6 - Komersial Besar'),
                ('K7', 'Kelompok 7 - Industri Ringan'),
                ('K8', 'Kelompok 8 - Industri Berat'),
                ('K9', 'Kelompok 9 - Pemerintahan'),
                ('K10', 'Kelompok 10 - Sosial/Umum'),
                ('K11', 'Kelompok 11 - Khusus'),
                ('K12', 'Kelompok 12 - Temporer')
            `);
            console.log('Inserted sample kelompok data');
        } else {
            console.log('Kelompok data already exists');
        }

        // Update existing pelanggan with random kelompok assignment
        await connection.execute(`
            UPDATE pelanggan 
            SET kelompok_id = (FLOOR(RAND() * 12) + 1) 
            WHERE kelompok_id IS NULL
        `);
        console.log('Updated pelanggan with kelompok assignments');

        console.log('Kelompok setup completed successfully!');

    } catch (error) {
        console.error('Error setting up kelompok:', error);
    } finally {
        await connection.end();
    }
}

setupKelompok();
