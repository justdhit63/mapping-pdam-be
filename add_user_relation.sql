USE pdam_mapping;

ALTER TABLE pelanggan 
ADD COLUMN user_id INT NOT NULL DEFAULT 1 AFTER id;

ALTER TABLE pelanggan 
ADD CONSTRAINT fk_pelanggan_user 
FOREIGN KEY (user_id) REFERENCES users(id) 
ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX idx_pelanggan_user_id ON pelanggan(user_id);

UPDATE pelanggan SET user_id = 1 WHERE user_id IS NULL OR user_id = 0;

INSERT INTO users (email, password) VALUES 
('user1@pdam.com', '$2a$10$hEk5pAuZkRhKJKoIQCbEfe9utb6QA4.B5qIa5NgVl5y43IrDE0Ugy'), -- password: admin123
('user2@pdam.com', '$2a$10$hEk5pAuZkRhKJKoIQCbEfe9utb6QA4.B5qIa5NgVl5y43IrDE0Ugy'); -- password: admin123

INSERT INTO pelanggan 
(user_id, id_pelanggan, nama_pelanggan, no_telpon, alamat, jumlah_jiwa, jenis_meter, tanggal_pemasangan, longitude, latitude) 
VALUES 
(2, 'PLG004', 'Andi Wijaya', '081234567893', 'Jl. Gatot Subroto No. 100, Jakarta', 2, 'Digital', '2024-04-05', 106.830555, -6.207777),
(2, 'PLG005', 'Dewi Sartika', '081234567894', 'Jl. HR Rasuna Said No. 200, Jakarta', 3, 'Analog', '2024-05-12', 106.835555, -6.210777),
(3, 'PLG006', 'Budi Hartono', '081234567895', 'Jl. Kuningan No. 300, Jakarta', 4, 'Digital', '2024-06-18', 106.840555, -6.215777);

SELECT 
    u.id as user_id,
    u.email,
    COUNT(p.id) as jumlah_pelanggan
FROM users u
LEFT JOIN pelanggan p ON u.id = p.user_id
GROUP BY u.id, u.email
ORDER BY u.id;

SELECT 
    p.id,
    p.id_pelanggan,
    p.nama_pelanggan,
    u.email as user_email
FROM pelanggan p
JOIN users u ON p.user_id = u.id
ORDER BY u.id, p.id;
