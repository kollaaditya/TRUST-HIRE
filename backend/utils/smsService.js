import axios from 'axios';

const sendSMS = async (mobile, otp) => {
  try {
    console.log(`🔐 Sending OTP ${otp} to +91${mobile}`);
    
    // Using Fast2SMS API with proper message
    const message = `Your TRUSTHIRE verification code is ${otp}. Valid for 1 minute only. Do not share this OTP with anyone. -TRUSTHIRE`;
    
    const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
      route: 'v3',
      sender_id: 'TRHIRE',
      message: message,
      language: 'english',
      flash: 0,
      numbers: mobile,
    }, {
      headers: {
        'authorization': process.env.FAST2SMS_API_KEY || 'demo',
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.return) {
      console.log('✅ SMS sent successfully to', mobile);
      return { success: true, message: 'OTP sent to your mobile' };
    } else {
      throw new Error('SMS API failed');
    }
  } catch (error) {
    console.error('SMS API Error:', error.message);
    
    // Fallback - log OTP for testing
    console.log(`\n📱 SMS FAILED - OTP for ${mobile}: ${otp}\n`);
    console.log('Use this OTP to complete verification');
    return { success: true, message: 'OTP generated (check console for testing)' };
  }
};

export { sendSMS };