-- Script untuk menambahkan sistem Role (Admin/User)
USE pdam_mapping;

-- 1. Tambah kolom role di tabel users
ALTER TABLE users 
ADD COLUMN role ENUM('admin', 'user') DEFAULT 'user' AFTER email;

-- 2. Update user admin@pdam.com menjadi admin
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@pdam.com';

-- 3. Buat user admin tambahan untuk testing
INSERT INTO users (email, role, password) VALUES 
('superadmin@pdam.com', 'admin', '$2a$10$hEk5pAuZkRhKJKoIQCbEfe9utb6QA4.B5qIa5NgVl5y43IrDE0Ugy'); -- password: admin123

-- 4. Verifikasi role yang sudah ditambahkan
SELECT id, email, role, created_at FROM users ORDER BY role DESC, id;

-- 5. Statistik berdasarkan role
SELECT 
    role,
    COUNT(*) as jumlah_user
FROM users 
GROUP BY role;
