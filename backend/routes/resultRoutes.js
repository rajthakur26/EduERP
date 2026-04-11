const express = require('express');
const router = express.Router();
const { addResult, getResultsByClass, getStudentResults, getMyResults, updateResult, deleteResult } = require('../controllers/resultController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('teacher', 'admin'), addResult);
router.get('/', protect, authorize('admin', 'teacher'), getResultsByClass);
router.get('/me', protect, authorize('student'), getMyResults);
router.get('/student/:studentId', protect, getStudentResults);
router.put('/:id', protect, authorize('teacher', 'admin'), updateResult);
router.delete('/:id', protect, authorize('admin'), deleteResult);

module.exports = router;
