-- Add cabang_id to pelanggan table
-- Run this script to add cabang relationship to pelanggan

-- 1. Add cabang_id column to pelanggan table
ALTER TABLE pelanggan 
ADD COLUMN cabang_id INT;

-- 2. Add foreign key constraint
ALTER TABLE pelanggan 
ADD CONSTRAINT fk_pelanggan_cabang 
FOREIGN KEY (cabang_id) REFERENCES cabang(id) ON DELETE SET NULL;

-- 3. Update existing pelanggan with sample cabang assignments (optional)
-- Assign pelanggan to different cabang based on their user's cabang
UPDATE pelanggan p
JOIN users u ON p.user_id = u.id
SET p.cabang_id = u.cabang_id
WHERE u.cabang_id IS NOT NULL;

-- 4. Show results
SELECT 'Pelanggan table updated with cabang_id' as status;

-- Show pelanggan with cabang info
SELECT 
    p.id,
    p.nama_pelanggan,
    p.alamat,
    u.full_name as user_name,
    c.kode_unit,
    c.nama_unit
FROM pelanggan p
LEFT JOIN users u ON p.user_id = u.id
LEFT JOIN cabang c ON p.cabang_id = c.id
ORDER BY p.id;

-- Show cabang statistics with pelanggan count
SELECT 
    c.kode_unit,
    c.nama_unit,
    COUNT(DISTINCT u.id) as total_users,
    COUNT(DISTINCT p.id) as total_pelanggan
FROM cabang c
LEFT JOIN users u ON c.id = u.cabang_id
LEFT JOIN pelanggan p ON c.id = p.cabang_id
GROUP BY c.id, c.kode_unit, c.nama_unit
ORDER BY c.kode_unit;
