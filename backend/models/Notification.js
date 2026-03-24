const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  message: {
    type: String,
    required: [true, 'Message is required'],
  },
  status: {
    type: String,
    enum: ['Unread', 'Read'],
    default: 'Unread',
  },
  type: {
    type: String,
    enum: ['SessionAssigned', 'SessionCancelled', 'InsuranceExpiry', 'MaintenanceDue', 'General'],
    default: 'General',
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Instructor',
    required: true,
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
  },
}, { timestamps: { createdAt: 'date', updatedAt: 'updatedAt' } });

module.exports = mongoose.model('Notification', notificationSchema);
