const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const { protect, authorize } = require('../middleware/auth');

// GET /api/bookings
// Get all bookings with optional filtering by userId or providerId
router.get('/', async (req, res) => {
  try {
    const { userId, providerId } = req.query;
    const query = {};
    
    // Apply filters if provided
    if (userId) query.userId = userId;
    if (providerId) query.providerId = providerId;
    
    const bookings = await Booking.find(query).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/bookings/:id
// Get single booking
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/bookings
// Create a new booking (customers only)
router.post('/', protect, async (req, res) => {
  try {
    // ✅ ROLE RESTRICTION: Get user information to check role
    const User = require('../models/User');
    let user = await User.findOne({ firebaseUid: req.user.uid });
    
    // Handle temporary test user (when Firebase Admin is not working)
    if (!user && req.user.uid === 'test-user-id') {
      console.log('📝 Using temporary test user for booking creation');
      user = {
        firebaseUid: 'test-user-id',
        email: 'test@example.com',
        role: 'customer', // Assume customer role for testing
        name: 'Test Customer', // This is what the booking creation expects
        firstName: 'Test',
        lastName: 'Customer'
      };
    }
    
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found. Please complete your profile setup.' 
      });
    }
    
    // ✅ PREVENT PROVIDERS FROM BOOKING
    if (user.role === 'provider') {
      return res.status(403).json({ 
        message: 'Providers cannot book services. Only customers can create bookings. If you need to book a service for personal use, please create a customer account.',
        error: 'PROVIDER_BOOKING_RESTRICTED',
        userRole: user.role
      });
    }
    
    // ✅ ONLY ALLOW CUSTOMERS TO BOOK
    if (user.role !== 'customer') {
      return res.status(403).json({ 
        message: 'Only customers can book services. Please log in with a customer account.',
        error: 'INSUFFICIENT_PERMISSIONS',
        userRole: user.role
      });
    }
    
    // Check if the service exists
    const service = await Service.findById(req.body.serviceId);
    if (!service) {
      return res.status(404).json({ 
        message: 'Service not found. The service may have been removed or is no longer available.' 
      });
    }
    
    // ✅ PREVENT SELF-BOOKING: Check if provider is trying to book their own service
    if (service.providerId === req.user.uid) {
      return res.status(400).json({ 
        message: 'You cannot book your own service.',
        error: 'SELF_BOOKING_NOT_ALLOWED'
      });
    }
    
    // Create booking with authenticated user info and service details
    const bookingData = {
      ...req.body,
      userId: req.user.uid,           // Use authenticated user ID
      userEmail: user.email,          // Use authenticated user email
      userName: user.name,            // Use authenticated user name
      price: service.price,           // Use service price
      providerId: service.providerId, // Use service provider ID
      status: 'pending',
      paymentStatus: 'pending'
    };
    
    const booking = await Booking.create(bookingData);
    
    console.log(`✅ BOOKING CREATED: User ${user.name} (${user.role}) booked service ${service.title} for ${booking.date}`);
    
    res.status(201).json({ 
      message: 'Booking request submitted successfully! The service provider will be notified.',
      booking,
      serviceTitle: service.title,
      providerName: service.providerName
    });
  } catch (error) {
    console.error('❌ Error creating booking:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ 
        message: 'Booking validation failed: ' + messages.join(', '),
        error: 'VALIDATION_ERROR'
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to create booking. Please try again.',
      error: 'SERVER_ERROR'
    });
  }
});

// PUT /api/bookings/:id
// Update a booking
router.put('/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json({
      message: 'Booking updated successfully',
      booking
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/bookings/:id/status
// Update booking status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status
    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json({ 
      message: 'Booking status updated successfully',
      booking
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/bookings/:id
// Delete a booking
router.delete('/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
