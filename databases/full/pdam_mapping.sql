-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 07, 2025 at 09:38 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pdam_mapping`
--

-- --------------------------------------------------------

--
-- Table structure for table `cabang`
--

CREATE TABLE `cabang` (
  `id` int(11) NOT NULL,
  `kode_unit` varchar(10) NOT NULL,
  `nama_unit` varchar(255) NOT NULL,
  `alamat` text DEFAULT NULL,
  `telepon` varchar(20) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cabang`
--

INSERT INTO `cabang` (`id`, `kode_unit`, `nama_unit`, `alamat`, `telepon`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'PDM001', 'PDAM Cabang Pusat', 'Jl. Merdeka No. 1, Jakarta Pusat', '021-1234567', 1, '2025-09-05 10:31:59', '2025-09-05 10:31:59'),
(2, 'PDM002', 'PDAM Cabang Utara', 'Jl. Kelapa Gading No. 25, Jakarta Utara', '021-2345678', 1, '2025-09-05 10:31:59', '2025-09-05 10:31:59'),
(3, 'PDM003', 'PDAM Cabang Selatan', 'Jl. Fatmawati No. 15, Jakarta Selatan', '021-3456789', 1, '2025-09-05 10:31:59', '2025-09-05 10:31:59'),
(4, 'PDM004', 'PDAM Cabang Timur', 'Jl. Rawamangun No. 30, Jakarta Timur', '021-4567890', 1, '2025-09-05 10:31:59', '2025-09-05 10:31:59'),
(5, 'PDM005', 'PDAM Cabang Barat', 'Jl. Kebon Jeruk No. 40, Jakarta Barat', '021-5678901', 1, '2025-09-05 10:31:59', '2025-09-05 10:31:59'),
(6, 'PDAM006', 'PDAM Cabang Garut Kota', 'Garut Kota', '0262', 1, '2025-09-05 10:45:37', '2025-09-05 10:45:37');

-- --------------------------------------------------------

--
-- Table structure for table `desa`
--

CREATE TABLE `desa` (
  `id` int(11) NOT NULL,
  `nama_desa` varchar(255) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `kecamatan_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `desa`
--

INSERT INTO `desa` (`id`, `nama_desa`, `is_active`, `created_at`, `updated_at`, `kecamatan_id`) VALUES
(1, 'Desa Sumber Makmur', 1, '2025-09-05 12:21:32', '2025-09-05 12:40:01', 1),
(2, 'Desa Tanjung Harapan', 1, '2025-09-05 12:21:32', '2025-09-05 12:40:01', 1),
(3, 'Desa Maju Bersama', 1, '2025-09-05 12:21:32', '2025-09-05 12:40:01', 2),
(4, 'Desa Sejahtera', 1, '2025-09-05 12:21:32', '2025-09-05 12:40:01', 2),
(5, 'Desa Damai Sentosa', 1, '2025-09-05 12:21:32', '2025-09-05 12:40:01', 3),
(6, 'Desa Karya Mulya', 1, '2025-09-05 12:21:32', '2025-09-05 12:40:01', 3),
(7, 'Desa Bina Mandiri', 1, '2025-09-05 12:21:32', '2025-09-05 12:40:01', 4),
(8, 'Desa Sukamaju', 1, '2025-09-05 12:21:32', '2025-09-05 12:40:01', 4),
(9, 'Desa Mekar Jaya', 1, '2025-09-05 12:21:32', '2025-09-05 12:40:01', 5),
(10, 'Desa Harapan Baru', 1, '2025-09-05 12:21:32', '2025-09-05 12:40:01', 5),
(11, 'Test Desa', 1, '2025-09-05 12:45:19', '2025-09-05 12:45:42', NULL),
(12, 'Desa Test Kecamatan Updated', 1, '2025-09-05 12:54:04', '2025-09-05 12:54:32', 2);

-- --------------------------------------------------------

--
-- Table structure for table `golongan`
--

CREATE TABLE `golongan` (
  `id` int(11) NOT NULL,
  `kode_golongan` varchar(10) NOT NULL,
  `nama_golongan` varchar(100) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `golongan`
--

INSERT INTO `golongan` (`id`, `kode_golongan`, `nama_golongan`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'G1', 'Golongan I - Rumah Tangga Sangat Sederhana', 1, '2025-09-05 15:20:08', '2025-09-05 15:20:08'),
(2, 'G2', 'Golongan II - Rumah Tangga Sederhana', 1, '2025-09-05 15:20:08', '2025-09-05 15:20:08'),
(3, 'G3', 'Golongan III - Rumah Tangga', 1, '2025-09-05 15:20:08', '2025-09-05 15:20:08'),
(4, 'G4', 'Golongan IV - Niaga Kecil', 1, '2025-09-05 15:20:08', '2025-09-05 15:20:08'),
(5, 'G5', 'Golongan V - Niaga Sedang', 1, '2025-09-05 15:20:08', '2025-09-05 15:20:08'),
(6, 'G6', 'Golongan VI - Niaga Besar', 1, '2025-09-05 15:20:08', '2025-09-05 15:20:08'),
(7, 'G7', 'Golongan VII - Industri Kecil', 1, '2025-09-05 15:20:08', '2025-09-05 15:20:08'),
(8, 'G8', 'Golongan VIII - Industri Sedang', 1, '2025-09-05 15:20:08', '2025-09-05 15:20:08'),
(9, 'G9', 'Golongan IX - Industri Besar', 1, '2025-09-05 15:20:08', '2025-09-05 15:20:08'),
(10, 'G10', 'Golongan X - Instansi Pemerintah', 1, '2025-09-05 15:20:08', '2025-09-05 15:20:08'),
(11, 'G11', 'Golongan XI - Sosial', 1, '2025-09-05 15:20:08', '2025-09-05 15:20:08'),
(12, 'G99', 'Golongan Test', 1, '2025-09-05 16:12:40', '2025-09-05 16:12:40');

-- --------------------------------------------------------

--
-- Table structure for table `kecamatan`
--

CREATE TABLE `kecamatan` (
  `id` int(11) NOT NULL,
  `nama_kecamatan` varchar(255) NOT NULL,
  `kode_kecamatan` varchar(10) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `kecamatan`
--

INSERT INTO `kecamatan` (`id`, `nama_kecamatan`, `kode_kecamatan`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Kecamatan Sumber', 'SMB', 1, '2025-09-05 12:40:01', '2025-09-05 12:40:01'),
(2, 'Kecamatan Tanjung', 'TJG', 1, '2025-09-05 12:40:01', '2025-09-05 12:40:01'),
(3, 'Kecamatan Maju', 'MJU', 1, '2025-09-05 12:40:01', '2025-09-05 12:40:01'),
(4, 'Kecamatan Sejahtera', 'SJH', 1, '2025-09-05 12:40:01', '2025-09-05 12:40:01'),
(5, 'Kecamatan Damai', 'DMI', 1, '2025-09-05 12:40:01', '2025-09-05 12:40:01'),
(6, 'Kecamatan Karya', 'KRY', 1, '2025-09-05 12:40:01', '2025-09-05 12:40:01'),
(7, 'Kecamatan Bina', 'BIN', 1, '2025-09-05 12:40:01', '2025-09-05 12:40:01'),
(8, 'Kecamatan Sukamaju', 'SKM', 1, '2025-09-05 12:40:01', '2025-09-05 12:40:01'),
(9, 'Kecamatan Mekar', 'MKR', 1, '2025-09-05 12:40:01', '2025-09-05 12:40:01'),
(10, 'Kecamatan Harapan', 'HRP', 1, '2025-09-05 12:40:01', '2025-09-05 12:40:01');

-- --------------------------------------------------------

--
-- Table structure for table `kelompok`
--

CREATE TABLE `kelompok` (
  `id` int(11) NOT NULL,
  `kode_kelompok` varchar(10) NOT NULL,
  `nama_kelompok` varchar(100) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `kelompok`
--

INSERT INTO `kelompok` (`id`, `kode_kelompok`, `nama_kelompok`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'K1', 'Kelompok 1 - Domestik Rendah', 1, '2025-09-05 15:49:23', '2025-09-05 16:03:24'),
(2, 'K2', 'Kelompok 2 - Domestik Menengah', 1, '2025-09-05 15:49:23', '2025-09-05 15:49:23'),
(3, 'K3', 'Kelompok 3 - Domestik Tinggi', 1, '2025-09-05 15:49:23', '2025-09-05 15:49:23'),
(4, 'K4', 'Kelompok 4 - Komersial Kecil', 1, '2025-09-05 15:49:23', '2025-09-05 15:49:23'),
(5, 'K5', 'Kelompok 5 - Komersial Menengah', 1, '2025-09-05 15:49:23', '2025-09-05 15:49:23'),
(6, 'K6', 'Kelompok 6 - Komersial Besar', 1, '2025-09-05 15:49:23', '2025-09-05 15:49:23'),
(7, 'K7', 'Kelompok 7 - Industri Ringan', 1, '2025-09-05 15:49:23', '2025-09-05 15:49:23'),
(8, 'K8', 'Kelompok 8 - Industri Berat', 1, '2025-09-05 15:49:23', '2025-09-05 15:49:23'),
(9, 'K9', 'Kelompok 9 - Pemerintahan', 1, '2025-09-05 15:49:23', '2025-09-05 15:49:23'),
(10, 'K10', 'Kelompok 10 - Sosial/Umum', 1, '2025-09-05 15:49:23', '2025-09-05 15:49:23'),
(11, 'K11', 'Kelompok 11 - Khusus', 1, '2025-09-05 15:49:23', '2025-09-05 15:49:23'),
(12, 'K12', 'Kelompok 12 - Temporer', 1, '2025-09-05 15:49:23', '2025-09-05 15:49:23'),
(13, 'K99', 'Kelompok Test', 1, '2025-09-05 16:12:53', '2025-09-05 16:12:53');

-- --------------------------------------------------------

--
-- Table structure for table `pelanggan`
--

CREATE TABLE `pelanggan` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL DEFAULT 1,
  `id_pelanggan` varchar(100) NOT NULL,
  `nama_pelanggan` varchar(255) NOT NULL,
  `no_telpon` varchar(20) DEFAULT NULL,
  `alamat` text DEFAULT NULL,
  `jumlah_jiwa` int(11) DEFAULT NULL,
  `jenis_meter` varchar(100) DEFAULT NULL,
  `tanggal_pemasangan` date DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `latitude` decimal(11,8) DEFAULT NULL,
  `foto_rumah_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `cabang_id` int(11) DEFAULT NULL,
  `desa_id` int(11) DEFAULT NULL,
  `kecamatan_id` int(11) DEFAULT NULL,
  `rayon_id` int(11) DEFAULT NULL,
  `golongan_id` int(11) DEFAULT NULL,
  `kelompok_id` int(11) DEFAULT NULL,
  `distribusi` text DEFAULT NULL,
  `sumber` text DEFAULT NULL,
  `kondisi_meter` text DEFAULT NULL,
  `kondisi_lingkungan` text DEFAULT NULL,
  `kategori` varchar(50) DEFAULT NULL,
  `status_pelanggan` varchar(20) DEFAULT 'aktif'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pelanggan`
--

INSERT INTO `pelanggan` (`id`, `user_id`, `id_pelanggan`, `nama_pelanggan`, `no_telpon`, `alamat`, `jumlah_jiwa`, `jenis_meter`, `tanggal_pemasangan`, `longitude`, `latitude`, `foto_rumah_url`, `created_at`, `updated_at`, `cabang_id`, `desa_id`, `kecamatan_id`, `rayon_id`, `golongan_id`, `kelompok_id`, `distribusi`, `sumber`, `kondisi_meter`, `kondisi_lingkungan`, `kategori`, `status_pelanggan`) VALUES
(1, 1, 'PLG001', 'Budi Santoso', '081234567890', 'Jl. Merdeka No. 123, Jakarta', 4, 'Digital', '2024-01-15', 99.99999999, -6.20876300, NULL, '2025-09-05 10:27:06', '2025-09-05 15:49:23', 1, 2, 1, 5, 2, 3, NULL, NULL, NULL, NULL, NULL, 'aktif'),
(2, 1, 'PLG002', 'Siti Rahayu', '081234567891', 'Jl. Sudirman No. 456, Jakarta', 3, 'Analog', '2024-02-20', 99.99999999, -6.22501400, NULL, '2025-09-05 10:27:06', '2025-09-05 15:49:23', 1, 8, 4, 7, 6, 1, NULL, NULL, NULL, NULL, NULL, 'aktif'),
(3, 1, 'PLG003', 'Ahmad Rahman', '081234567892', 'Jl. Thamrin No. 789, Jakarta', 5, 'Digital', '2024-03-10', 99.99999999, -6.19571800, NULL, '2025-09-05 10:27:06', '2025-09-05 15:49:23', 1, 5, 3, 1, 11, 6, NULL, NULL, NULL, NULL, NULL, 'aktif'),
(4, 2, 'PLG004', 'Andi Wijaya', '081234567893', 'Jl. Gatot Subroto No. 100, Jakarta', 2, 'Digital', '2024-04-05', 99.99999999, -6.20777700, NULL, '2025-09-05 10:27:23', '2025-09-05 15:49:23', 2, 2, 1, 1, 4, 1, NULL, NULL, NULL, NULL, NULL, 'aktif'),
(5, 2, 'PLG005', 'Dewi Sartika', '081234567894', 'Jl. HR Rasuna Said No. 200, Jakarta', 3, 'Analog', '2024-05-12', 99.99999999, -6.21077700, NULL, '2025-09-05 10:27:23', '2025-09-05 15:49:23', 2, 9, 5, 1, 9, 1, NULL, NULL, NULL, NULL, NULL, 'aktif'),
(6, 3, 'PLG006', 'Budi Hartono', '081234567895', 'Jl. Kuningan No. 300, Jakarta', 4, 'Digital', '2024-06-18', 99.99999999, -6.21577700, NULL, '2025-09-05 10:27:23', '2025-09-05 15:49:23', 3, 1, 1, 2, 1, 12, NULL, NULL, NULL, NULL, NULL, 'aktif'),
(7, 2, '123123', 'PLG123', '123', 'Jalan Galumpit, Kota Kulon, Garut Kota, Garut, West Java, Java, 44115, Indonesia', 2, 'Digidaw', '2025-09-09', 99.99999999, -7.22554673, '/uploads/images/foto_rumah-1757074329133-88216392.jpg', '2025-09-05 12:12:09', '2025-09-05 15:49:23', 6, 7, 4, 7, 10, 9, NULL, NULL, NULL, NULL, NULL, 'aktif'),
(8, 2, 'Test112', '112', '112', 'Jalan Ciledug, Kota Kulon, Garut Kota, Garut, West Java, Java, 44119, Indonesia', 2, 'Meteran', '2025-09-18', 99.99999999, -7.22778189, '/uploads/images/foto_rumah-1757088862315-875831793.jpg', '2025-09-05 16:14:22', '2025-09-05 16:14:22', 6, 8, 4, 4, 9, 9, '-', '-', '-', '-', 'jadwal harian', 'aktif'),
(9, 2, 'test01', '01', '01', 'Kota Kulon, Garut Kota, Garut, West Java, Java, 44119, Indonesia', 2, 'metera', '2025-09-03', 99.99999999, -7.22773399, '/uploads/images/foto_rumah-1757089464121-327685925.jpg', '2025-09-05 16:24:24', '2025-09-05 16:24:24', 6, 8, 4, 5, 6, 13, 'a', 'b', 'c', 'd', 'jadwal harian', 'aktif'),
(10, 2, 'test02', '02', '02', 'Cintaasih, Cisurupan, Garut, West Java, Java, 44171, Indonesia', 2, 'meteran', '2025-09-19', 99.99999999, -7.33454563, '/uploads/images/foto_rumah-1757090077409-158145944.jpg', '2025-09-05 16:34:37', '2025-09-05 16:39:39', 2, 2, 1, 3, 7, 8, 'a', 'b', 'c', 'd', 'jadwal harian', 'aktif'),
(11, 2, 'test03', '03', '03', 'Kota Kulon, Garut Kota, Garut, West Java, Java, 44119, Indonesia', 2, 'Meteran', '2025-09-10', 99.99999999, -7.22784043, '/uploads/images/foto_rumah-1757090423352-31877651.jpg', '2025-09-05 16:40:23', '2025-09-06 02:18:12', 6, 12, 2, 4, 8, 8, 'a', 'b', 'c', 'd', 'jadwal harian', 'tidak aktif'),
(12, 2, 'test04', '04', '04', 'Kota Kulon, Garut Kota, Garut, West Java, Java, 44119, Indonesia', 2, 'digidaw', '2025-09-09', 107.90802062, -7.22767545, '/uploads/images/foto_rumah-1757091093756-973644506.jpg', '2025-09-05 16:51:33', '2025-09-06 02:17:59', 6, 12, 2, 9, 8, 13, 'a', 'b', 'c', 'd', 'jadwal mingguan', 'aktif'),
(13, 5, 'SL001', 'SL001', '0011', 'Kota Kulon, Garut Kota, Garut, West Java, Java, 44119, Indonesia', 2, 'digital', '2025-09-25', 107.90811181, -7.22770738, '/uploads/images/foto_rumah-1757159992224-574382321.jpg', '2025-09-06 11:59:52', '2025-09-06 12:22:29', 6, 7, 4, 4, 8, 8, 'a', 'b', 'c', 'd', 'jadwal harian', 'aktif');

-- --------------------------------------------------------

--
-- Table structure for table `rayon`
--

CREATE TABLE `rayon` (
  `id` int(11) NOT NULL,
  `nama_rayon` varchar(100) NOT NULL,
  `kode_rayon` varchar(10) NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rayon`
--

INSERT INTO `rayon` (`id`, `nama_rayon`, `kode_rayon`, `deskripsi`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Rayon Utara', 'UTR', 'Rayon untuk wilayah utara kota', 1, '2025-09-05 13:14:27', '2025-09-05 13:14:27'),
(2, 'Rayon Selatan', 'SLT', 'Rayon untuk wilayah selatan kota', 1, '2025-09-05 13:14:27', '2025-09-05 13:14:27'),
(3, 'Rayon Timur', 'TMR', 'Rayon untuk wilayah timur kota', 1, '2025-09-05 13:14:27', '2025-09-05 13:14:27'),
(4, 'Rayon Barat', 'BRT', 'Rayon untuk wilayah barat kota', 1, '2025-09-05 13:14:27', '2025-09-05 13:14:27'),
(5, 'Rayon Pusat', 'PST', 'Rayon untuk wilayah pusat kota', 1, '2025-09-05 13:14:27', '2025-09-05 13:14:27'),
(6, 'Rayon Industri', 'IND', 'Rayon khusus area industri', 1, '2025-09-05 13:14:27', '2025-09-05 13:14:27'),
(7, 'Rayon Perumahan', 'PRH', 'Rayon khusus area perumahan', 1, '2025-09-05 13:14:27', '2025-09-05 13:14:27'),
(8, 'Rayon Komersial', 'KMR', 'Rayon khusus area komersial', 1, '2025-09-05 13:14:27', '2025-09-05 13:14:27'),
(9, 'Rayon Test', 'TS', NULL, 1, '2025-09-05 14:06:20', '2025-09-05 14:06:20');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `role` enum('admin','user') DEFAULT 'user',
  `cabang_id` int(11) DEFAULT NULL,
  `position` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `last_login` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `full_name`, `role`, `cabang_id`, `position`, `phone`, `is_active`, `last_login`, `updated_at`, `password`, `created_at`) VALUES
(1, 'admin@pdam.com', 'Administrator', 'admin', 1, 'System Admin', '081234567890', 1, NULL, '2025-09-05 10:31:59', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '2025-09-05 10:27:06'),
(2, 'user1@pdam.com', 'Sutedjo', 'user', 2, NULL, NULL, 1, '2025-09-07 05:00:29', '2025-09-07 05:00:29', '$2a$10$hEk5pAuZkRhKJKoIQCbEfe9utb6QA4.B5qIa5NgVl5y43IrDE0Ugy', '2025-09-05 10:27:23'),
(3, 'user2@pdam.com', NULL, 'user', 3, NULL, NULL, 1, NULL, '2025-09-05 10:31:59', '$2a$10$hEk5pAuZkRhKJKoIQCbEfe9utb6QA4.B5qIa5NgVl5y43IrDE0Ugy', '2025-09-05 10:27:23'),
(4, 'superadmin@pdam.com', 'Super Administrator', 'admin', 1, 'System Super Admin', '081234567891', 1, '2025-09-07 05:02:38', '2025-09-07 05:02:38', '$2a$10$hEk5pAuZkRhKJKoIQCbEfe9utb6QA4.B5qIa5NgVl5y43IrDE0Ugy', '2025-09-05 10:27:44'),
(5, 'pegawai1@pdam.com', 'Budi Santoso', 'user', 4, 'Staff Teknis', '081234567892', 1, '2025-09-06 12:23:34', '2025-09-06 12:23:34', '$2a$10$hEk5pAuZkRhKJKoIQCbEfe9utb6QA4.B5qIa5NgVl5y43IrDE0Ugy', '2025-09-05 10:28:02'),
(6, 'pegawai2@pdam.com', 'Siti Rahayu', 'user', 5, 'Staff Operasional', '081234567893', 1, NULL, '2025-09-05 10:31:59', '$2a$10$hEk5pAuZkRhKJKoIQCbEfe9utb6QA4.B5qIa5NgVl5y43IrDE0Ugy', '2025-09-05 10:28:02'),
(7, 'pegawai3@pdam.com', 'Ahmad Rahman', 'user', 6, 'Staff Lapangan', '081234567894', 1, NULL, '2025-09-05 10:45:53', '$2a$10$hEk5pAuZkRhKJKoIQCbEfe9utb6QA4.B5qIa5NgVl5y43IrDE0Ugy', '2025-09-05 10:28:02'),
(8, 'pegawai4@pdam.com', 'Dewi Sartika', 'user', 6, 'Staff Administrasi', '081234567895', 1, NULL, '2025-09-05 10:45:53', '$2a$10$hEk5pAuZkRhKJKoIQCbEfe9utb6QA4.B5qIa5NgVl5y43IrDE0Ugy', '2025-09-05 10:28:02'),
(9, 'testadmin@pdam.com', NULL, 'admin', NULL, NULL, NULL, 1, NULL, '2025-09-05 12:27:32', '$2a$10$LrRzOHXki042he1wopQZVOEDR6iZ0qioqG03KSqw3ki67UnHNzDD.', '2025-09-05 12:27:32');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cabang`
--
ALTER TABLE `cabang`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kode_unit` (`kode_unit`);

--
-- Indexes for table `desa`
--
ALTER TABLE `desa`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nama_desa` (`nama_desa`),
  ADD KEY `fk_desa_kecamatan` (`kecamatan_id`);

--
-- Indexes for table `golongan`
--
ALTER TABLE `golongan`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kode_golongan` (`kode_golongan`);

--
-- Indexes for table `kecamatan`
--
ALTER TABLE `kecamatan`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nama_kecamatan` (`nama_kecamatan`),
  ADD UNIQUE KEY `kode_kecamatan` (`kode_kecamatan`);

--
-- Indexes for table `kelompok`
--
ALTER TABLE `kelompok`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kode_kelompok` (`kode_kelompok`);

--
-- Indexes for table `pelanggan`
--
ALTER TABLE `pelanggan`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id_pelanggan` (`id_pelanggan`),
  ADD KEY `idx_pelanggan_user_id` (`user_id`),
  ADD KEY `fk_pelanggan_cabang` (`cabang_id`),
  ADD KEY `fk_pelanggan_kecamatan` (`kecamatan_id`),
  ADD KEY `rayon_id` (`rayon_id`),
  ADD KEY `golongan_id` (`golongan_id`),
  ADD KEY `kelompok_id` (`kelompok_id`);

--
-- Indexes for table `rayon`
--
ALTER TABLE `rayon`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kode_rayon` (`kode_rayon`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_users_cabang` (`cabang_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cabang`
--
ALTER TABLE `cabang`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `desa`
--
ALTER TABLE `desa`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `golongan`
--
ALTER TABLE `golongan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `kecamatan`
--
ALTER TABLE `kecamatan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `kelompok`
--
ALTER TABLE `kelompok`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `pelanggan`
--
ALTER TABLE `pelanggan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `rayon`
--
ALTER TABLE `rayon`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `desa`
--
ALTER TABLE `desa`
  ADD CONSTRAINT `fk_desa_kecamatan` FOREIGN KEY (`kecamatan_id`) REFERENCES `kecamatan` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `pelanggan`
--
ALTER TABLE `pelanggan`
  ADD CONSTRAINT `fk_pelanggan_cabang` FOREIGN KEY (`cabang_id`) REFERENCES `cabang` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_pelanggan_kecamatan` FOREIGN KEY (`kecamatan_id`) REFERENCES `kecamatan` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_pelanggan_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `pelanggan_ibfk_1` FOREIGN KEY (`rayon_id`) REFERENCES `rayon` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `pelanggan_ibfk_2` FOREIGN KEY (`golongan_id`) REFERENCES `golongan` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `pelanggan_ibfk_3` FOREIGN KEY (`kelompok_id`) REFERENCES `kelompok` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_cabang` FOREIGN KEY (`cabang_id`) REFERENCES `cabang` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
