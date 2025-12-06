import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  full_name: { type: String, required: true },
  username: String,
  phone: String,
  location: String,
  date_of_birth: String,
  profile_photo_url: String,
  resume_url: String,
  resume_name: String,
  user_role: { 
    type: String, 
    enum: ['job_seeker', 'employer', 'both'],
    default: 'job_seeker'
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);