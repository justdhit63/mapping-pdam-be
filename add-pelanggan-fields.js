import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function addPelangganFields() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'pdam_mapping'
    });

    try {
        console.log('Adding new fields to pelanggan table...');

        // Check existing columns to avoid duplicate additions
        const [existingColumns] = await connection.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'pdam_mapping' 
            AND TABLE_NAME = 'pelanggan'
        `);

        const columnNames = existingColumns.map(col => col.COLUMN_NAME);

        // Add manual input fields (nullable text fields)
        const fieldsToAdd = [
            { name: 'distribusi', sql: 'ADD COLUMN distribusi TEXT NULL' },
            { name: 'sumber', sql: 'ADD COLUMN sumber TEXT NULL' },
            { name: 'kondisi_meter', sql: 'ADD COLUMN kondisi_meter TEXT NULL' },
            { name: 'kondisi_lingkungan', sql: 'ADD COLUMN kondisi_lingkungan TEXT NULL' },
            { name: 'kategori', sql: 'ADD COLUMN kategori VARCHAR(50) NULL' },
            { name: 'status_pelanggan', sql: 'ADD COLUMN status_pelanggan VARCHAR(20) DEFAULT "aktif"' }
        ];

        for (const field of fieldsToAdd) {
            if (!columnNames.includes(field.name)) {
                await connection.execute(`ALTER TABLE pelanggan ${field.sql}`);
                console.log(`✅ Added column: ${field.name}`);
            } else {
                console.log(`⚠️  Column ${field.name} already exists`);
            }
        }

        console.log('✅ Successfully added new fields to pelanggan table!');

    } catch (error) {
        console.error('❌ Error adding pelanggan fields:', error);
    } finally {
        await connection.end();
    }
}

addPelangganFields();
