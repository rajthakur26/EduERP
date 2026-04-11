const express = require('express');
const router = express.Router();
const { getUsers, getUserById, updateUser, deleteUser, changePassword } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('admin'), getUsers);
router.get('/:id', protect, authorize('admin'), getUserById);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);
router.put('/change-password', protect, changePassword);

module.exports = router;
