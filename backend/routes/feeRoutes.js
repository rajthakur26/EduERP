const express = require('express');
const router = express.Router();
const { createFee, getFees, getFeeById, updateFee, getMyFees, getFeeStats } = require('../controllers/feeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('admin'), createFee);
router.get('/', protect, authorize('admin'), getFees);
router.get('/stats', protect, authorize('admin'), getFeeStats);
router.get('/me', protect, authorize('student'), getMyFees);
router.get('/:id', protect, getFeeById);
router.put('/:id', protect, authorize('admin'), updateFee);

module.exports = router;
