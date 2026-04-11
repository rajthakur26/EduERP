const express = require('express');
const router = express.Router();
const { getDashboardStats, getAttendanceAnalytics, getFeeAnalytics, getResultAnalytics } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, authorize('admin'), getDashboardStats);
router.get('/attendance', protect, authorize('admin', 'teacher'), getAttendanceAnalytics);
router.get('/fees', protect, authorize('admin'), getFeeAnalytics);
router.get('/results', protect, authorize('admin', 'teacher'), getResultAnalytics);

module.exports = router;
