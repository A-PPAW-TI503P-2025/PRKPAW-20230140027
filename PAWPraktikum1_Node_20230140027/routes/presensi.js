const express = require('express');
const router = express.Router();
const presensiController = require('../controllers/presensiController');
const { authenticateToken } = require('../middleware/permissionMiddleware');

// Middleware autentikasi
router.use(authenticateToken);

// Upload middleware ditaruh di sini
router.post('/check-in', presensiController.upload.single('image'), presensiController.CheckIn);

router.post('/check-out', presensiController.CheckOut);

router.put(
  '/:id', 
  presensiController.validateUpdate, 
  presensiController.updatePresensi
);

router.delete('/:id', presensiController.deletePresensi);

module.exports = router;