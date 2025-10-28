// add-water-meter-fields.js
// Script to add water meter fields to pelanggan table

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pdam_mapping',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function addWaterMeterFields() {
    let connection;
    try {
        connection = await pool.getConnection();
        console.log('✓ Connected to database');

        // Check if columns already exist
        console.log('\nChecking existing columns...');
        const [columns] = await connection.execute(
            `SELECT COLUMN_NAME 
             FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_SCHEMA = ? 
             AND TABLE_NAME = 'pelanggan' 
             AND COLUMN_NAME IN ('stand_meter', 'nomer_water_meter', 'merk_meter', 'ukuran_water_meter', 'kondisi_water_meter')`,
            [process.env.DB_NAME || 'pdam_mapping']
        );

        const existingColumns = columns.map(col => col.COLUMN_NAME);
        console.log('Existing water meter columns:', existingColumns);

        const columnsToAdd = [
            { name: 'stand_meter', sql: 'ADD COLUMN stand_meter VARCHAR(100) DEFAULT NULL' },
            { name: 'nomer_water_meter', sql: 'ADD COLUMN nomer_water_meter VARCHAR(100) DEFAULT NULL' },
            { name: 'merk_meter', sql: 'ADD COLUMN merk_meter VARCHAR(50) DEFAULT NULL' },
            { name: 'ukuran_water_meter', sql: 'ADD COLUMN ukuran_water_meter VARCHAR(20) DEFAULT NULL' },
            { name: 'kondisi_water_meter', sql: 'ADD COLUMN kondisi_water_meter TEXT DEFAULT NULL' }
        ];

        // Add missing columns
        for (const column of columnsToAdd) {
            if (!existingColumns.includes(column.name)) {
                console.log(`\nAdding column: ${column.name}...`);
                try {
                    await connection.execute(`ALTER TABLE pelanggan ${column.sql}`);
                    console.log(`✓ Column ${column.name} added successfully`);
                } catch (error) {
                    console.error(`✗ Error adding column ${column.name}:`, error.message);
                }
            } else {
                console.log(`✓ Column ${column.name} already exists`);
            }
        }

        // Verify all columns
        console.log('\nVerifying final table structure...');
        const [finalColumns] = await connection.execute(
            `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
             FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_SCHEMA = ? 
             AND TABLE_NAME = 'pelanggan' 
             AND COLUMN_NAME IN ('stand_meter', 'nomer_water_meter', 'merk_meter', 'ukuran_water_meter', 'kondisi_water_meter')
             ORDER BY ORDINAL_POSITION`,
            [process.env.DB_NAME || 'pdam_mapping']
        );

        console.log('\nWater Meter Fields in pelanggan table:');
        console.table(finalColumns);

        console.log('\n✅ Water meter fields setup completed successfully!');

    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    } finally {
        if (connection) connection.release();
        await pool.end();
    }
}

// Run the script
addWaterMeterFields()
    .then(() => {
        console.log('\n✓ Script completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n✗ Script failed:', error);
        process.exit(1);
    });
