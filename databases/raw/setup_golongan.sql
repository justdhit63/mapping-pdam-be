-- Setup Golongan Table
CREATE TABLE IF NOT EXISTS golongan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kode_golongan VARCHAR(10) NOT NULL UNIQUE,
    nama_golongan VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add golongan_id to pelanggan table
ALTER TABLE pelanggan 
ADD COLUMN golongan_id INT,
ADD FOREIGN KEY (golongan_id) REFERENCES golongan(id) ON DELETE SET NULL;

-- Insert sample golongan data
INSERT INTO golongan (kode_golongan, nama_golongan) VALUES
('G1', 'Golongan I - Rumah Tangga Sangat Sederhana'),
('G2', 'Golongan II - Rumah Tangga Sederhana'),
('G3', 'Golongan III - Rumah Tangga'),
('G4', 'Golongan IV - Niaga Kecil'),
('G5', 'Golongan V - Niaga Sedang'),
('G6', 'Golongan VI - Niaga Besar'),
('G7', 'Golongan VII - Industri Kecil'),
('G8', 'Golongan VIII - Industri Sedang'),
('G9', 'Golongan IX - Industri Besar'),
('G10', 'Golongan X - Instansi Pemerintah'),
('G11', 'Golongan XI - Sosial');

-- Update existing pelanggan with random golongan assignment
UPDATE pelanggan SET golongan_id = (FLOOR(RAND() * 11) + 1) WHERE golongan_id IS NULL;
