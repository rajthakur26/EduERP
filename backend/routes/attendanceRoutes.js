const express = require('express');
const router = express.Router();
const { markAttendance, getAttendanceByClass, getStudentAttendance, getMyAttendance } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('teacher', 'admin'), markAttendance);
router.get('/', protect, authorize('admin', 'teacher'), getAttendanceByClass);
router.get('/me', protect, authorize('student'), getMyAttendance);
router.get('/student/:studentId', protect, getStudentAttendance);

module.exports = router;
