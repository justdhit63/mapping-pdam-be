-- Add registration fields to pelanggan table (safe - checks if exists first)

-- Add columns only if they don't exist
SET @sql = '';

-- Check and add no_registrasi
SELECT COUNT(*) INTO @count FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'pdam_mapping' AND TABLE_NAME = 'pelanggan' AND COLUMN_NAME = 'no_registrasi';
IF @count = 0 THEN
    ALTER TABLE pelanggan ADD COLUMN no_registrasi VARCHAR(10) NULL UNIQUE;
END IF;

-- Check and add email
SELECT COUNT(*) INTO @count FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'pdam_mapping' AND TABLE_NAME = 'pelanggan' AND COLUMN_NAME = 'email';
IF @count = 0 THEN
    ALTER TABLE pelanggan ADD COLUMN email VARCHAR(100) NULL;
END IF;

-- Check and add foto_ktp_url
SELECT COUNT(*) INTO @count FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'pdam_mapping' AND TABLE_NAME = 'pelanggan' AND COLUMN_NAME = 'foto_ktp_url';
IF @count = 0 THEN
    ALTER TABLE pelanggan ADD COLUMN foto_ktp_url VARCHAR(255) NULL;
END IF;

-- Check and add foto_kk_url
SELECT COUNT(*) INTO @count FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'pdam_mapping' AND TABLE_NAME = 'pelanggan' AND COLUMN_NAME = 'foto_kk_url';
IF @count = 0 THEN
    ALTER TABLE pelanggan ADD COLUMN foto_kk_url VARCHAR(255) NULL;
END IF;

-- Check and add status_registrasi
SELECT COUNT(*) INTO @count FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'pdam_mapping' AND TABLE_NAME = 'pelanggan' AND COLUMN_NAME = 'status_registrasi';
IF @count = 0 THEN
    ALTER TABLE pelanggan ADD COLUMN status_registrasi ENUM('draft', 'pending', 'approved', 'rejected') DEFAULT 'draft';
END IF;

-- Check and add tanggal_registrasi
SELECT COUNT(*) INTO @count FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'pdam_mapping' AND TABLE_NAME = 'pelanggan' AND COLUMN_NAME = 'tanggal_registrasi';
IF @count = 0 THEN
    ALTER TABLE pelanggan ADD COLUMN tanggal_registrasi DATETIME DEFAULT CURRENT_TIMESTAMP;
END IF;

-- Check and add catatan_registrasi
SELECT COUNT(*) INTO @count FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'pdam_mapping' AND TABLE_NAME = 'pelanggan' AND COLUMN_NAME = 'catatan_registrasi';
IF @count = 0 THEN
    ALTER TABLE pelanggan ADD COLUMN catatan_registrasi TEXT NULL;
END IF;

-- Check and add approved_by
SELECT COUNT(*) INTO @count FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'pdam_mapping' AND TABLE_NAME = 'pelanggan' AND COLUMN_NAME = 'approved_by';
IF @count = 0 THEN
    ALTER TABLE pelanggan ADD COLUMN approved_by INT NULL;
END IF;

-- Check and add approved_at
SELECT COUNT(*) INTO @count FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'pdam_mapping' AND TABLE_NAME = 'pelanggan' AND COLUMN_NAME = 'approved_at';
IF @count = 0 THEN
    ALTER TABLE pelanggan ADD COLUMN approved_at DATETIME NULL;
END IF;

-- Check and add rejected_reason
SELECT COUNT(*) INTO @count FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'pdam_mapping' AND TABLE_NAME = 'rejected_reason';
IF @count = 0 THEN
    ALTER TABLE pelanggan ADD COLUMN rejected_reason TEXT NULL;
END IF;

-- Make id_pelanggan nullable for registration
ALTER TABLE pelanggan MODIFY id_pelanggan VARCHAR(50) NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_no_registrasi ON pelanggan(no_registrasi);
CREATE INDEX IF NOT EXISTS idx_status_registrasi ON pelanggan(status_registrasi);
CREATE INDEX IF NOT EXISTS idx_email ON pelanggan(email);

SELECT 'Registration fields setup completed!' as status;