const express = require('express');
const router = express.Router();
const {
  getAttendanceRecords,
  createAttendanceRecord,
  getAttendanceAnalytics,
  getAttendanceReports
} = require('../controllers/examAttendanceController');
const { protect, adminOnly } = require('../middleware/auth');

// Admin and Instructor routes
router.get('/attendance', protect, getAttendanceRecords);
router.post('/attendance', protect, createAttendanceRecord);
router.get('/attendance/analytics', protect, getAttendanceAnalytics);
router.get('/attendance/reports', protect, adminOnly, getAttendanceReports);

module.exports = router;
