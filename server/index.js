const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();
console.log('Environment variables loaded');
console.log(`MONGO_URI exists: ${!!process.env.MONGO_URI}`);
console.log(`PORT: ${process.env.PORT || 5001}`);

// Connect to database
try {
  connectDB();
  console.log('Database connection initiated');
} catch (error) {
  console.error(`Failed to connect to database: ${error.message}`);
}

// Route files
const servicesRouter = require('./routes/services');
const bookingsRouter = require('./routes/bookings');
const usersRouter = require('./routes/users');

const app = express();

// Middleware
app.use(cors());
// Increase payload size limit to 50MB for handling base64 encoded images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Mount routes
app.use('/api/services', servicesRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/users', usersRouter);

// Root route for easy testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Home Service API' });
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Test route to check MongoDB connection
app.get('/api/test-db', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const dbStatus = mongoose.connection.readyState;
    const statusMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    res.json({
      status: statusMap[dbStatus] || 'unknown',
      message: dbStatus === 1 ? 'Database connection is healthy' : 'Database connection is not established'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Keep the process running
process.stdin.resume();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Log the error but don't exit
  console.error('Unhandled rejection occurred, but server will continue running');
});

// Handle termination signals
process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

