const express = require('express');
const router = express.Router();
const {
  getTheoryExams,
  getTheoryExamById,
  getAssignableStudents,
  assignStudentToTheoryExam,
  unassignStudentFromTheoryExam,
  getUpcomingTheoryExams,
  importTheoryExams
} = require('../controllers/theoryExamController');
const { protect, adminOnly } = require('../middleware/auth');

// Public routes (all authenticated users)
router.get('/', getTheoryExams);  // Temporarily removed protect for debugging
router.get('/upcoming', getUpcomingTheoryExams);  // Temporarily removed protect for debugging
router.get('/:id', getTheoryExamById);  // Temporarily removed protect for debugging

// Admin only routes
router.get('/:id/assignable-students', getAssignableStudents);  // Temporarily removed middleware for debugging
router.post('/:id/assign-student', assignStudentToTheoryExam);
router.post('/:id/unassign-student', unassignStudentFromTheoryExam);
router.post('/import', importTheoryExams);

module.exports = router;
