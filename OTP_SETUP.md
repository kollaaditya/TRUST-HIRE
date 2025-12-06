# OTP Authentication Setup Guide

## 🚀 Quick Setup

### 1. Install Backend Dependencies
```bash
cd backend
npm install axios bcrypt
```

### 2. Environment Configuration
Create `.env` file in backend directory:
```env
FAST2SMS_API_KEY=your_fast2sms_api_key_here
JWT_SECRET=your_super_secret_jwt_key_here
MONGODB_URI=mongodb://localhost:27017/trusthire
PORT=3001
```

### 3. Get Fast2SMS API Key
1. Visit [Fast2SMS.com](https://www.fast2sms.com)
2. Sign up for free account
3. Go to Dashboard → API Keys
4. Copy your API key to `.env` file

### 4. Start Services
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

## 📱 How It Works

### User Flow:
1. User clicks "Sign in with OTP" on auth page
2. Enters 10-digit mobile number
3. Receives 6-digit OTP via SMS
4. Enters OTP in 6-box UI
5. Gets JWT token on successful verification

### Security Features:
- ✅ OTP hashed with bcrypt before storage
- ✅ Auto-expires in 60 seconds (TTL index)
- ✅ Only latest OTP is valid
- ✅ Rate limiting on resend (1 minute cooldown)
- ✅ JWT token generation on success

## 🔧 API Endpoints

### Send OTP
```
POST /api/otp/send-otp
Body: { "mobile": "9876543210" }
```

### Verify OTP
```
POST /api/otp/verify-otp  
Body: { "mobile": "9876543210", "otp": "123456" }
```

### Resend OTP
```
POST /api/otp/resend-otp
Body: { "mobile": "9876543210" }
```

## 🎯 Testing

### Test with Demo Numbers:
- Use any 10-digit number for testing
- Check backend console for generated OTP
- Or use Fast2SMS test mode

### Frontend Features:
- ✅ 6-box OTP input with auto-focus
- ✅ 60-second countdown timer
- ✅ Resend button (disabled until timer ends)
- ✅ Mobile number validation
- ✅ Error handling with toast notifications

## 🚀 AWS Deployment

### Backend (EC2):
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup
git clone your-repo
cd backend
npm install
npm install pm2 -g

# Environment
sudo nano .env
# Add your production values

# Start with PM2
pm2 start server.js --name "trusthire-api"
pm2 startup
pm2 save
```

### Frontend (S3 + CloudFront):
```bash
cd frontend
npm run build
aws s3 sync dist/ s3://your-bucket-name
```

### MongoDB (Atlas):
```bash
# Update .env with Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/trusthire
```

## 🔐 Production Security

### Environment Variables:
```env
FAST2SMS_API_KEY=your_production_api_key
JWT_SECRET=super_long_random_string_here
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/trusthire
NODE_ENV=production
```

### Rate Limiting (Optional):
```javascript
// Add to server.js
import rateLimit from 'express-rate-limit';

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many OTP requests'
});

app.use('/api/otp', otpLimiter);
```

## ✅ Verification Checklist

- [ ] Backend dependencies installed
- [ ] Environment variables configured  
- [ ] Fast2SMS API key working
- [ ] MongoDB connection established
- [ ] OTP model created with TTL index
- [ ] Frontend OTP component renders
- [ ] SMS sending works
- [ ] OTP verification works
- [ ] JWT token generation works
- [ ] Timer and resend functionality works

## 🐛 Troubleshooting

### Common Issues:

1. **SMS not sending**: Check Fast2SMS API key and account balance
2. **OTP not expiring**: Ensure MongoDB TTL index is created
3. **Module import errors**: Verify all files use ES6 imports
4. **CORS errors**: Check backend CORS configuration
5. **Timer not working**: Verify useEffect dependencies

### Debug Commands:
```bash
# Check MongoDB TTL index
db.otps.getIndexes()

# View OTP records
db.otps.find()

# Check server logs
pm2 logs trusthire-api
```

🎉 **Your OTP authentication system is now ready for production!**