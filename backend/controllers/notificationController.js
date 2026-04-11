const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');
const { getIO } = require('../socket/socketManager');

const createNotification = asyncHandler(async (req, res) => {
  const { title, message, type, recipientId, recipientRole, link } = req.body;
  const notification = await Notification.create({
    title, message, type, link,
    recipient: recipientId || null,
    recipientRole: recipientRole || 'all',
    sender: req.user._id,
  });

  // Emit via Socket.IO
  const io = getIO();
  if (io) {
    if (recipientId) {
      io.to(`user_${recipientId}`).emit('notification', notification);
    } else {
      io.to(recipientRole || 'all').emit('notification', notification);
    }
  }

  res.status(201).json({ success: true, notification });
});

const getNotifications = asyncHandler(async (req, res) => {
  const query = {
    $or: [
      { recipient: req.user._id },
      { recipientRole: req.user.role },
      { recipientRole: 'all' },
    ],
  };
  const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(50);
  const unread = notifications.filter((n) => !n.isRead).length;
  res.json({ success: true, notifications, unread });
});

const markAsRead = asyncHandler(async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
  res.json({ success: true, message: 'Marked as read' });
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { $or: [{ recipient: req.user._id }, { recipientRole: req.user.role }, { recipientRole: 'all' }], isRead: false },
    { isRead: true }
  );
  res.json({ success: true, message: 'All marked as read' });
});

const deleteNotification = asyncHandler(async (req, res) => {
  await Notification.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Notification deleted' });
});

module.exports = { createNotification, getNotifications, markAsRead, markAllAsRead, deleteNotification };
