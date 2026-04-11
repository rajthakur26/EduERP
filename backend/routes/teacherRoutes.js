const express = require('express');
const router = express.Router();
const { getTeachers, getTeacherById, updateTeacher, deleteTeacher, getMyProfile } = require('../controllers/teacherController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('admin'), getTeachers);
router.get('/me', protect, authorize('teacher'), getMyProfile);
router.get('/:id', protect, getTeacherById);
router.put('/:id', protect, authorize('admin'), updateTeacher);
router.delete('/:id', protect, authorize('admin'), deleteTeacher);

module.exports = router;
