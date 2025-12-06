import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api/otp';

export const otpAPI = {
  sendOTP: async (mobile: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/send-otp`, { mobile });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to send OTP');
    }
  },

  verifyOTP: async (mobile: string, otp: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/verify-otp`, { mobile, otp });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to verify OTP');
    }
  },

  resendOTP: async (mobile: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/resend-otp`, { mobile });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to resend OTP');
    }
  }
};