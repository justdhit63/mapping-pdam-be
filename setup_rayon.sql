-- Setup Rayon Table
CREATE TABLE IF NOT EXISTS rayon (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_rayon VARCHAR(100) NOT NULL,
    kode_rayon VARCHAR(10) NOT NULL UNIQUE,
    deskripsi TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add rayon_id to pelanggan table
ALTER TABLE pelanggan 
ADD COLUMN rayon_id INT,
ADD FOREIGN KEY (rayon_id) REFERENCES rayon(id) ON DELETE SET NULL;

-- Insert sample rayon data
INSERT INTO rayon (nama_rayon, kode_rayon, deskripsi) VALUES
('Rayon Utara', 'UTR', 'Rayon untuk wilayah utara kota'),
('Rayon Selatan', 'SLT', 'Rayon untuk wilayah selatan kota'),
('Rayon Timur', 'TMR', 'Rayon untuk wilayah timur kota'),
('Rayon Barat', 'BRT', 'Rayon untuk wilayah barat kota'),
('Rayon Pusat', 'PST', 'Rayon untuk wilayah pusat kota'),
('Rayon Industri', 'IND', 'Rayon khusus area industri'),
('Rayon Perumahan', 'PRH', 'Rayon khusus area perumahan'),
('Rayon Komersial', 'KMR', 'Rayon khusus area komersial');

-- Update existing pelanggan with random rayon assignment
UPDATE pelanggan SET rayon_id = (FLOOR(RAND() * 8) + 1) WHERE rayon_id IS NULL;
