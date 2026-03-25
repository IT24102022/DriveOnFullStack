const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  staffLogin,
  getStaffAttendance,
  markStaffAttendance,
  getStaffPerformance
} = require('../controllers/staffController');

// Public routes
router.post('/login', staffLogin);

// Protected routes
router.route('/')
  .get(protect, getAllStaff)
  .post(protect, adminOnly, upload.single('image'), createStaff);

router.route('/:id')
  .get(protect, getStaffById)
  .put(protect, adminOnly, upload.single('image'), updateStaff)
  .delete(protect, adminOnly, deleteStaff);

// Attendance routes
router.get('/attendance', protect, adminOnly, getStaffAttendance);
router.post('/attendance', protect, adminOnly, markStaffAttendance);

// Performance reports
router.get('/performance', protect, adminOnly, getStaffPerformance);

module.exports = router;
