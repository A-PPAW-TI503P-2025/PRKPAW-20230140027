// controllers/iotController.js
const { SensorLog } = require('../models'); // <-- Import Model SensorLog

// 1. Fungsi Test Koneksi (Biarkan jika sudah ada)
exports.testConnection = async (req, res) => {
    try {
        res.status(200).json({ status: "connected", message: "Server IoT Ready" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. Fungsi Menerima & Menyimpan Data (receiveSensorData)
exports.receiveSensorData = async (req, res) => {
    try {
        // Tangkap data dari body request (dikirim oleh ESP32) [cite: 237]
        const { suhu, kelembaban, cahaya } = req.body;

        // Validasi sederhana [cite: 239]
        if (suhu === undefined || kelembaban === undefined) {
            return res.status(400).json({
                status: "error",
                message: "Data suhu atau kelembaban tidak valid"
            });
        }

        // Simpan ke Database [cite: 246]
        const newData = await SensorLog.create({
            suhu: parseFloat(suhu),
            kelembaban: parseFloat(kelembaban),
            cahaya: parseInt(cahaya) || 0 // Default 0 jika tidak ada data cahaya [cite: 250]
        });

        // Log agar terlihat di terminal [cite: 253]
        console.log(` 💾  [SAVED] Suhu: ${suhu}°C | Lembab: ${kelembaban}% | Cahaya: ${cahaya}`);

        // Beri respon sukses ke ESP32 [cite: 254]
        res.status(201).json({ status: "ok", message: "Data berhasil disimpan" });

    } catch (error) {
        console.error("Gagal menyimpan data:", error);
        res.status(500).json({ status: "error", message: error.message });
    }
};

// 3. Fungsi Get History (Dari Modul 14, biarkan saja jika sudah ada)
exports.getSensorHistory = async (req, res) => {
    try {
        const data = await SensorLog.findAll({
            limit: 20,
            order: [['createdAt', 'DESC']]
        });
        const formattedData = data.reverse();
        res.json({ status: "success", data: formattedData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};