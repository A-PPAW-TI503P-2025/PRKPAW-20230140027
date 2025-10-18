exports.addUserData = (req, res, next) => {
    console.log("Middleware: Menambahkan data user ke tiruan (dummy)..");
    req.user = {
        id: 123,
        name: "Sugeng",
        role: "karyawan"
    };
    next();
}
 	exports.isAdmin = (req, res, next) => {
 	  if (req.user && req.user.role === "admin") {
 	    console.log('Middleware: apakah user adalah admin..');
 	    next(); 
 	  } else {
 	    console.log('Middleware: Gagal! Pengguna bukan admin.');
 	    return res.status(403).json({ message: 'Akses ditolak: Hanya untuk admin'});
 	  }
 	};
