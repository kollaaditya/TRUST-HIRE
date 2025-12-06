import express from 'express';
import { sendOTP, verifyOTP, resendOTP, getOTPStats } from '../controllers/otpController.js';

const router = express.Router();

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.get('/stats', getOTPStats);

export default router;