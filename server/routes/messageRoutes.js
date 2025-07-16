const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { protect, authorize } = require('../middleware/auth');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');

/**
 * @route   POST /api/messages
 * @desc    Send a new message
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
  try {
    const { bookingId, recipientId, content, attachments } = req.body;
    
    if (!bookingId || !recipientId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide bookingId, recipientId and content'
      });
    }

    // Verify the booking exists and user is part of the conversation
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Ensure the user is either the customer or provider for this booking
    const userId = req.user.firebaseUid;
    if (booking.userId !== userId && booking.providerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send messages for this booking'
      });
    }

    // Ensure recipient is the other party in the booking
    if (recipientId !== booking.userId && recipientId !== booking.providerId) {
      return res.status(400).json({
        success: false,
        message: 'Recipient must be part of the booking'
      });
    }

    const newMessage = new Message({
      bookingId,
      senderId: userId,
      recipientId,
      content,
      attachments: attachments || []
    });

    const message = await newMessage.save();

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/messages/booking/:bookingId
 * @desc    Get all messages for a specific booking
 * @access  Private
 */
router.get('/booking/:bookingId', protect, async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    
    // Verify the booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Ensure the user is either the customer or provider for this booking
    const userId = req.user.firebaseUid;
    if (booking.userId !== userId && booking.providerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view messages for this booking'
      });
    }

    // Get messages for this booking, sorted by creation time
    const messages = await Message.find({ bookingId })
      .sort({ createdAt: 1 });

    // Mark messages as read if the current user is the recipient
    const unreadMessages = messages.filter(
      message => !message.isRead && message.recipientId === userId
    );

    if (unreadMessages.length > 0) {
      await Message.updateMany(
        { 
          _id: { $in: unreadMessages.map(msg => msg._id) }
        },
        { isRead: true }
      );
    }

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/messages/unread
 * @desc    Get count of unread messages for the current user
 * @access  Private
 */
router.get('/unread', protect, async (req, res) => {
  try {
    const userId = req.user.firebaseUid;
    
    // Count unread messages where user is recipient
    const unreadCount = await Message.countDocuments({
      recipientId: userId,
      isRead: false
    });

    res.status(200).json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    console.error('Error counting unread messages:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   PUT /api/messages/:id/read
 * @desc    Mark a message as read
 * @access  Private
 */
router.put('/:id/read', protect, async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.user.firebaseUid;
    
    // Find the message
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    // Ensure the user is the recipient
    if (message.recipientId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to mark this message as read'
      });
    }
    
    // Update the message
    message.isRead = true;
    await message.save();
    
    res.status(200).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
