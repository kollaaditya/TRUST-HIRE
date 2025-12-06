import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Job from './models/Job.js';
import Application from './models/Application.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/trusthire')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const sampleUsers = [
  // Employers (5 users)
  { email: 'john.shop@local.com', password: 'password123', full_name: 'John Smith', username: 'johnsmith', phone: '+1234567890', user_role: 'employer' },
  { email: 'sarah.restaurant@local.com', password: 'password123', full_name: 'Sarah Johnson', username: 'sarahjohnson', phone: '+1234567891', user_role: 'employer' },
  { email: 'mike.store@local.com', password: 'password123', full_name: 'Mike Davis', username: 'mikedavis', phone: '+1234567892', user_role: 'employer' },
  { email: 'lisa.cafe@local.com', password: 'password123', full_name: 'Lisa Wilson', username: 'lisawilson', phone: '+1234567893', user_role: 'employer' },
  { email: 'david.garage@local.com', password: 'password123', full_name: 'David Brown', username: 'davidbrown', phone: '+1234567894', user_role: 'employer' },
  
  // Job Seekers (5 users)
  { email: 'alex.worker@email.com', password: 'password123', full_name: 'Alex Thompson', username: 'alexthompson', phone: '+1234567895', user_role: 'job_seeker' },
  { email: 'emma.helper@email.com', password: 'password123', full_name: 'Emma Garcia', username: 'emmagarcia', phone: '+1234567896', user_role: 'job_seeker' },
  { email: 'ryan.clerk@email.com', password: 'password123', full_name: 'Ryan Martinez', username: 'ryanmartinez', phone: '+1234567897', user_role: 'job_seeker' },
  { email: 'sophia.cashier@email.com', password: 'password123', full_name: 'Sophia Lee', username: 'sophialee', phone: '+1234567898', user_role: 'job_seeker' },
  { email: 'james.driver@email.com', password: 'password123', full_name: 'James Taylor', username: 'jamestaylor', phone: '+1234567899', user_role: 'job_seeker' }
];

const sampleJobs = [
  { title: 'Shop Assistant', description: 'Help customers and manage inventory in local retail store', category: 'Retail', location: 'Downtown Main St', salary_min: 15000, salary_max: 25000, job_type: 'part-time', contact_email: 'john.shop@local.com', contact_phone: '+1234567890' },
  { title: 'Restaurant Server', description: 'Serve customers and take orders in busy restaurant', category: 'Hospitality & Food Service', location: 'City Center', salary_min: 18000, salary_max: 28000, job_type: 'full-time', contact_email: 'sarah.restaurant@local.com', contact_phone: '+1234567891' },
  { title: 'Store Cashier', description: 'Handle cash register and customer transactions', category: 'Retail', location: 'Shopping Mall', salary_min: 16000, salary_max: 24000, job_type: 'part-time', contact_email: 'mike.store@local.com', contact_phone: '+1234567892' },
  { title: 'Cafe Barista', description: 'Prepare coffee and serve customers in local cafe', category: 'Hospitality & Food Service', location: 'Coffee Street', salary_min: 17000, salary_max: 26000, job_type: 'full-time', contact_email: 'lisa.cafe@local.com', contact_phone: '+1234567893' },
  { title: 'Delivery Driver', description: 'Deliver packages and goods around the city', category: 'Transportation & Logistics', location: 'City Wide', salary_min: 20000, salary_max: 30000, job_type: 'full-time', contact_email: 'david.garage@local.com', contact_phone: '+1234567894' }
];

async function populateData() {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    
    console.log('Creating users...');
    const createdUsers = [];
    
    for (let i = 0; i < sampleUsers.length; i++) {
      const userData = sampleUsers[i];
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      const user = new User({
        _id: new mongoose.Types.ObjectId().toString(),
        email: userData.email,
        password: hashedPassword,
        full_name: userData.full_name,
        username: userData.username,
        phone: userData.phone,
        user_role: userData.user_role,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      await user.save();
      createdUsers.push(user);
      console.log(`Created user: ${userData.full_name}`);
    }
    
    console.log('Creating jobs...');
    const createdJobs = [];
    const employers = createdUsers.filter(user => user.user_role === 'employer');
    
    for (let i = 0; i < sampleJobs.length; i++) {
      const jobData = sampleJobs[i];
      const employer = employers[i];
      
      const job = new Job({
        _id: new mongoose.Types.ObjectId().toString(),
        employer_id: employer._id,
        title: jobData.title,
        description: jobData.description,
        category: jobData.category,
        location: jobData.location,
        salary_min: jobData.salary_min,
        salary_max: jobData.salary_max,
        job_type: jobData.job_type,
        contact_email: jobData.contact_email,
        contact_phone: jobData.contact_phone,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      });
      
      await job.save();
      createdJobs.push(job);
      console.log(`Created job: ${jobData.title}`);
    }
    
    console.log('Creating applications...');
    const jobSeekers = createdUsers.filter(user => user.user_role === 'job_seeker');
    
    // Each job seeker applies to all 5 jobs
    for (const jobSeeker of jobSeekers) {
      for (const job of createdJobs) {
        const application = new Application({
          _id: new mongoose.Types.ObjectId().toString(),
          job_id: job._id,
          applicant_id: jobSeeker._id,
          message: `I am interested in the ${job.title} position. I have experience in this field and would like to work with your team.`,
          status: 'pending',
          created_at: new Date(),
          updated_at: new Date()
        });
        
        await application.save();
        console.log(`${jobSeeker.full_name} applied to ${job.title}`);
      }
    }
    
    console.log('Sample data populated successfully!');
    console.log(`Created ${createdUsers.length} users, ${createdJobs.length} jobs, and ${jobSeekers.length * createdJobs.length} applications`);
    
  } catch (error) {
    console.error('Error populating data:', error);
  } finally {
    mongoose.connection.close();
  }
}

populateData();