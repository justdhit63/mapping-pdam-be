import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function setupRayon() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'pdam_mapping'
    });

    try {
        console.log('Setting up rayon table...');

        // Create rayon table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS rayon (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nama_rayon VARCHAR(100) NOT NULL,
                kode_rayon VARCHAR(10) NOT NULL UNIQUE,
                deskripsi TEXT,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Check if rayon_id column exists in pelanggan table
        const [columns] = await connection.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'pdam_mapping' 
            AND TABLE_NAME = 'pelanggan' 
            AND COLUMN_NAME = 'rayon_id'
        `);

        if (columns.length === 0) {
            // Add rayon_id to pelanggan table
            await connection.execute(`
                ALTER TABLE pelanggan 
                ADD COLUMN rayon_id INT,
                ADD FOREIGN KEY (rayon_id) REFERENCES rayon(id) ON DELETE SET NULL
            `);
            console.log('Added rayon_id column to pelanggan table');
        } else {
            console.log('rayon_id column already exists in pelanggan table');
        }

        // Check if rayon data exists
        const [existingRayon] = await connection.execute('SELECT COUNT(*) as count FROM rayon');
        
        if (existingRayon[0].count === 0) {
            // Insert sample rayon data
            await connection.execute(`
                INSERT INTO rayon (nama_rayon, kode_rayon, deskripsi) VALUES
                ('Rayon Utara', 'UTR', 'Rayon untuk wilayah utara kota'),
                ('Rayon Selatan', 'SLT', 'Rayon untuk wilayah selatan kota'),
                ('Rayon Timur', 'TMR', 'Rayon untuk wilayah timur kota'),
                ('Rayon Barat', 'BRT', 'Rayon untuk wilayah barat kota'),
                ('Rayon Pusat', 'PST', 'Rayon untuk wilayah pusat kota'),
                ('Rayon Industri', 'IND', 'Rayon khusus area industri'),
                ('Rayon Perumahan', 'PRH', 'Rayon khusus area perumahan'),
                ('Rayon Komersial', 'KMR', 'Rayon khusus area komersial')
            `);
            console.log('Inserted sample rayon data');
        } else {
            console.log('Rayon data already exists');
        }

        // Update existing pelanggan with random rayon assignment
        await connection.execute(`
            UPDATE pelanggan 
            SET rayon_id = (FLOOR(RAND() * 8) + 1) 
            WHERE rayon_id IS NULL
        `);
        console.log('Updated pelanggan with rayon assignments');

        console.log('Rayon setup completed successfully!');

    } catch (error) {
        console.error('Error setting up rayon:', error);
    } finally {
        await connection.end();
    }
}

setupRayon();
