import BlacklistedUser from '../models/BlacklistedUser.js';

// Check if user is blacklisted
const isBlacklisted = async (mobile, email) => {
  const blacklisted = await BlacklistedUser.findOne({
    $or: [
      { mobile: mobile },
      { email: email }
    ]
  });
  return blacklisted;
};

// Fraud detection rules
const detectFraud = (userData) => {
  const { mobile, email, username, fullName } = userData;
  const suspiciousPatterns = [];

  // Check for suspicious mobile patterns
  if (mobile && (
    mobile.startsWith('0000') || 
    mobile === '1234567890' || 
    mobile === '9999999999' ||
    /^(\d)\1{9}$/.test(mobile) // Same digit repeated
  )) {
    suspiciousPatterns.push('suspicious_mobile');
  }

  // Check for suspicious email patterns
  if (email && (
    email.includes('tempmail') ||
    email.includes('10minutemail') ||
    email.includes('guerrillamail') ||
    email.includes('mailinator')
  )) {
    suspiciousPatterns.push('temporary_email');
  }

  // Check for suspicious names
  if (fullName && (
    fullName.toLowerCase().includes('test') ||
    fullName.toLowerCase().includes('fake') ||
    fullName.length < 3 ||
    /^[a-z]+$/.test(fullName.toLowerCase()) // All lowercase
  )) {
    suspiciousPatterns.push('suspicious_name');
  }

  // Check for suspicious username
  if (username && (
    username.includes('test') ||
    username.includes('fake') ||
    /^\d+$/.test(username) // Only numbers
  )) {
    suspiciousPatterns.push('suspicious_username');
  }

  return suspiciousPatterns;
};

// Rate limiting check
const checkRateLimit = async (mobile, timeWindow = 3600000) => { // 1 hour
  // This would typically use Redis, but for simplicity using in-memory
  const attempts = global.otpAttempts || {};
  const now = Date.now();
  
  if (!attempts[mobile]) {
    attempts[mobile] = [];
  }
  
  // Remove old attempts
  attempts[mobile] = attempts[mobile].filter(time => now - time < timeWindow);
  
  // Check if too many attempts
  if (attempts[mobile].length >= 5) {
    return false; // Rate limited
  }
  
  // Add current attempt
  attempts[mobile].push(now);
  global.otpAttempts = attempts;
  
  return true; // Not rate limited
};

export { isBlacklisted, detectFraud, checkRateLimit };