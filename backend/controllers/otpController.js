import bcrypt from 'bcrypt';
import OTP from '../models/OTP.js';
import { sendSMS } from '../utils/smsService.js';
import { generateToken } from '../utils/jwt.js';
import { isBlacklisted, detectFraud, checkRateLimit } from '../utils/fraudDetection.js';

// Send OTP
const sendOTP = async (req, res) => {
  try {
    const { mobile, email, username, fullName } = req.body;
    
    if (!mobile || mobile.length !== 10) {
      return res.status(400).json({ error: 'Valid 10-digit mobile number required' });
    }

    // Check if user is blacklisted
    const blacklisted = await isBlacklisted(mobile, email);
    if (blacklisted) {
      return res.status(403).json({ 
        error: 'Account blocked due to policy violation',
        reason: blacklisted.reason 
      });
    }

    // Check rate limiting
    const rateLimitOk = await checkRateLimit(mobile);
    if (!rateLimitOk) {
      return res.status(429).json({ 
        error: 'Too many OTP requests. Please try after 1 hour.' 
      });
    }

    // Fraud detection
    const suspiciousPatterns = detectFraud({ mobile, email, username, fullName });
    if (suspiciousPatterns.length > 2) {
      return res.status(403).json({ 
        error: 'Registration blocked due to suspicious activity',
        patterns: suspiciousPatterns 
      });
    }

    // Delete existing OTP for this mobile
    await OTP.deleteMany({ mobile });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash OTP before storing
    const hashedOTP = await bcrypt.hash(otp, 10);
    
    // Save to database
    await new OTP({ mobile, otp: hashedOTP }).save();
    
    // Send SMS
    await sendSMS(mobile, otp);
    
    res.json({ 
      success: true, 
      message: 'OTP sent successfully',
      otp: otp // For testing - shows OTP in response
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    
    if (!mobile || !otp) {
      return res.status(400).json({ error: 'Mobile and OTP required' });
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({ mobile });
    
    if (!otpRecord) {
      return res.status(400).json({ error: 'OTP expired or invalid' });
    }

    // Verify OTP
    const isValid = await bcrypt.compare(otp, otpRecord.otp);
    
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Delete OTP after successful verification
    await OTP.deleteOne({ mobile });
    
    // Generate JWT token
    const token = generateToken(mobile);
    
    res.json({ 
      success: true, 
      message: 'OTP verified successfully',
      token 
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
};

// Get OTP Statistics (Aggregation)
const getOTPStats = async (req, res) => {
  try {
    const stats = await OTP.aggregate([
      {
        $group: {
          _id: null,
          totalOTPs: { $sum: 1 },
          uniqueMobiles: { $addToSet: "$mobile" },
          avgCreatedTime: { $avg: "$createdAt" },
          latestOTP: { $max: "$createdAt" },
          oldestOTP: { $min: "$createdAt" }
        }
      },
      {
        $project: {
          _id: 0,
          totalOTPs: 1,
          uniqueMobileCount: { $size: "$uniqueMobiles" },
          latestOTP: 1,
          oldestOTP: 1,
          avgCreatedTime: 1
        }
      }
    ]);

    const mobileStats = await OTP.aggregate([
      {
        $group: {
          _id: "$mobile",
          otpCount: { $sum: 1 },
          lastGenerated: { $max: "$createdAt" },
          firstGenerated: { $min: "$createdAt" }
        }
      },
      {
        $sort: { lastGenerated: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      success: true,
      overallStats: stats[0] || { totalOTPs: 0, uniqueMobileCount: 0 },
      recentMobiles: mobileStats
    });
  } catch (error) {
    console.error('OTP Stats error:', error);
    res.status(500).json({ error: 'Failed to get OTP statistics' });
  }
};

// Resend OTP
const resendOTP = async (req, res) => {
  try {
    const { mobile } = req.body;
    
    if (!mobile) {
      return res.status(400).json({ error: 'Mobile number required' });
    }

    // Check if OTP exists and when it was created
    const existingOTP = await OTP.findOne({ mobile });
    
    if (existingOTP) {
      const timeDiff = Date.now() - existingOTP.createdAt.getTime();
      const remainingTime = 60000 - timeDiff; // 60 seconds in milliseconds
      
      if (remainingTime > 0) {
        return res.status(400).json({ 
          error: 'Wait 1 minute before requesting new OTP',
          remainingTime: Math.ceil(remainingTime / 1000)
        });
      }
    }

    // Delete existing OTP
    await OTP.deleteMany({ mobile });

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = await bcrypt.hash(otp, 10);
    
    // Save to database
    await new OTP({ mobile, otp: hashedOTP }).save();
    
    // Send SMS
    await sendSMS(mobile, otp);
    
    res.json({ 
      success: true, 
      message: 'OTP resent successfully'
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
};

export { sendOTP, verifyOTP, resendOTP, getOTPStats };