const Notification = require('../models/Notification');

// @desc  Get user's notifications
// @route GET /api/notifications
exports.getNotifications = async (req, res) => {
  const notifications = await Notification.find({ receiver: req.user._id })
    .populate('sender', 'name avatarUrl')
    .sort({ createdAt: -1 })
    .limit(50);
  const unreadCount = await Notification.countDocuments({ receiver: req.user._id, isRead: false });
  res.json({ success: true, unreadCount, data: notifications });
};

// @desc  Mark single notification as read
// @route PATCH /api/notifications/:id/read
exports.markRead = async (req, res) => {
  const notif = await Notification.findOneAndUpdate(
    { _id: req.params.id, receiver: req.user._id },
    { isRead: true },
    { new: true }
  );
  if (!notif) return res.status(404).json({ success: false, message: 'Notification not found' });
  res.json({ success: true, data: notif });
};

// @desc  Mark all notifications as read
// @route PATCH /api/notifications/read-all
exports.markAllRead = async (req, res) => {
  await Notification.updateMany(
    { receiver: req.user._id, isRead: false },
    { isRead: true }
  );
  res.json({ success: true, message: 'All notifications marked as read' });
};

// @desc  Delete a notification
// @route DELETE /api/notifications/:id
exports.deleteNotification = async (req, res) => {
  const notif = await Notification.findOneAndDelete({
    _id: req.params.id,
    receiver: req.user._id,
  });
  if (!notif) return res.status(404).json({ success: false, message: 'Notification not found' });
  res.json({ success: true, message: 'Notification deleted' });
};

// ── Helper: create a notification (used by other controllers) ─────────────
exports.createNotification = async ({ receiver, sender, title, message, type }) => {
  return Notification.create({ receiver, sender, title, message, type });
};
