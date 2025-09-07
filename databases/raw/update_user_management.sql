-- Script untuk update User Management dan Cascade Delete
USE pdam_mapping;

-- 1. Update foreign key constraint untuk CASCADE DELETE
-- Hapus constraint lama
ALTER TABLE pelanggan DROP FOREIGN KEY fk_pelanggan_user;

-- Buat constraint baru dengan CASCADE DELETE
ALTER TABLE pelanggan 
ADD CONSTRAINT fk_pelanggan_user 
FOREIGN KEY (user_id) REFERENCES users(id) 
ON DELETE CASCADE ON UPDATE CASCADE;

-- 2. Tambah kolom tambahan untuk user management
ALTER TABLE users 
ADD COLUMN full_name VARCHAR(255) DEFAULT NULL AFTER email,
ADD COLUMN position VARCHAR(100) DEFAULT NULL AFTER role,
ADD COLUMN phone VARCHAR(20) DEFAULT NULL AFTER position,
ADD COLUMN is_active BOOLEAN DEFAULT TRUE AFTER phone,
ADD COLUMN last_login TIMESTAMP NULL AFTER is_active,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER last_login;

-- 3. Update existing users dengan data tambahan
UPDATE users SET 
    full_name = 'Administrator',
    position = 'System Admin',
    phone = '081234567890'
WHERE email = 'admin@pdam.com';

UPDATE users SET 
    full_name = 'Super Administrator',
    position = 'System Super Admin',
    phone = '081234567891'
WHERE email = 'superadmin@pdam.com';

-- 4. Buat beberapa user pegawai untuk testing
INSERT INTO users (email, full_name, role, position, phone, password) VALUES 
('pegawai1@pdam.com', 'Budi Santoso', 'user', 'Staff Teknis', '081234567892', '$2a$10$hEk5pAuZkRhKJKoIQCbEfe9utb6QA4.B5qIa5NgVl5y43IrDE0Ugy'),
('pegawai2@pdam.com', 'Siti Rahayu', 'user', 'Staff Operasional', '081234567893', '$2a$10$hEk5pAuZkRhKJKoIQCbEfe9utb6QA4.B5qIa5NgVl5y43IrDE0Ugy'),
('pegawai3@pdam.com', 'Ahmad Rahman', 'user', 'Staff Lapangan', '081234567894', '$2a$10$hEk5pAuZkRhKJKoIQCbEfe9utb6QA4.B5qIa5NgVl5y43IrDE0Ugy'),
('pegawai4@pdam.com', 'Dewi Sartika', 'user', 'Staff Administrasi', '081234567895', '$2a$10$hEk5pAuZkRhKJKoIQCbEfe9utb6QA4.B5qIa5NgVl5y43IrDE0Ugy');

-- 5. Test cascade delete functionality
-- (Jangan jalankan ini di production!)
-- DELETE FROM users WHERE email = 'test@example.com';

-- 6. Verifikasi struktur tabel yang sudah diupdate
DESCRIBE users;
DESCRIBE pelanggan;

-- 7. Show updated user data
SELECT 
    id, email, full_name, role, position, phone, is_active, created_at 
FROM users 
ORDER BY role DESC, created_at DESC;

-- 8. Test relasi dan cascade
SELECT 
    u.id, u.email, u.full_name, u.role, u.position,
    COUNT(p.id) as total_pelanggan
FROM users u
LEFT JOIN pelanggan p ON u.id = p.user_id
GROUP BY u.id, u.email, u.full_name, u.role, u.position
ORDER BY u.role DESC, total_pelanggan DESC;
