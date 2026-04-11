const express = require('express');
const router = express.Router();
const { getStudents, getStudentById, updateStudent, deleteStudent, getMyProfile } = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('admin', 'teacher'), getStudents);
router.get('/me', protect, authorize('student'), getMyProfile);
router.get('/:id', protect, getStudentById);
router.put('/:id', protect, authorize('admin'), updateStudent);
router.delete('/:id', protect, authorize('admin'), deleteStudent);

module.exports = router;
