const { Presensi } = require("../models");
const { format } = require("date-fns-tz");
const timeZone = "Asia/Jakarta";
const { body, validationResult } = require("express-validator");

exports.CheckIn = async (req, res) => {
  try {
    // Ambil userId dan nama dari token (req.user)
    const { id: userId, nama: userName } = req.user;
    // Ambil lokasi dari body (dikirim oleh frontend)
    const { latitude, longitude } = req.body;

    const waktuSekarang = new Date();

    // Cek apakah user sudah check-in tapi belum check-out
    const existingRecord = await Presensi.findOne({
      where: { userId: userId, checkOut: null },
    });

    if (existingRecord) {
      return res.status(400).json({ message: "Anda sudah melakukan check-in hari ini." });
    }

    // Simpan data presensi + lokasi
    const newRecord = await Presensi.create({
      userId: userId,
      nama: userName,
      checkIn: waktuSekarang,
      latitude: latitude,   // <-- Pastikan kolom ini ada di database
      longitude: longitude, // <-- Pastikan kolom ini ada di database
    });

    const formattedData = {
      userId: newRecord.userId,
      nama: newRecord.nama,
      checkIn: format(newRecord.checkIn, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
      checkOut: null
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

// Export array validator ini agar router tidak error "handler must be a function"
exports.validateUpdate = [
    body("checkIn").optional().isISO8601(),
    body("checkOut").optional().isISO8601()
];

exports.updatePresensi = async (req, res) => {
    // Logika update sederhana
    const { id } = req.params;
    const updated = await Presensi.update(req.body, { where: { id } });
    res.json({ message: "Update berhasil", data: updated });
};