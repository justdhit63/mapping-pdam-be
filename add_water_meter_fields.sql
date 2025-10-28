-- SQL script to add water meter fields to pelanggan table
-- Run this script to add the new columns for water meter information

USE pdam_mapping;

-- Add stand_meter column
ALTER TABLE pelanggan 
ADD COLUMN IF NOT EXISTS stand_meter VARCHAR(100) DEFAULT NULL
AFTER status_pelanggan;

-- Add nomer_water_meter column
ALTER TABLE pelanggan 
ADD COLUMN IF NOT EXISTS nomer_water_meter VARCHAR(100) DEFAULT NULL
AFTER stand_meter;

-- Add merk_meter column
ALTER TABLE pelanggan 
ADD COLUMN IF NOT EXISTS merk_meter VARCHAR(50) DEFAULT NULL
AFTER nomer_water_meter;

-- Add ukuran_water_meter column
ALTER TABLE pelanggan 
ADD COLUMN IF NOT EXISTS ukuran_water_meter VARCHAR(20) DEFAULT NULL
AFTER merk_meter;

-- Add kondisi_water_meter column
ALTER TABLE pelanggan 
ADD COLUMN IF NOT EXISTS kondisi_water_meter TEXT DEFAULT NULL
AFTER ukuran_water_meter;

-- Verify the columns were added
DESCRIBE pelanggan;

SELECT 'Water meter fields added successfully!' as status;
