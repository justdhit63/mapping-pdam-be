-- Add registration fields to pelanggan table
ALTER TABLE pelanggan 
ADD COLUMN no_registrasi VARCHAR(10) NULL UNIQUE,
ADD COLUMN email VARCHAR(100) NULL,
ADD COLUMN foto_ktp_url VARCHAR(255) NULL,
ADD COLUMN foto_kk_url VARCHAR(255) NULL,
ADD COLUMN status_registrasi ENUM('draft', 'pending', 'approved', 'rejected') DEFAULT 'draft',
ADD COLUMN tanggal_registrasi DATETIME DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN catatan_registrasi TEXT NULL,
ADD COLUMN approved_by INT NULL,
ADD COLUMN approved_at DATETIME NULL,
ADD COLUMN rejected_reason TEXT NULL;

-- Make id_pelanggan nullable for registration
ALTER TABLE pelanggan MODIFY id_pelanggan VARCHAR(50) NULL;

-- Make optional fields nullable for registration
ALTER TABLE pelanggan MODIFY cabang_id INT NULL;
ALTER TABLE pelanggan MODIFY rayon_id INT NULL;
ALTER TABLE pelanggan MODIFY golongan_id INT NULL;
ALTER TABLE pelanggan MODIFY kelompok_id INT NULL;
ALTER TABLE pelanggan MODIFY tanggal_pemasangan DATE NULL;
ALTER TABLE pelanggan MODIFY jenis_meter VARCHAR(50) NULL;
ALTER TABLE pelanggan MODIFY distribusi VARCHAR(100) NULL;
ALTER TABLE pelanggan MODIFY sumber VARCHAR(100) NULL;
ALTER TABLE pelanggan MODIFY kondisi_meter VARCHAR(100) NULL;
ALTER TABLE pelanggan MODIFY kondisi_lingkungan VARCHAR(100) NULL;
ALTER TABLE pelanggan MODIFY kategori VARCHAR(50) NULL;

-- Add indexes for performance
CREATE INDEX idx_no_registrasi ON pelanggan(no_registrasi);
CREATE INDEX idx_status_registrasi ON pelanggan(status_registrasi);
CREATE INDEX idx_email ON pelanggan(email);

-- Function to generate next registration number
DELIMITER $$
CREATE FUNCTION generate_registration_number() 
RETURNS VARCHAR(10)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE next_num INT;
    DECLARE reg_number VARCHAR(10);
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(no_registrasi, 1, 5) AS UNSIGNED)), 0) + 1 
    INTO next_num 
    FROM pelanggan 
    WHERE no_registrasi IS NOT NULL;
    
    SET reg_number = LPAD(next_num, 5, '0');
    
    RETURN reg_number;
END$$
DELIMITER ;