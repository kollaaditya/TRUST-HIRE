import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";
import { Briefcase } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [signupData, setSignupData] = useState<any>(null);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [mobile, setMobile] = useState("");
  const [isSigninOTP, setIsSigninOTP] = useState(false);

  const API = import.meta.env.VITE_API_URL;

  // ================= SIGN UP =================
  const handleSignUp = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const username = formData.get("username") as string;
    const fullName = formData.get("fullName") as string;
    const password = formData.get("password") as string;

    if (!phone || phone.length !== 10) {
      toast.error("Enter valid 10-digit mobile number");
      setLoading(false);
      return;
    }

    try {
      const otpResponse = await fetch(API + "/api/otp/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: phone }),
      });

      if (!otpResponse.ok) throw new Error("Failed to send OTP");

      const otpData = await otpResponse.json();

      setSignupData({ email, phone, username, fullName, password });
      setShowOTPVerification(true);

      if (otpData.otp) {
        alert("Your OTP is: " + otpData.otp);
      }

      toast.success("OTP sent successfully");
    } catch (error: any) {
      toast.error(error.message);
    }

    setLoading(false);
  };

  // ================= OTP VERIFY =================
  const handleOTPVerification = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      toast.error("Enter full OTP");
      return;
    }

    setLoading(true);

    try {
      const verifyRes = await fetch(API + "/api/otp/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: signupData?.phone || mobile,
          otp: otpString,
        }),
      });

      if (!verifyRes.ok) throw new Error("Invalid OTP");

      if (isSigninOTP) {
        toast.success("Signed in successfully");
        navigate("/dashboard");
        return;
      }

      const signupRes = await fetch(API + "/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: signupData?.email,
          password: signupData?.password,
          full_name: signupData?.fullName,
          phone: signupData?.phone,
          username: signupData?.username,
        }),
      });

      if (!signupRes.ok) throw new Error("Signup failed");

      const user = await signupRes.json();
      localStorage.setItem("auth_token", user.token);

      toast.success("Account created successfully");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message);
    }

    setLoading(false);
  };

  // ================= SIGN IN =================
  const handleSignIn = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const response = await fetch(API + "/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error("Sign in failed");

      const user = await response.json();
      localStorage.setItem("auth_token", user.token);

      toast.success("Signed in successfully");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase /> TRUST-HIRE
            </CardTitle>
            <CardDescription>
              Sign in or create an account
            </CardDescription>
          </CardHeader>

          <CardContent>
            {showOTPVerification ? (
              <div className="space-y-4">
                <Input
                  placeholder="Enter 6-digit OTP"
                  value={otp.join("")}
                  onChange={(e) =>
                    setOtp(e.target.value.split("").slice(0, 6))
                  }
                />
                <Button
                  onClick={handleOTPVerification}
                  disabled={loading}
                  className="w-full"
                >
                  Verify OTP
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowOTPVerification(false)}
                  className="w-full"
                >
                  Back
                </Button>
              </div>
            ) : (
              <Tabs defaultValue="signin">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <Input name="email" placeholder="Email" required />
                    <Input
                      name="password"
                      type="password"
                      placeholder="Password"
                      required
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loading}
                    >
                      Sign In
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <Input name="username" placeholder="Username" required />
                    <Input name="fullName" placeholder="Full Name" required />
                    <Input name="email" placeholder="Email" required />
                    <Input name="phone" placeholder="Mobile" required />
                    <Input
                      name="password"
                      type="password"
                      placeholder="Password"
                      required
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loading}
                    >
                      Sign Up
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
