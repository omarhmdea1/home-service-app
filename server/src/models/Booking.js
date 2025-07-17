const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
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
  userEmail: {
    type: String,
    required: [true, 'User email is required'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  providerId: {
    type: String,
    required: [true, 'Provider ID is required']
  },
  date: {
    type: Date,
    required: [true, 'Please add a date for the service']
  },
  time: {
    type: String,
    required: [true, 'Please add a time for the service']
  },
  address: {
    type: String,
    required: [true, 'Please add an address']
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  price: {
    type: Number,
    required: [true, 'Price is required']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'paypal', 'cash', ''],
    default: ''
  },
  paymentId: {
    type: String,
    default: ''
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

module.exports = mongoose.model('Booking', BookingSchema);
