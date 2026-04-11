const express = require('express');
const router = express.Router();
const { createAssignment, getAssignments, getAssignmentById, updateAssignment, submitAssignment, gradeSubmission } = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('teacher', 'admin'), createAssignment);
router.get('/', protect, getAssignments);
router.get('/:id', protect, getAssignmentById);
router.put('/:id', protect, authorize('teacher', 'admin'), updateAssignment);
router.post('/:id/submit', protect, authorize('student'), submitAssignment);
router.post('/:id/grade', protect, authorize('teacher', 'admin'), gradeSubmission);

module.exports = router;
