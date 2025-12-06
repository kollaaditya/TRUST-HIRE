import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  mobile: {
    type: String,
    required: true,
    index: true
  },
  otp: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 // TTL index - expires in 60 seconds
  }
});

// Ensure only one OTP per mobile number
otpSchema.index({ mobile: 1 }, { unique: true });

export default mongoose.model('OTP', otpSchema);