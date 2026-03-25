const express = require('express');
const router = express.Router();
const {
  getAllStudentProgress,
  getStudentProgress,
  updateStudentProgress,
  getProgressStats
} = require('../controllers/examProgressController');
const { protect, adminOnly } = require('../middleware/auth');

// Admin and Instructor routes
router.get('/progress/students', protect, adminOnly, getAllStudentProgress);
router.get('/progress/stats', protect, adminOnly, getProgressStats);

// Student progress (students can view their own)
router.get('/progress/students/:studentId', protect, getStudentProgress);

// Progress update (system/admin only)
router.post('/progress/students/:studentId/update', protect, adminOnly, updateStudentProgress);

module.exports = router;
