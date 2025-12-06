import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  sender_id: { type: String, required: true },
  receiver_id: { type: String, required: true },
  job_id: String,
  content: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model('Message', messageSchema);