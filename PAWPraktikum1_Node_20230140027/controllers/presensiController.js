const { Presensi } = require("../models");
const { format } = require("date-fns-tz");
const timeZone = "Asia/Jakarta";

const { body, validationResult } = require("express-validator");

exports.CheckIn = async (req, res) => {
	try {
		const { id: userId, nama: userName } = req.user;
		const waktuSekarang = new Date();

		const existingRecord = await Presensi.findOne({
			where: { userId: userId, checkOut: null },
		});

		if (existingRecord) {
			return res
				.status(400)
				.json({ message: "Anda sudah melakukan check-in hari ini." });
		}

		const newRecord = await Presensi.create({
			userId: userId,
			nama: userName,
			checkIn: waktuSekarang,
		});
		
		const formattedData = {
			userId: newRecord.userId,
			nama: newRecord.nama,
			checkIn: format(newRecord.checkIn, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
			checkOut: null
		};

		res.status(201).json({
			message: `Halo ${userName}, check-in Anda berhasil pada pukul ${format(
				waktuSekarang,
				"HH:mm:ss",
				{ timeZone }
			)} WIB`,
			data: formattedData,
		});
	} catch (error) {
		res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
	}
};

exports.CheckOut = async (req, res) => {
	try {
		const { id: userId, nama: userName } = req.user;
		const waktuSekarang = new Date();

		const recordToUpdate = await Presensi.findOne({
			where: { userId: userId, checkOut: null },
		});

		if (!recordToUpdate) {
			return res.status(404).json({
				message: "Tidak ditemukan catatan check-in yang aktif untuk Anda.",
			});
		}

		recordToUpdate.checkOut = waktuSekarang;
		await recordToUpdate.save();

		const formattedData = {
			userId: recordToUpdate.userId,
			nama: recordToUpdate.nama,
			checkIn: format(recordToUpdate.checkIn, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
			checkOut: format(recordToUpdate.checkOut, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
		};

		res.json({
			message: `Selamat jalan ${userName}, check-out Anda berhasil pada pukul ${format(
				waktuSekarang,
				"HH:mm:ss",
				{ timeZone }
			)} WIB`,
			data: formattedData,
		});
	} catch (error) {
		res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
	}
};

exports.deletePresensi = async (req, res) => {
	try {
		const { id: userId } = req.user;
		const presensiId = req.params.id;
		const recordToDelete = await Presensi.findByPk(presensiId);

		if (!recordToDelete) {
			return res
				.status(404)
				.json({ message: "Catatan presensi tidak ditemukan." });
		}
		if (recordToDelete.userId !== userId) {
			return res
				.status(403)
				.json({ message: "Akses ditolak: Anda bukan pemilik catatan ini." });
		}

		await recordToDelete.destroy();
		res.status(204).send();
	} catch (error) {
		res
			.status(500)
			.json({ message: "Terjadi kesalahan pada server", error: error.message });
	}
};

exports.validateUpdate = [
	body("checkIn")
		.optional()
		.isISO8601()
		.withMessage("Format 'checkIn' harus tanggal yang benar."),

	body("checkOut")
		.optional()
		.isISO8601()
		.withMessage("Format 'checkOut' harus tanggal yang benar."),
];

exports.updatePresensi = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const presensiId = req.params.id;
		const { checkIn, checkOut, nama } = req.body;

		if (checkIn === undefined && checkOut === undefined && nama === undefined) {
			return res.status(400).json({
				message:
					"Request body tidak berisi data yang valid untuk diupdate (checkIn, checkOut, atau nama).",
			});
		}

		const recordToUpdate = await Presensi.findByPk(presensiId);
		if (!recordToUpdate) {
			return res
				.status(404)
				.json({ message: "Catatan presensi tidak ditemukan." });
		}

		recordToUpdate.checkIn = checkIn || recordToUpdate.checkIn;
		recordToUpdate.checkOut = checkOut || recordToUpdate.checkOut;
		recordToUpdate.nama = nama || recordToUpdate.nama;
		await recordToUpdate.save();

		res.json({
			message: "Data presensi berhasil diperbarui.",
			data: recordToUpdate,
		});
	} catch (error) {
		res
			.status(500)
			.json({ message: "Terjadi kesalahan pada server", error: error.message });
	}
};
