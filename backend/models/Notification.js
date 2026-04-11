const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['info', 'warning', 'success', 'error'], default: 'info' },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    recipientRole: { type: String, enum: ['admin', 'teacher', 'student', 'all'], default: 'all' },
    isRead: { type: Boolean, default: false },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    link: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
