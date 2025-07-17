const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth');

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Filter by service or provider if provided in query
    const filter = {};
    
    if (req.query.serviceId) {
      filter.serviceId = req.query.serviceId;
    }
    
    if (req.query.providerId) {
      filter.providerId = req.query.providerId;
    }
    
    const reviews = await Review.find(filter).sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @desc    Get reviews by user
// @route   GET /api/reviews/user
// @access  Private
router.get('/user', protect, async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user.firebaseUid }).sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }
    
    res.status(200).json({
      success: true,
      data: review
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;
    
    // Check if booking exists and belongs to user
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }
    
    if (booking.userId !== req.user.firebaseUid) {
      return res.status(403).json({ success: false, error: 'Not authorized to review this booking' });
    }
    
    // Check if booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({ success: false, error: 'Cannot review a booking that is not completed' });
    }
    
    // Check if review already exists for this booking
    const existingReview = await Review.findOne({ bookingId });
    
    if (existingReview) {
      return res.status(400).json({ success: false, error: 'Review already exists for this booking' });
    }
    
    // Create review
    const review = await Review.create({
      bookingId,
      serviceId: booking.serviceId,
      userId: req.user.firebaseUid,
      userName: booking.userName,
      userPhoto: req.user.photoURL || '',
      providerId: booking.providerId,
      rating,
      comment
    });
    
    res.status(201).json({
      success: true,
      data: review
    });
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: messages });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }
    
    // Check if user owns the review
    if (review.userId !== req.user.firebaseUid) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this review' });
    }
    
    // Only allow updating rating and comment
    const { rating, comment } = req.body;
    const updateData = { updatedAt: Date.now() };
    
    if (rating) updateData.rating = rating;
    if (comment) updateData.comment = comment;
    
    // Update review
    review = await Review.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: review
    });
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: messages });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @desc    Provider respond to review
// @route   PUT /api/reviews/:id/respond
// @access  Private/Provider
router.put('/:id/respond', protect, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ success: false, error: 'Response text is required' });
    }
    
    let review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }
    
    // Check if user is the provider
    if (review.providerId !== req.user.firebaseUid) {
      return res.status(403).json({ success: false, error: 'Not authorized to respond to this review' });
    }
    
    // Add response
    review = await Review.findByIdAndUpdate(
      req.params.id,
      {
        response: {
          text,
          date: Date.now()
        },
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      data: review
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }
    
    // Check if user owns the review or is admin
    if (review.userId !== req.user.firebaseUid && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this review' });
    }
    
    await review.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;
