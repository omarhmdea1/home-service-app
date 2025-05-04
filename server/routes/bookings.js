const express = require('express');
const router = express.Router();

// POST /api/bookings
router.post('/', (req, res) => {
  const { serviceId, date, time } = req.body;
  // Here you would typically save the booking to the database
  console.log(`Booking received: Service ID ${serviceId}, Date ${date}, Time ${time}`);
  res.status(201).json({ message: 'Booking request submitted successfully.' });
});

module.exports = router;
