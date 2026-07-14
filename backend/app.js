const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const courseRoutes = require('./src/routes/courseRoutes');
const myCourseRoutes = require('./src/routes/myCourseRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const jobRoutes = require('./src/routes/jobRoutes');
const atsRoutes = require('./src/routes/atsRoutes');
const profileRoutes = require('./src/routes/profileRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const path = require('path');
const { seedAdmin } = require('./src/controllers/adminController');

// Load environment variables
dotenv.config();

// Connect to database and seed default admin on startup
connectDB().then(() => {
  seedAdmin();
});

const app = express();

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Enable Cross-Origin Resource Sharing (CORS) for production requests
app.use(cors());

// Body parser
app.use(express.json());

// Standard logging middleware (only in development to avoid production logging overhead)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
  });
}

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/my-courses', myCourseRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/ats', atsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the Authentication API Backend Server',
    version: '1.0.0',
  });
});

// 404 Fallback
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found',
  });
});

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});
