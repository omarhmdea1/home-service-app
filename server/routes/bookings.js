const express = require('express');
const router = express.Router();

// Mock data for bookings
let bookings = [];

// GET /api/bookings
router.get('/', (req, res) => {
  const userId = req.query.userId;
  
  // Filter bookings by user ID if provided
  const userBookings = userId 
    ? bookings.filter(booking => booking.userId === userId)
    : bookings;
    
  res.json(userBookings);
});

// GET /api/bookings/:id
router.get('/:id', (req, res) => {
  const booking = bookings.find(b => b.id === req.params.id);
  
  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }
  
  res.json(booking);
});

// POST /api/bookings
router.post('/', (req, res) => {
  const { serviceId, userId, date, time, address, notes } = req.body;
  
  // Generate a unique ID
  const id = 'bk' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  
  // Create new booking with status
  const newBooking = {
    id,
    serviceId,
    userId,
    date,
    time,
    address,
    notes,
    status: 'pending', // Default status is pending
    createdAt: new Date().toISOString()
  };
  
  // Add to bookings array (in a real app, this would be saved to a database)
  bookings.push(newBooking);
  
  // Here you would typically save the booking to the database
  console.log(`Booking received: Service ID ${serviceId}, Date ${date}, Time ${time}, Status: pending`);
  res.status(201).json({ 
    message: 'Booking request submitted successfully.',
    booking: newBooking
  });
});

// PUT /api/bookings/:id/status
router.put('/:id/status', (req, res) => {
  const { status } = req.body;
  const bookingId = req.params.id;
  
  // Validate status
  if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }
  
  // Find the booking
  const bookingIndex = bookings.findIndex(b => b.id === bookingId);
  
  if (bookingIndex === -1) {
    return res.status(404).json({ message: 'Booking not found' });
  }
  
  // Update the status
  bookings[bookingIndex].status = status;
  
  res.json({ 
    message: 'Booking status updated successfully',
    booking: bookings[bookingIndex]
  });
});

module.exports = router;
