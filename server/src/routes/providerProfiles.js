const express = require('express');
const router = express.Router();
const ProviderProfile = require('../models/ProviderProfile');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all provider profiles
// @route   GET /api/provider-profiles
// @access  Public
router.get('/', async (req, res) => {
  try {
    const providerProfiles = await ProviderProfile.find();
    res.status(200).json({ success: true, count: providerProfiles.length, data: providerProfiles });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @desc    Get single provider profile
// @route   GET /api/provider-profiles/:userId
// @access  Public
router.get('/:userId', async (req, res) => {
  try {
    const providerProfile = await ProviderProfile.findOne({ userId: req.params.userId });
    
    if (!providerProfile) {
      return res.status(404).json({ success: false, error: 'Provider profile not found' });
    }
    
    res.status(200).json({ success: true, data: providerProfile });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @desc    Create provider profile
// @route   POST /api/provider-profiles
// @access  Private/Provider
router.post('/', protect, authorize('provider'), async (req, res) => {
  try {
    // Check if profile already exists
    const existingProfile = await ProviderProfile.findOne({ userId: req.user.firebaseUid });
    
    if (existingProfile) {
      return res.status(400).json({ success: false, error: 'Provider profile already exists' });
    }
    
    // Create profile
    const providerProfile = await ProviderProfile.create({
      ...req.body,
      userId: req.user.firebaseUid
    });
    
    res.status(201).json({ success: true, data: providerProfile });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: messages });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @desc    Update provider profile
// @route   PUT /api/provider-profiles/:userId
// @access  Private/Provider or Admin
router.put('/:userId', protect, async (req, res) => {
  try {
    let providerProfile = await ProviderProfile.findOne({ userId: req.params.userId });
    
    if (!providerProfile) {
      return res.status(404).json({ success: false, error: 'Provider profile not found' });
    }
    
    // Check if user is the profile owner or an admin
    if (req.user.firebaseUid !== req.params.userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to update this profile' });
    }
    
    // Update updatedAt field
    req.body.updatedAt = Date.now();
    
    // Update profile
    providerProfile = await ProviderProfile.findOneAndUpdate(
      { userId: req.params.userId },
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({ success: true, data: providerProfile });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: messages });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @desc    Add portfolio item
// @route   POST /api/provider-profiles/:userId/portfolio
// @access  Private/Provider
router.post('/:userId/portfolio', protect, async (req, res) => {
  try {
    // Check if user is the profile owner
    if (req.user.firebaseUid !== req.params.userId) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this profile' });
    }
    
    const providerProfile = await ProviderProfile.findOne({ userId: req.params.userId });
    
    if (!providerProfile) {
      return res.status(404).json({ success: false, error: 'Provider profile not found' });
    }
    
    // Add portfolio item
    providerProfile.portfolio.push(req.body);
    providerProfile.updatedAt = Date.now();
    
    await providerProfile.save();
    
    res.status(200).json({ success: true, data: providerProfile });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: messages });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @desc    Update verification status (Admin only)
// @route   PUT /api/provider-profiles/:userId/verify
// @access  Private/Admin
router.put('/:userId/verify', protect, authorize('admin'), async (req, res) => {
  try {
    const { isVerified } = req.body;
    
    if (isVerified === undefined) {
      return res.status(400).json({ success: false, error: 'Verification status is required' });
    }
    
    // Update provider profile verification status
    const providerProfile = await ProviderProfile.findOneAndUpdate(
      { userId: req.params.userId },
      { isVerified, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!providerProfile) {
      return res.status(404).json({ success: false, error: 'Provider profile not found' });
    }
    
    // Also update the user's verification status
    await User.findOneAndUpdate(
      { firebaseUid: req.params.userId },
      { isVerified }
    );
    
    res.status(200).json({ success: true, data: providerProfile });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;
