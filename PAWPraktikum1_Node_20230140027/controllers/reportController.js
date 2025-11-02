const { Presensi } = require("../models");
const { Op } = require("sequelize");

exports.getDailyReport = async (req, res) => {
  try {
    const { nama, tanggalMulai, tanggalSelesai } = req.query;
    let options = { where: {} };

    if (nama) {
      options.where.nama = {
        [Op.like]: `%${nama}%`,
      };
    }

    if (tanggalMulai && tanggalSelesai) {
      const startDate = new Date(tanggalMulai);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(tanggalSelesai);
      endDate.setHours(23, 59, 59, 999);

      options.where.checkIn = {
        [Op.between]: [startDate, endDate],
      };
    }

    const records = await Presensi.findAll(options);

    res.json({
      reportDate: new Date().toLocaleDateString(),
      data: records,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal mengambil laporan", error: error.message });
  }
};
