const express = require('express');
const router = express.Router();
const {
  getPracticalExams,
  getPracticalExamById,
  getAssignableStudents,
  assignStudentToPracticalExam,
  unassignStudentFromPracticalExam,
  getUpcomingPracticalExams,
  importPracticalExams
} = require('../controllers/practicalExamController');
const { protect, adminOnly } = require('../middleware/auth');

// Public routes (all authenticated users)
router.get('/', protect, getPracticalExams);
router.get('/upcoming', protect, getUpcomingPracticalExams);
router.get('/:id', protect, getPracticalExamById);

// Admin only routes
router.get('/:id/assignable-students', protect, adminOnly, getAssignableStudents);
router.post('/:id/assign-student', protect, adminOnly, assignStudentToPracticalExam);
router.post('/:id/unassign-student', protect, adminOnly, unassignStudentFromPracticalExam);
router.post('/import', protect, adminOnly, importPracticalExams);

module.exports = router;
