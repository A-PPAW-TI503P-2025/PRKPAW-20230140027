const { Presensi } = require("../models");
const { format } = require("date-fns-tz");
const timeZone = "Asia/Jakarta";
const { body, validationResult } = require("express-validator");
const multer = require('multer'); // [cite: 67]
const path = require('path');     // [cite: 68]

// --- KONFIGURASI MULTER (UPLOAD FOTO) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // File akan disimpan di folder 'uploads/' [cite: 71]
  },
  filename: (req, file, cb) => {
    // Format nama file: userId-timestamp.jpg agar unik [cite: 74]
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) { // Hanya terima gambar [cite: 79]
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar yang diperbolehkan!'), false);
  }
};

// Export middleware upload untuk dipakai di Router
exports.upload = multer({ storage: storage, fileFilter: fileFilter }); // [cite: 85]


// --- CONTROLLER FUNCTIONS ---

exports.CheckIn = async (req, res) => {
  try {
    const { id: userId, nama: userName } = req.user;
    const { latitude, longitude } = req.body;
    
    // Ambil path foto jika ada yang diupload [cite: 91]
    const buktiFoto = req.file ? req.file.path : null; 

    const waktuSekarang = new Date();

    // Cek apakah user sudah check-in tapi belum check-out
    const existingRecord = await Presensi.findOne({
      where: { userId: userId, checkOut: null },
    });

    if (existingRecord) {
      return res.status(400).json({ message: "Anda sudah melakukan check-in hari ini." });
    }

    // Simpan data presensi + lokasi + FOTO
    const newRecord = await Presensi.create({
      userId: userId,
      nama: userName,
      checkIn: waktuSekarang,
      latitude: latitude,
      longitude: longitude,
      buktiFoto: buktiFoto // Simpan path foto ke database [cite: 98]
    });

    const formattedData = {
      userId: newRecord.userId,
      nama: newRecord.nama,
      checkIn: format(newRecord.checkIn, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
      checkOut: null,
      buktiFoto: newRecord.buktiFoto
    };

    res.status(201).json({
      message: `Halo ${userName}, check-in berhasil!`,
      data: formattedData,
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.CheckOut = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const waktuSekarang = new Date();

    const recordToUpdate = await Presensi.findOne({
      where: { userId: userId, checkOut: null },
    });

    if (!recordToUpdate) {
      return res.status(404).json({ message: "Belum ada data check-in aktif." });
    }

    recordToUpdate.checkOut = waktuSekarang;
    await recordToUpdate.save();

    res.json({
      message: "Check-out berhasil!",
      data: recordToUpdate,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deletePresensi = async (req, res) => {
  try {
      const presensiId = req.params.id;
      const record = await Presensi.findByPk(presensiId);
      if (!record) return res.status(404).json({ message: "Data tidak ditemukan" });
      
      await record.destroy();
      res.status(204).send();
  } catch (error) {
      res.status(500).json({ message: "Server error" });
  }
};

exports.validateUpdate = [
    body("checkIn").optional().isISO8601(),
    body("checkOut").optional().isISO8601()
];

exports.updatePresensi = async (req, res) => {
    const { id } = req.params;
    const updated = await Presensi.update(req.body, { where: { id } });
    res.json({ message: "Update berhasil", data: updated });
};