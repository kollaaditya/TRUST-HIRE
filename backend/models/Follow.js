import mongoose from 'mongoose';

const followSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  follower_id: { type: String, required: true },
  following_id: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'accepted'],
    default: 'pending'
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Index for unique follow relationships
followSchema.index({ follower_id: 1, following_id: 1 }, { unique: true });

export default mongoose.model('Follow', followSchema);
