import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mongoAPI as supabase } from "@/lib/mongodb-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Briefcase } from "lucide-react";
import { sendNotification } from "@/lib/notifications";
import OTPAuth from "@/components/OTPAuth";

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [signupData, setSignupData] = useState<any>(null);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [mobile, setMobile] = useState('');
  const [isSigninOTP, setIsSigninOTP] = useState(false);



  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const username = formData.get("username") as string;
    const fullName = formData.get("fullName") as string;
    const password = formData.get("password") as string;

    if (!phone || phone.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      setLoading(false);
      return;
    }

    try {
      // Send OTP with fraud detection
      const otpResponse = await fetch(import.meta.env.VITE_API_URL + "/api/otp/send-otp", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mobile: phone,
          email: email,
          username: username,
          fullName: fullName
        })
      });
      
      if (!otpResponse.ok) {
        throw new Error('Failed to send OTP');
      }
      
      const otpData = await otpResponse.json();
      
      // Store signup data and show OTP verification
      setSignupData({ email, phone, username, fullName, password });
      setShowOTPVerification(true);
      
      if (otpData.otp) {
        // Show OTP in popup for testing
        alert("Your OTP is: " + otpData.otp + "\n\nCopy this OTP and enter it in the verification boxes.");
        toast.success("OTP: " + otpData.otp + " (Also sent via SMS)");


      } else {
        toast.success('OTP sent to your mobile number via SMS');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send OTP');
    }
    setLoading(false);
  };

  const handleOTPSignin = async () => {
    setLoading(true);
    try {
      const otpResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/otp/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile })
      });
      
      if (!otpResponse.ok) {
        throw new Error('Failed to send OTP');
      }
      
      const otpData = await otpResponse.json();
      
      if (otpData.otp) {
        alert(`📱 Your OTP is: ${otpData.otp}`);
        toast.success(`OTP: ${otpData.otp}`);
      } else {
        toast.success('OTP sent to your mobile');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send OTP');
    }
    setLoading(false);
  };

  const handleOTPVerification = async () => {
    if (!signupData && !isSigninOTP) return;
    
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter complete OTP');
      return;
    }

    setLoading(true);
    try {
      // Verify OTP first
      const otpResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/otp/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mobile: signupData?.phone || mobile, 
          otp: otpString 
        })
      });

      if (!otpResponse.ok) {
        const otpError = await otpResponse.json();
        console.error('OTP verification failed:', otpError);
        throw new Error(otpError.error || 'Invalid OTP');
      }
      
      const otpResult = await otpResponse.json();
      console.log('OTP verification success:', otpResult);

      if (isSigninOTP) {
        // OTP signin - just redirect to dashboard
        localStorage.setItem('auth_token', otpResult.token);
        toast.success('Signed in successfully!');
        navigate('/dashboard');
        return;
      }

      // OTP verified, now create account
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signupData.email,
          password: signupData.password,
          full_name: signupData.fullName,
          phone: signupData.phone,
          username: signupData.username
        })
      });

      console.log('Signup response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Signup failed:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        throw new Error(errorData.error || 'Signup failed');
      }

      const user = await response.json();
      console.log('Signup success:', user);
      
      if (user.success && user.token) {
        localStorage.setItem('auth_token', user.token);
        toast.success("Account created successfully! Welcome to TrustHire! 🎉");
        
        // Test token storage
        const storedToken = localStorage.getItem('auth_token');
        console.log('Token stored:', storedToken ? 'Yes' : 'No');
        
        // Force navigation
        console.log('Navigating to dashboard...');
        navigate("/dashboard", { replace: true });
      } else {
        console.error('Invalid response:', user);
        throw new Error('Invalid server response');
      }
    } catch (error: any) {
      console.error('OTP verification or signup error:', error);
      toast.error(error.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error('Sign in failed');
      }

      const user = await response.json();
      
      // Store token in localStorage
      localStorage.setItem('auth_token', user.token);
      
      toast.success("Signed in successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-6xl animate-float">💼</div>
        <div className="absolute top-40 right-20 text-5xl animate-float" style={{animationDelay: '0.5s'}}>🎯</div>
        <div className="absolute bottom-32 left-1/4 text-4xl animate-float" style={{animationDelay: '1s'}}>✨</div>
        <div className="absolute top-1/3 right-10 text-5xl animate-float" style={{animationDelay: '1.5s'}}>🚀</div>
        <div className="absolute bottom-20 right-1/3 text-4xl animate-float" style={{animationDelay: '2s'}}>⭐</div>
        <div className="absolute top-1/2 left-20 text-3xl animate-float" style={{animationDelay: '0.8s'}}>💡</div>
      </div>

      <div className="w-full max-w-md space-y-8 animate-fade-in relative z-10">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center shadow-2xl animate-float hover:scale-110 transition-transform duration-300">
              <Briefcase className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-scale-in">
            TRUST-HIRE 🤝
          </h1>
          <p className="mt-3 text-muted-foreground text-lg animate-slide-up">Your trusted job portal ✨</p>
        </div>

        <Card className="border-primary/20 shadow-2xl backdrop-blur-sm bg-card/95 hover:shadow-primary/20 transition-all duration-300 animate-scale-in">
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-2">
              Welcome Back! 👋
            </CardTitle>
            <CardDescription className="text-base">Sign in or create an account to get started 🚀</CardDescription>
          </CardHeader>
          <CardContent>
            {showOTPVerification ? (
              <div className="animate-fade-in space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold">
                    {isSigninOTP ? 'Sign in with OTP' : 'Verify Mobile Number'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isSigninOTP ? 'Enter your mobile number' : `Enter OTP sent to ${signupData?.phone}`}
                  </p>
                </div>
                
                {isSigninOTP && (
                  <div className="space-y-4">
                    <Input
                      type="tel"
                      placeholder="Enter 10-digit mobile number"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="h-12 text-center text-lg"
                    />
                    <Button 
                      onClick={handleOTPSignin}
                      disabled={loading || mobile.length !== 10}
                      className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-accent"
                    >
                      {loading ? 'Sending...' : 'Send OTP'}
                    </Button>
                  </div>
                )}
                
                <div className="flex justify-center space-x-2">
                  {[0,1,2,3,4,5].map((index) => (
                    <Input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={otp[index]}
                      onChange={(e) => {
                        const newOtp = [...otp];
                        newOtp[index] = e.target.value;
                        setOtp(newOtp);
                        if (e.target.value && index < 5) {
                          const nextInput = document.querySelector(`input[data-index="${index + 1}"]`) as HTMLInputElement;
                          nextInput?.focus();
                        }
                      }}
                      data-index={index}
                      className="w-12 h-12 text-center text-lg font-semibold"
                    />
                  ))}
                </div>
                
                <Button 
                  onClick={() => handleOTPVerification()}
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-accent"
                  disabled={loading || otp.join('').length !== 6}
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </Button>
                
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setShowOTPVerification(false);
                    setOtp(['', '', '', '', '', '']);
                    setIsSigninOTP(false);
                    setMobile('');
                  }}
                  className="w-full"
                >
                  {isSigninOTP ? 'Back to Sign In' : 'Back to Signup'}
                </Button>
              </div>
            ) : (
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 p-1">
                  <TabsTrigger value="signin" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent transition-all">
                    🔐 Sign In
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent transition-all">
                    ✍️ Sign Up
                  </TabsTrigger>
                </TabsList>
              <TabsContent value="signin" className="animate-fade-in">
                <form onSubmit={handleSignIn} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-base">📧 Email</Label>
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                      className="h-12 transition-all focus:scale-[1.02]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-base">🔒 Password</Label>
                    <Input
                      id="signin-password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      className="h-12 transition-all focus:scale-[1.02]"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:scale-[1.02] transition-all" 
                    disabled={loading}
                  >
                    {loading ? "Signing in... ⏳" : "Sign In 🚀"}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => navigate('/forgot-password')}
                      className="text-sm text-primary hover:underline font-medium transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>
                  
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowOTPVerification(true);
                      setIsSigninOTP(true);
                    }}
                    className="w-full h-12 text-base font-semibold hover:bg-primary/5 transition-all"
                  >
                    📱 Sign in with OTP
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="animate-fade-in">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-username" className="text-base">👤 Username</Label>
                    <Input
                      id="signup-username"
                      name="username"
                      type="text"
                      placeholder="johndoe"
                      required
                      className="h-12 transition-all focus:scale-[1.02]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-fullname" className="text-base">✨ Full Name</Label>
                    <Input
                      id="signup-fullname"
                      name="fullName"
                      type="text"
                      placeholder="John Doe"
                      required
                      className="h-12 transition-all focus:scale-[1.02]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-base">📧 Email</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                      className="h-12 transition-all focus:scale-[1.02]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-phone" className="text-base">📱 Mobile Number *</Label>
                    <Input
                      id="signup-phone"
                      name="phone"
                      type="tel"
                      placeholder="9876543210"
                      maxLength={10}
                      required
                      className="h-12 transition-all focus:scale-[1.02]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-base">🔒 Password</Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="h-12 transition-all focus:scale-[1.02]"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:scale-[1.02] transition-all" 
                    disabled={loading}
                  >
                    {loading ? "Creating account... ⏳" : "Sign Up ✨"}
                  </Button>
                </form>
              </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
