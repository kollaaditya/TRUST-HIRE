import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  rater_id: { type: String, required: true },
  rated_user_id: { type: String, required: true },
  job_id: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: String,
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model('Rating', ratingSchema);