import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  job_id: { type: String, required: true },
  applicant_id: { type: String, required: true },
  message: String,
  status: { type: String, default: 'pending' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

export default mongoose.model('Application', applicationSchema);