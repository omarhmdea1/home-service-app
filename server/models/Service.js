const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  image: {
    type: String,
    default: '/images/default-service.jpg'
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['Cleaning', 'Plumbing', 'Electrical', 'Gardening', 'Painting', 'Moving', 'Other']
  },
  providerId: {
    type: String,
    required: [true, 'Provider ID is required']
  },
  providerName: {
    type: String,
    required: [true, 'Provider name is required']
  },
  providerPhoto: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Service', ServiceSchema);
