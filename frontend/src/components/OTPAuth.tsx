import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Smartphone, Timer, RotateCcw } from 'lucide-react';
import { otpAPI } from '@/lib/otpAPI';

interface OTPAuthProps {
  onSuccess: (token?: string) => void;
  mobile?: string;
  hideHeader?: boolean;
}

const OTPAuth = ({ onSuccess, mobile: propMobile, hideHeader }: OTPAuthProps) => {
  const [step, setStep] = useState<'mobile' | 'otp'>(propMobile ? 'otp' : 'mobile');
  const [mobile, setMobile] = useState(propMobile || '');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);
  
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0 && step === 'otp') {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown, step]);

  const handleSendOTP = async () => {
    if (mobile.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const response = await otpAPI.sendOTP(mobile);
      setStep('otp');
      setCountdown(60);
      setCanResend(false);
      
      // Show OTP for testing
      if (response.otp) {
        toast.success(`OTP sent! Your OTP is: ${response.otp}`);
      } else {
        toast.success('OTP sent successfully!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter complete OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await otpAPI.verifyOTP(mobile, otpString);
      toast.success('OTP verified successfully!');
      onSuccess(response.token);
    } catch (error: any) {
      toast.error(error.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const response = await otpAPI.resendOTP(mobile);
      setCountdown(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      
      // Show OTP for testing
      if (response.otp) {
        toast.success(`OTP resent! Your OTP is: ${response.otp}`);
      } else {
        toast.success('OTP resent successfully!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Smartphone className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {step === 'mobile' ? 'Enter Mobile Number' : 'Verify OTP'}
          </CardTitle>
          <CardDescription>
            {step === 'mobile' 
              ? 'We\'ll send you a verification code' 
              : `Enter the 6-digit code sent to +91 ${mobile}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 'mobile' ? (
            <>
              <div className="space-y-2">
                <Input
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="text-center text-lg"
                />
              </div>
              <Button 
                onClick={handleSendOTP} 
                disabled={loading || mobile.length !== 10}
                className="w-full"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </Button>
            </>
          ) : (
            <>
              <div className="flex justify-center space-x-2">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => (otpRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOTPChange(index, e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-lg font-semibold"
                  />
                ))}
              </div>
              
              {countdown > 0 && (
                <div className="flex items-center justify-center text-sm text-muted-foreground">
                  <Timer className="w-4 h-4 mr-2" />
                  Resend OTP in {countdown}s
                </div>
              )}
              
              <div className="space-y-3">
                <Button 
                  onClick={handleVerifyOTP} 
                  disabled={loading || otp.join('').length !== 6}
                  className="w-full"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={handleResendOTP}
                  disabled={loading || !canResend}
                  className="w-full"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Resend OTP
                </Button>
                
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setStep('mobile');
                    setOtp(['', '', '', '', '', '']);
                    setCountdown(0);
                  }}
                  className="w-full"
                >
                  Change Mobile Number
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OTPAuth;