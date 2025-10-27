// <--- 1. IMPOR MODEL ANDA
// Pastikan Anda mengimpor model dari database
// Sesuaikan nama 'Presensi' jika nama file model Anda berbeda
const { Presensi } = require('../models');

// <--- 2. UBAH MENJADI FUNGSI 'async'
// Kita butuh 'async' agar bisa menggunakan 'await' untuk operasi database
exports.getDailyReport = async (req, res) => {
  
  // <--- 3. GUNAKAN BLOK 'try...catch'
  // Ini SANGAT PENTING untuk menangani error jika database gagal
  try {
    
    console.log("Controller: Mengambil data laporan harian dari DATABASE...");
    
    // <--- 4. DEFINISIKAN 'presensiRecords'
    // Ini adalah baris yang hilang.
    // Kita mengambil SEMUA data dari tabel 'Presensi'
    const presensiRecords = await Presensi.findAll();

    // Kirim respon JSON setelah data berhasil diambil
    res.json({
      reportDate: new Date().toLocaleDateString(), // Sesuai gambar asli
      data: presensiRecords,
    });

  } catch (error) {
    // Blok ini akan menangkap error jika 'await Presensi.findAll()' gagal
    console.error("Error saat mengambil data dari database:", error);
    res.status(500).json({ 
      message: "Terjadi kesalahan pada server saat mengambil laporan harian.",
      error: error.message 
    });
  }
};