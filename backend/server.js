import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Job from './models/Job.js';
import Application from './models/Application.js';
import Message from './models/Message.js';
import Rating from './models/Rating.js';
import Follow from './models/Follow.js';
import otpRoutes from './routes/otp.js';
import adminRoutes from './routes/admin.js';

const app = express();

const JWT_SECRET = 'your-secret-key';

app.use(cors({
  origin: "https://trust-hire-ojfo.vercel.app",
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// OTP Routes
app.use('/api/otp', otpRoutes);

// Admin Routes
app.use('/api/admin', adminRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB connection error:", err));


// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

app.post('/api/auth/signup', async (req, res) => {
  try {
    console.log('Signup request received:', req.body);
    const { email, password, full_name, phone, username } = req.body;
    
    // Validate required fields
    if (!email || !password || !full_name || !username) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    if (existingUser) {
      return res.status(400).json({ 
        error: existingUser.email === email ? 'Email already exists' : 'Username already exists' 
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const user = new User({
      _id: new mongoose.Types.ObjectId().toString(),
      email,
      password: hashedPassword,
      full_name,
      phone: phone || null,
      username,
      user_role: 'job_seeker',
      created_at: new Date()
    });
    
    console.log('Saving user:', { email, username, full_name });
    await user.save();
    console.log('User saved successfully');
    
    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ 
      success: true, 
      user: { 
        id: user._id, 
        email: user.email, 
        full_name: user.full_name,
        username: user.username 
      }, 
      token 
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ 
      success: true, 
      user: { 
        id: user._id, 
        email: user.email, 
        full_name: user.full_name 
      }, 
      token 
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/auth/user', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    console.log('Auth check: Token received:', token ? 'Yes' : 'No');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Auth check: Token decoded:', decoded);
    
    const user = await User.findById(decoded.userId).select('-password');
    console.log('Auth check: User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Auth check error:', error.message);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Request password reset
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      // For security, we don't reveal if email exists
      return res.json({ 
        success: true, 
        message: 'If an account exists with this email, a password reset link has been sent' 
      });
    }
    
    // Generate a reset token that expires in 1 hour
    const resetToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    
    // In a real app, you would send this token via email
    // For now, we'll return it (in production, store it and send via email)
    res.json({ 
      success: true, 
      message: 'Password reset instructions sent to your email',
      resetToken // Only for development - in production, send via email
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
});

// Reset password with token
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;
    
    if (!resetToken || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    // Verify the reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, JWT_SECRET);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }
    
    // Find user and update password
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update user password
    user.password = hashedPassword;
    user.updated_at = new Date();
    await user.save();
    
    res.json({ 
      success: true, 
      message: 'Password has been reset successfully. You can now login with your new password.' 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Change password (when user is logged in)
app.put('/api/auth/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New passwords do not match' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    // Find user
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update password
    user.password = hashedPassword;
    user.updated_at = new Date();
    await user.save();
    
    res.json({ 
      success: true, 
      message: 'Password changed successfully' 
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'active' }).sort({ created_at: -1 });
    
    // Add employer details to each job
    const jobsWithEmployers = await Promise.all(
      jobs.map(async (job) => {
        const employer = await User.findById(job.employer_id).select('full_name username location user_role');
        return {
          ...job.toObject(),
          employer: employer || { full_name: 'Unknown Employer' }
        };
      })
    );
    
    res.json(jobsWithEmployers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/jobs/my-jobs', verifyToken, async (req, res) => {
  try {
    const jobs = await Job.find({ employer_id: req.userId }).sort({ created_at: -1 });

    const jobsWithApplications = await Promise.all(
      jobs.map(async (job) => {

        const applications = await Application.find({ job_id: job._id });

        const applicationsWithProfiles = await Promise.all(
          applications.map(async (app) => {

            const applicantProfile = await User.findById(app.applicant_id)
              .select('full_name username phone date_of_birth location user_role resume_url');

            return {
              ...app.toObject(),
              profiles: applicantProfile || null
            };
          })
        );

        return {
          ...job.toObject(),
          applications: applicationsWithProfiles
        };
      })
    );

    res.json(jobsWithApplications);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/jobs/:jobId/status', verifyToken, async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status } = req.body;
    
    const job = await Job.findOneAndUpdate(
      { _id: jobId, employer_id: req.userId },
      { status, updated_at: new Date() },
      { new: true }
    );
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json({ success: true, job });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/jobs/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Add employer details
    const employer = await User.findById(job.employer_id).select('full_name username location user_role phone created_at');
    
    res.json({
      ...job.toObject(),
      employer: employer || { full_name: 'Unknown Employer' }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/applications', verifyToken, async (req, res) => {
  try {
    const { jobId, message } = req.body;
    
    // Check if user already applied
    const existingApplication = await Application.findOne({
      job_id: jobId,
      applicant_id: req.userId
    });
    
    if (existingApplication) {
      return res.status(400).json({ error: 'You have already applied to this job' });
    }
    
    const application = new Application({
      _id: new mongoose.Types.ObjectId().toString(),
      job_id: jobId,
      applicant_id: req.userId,
      message,
      status: 'pending'
    });
    
    await application.save();
    res.json({ success: true, application });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/applications/my-applications', verifyToken, async (req, res) => {
  try {
    const applications = await Application.find({ applicant_id: req.userId }).sort({ created_at: -1 });
    
    const applicationsWithJobs = await Promise.all(
      applications.map(async (app) => {
        const job = await Job.findById(app.job_id);
        return {
          _id: app._id,
          status: app.status,
          message: app.message,
          created_at: app.created_at,
          job: job ? {
            _id: job._id,
            title: job.title,
            location: job.location,
            category: job.category
          } : null
        };
      })
    );
    
    res.json(applicationsWithJobs.filter(app => app.job !== null));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/jobs', verifyToken, async (req, res) => {
  try {
    console.log('Job posting request received');
    console.log('Request body:', req.body);
    console.log('User ID:', req.userId);
    
    const {
      title,
      description,
      category,
      location,
      qualification,
      contactEmail,
      contactPhone,
      jobType,
      salaryMin,
      salaryMax,
      deadline
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !location || !contactEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const job = new Job({
      _id: new mongoose.Types.ObjectId().toString(),
      employer_id: req.userId,
      title,
      description,
      category,
      location,
      qualification,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      job_type: jobType,
      salary_min: salaryMin ? parseInt(salaryMin) : null,
      salary_max: salaryMax ? parseInt(salaryMax) : null,
      deadline: deadline ? new Date(deadline) : null
    });

    console.log('Saving job:', job);
    await job.save();
    console.log('Job saved successfully');
    res.json({ success: true, job });
  } catch (error) {
    console.error('Job posting error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/auth/user', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const { username, full_name, phone, date_of_birth, user_role, location, profile_photo_url, resume_url, resume_name } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      {
        username,
        full_name,
        phone,
        date_of_birth,
        user_role,
        location,
        profile_photo_url,
        resume_url,
        resume_name,
        updated_at: new Date()
      },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user: updatedUser });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.post('/api/messages', verifyToken, async (req, res) => {
  try {
    const { receiverId, content, jobId } = req.body;
    console.log('Sending message from:', req.userId, 'to:', receiverId, 'content:', content);
    
    const message = new Message({
      _id: new mongoose.Types.ObjectId().toString(),
      sender_id: req.userId,
      receiver_id: receiverId,
      job_id: jobId,
      content
    });
    
    await message.save();
    console.log('Message saved:', message._id);
    res.json({ success: true, message });
  } catch (error) {
    console.error('Message send error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/messages/:receiverId', verifyToken, async (req, res) => {
  try {
    const { receiverId } = req.params;
    console.log('Fetching messages between:', req.userId, 'and', receiverId);
    
    const messages = await Message.find({
      $or: [
        { sender_id: req.userId, receiver_id: receiverId },
        { sender_id: receiverId, receiver_id: req.userId }
      ]
    }).sort({ created_at: 1 });
    
    console.log('Found messages:', messages.length);
    res.json(messages);
  } catch (error) {
    console.error('Message fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/conversations', verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender_id: req.userId },
        { receiver_id: req.userId }
      ]
    }).sort({ created_at: -1 });
    
    const conversationMap = new Map();
    
    for (const message of messages) {
      const otherUserId = message.sender_id === req.userId ? message.receiver_id : message.sender_id;
      
      if (!conversationMap.has(otherUserId)) {
        const otherUser = await User.findById(otherUserId).select('full_name');
        conversationMap.set(otherUserId, {
          user_id: otherUserId,
          user_name: otherUser?.full_name || 'Unknown User',
          last_message: message.content,
          last_message_time: message.created_at
        });
      }
    }
    
    res.json(Array.from(conversationMap.values()));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/profile/stats', verifyToken, async (req, res) => {
  try {
    console.log('Getting stats for user:', req.userId);
    
    const jobsPosted = await Job.countDocuments({ employer_id: req.userId });
    const jobsApplied = await Application.countDocuments({ applicant_id: req.userId });
    
    const ratings = await Rating.find({ rated_user_id: req.userId });
    const totalRatings = ratings.length;
    const avgRating = totalRatings > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings : 0;
    
    console.log('Stats:', { jobsPosted, jobsApplied, totalRatings, avgRating });
    
    res.json({
      jobsPosted,
      jobsApplied,
      avgRating: Math.round(avgRating * 10) / 10,
      totalRatings
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/applications/check/:jobId', verifyToken, async (req, res) => {
  try {
    const { jobId } = req.params;
    const application = await Application.findOne({
      job_id: jobId,
      applicant_id: req.userId
    });
    
    res.json({ hasApplied: !!application });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/ratings/check/:jobId/:employerId', verifyToken, async (req, res) => {
  try {
    const { jobId, employerId } = req.params;
    const rating = await Rating.findOne({
      rater_id: req.userId,
      rated_user_id: employerId,
      job_id: jobId
    });
    
    res.json({ 
      hasRated: !!rating,
      rating: rating ? { rating: rating.rating, comment: rating.comment } : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/applications/:applicationId/status', verifyToken, async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;
    
    const application = await Application.findByIdAndUpdate(
      applicationId,
      { status, updated_at: new Date() },
      { new: true }
    );
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    res.json({ success: true, application });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ratings', verifyToken, async (req, res) => {
  try {
    const { ratedUserId, jobId, rating, comment } = req.body;
    
    // Check if rating already exists
    const existingRating = await Rating.findOne({
      rater_id: req.userId,
      rated_user_id: ratedUserId,
      job_id: jobId
    });
    
    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      existingRating.comment = comment;
      await existingRating.save();
      res.json({ success: true, rating: existingRating });
    } else {
      // Create new rating
      const newRating = new Rating({
        _id: new mongoose.Types.ObjectId().toString(),
        rater_id: req.userId,
        rated_user_id: ratedUserId,
        job_id: jobId,
        rating,
        comment
      });
      
      await newRating.save();
      res.json({ success: true, rating: newRating });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Follow endpoints
app.post('/api/follows', verifyToken, async (req, res) => {
  try {
    const { followingId } = req.body;
    
    if (req.userId === followingId) {
      return res.status(400).json({ error: 'You cannot follow yourself' });
    }
    
    // Check if follow relationship already exists
    const existingFollow = await Follow.findOne({
      follower_id: req.userId,
      following_id: followingId
    });
    
    if (existingFollow) {
      return res.status(400).json({ error: 'You are already following or have a pending request with this user' });
    }
    
    const follow = new Follow({
      _id: new mongoose.Types.ObjectId().toString(),
      follower_id: req.userId,
      following_id: followingId,
      status: 'pending'
    });
    
    await follow.save();
    res.json({ success: true, follow });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pending follow requests for the current user
app.get('/api/follows/requests', verifyToken, async (req, res) => {
  try {
    const requests = await Follow.find({
      following_id: req.userId,
      status: 'pending'
    }).sort({ created_at: -1 });
    
    const requestsWithFollowerInfo = await Promise.all(
      requests.map(async (request) => {
        const follower = await User.findById(request.follower_id).select('full_name username profile_photo_url location');
        return {
          ...request.toObject(),
          follower
        };
      })
    );
    
    res.json(requestsWithFollowerInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Accept a follow request
app.put('/api/follows/:followId/accept', verifyToken, async (req, res) => {
  try {
    const { followId } = req.params;
    
    const follow = await Follow.findById(followId);
    
    if (!follow) {
      return res.status(404).json({ error: 'Follow request not found' });
    }
    
    if (follow.following_id !== req.userId) {
      return res.status(403).json({ error: 'You can only accept follow requests sent to you' });
    }
    
    follow.status = 'accepted';
    follow.updated_at = new Date();
    await follow.save();
    
    res.json({ success: true, follow });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reject/remove a follow
app.delete('/api/follows/:followId', verifyToken, async (req, res) => {
  try {
    const { followId } = req.params;
    
    const follow = await Follow.findById(followId);
    
    if (!follow) {
      return res.status(404).json({ error: 'Follow not found' });
    }
    
    // Allow deletion by either the follower or the person being followed
    if (follow.follower_id !== req.userId && follow.following_id !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    await Follow.deleteOne({ _id: followId });
    
    res.json({ success: true, message: 'Follow removed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get follow status between two users
app.get('/api/follows/status/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const follow = await Follow.findOne({
      follower_id: req.userId,
      following_id: userId
    });
    
    res.json({
      isFollowing: follow?.status === 'accepted' || false,
      hasPendingRequest: follow?.status === 'pending' || false,
      followId: follow?._id || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get followers list for a user
app.get('/api/follows/followers/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const followers = await Follow.find({
      following_id: userId,
      status: 'accepted'
    });
    
    const followersWithInfo = await Promise.all(
      followers.map(async (follow) => {
        const user = await User.findById(follow.follower_id).select('full_name username profile_photo_url location');
        return {
          ...follow.toObject(),
          user
        };
      })
    );
    
    res.json(followersWithInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get following list for a user
app.get('/api/follows/following/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const following = await Follow.find({
      follower_id: userId,
      status: 'accepted'
    });
    
    const followingWithInfo = await Promise.all(
      following.map(async (follow) => {
        const user = await User.findById(follow.following_id).select('full_name username profile_photo_url location');
        return {
          ...follow.toObject(),
          user
        };
      })
    );
    
    res.json(followingWithInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
