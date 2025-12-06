import mongoose from 'mongoose';

const blacklistedUserSchema = new mongoose.Schema({
  mobile: {
    type: String,
    required: true,
    index: true
  },
  email: {
    type: String,
    index: true
  },
  reason: {
    type: String,
    required: true,
    enum: ['fraud', 'spam', 'fake_profile', 'multiple_accounts', 'suspicious_activity']
  },
  reportedBy: {
    type: String,
    default: 'system'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

blacklistedUserSchema.index({ mobile: 1 }, { unique: true });

export default mongoose.model('BlacklistedUser', blacklistedUserSchema);