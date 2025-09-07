USE pdam_mapping;

-- Fix longitude column to accommodate Indonesian coordinates (107.x)
ALTER TABLE pelanggan MODIFY COLUMN longitude DECIMAL(11,8) NULL;

-- Show updated schema
DESCRIBE pelanggan;
