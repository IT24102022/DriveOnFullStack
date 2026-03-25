const express = require('express');
const router = express.Router();

// Import individual route modules
const examRoutes = require('./exams');
const practicalExamRoutes = require('./practicalExams');

// Debug route
router.get('/debug', (req, res) => {
  res.json({ message: 'Exam system routes are working', timestamp: new Date() });
});

// Mount exam routes
router.use('/theory', examRoutes);
router.use('/practical', practicalExamRoutes);

module.exports = router;
