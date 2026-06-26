const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title:    { type: String, required: true },
  message:  { type: String, required: true },
  type:     { type: String, enum: ['application_status', 'interview_scheduled', 'invitation', 'general', 'follow_request', 'follow_accepted', 'follow_removed', 'new_job'], default: 'general' },
  isRead:   { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
