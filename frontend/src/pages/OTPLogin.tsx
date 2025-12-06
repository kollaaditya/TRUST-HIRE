import { useNavigate } from 'react-router-dom';
import OTPAuth from '@/components/OTPAuth';

const OTPLogin = () => {
  const navigate = useNavigate();

  const handleOTPSuccess = (token: string) => {
    localStorage.setItem('auth_token', token);
    navigate('/dashboard');
  };

  return <OTPAuth onSuccess={handleOTPSuccess} />;
};

export default OTPLogin;