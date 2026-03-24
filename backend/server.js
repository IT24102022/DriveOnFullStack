const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/sessions',    require('./routes/sessions'));
app.use('/api/instructors', require('./routes/instructors'));
app.use('/api/vehicles',    require('./routes/vehicles'));
app.use('/api/payments',    require('./routes/payments'));
app.use('/api/quizzes',     require('./routes/quizzes'));
app.use('/api/progress',    require('./routes/progress'));
app.use('/api/learning',    require('./routes/learning'));
app.use('/api/students',           require('./routes/students'));
app.use('/api/license-categories', require('./routes/licenseCategories'));
app.use('/api/vehicle-classes',    require('./routes/vehicleClasses'));
app.use('/api/enrollment',         require('./routes/enrollment'));
app.use('/api/owners', require('./routes/owners'));
app.use('/api/feedbacks', require('./routes/feedbacks'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'DriveOn API is running', status: 'OK' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
