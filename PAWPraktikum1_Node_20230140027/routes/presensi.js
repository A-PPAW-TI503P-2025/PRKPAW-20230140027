const express = require('express');
const router = express.Router();
const presensiController = require('../controllers/presensiController');
const { authenticateToken } = require('../middleware/permissionMiddleware');

// Gunakan middleware autentikasi untuk semua route di bawah ini
router.use(authenticateToken);

// Route Check-in & Check-out
router.post('/check-in', presensiController.CheckIn);
router.post('/check-out', presensiController.CheckOut);

// Route Update & Delete
router.put(
  '/:id', 
  presensiController.validateUpdate, 
  presensiController.updatePresensi
);

router.delete('/:id', presensiController.deletePresensi);

module.exports = router;