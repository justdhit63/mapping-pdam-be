import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function setupGolongan() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'pdam_mapping'
    });

    try {
        console.log('Setting up golongan table...');

        // Create golongan table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS golongan (
                id INT AUTO_INCREMENT PRIMARY KEY,
                kode_golongan VARCHAR(10) NOT NULL UNIQUE,
                nama_golongan VARCHAR(100) NOT NULL,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Check if golongan_id column exists in pelanggan table
        const [columns] = await connection.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'pdam_mapping' 
            AND TABLE_NAME = 'pelanggan' 
            AND COLUMN_NAME = 'golongan_id'
        `);

        if (columns.length === 0) {
            // Add golongan_id to pelanggan table
            await connection.execute(`
                ALTER TABLE pelanggan 
                ADD COLUMN golongan_id INT,
                ADD FOREIGN KEY (golongan_id) REFERENCES golongan(id) ON DELETE SET NULL
            `);
            console.log('Added golongan_id column to pelanggan table');
        } else {
            console.log('golongan_id column already exists in pelanggan table');
        }

        // Check if golongan data exists
        const [existingGolongan] = await connection.execute('SELECT COUNT(*) as count FROM golongan');
        
        if (existingGolongan[0].count === 0) {
            // Insert sample golongan data
            await connection.execute(`
                INSERT INTO golongan (kode_golongan, nama_golongan) VALUES
                ('G1', 'Golongan I - Rumah Tangga Sangat Sederhana'),
                ('G2', 'Golongan II - Rumah Tangga Sederhana'),
                ('G3', 'Golongan III - Rumah Tangga'),
                ('G4', 'Golongan IV - Niaga Kecil'),
                ('G5', 'Golongan V - Niaga Sedang'),
                ('G6', 'Golongan VI - Niaga Besar'),
                ('G7', 'Golongan VII - Industri Kecil'),
                ('G8', 'Golongan VIII - Industri Sedang'),
                ('G9', 'Golongan IX - Industri Besar'),
                ('G10', 'Golongan X - Instansi Pemerintah'),
                ('G11', 'Golongan XI - Sosial')
            `);
            console.log('Inserted sample golongan data');
        } else {
            console.log('Golongan data already exists');
        }

        // Update existing pelanggan with random golongan assignment
        await connection.execute(`
            UPDATE pelanggan 
            SET golongan_id = (FLOOR(RAND() * 11) + 1) 
            WHERE golongan_id IS NULL
        `);
        console.log('Updated pelanggan with golongan assignments');

        console.log('Golongan setup completed successfully!');

    } catch (error) {
        console.error('Error setting up golongan:', error);
    } finally {
        await connection.end();
    }
}

setupGolongan();
