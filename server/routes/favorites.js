const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');
const Service = require('../models/Service');
const { protect } = require('../middleware/auth');

// @desc    Get user favorites
// @route   GET /api/favorites
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.user.firebaseUid })
      .populate({
        path: 'serviceId',
        select: 'title description price image category providerId providerName providerPhoto rating'
      });
    
    // Format the response to include service details
    const formattedFavorites = favorites.map(fav => ({
      _id: fav._id,
      userId: fav.userId,
      serviceId: fav.serviceId._id,
      service: fav.serviceId,
      createdAt: fav.createdAt
    }));
    
    res.status(200).json({
      success: true,
      count: favorites.length,
      data: formattedFavorites
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @desc    Add service to favorites
// @route   POST /api/favorites
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { serviceId } = req.body;
    
    if (!serviceId) {
      return res.status(400).json({ success: false, error: 'Service ID is required' });
    }
    
    // Check if service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ success: false, error: 'Service not found' });
    }
    
    // Check if already favorited
    const existingFavorite = await Favorite.findOne({
      userId: req.user.firebaseUid,
      serviceId
    });
    
    if (existingFavorite) {
      return res.status(400).json({ success: false, error: 'Service already in favorites' });
    }
    
    // Create new favorite
    const favorite = await Favorite.create({
      userId: req.user.firebaseUid,
      serviceId
    });
    
    res.status(201).json({
      success: true,
      data: favorite
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

// @desc    Remove service from favorites
// @route   DELETE /api/favorites/:serviceId
// @access  Private
router.delete('/:serviceId', protect, async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      userId: req.user.firebaseUid,
      serviceId: req.params.serviceId
    });
    
    if (!favorite) {
      return res.status(404).json({ success: false, error: 'Favorite not found' });
    }
    
    await favorite.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @desc    Check if a service is favorited by the user
// @route   GET /api/favorites/check/:serviceId
// @access  Private
router.get('/check/:serviceId', protect, async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      userId: req.user.firebaseUid,
      serviceId: req.params.serviceId
    });
    
    res.status(200).json({
      success: true,
      isFavorite: favorite ? true : false
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;
