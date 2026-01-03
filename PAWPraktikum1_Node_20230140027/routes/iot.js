const express = require('express');
const router = express.Router();
const iotController = require('../controllers/iotController');

// Route Get History (Modul 14)
router.get('/history', iotController.getSensorHistory);

// Route Post Data (Modul 13)
// HAPUS tulisan di baris ini
router.post('/data', iotController.receiveSensorData); 

// Route Ping (Optional)
router.post('/ping', iotController.testConnection);

module.exports = router;