-- Create cabang table and update user table with cabang_id
-- Run this script to add cabang functionality

-- 1. Create cabang table
CREATE TABLE IF NOT EXISTS cabang (
    id INT PRIMARY KEY AUTO_INCREMENT,
    kode_unit VARCHAR(10) NOT NULL UNIQUE,
    nama_unit VARCHAR(255) NOT NULL,
    alamat TEXT,
    telepon VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Add cabang_id to users table
ALTER TABLE users 
ADD COLUMN cabang_id INT NULL AFTER role,
ADD CONSTRAINT fk_users_cabang 
FOREIGN KEY (cabang_id) REFERENCES cabang(id) 
ON DELETE SET NULL ON UPDATE CASCADE;

-- 3. Insert sample cabang data
INSERT INTO cabang (kode_unit, nama_unit, alamat, telepon) VALUES
('PDM001', 'PDAM Cabang Pusat', 'Jl. Merdeka No. 1, Jakarta Pusat', '021-1234567'),
('PDM002', 'PDAM Cabang Utara', 'Jl. Kelapa Gading No. 25, Jakarta Utara', '021-2345678'),
('PDM003', 'PDAM Cabang Selatan', 'Jl. Fatmawati No. 15, Jakarta Selatan', '021-3456789'),
('PDM004', 'PDAM Cabang Timur', 'Jl. Rawamangun No. 30, Jakarta Timur', '021-4567890'),
('PDM005', 'PDAM Cabang Barat', 'Jl. Kebon Jeruk No. 40, Jakarta Barat', '021-5678901');

-- 4. Update existing users to have cabang (optional)
UPDATE users SET cabang_id = 1 WHERE role = 'admin';
UPDATE users SET cabang_id = 2 WHERE id = 2; -- user1@pdam.com
UPDATE users SET cabang_id = 3 WHERE id = 3; -- user2@pdam.com
UPDATE users SET cabang_id = 4 WHERE id = 5; -- john.doe@pdam.co.id
UPDATE users SET cabang_id = 5 WHERE id = 6; -- jane.smith@pdam.co.id

-- 5. Verify structure
SELECT 'Cabang Table' as Info;
DESCRIBE cabang;

SELECT 'Users with Cabang' as Info;
SELECT u.id, u.email, u.role, u.full_name, c.kode_unit, c.nama_unit 
FROM users u 
LEFT JOIN cabang c ON u.cabang_id = c.id 
ORDER BY u.role DESC, c.kode_unit;

SELECT 'Cabang with User Count' as Info;
SELECT 
    c.id,
    c.kode_unit,
    c.nama_unit,
    COUNT(u.id) as total_users
FROM cabang c
LEFT JOIN users u ON c.id = u.cabang_id
GROUP BY c.id, c.kode_unit, c.nama_unit
ORDER BY c.kode_unit;
