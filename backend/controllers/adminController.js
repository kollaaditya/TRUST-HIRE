import BlacklistedUser from '../models/BlacklistedUser.js';

// Add user to blacklist
const addToBlacklist = async (req, res) => {
  try {
    const { mobile, email, reason } = req.body;
    
    if (!mobile || !reason) {
      return res.status(400).json({ error: 'Mobile and reason required' });
    }

    const blacklistedUser = new BlacklistedUser({
      mobile,
      email,
      reason,
      reportedBy: 'admin'
    });

    await blacklistedUser.save();
    
    res.json({ 
      success: true, 
      message: 'User added to blacklist successfully' 
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'User already blacklisted' });
    }
    res.status(500).json({ error: 'Failed to blacklist user' });
  }
};

// Get blacklisted users
const getBlacklistedUsers = async (req, res) => {
  try {
    const users = await BlacklistedUser.find()
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get blacklisted users' });
  }
};

// Remove from blacklist
const removeFromBlacklist = async (req, res) => {
  try {
    const { mobile } = req.params;
    
    await BlacklistedUser.deleteOne({ mobile });
    
    res.json({ 
      success: true, 
      message: 'User removed from blacklist' 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove from blacklist' });
  }
};

export { addToBlacklist, getBlacklistedUsers, removeFromBlacklist };