-- Setup table kecamatan dengan relasi ke desa dan pelanggan
-- Relasi: 1 kecamatan -> many desa, 1 desa -> 1 kecamatan
-- Relasi: 1 kecamatan -> many pelanggan, 1 pelanggan -> 1 kecamatan

-- 1. Create table kecamatan
CREATE TABLE IF NOT EXISTS kecamatan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_kecamatan VARCHAR(255) NOT NULL UNIQUE,
    kode_kecamatan VARCHAR(10) UNIQUE,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Add kecamatan_id to desa table (1 desa -> 1 kecamatan)
ALTER TABLE desa 
ADD COLUMN kecamatan_id INT,
ADD CONSTRAINT fk_desa_kecamatan 
FOREIGN KEY (kecamatan_id) REFERENCES kecamatan(id) ON DELETE SET NULL;

-- 3. Add kecamatan_id to pelanggan table (1 pelanggan -> 1 kecamatan)
ALTER TABLE pelanggan 
ADD COLUMN kecamatan_id INT,
ADD CONSTRAINT fk_pelanggan_kecamatan 
FOREIGN KEY (kecamatan_id) REFERENCES kecamatan(id) ON DELETE SET NULL;

-- 4. Insert sample data kecamatan
INSERT INTO kecamatan (nama_kecamatan, kode_kecamatan) VALUES
('Kecamatan Sumber', 'SMB'),
('Kecamatan Tanjung', 'TJG'),
('Kecamatan Maju', 'MJU'),
('Kecamatan Sejahtera', 'SJH'),
('Kecamatan Damai', 'DMI'),
('Kecamatan Karya', 'KRY'),
('Kecamatan Bina', 'BIN'),
('Kecamatan Sukamaju', 'SKM'),
('Kecamatan Mekar', 'MKR'),
('Kecamatan Harapan', 'HRP');

-- 5. Update desa dengan kecamatan_id (assign desa ke kecamatan)
-- Desa 1-2 -> Kecamatan 1 (Sumber)
UPDATE desa SET kecamatan_id = 1 WHERE id IN (1, 2);

-- Desa 3-4 -> Kecamatan 2 (Tanjung) 
UPDATE desa SET kecamatan_id = 2 WHERE id IN (3, 4);

-- Desa 5-6 -> Kecamatan 3 (Maju)
UPDATE desa SET kecamatan_id = 3 WHERE id IN (5, 6);

-- Desa 7-8 -> Kecamatan 4 (Sejahtera)
UPDATE desa SET kecamatan_id = 4 WHERE id IN (7, 8);

-- Desa 9-10 -> Kecamatan 5 (Damai)
UPDATE desa SET kecamatan_id = 5 WHERE id IN (9, 10);

-- 6. Update pelanggan dengan kecamatan_id berdasarkan desa mereka
-- Ambil kecamatan_id dari desa yang sudah di-assign
UPDATE pelanggan p 
JOIN desa d ON p.desa_id = d.id 
SET p.kecamatan_id = d.kecamatan_id 
WHERE p.desa_id IS NOT NULL;
