const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Service = require('../models/Service');

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
// Create a new booking
router.post('/', async (req, res) => {
  try {
    // Check if the service exists
    const service = await Service.findById(req.body.serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Create booking with service price and provider info
    const bookingData = {
      ...req.body,
      price: service.price,
      providerId: service.providerId,
      status: 'pending',
      paymentStatus: 'pending'
    };
    
    const booking = await Booking.create(bookingData);
    
    console.log(`Booking created: Service ID ${booking.serviceId}, Date ${booking.date}, Status: pending`);
    
    res.status(201).json({ 
      message: 'Booking request submitted successfully.',
      booking
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
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
