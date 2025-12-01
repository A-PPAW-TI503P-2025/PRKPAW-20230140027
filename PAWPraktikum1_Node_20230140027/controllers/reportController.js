const { Presensi, User } = require("../models"); // Tambahkan User
const { Op } = require("sequelize");

exports.getDailyReport = async (req, res) => {
  try {
    const { nama, tanggalMulai, tanggalSelesai } = req.query;
    let options = { 
      where: {},
      include: [{ 
        model: User, 
        attributes: ['nama'] // Ambil hanya kolom nama dari tabel User
      }],
      order: [['checkIn', 'DESC']] // Urutkan dari yang terbaru
    };

    // Filter berdasarkan Nama User (Pencarian)
    if (nama) {
      // Karena nama ada di tabel User, kita filter di dalam include atau gunakan logic khusus.
      // Namun untuk simplifikasi Sequelize standar, filter nama di tabel asosiasi agak kompleks.
      // Untuk saat ini kita filter record presensi-nya saja, atau biarkan fitur search ini sementara.
      // Jika ingin search nama user, logic-nya harus pindah ke dalam block include.
      options.include[0].where = {
        nama: { [Op.like]: `%${nama}%` }
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
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil laporan", error: error.message });
  }
};