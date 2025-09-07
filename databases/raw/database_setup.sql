-- Script SQL untuk setup database PDAM Mapping
-- Jalankan script ini di MySQL Workbench atau command line

-- 1. Buat database
CREATE DATABASE IF NOT EXISTS pdam_mapping;
USE pdam_mapping;

-- 2. Buat tabel users untuk autentikasi
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Buat tabel pelanggan
CREATE TABLE pelanggan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_pelanggan VARCHAR(100) UNIQUE NOT NULL,
    nama_pelanggan VARCHAR(255) NOT NULL,
    no_telpon VARCHAR(20),
    alamat TEXT,
    jumlah_jiwa INT,
    jenis_meter VARCHAR(100),
    tanggal_pemasangan DATE,
    longitude DECIMAL(10, 8),
    latitude DECIMAL(11, 8),
    foto_rumah_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Insert data user default untuk testing (password: admin123)
-- Password sudah di-hash dengan bcrypt
INSERT INTO users (email, password) VALUES 
('admin@pdam.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- 5. Insert data pelanggan sample untuk testing
INSERT INTO pelanggan 
(id_pelanggan, nama_pelanggan, no_telpon, alamat, jumlah_jiwa, jenis_meter, tanggal_pemasangan, longitude, latitude) 
VALUES 
('PLG001', 'Budi Santoso', '081234567890', 'Jl. Merdeka No. 123, Jakarta', 4, 'Digital', '2024-01-15', 106.845599, -6.208763),
('PLG002', 'Siti Rahayu', '081234567891', 'Jl. Sudirman No. 456, Jakarta', 3, 'Analog', '2024-02-20', 106.822777, -6.225014),
('PLG003', 'Ahmad Rahman', '081234567892', 'Jl. Thamrin No. 789, Jakarta', 5, 'Digital', '2024-03-10', 106.821311, -6.195718);

-- 6. Tampilkan data yang sudah diinsert untuk verifikasi
SELECT * FROM users;
SELECT * FROM pelanggan;
