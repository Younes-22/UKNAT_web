const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'gbp'
  },
  donationType: {
    type: String,
    enum: ['one-time', 'monthly'],
    required: true
  },
  donor: {
    firstName: String,
    lastName: String,
    email: {
      type: String,
      required: true
    },
    phone: String,
    address: String,
    city: String,
    state: String,
    zip: String,
    country: String,
    anonymous: {
      type: Boolean,
      default: false
    }
  },
  campaign: {
    type: String,
    default: 'general'
  },
  stripePaymentId: {
    type: String,
    required: true
  },
  stripeCustomerId: String,
  stripeSubscriptionId: String,
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'completed'
  },
  newsletterSignup: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Donation', DonationSchema);