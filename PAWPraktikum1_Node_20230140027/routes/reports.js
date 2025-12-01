const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
// Ganti addUserData dengan authenticateToken
const { authenticateToken, isAdmin } = require('../middleware/permissionMiddleware');

// Gunakan authenticateToken di dalam array middleware
router.get('/daily', [authenticateToken, isAdmin], reportController.getDailyReport);

module.exports = router;