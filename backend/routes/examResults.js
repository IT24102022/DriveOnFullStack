const express = require('express');
const router = express.Router();
const {
  createExamResult,
  getStudentResults,
  getExamResults,
  getResultStats
} = require('../controllers/examResultController');
const { protect, adminOnly } = require('../middleware/auth');

// Admin only routes
router.post('/results', protect, adminOnly, createExamResult);
router.get('/results/exam/:examType/:examId', protect, getExamResults);
router.get('/results/stats', protect, adminOnly, getResultStats);

// Student results (students can view their own)
router.get('/results/student/:studentId', protect, getStudentResults);

module.exports = router;
