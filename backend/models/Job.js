import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  employer_id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  location: { type: String, required: true },
  qualification: String,
  salary_min: Number,
  salary_max: Number,
  job_type: String,
  contact_email: String,
  contact_phone: String,
  deadline: Date,
  status: { type: String, default: 'active' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

export default mongoose.model('Job', jobSchema);