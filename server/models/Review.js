const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking ID is required']
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Service ID is required']
  },
  userId: {
    type: String,
    required: [true, 'User ID is required']
  },
  userName: {
    type: String,
    required: [true, 'User name is required']
  },
  userPhoto: {
    type: String,
    default: ''
  },
  providerId: {
    type: String,
    required: [true, 'Provider ID is required']
  },
  rating: {
    type: Number,
    required: [true, 'Please add a rating'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: [true, 'Please add a comment'],
    maxlength: [1000, 'Comment cannot be more than 1000 characters']
  },
  response: {
    text: {
      type: String,
      maxlength: [1000, 'Response cannot be more than 1000 characters']
    },
    date: {
      type: Date
    }
  },
  isVerified: {
    type: Boolean,
    default: true
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

// Update service and provider ratings when a review is added or modified
ReviewSchema.post('save', async function() {
  try {
    const Service = mongoose.model('Service');
    const User = mongoose.model('User');
    
    // Update service rating
    const serviceReviews = await this.constructor.find({ serviceId: this.serviceId });
    const serviceAvgRating = serviceReviews.reduce((acc, item) => acc + item.rating, 0) / serviceReviews.length;
    await Service.findByIdAndUpdate(this.serviceId, {
      rating: serviceAvgRating,
      reviewCount: serviceReviews.length
    });
    
    // Update provider rating
    const providerReviews = await this.constructor.find({ providerId: this.providerId });
    const providerAvgRating = providerReviews.reduce((acc, item) => acc + item.rating, 0) / providerReviews.length;
    await User.findOneAndUpdate({ firebaseUid: this.providerId }, {
      averageRating: providerAvgRating,
      reviewCount: providerReviews.length
    });
  } catch (err) {
    console.error('Error updating ratings:', err);
  }
});

module.exports = mongoose.model('Review', ReviewSchema);
