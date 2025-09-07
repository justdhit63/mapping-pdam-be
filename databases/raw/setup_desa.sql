-- Create desa table and add relationship to pelanggan
-- Run this script to add desa functionality

-- 1. Create desa table
CREATE TABLE IF NOT EXISTS desa (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nama_desa VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Add desa_id column to pelanggan table
ALTER TABLE pelanggan 
ADD COLUMN IF NOT EXISTS desa_id INT;

-- 3. Add foreign key constraint
ALTER TABLE pelanggan 
ADD CONSTRAINT IF NOT EXISTS fk_pelanggan_desa 
FOREIGN KEY (desa_id) REFERENCES desa(id) ON DELETE SET NULL;

-- 4. Insert sample desa data
INSERT INTO desa (nama_desa) VALUES
('Desa Sumber Makmur'),
('Desa Tanjung Harapan'),
('Desa Maju Bersama'),
('Desa Sejahtera'),
('Desa Damai Sentosa'),
('Desa Karya Mulya'),
('Desa Bina Mandiri'),
('Desa Sukamaju'),
('Desa Mekar Jaya'),
('Desa Harapan Baru');

-- 5. Update existing pelanggan with random desa assignments (optional)
UPDATE pelanggan 
SET desa_id = (
    SELECT id FROM desa 
    ORDER BY RAND() 
    LIMIT 1
) 
WHERE desa_id IS NULL;

-- 6. Show results
SELECT 'Desa table created and pelanggan updated successfully' as status;

-- Show desa list
SELECT 
    id,
    nama_desa,
    is_active,
    created_at
FROM desa 
ORDER BY nama_desa;

-- Show desa statistics with pelanggan count
SELECT 
    d.id,
    d.nama_desa,
    COUNT(p.id) as total_pelanggan,
    d.is_active
FROM desa d
LEFT JOIN pelanggan p ON d.id = p.desa_id
GROUP BY d.id, d.nama_desa, d.is_active
ORDER BY d.nama_desa;

-- Show sample pelanggan with desa info
SELECT 
    p.id,
    p.nama_pelanggan,
    p.alamat,
    d.nama_desa,
    c.nama_unit as cabang_nama
FROM pelanggan p
LEFT JOIN desa d ON p.desa_id = d.id
LEFT JOIN cabang c ON p.cabang_id = c.id
LIMIT 10;
