const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
try {
  connectDB();
} catch (error) {
  console.error(`Failed to connect to database: ${error.message}`);
}

// Route files
const servicesRouter = require('./routes/services');
const bookingsRouter = require('./routes/bookings');
const usersRouter = require('./routes/users');
const categoriesRouter = require('./routes/categories');
const favoritesRouter = require('./routes/favorites');
const providerProfilesRouter = require('./routes/providerProfiles');
const reviewsRouter = require('./routes/reviews');
const messagesRouter = require('./routes/messageRoutes');

const app = express();

// Middleware
app.use(cors());
// Increase payload size limit to 50MB for handling base64 encoded images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Make io available to routes via middleware
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Mount routes
app.use('/api/services', servicesRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/users', usersRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/provider-profiles', providerProfilesRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/messages', messagesRouter);

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

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a booking room for real-time messaging
  socket.on('join_booking_room', (bookingId) => {
    socket.join(bookingId);
    console.log(`Socket ${socket.id} joined booking room: ${bookingId}`);
  });

  // Leave a booking room
  socket.on('leave_booking_room', (bookingId) => {
    socket.leave(bookingId);
    console.log(`Socket ${socket.id} left booking room: ${bookingId}`);
  });

  // Handle new messages (emit to room)
  socket.on('new_message', (data) => {
    const { bookingId, message } = data;
    // Broadcast the message to all users in this booking room
    socket.to(bookingId).emit('message_received', message);
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    const { bookingId, isTyping, userName } = data;
    socket.to(bookingId).emit('user_typing', { isTyping, userName });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`Socket.io is ready and listening for connections`);
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

