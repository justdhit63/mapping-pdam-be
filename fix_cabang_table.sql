-- Fix cabang table creation issue
-- Run this script to fix tablespace error

-- 1. Drop existing cabang table if exists (this will also remove any data)
DROP TABLE IF EXISTS cabang;

-- 2. Create cabang table fresh
CREATE TABLE cabang (
    id INT PRIMARY KEY AUTO_INCREMENT,
    kode_unit VARCHAR(10) NOT NULL UNIQUE,
    nama_unit VARCHAR(255) NOT NULL,
    alamat TEXT,
    telepon VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Add cabang_id column to users table if not exists
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS cabang_id INT,
ADD FOREIGN KEY IF NOT EXISTS (cabang_id) REFERENCES cabang(id) ON DELETE SET NULL;

-- 4. Insert sample cabang data
INSERT INTO cabang (kode_unit, nama_unit, alamat, telepon) VALUES
('PDM001', 'PDAM Cabang Pusat', 'Jl. Merdeka No. 1, Jakarta', '021-1234567'),
('PDM002', 'PDAM Cabang Utara', 'Jl. Veteran No. 15, Jakarta Utara', '021-2345678'),
('PDM003', 'PDAM Cabang Selatan', 'Jl. Sudirman No. 25, Jakarta Selatan', '021-3456789'),
('PDM004', 'PDAM Cabang Timur', 'Jl. Gatot Subroto No. 30, Jakarta Timur', '021-4567890'),
('PDM005', 'PDAM Cabang Barat', 'Jl. Thamrin No. 40, Jakarta Barat', '021-5678901');

-- 5. Show created tables
SELECT 'Cabang table created successfully' as status;
SELECT COUNT(*) as total_cabang FROM cabang;
SELECT * FROM cabang ORDER BY kode_unit;
