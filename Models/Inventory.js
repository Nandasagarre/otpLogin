const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true,
    required: true
  },
  otpSent: {
    type: String,
    default: ''
  },
  otpGeneratedAt: {
    type: Date
  },
  otpAttempts: {
    type: Number,
    default: 0
  },
  blockedUntil: {
    type: Date
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;
