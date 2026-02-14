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
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [mobile, setMobile] = useState("");
  const [isSigninOTP, setIsSigninOTP] = useState(false);

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
      toast.error("Please enter a valid 10-digit mobile number");
      setLoading(false);
      return;
    }

    try {
      const otpResponse = await fetch(
        import.meta.env.VITE_API_URL + "/api/otp/send-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mobile: phone,
            email,
            username,
            fullName,
          }),
        }
      );

      if (!otpResponse.ok) {
        throw new Error("Failed to send OTP");
      }

      const otpData = await otpResponse.json();

      setSignupData({ email, phone, username, fullName, password });
      setShowOTPVerification(true);

      if (otpData.otp) {
        alert(
          "Your OTP is: " +
            otpData.otp +
            "\n\nCopy this OTP and enter it in the verification boxes."
        );
        toast.success("OTP: " + otpData.otp + " (Also sent via SMS)");
      } else {
        toast.success("OTP sent to your mobile number via SMS");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send OTP");
    }

    setLoading(false);
  };

  const handleOTPSignin = async () => {
    setLoading(true);
    try {
      const otpResponse = await fetch(
        import.meta.env.VITE_API_URL + "/api/otp/send-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mobile }),
        }
      );

      if (!otpResponse.ok) {
        throw new Error("Failed to send OTP");
      }

      const otpData = await otpResponse.json();

      if (otpData.otp) {
        alert("📱 Your OTP is: " + otpData.otp);
        toast.success("OTP: " + otpData.otp);
      } else {
        toast.success("OTP sent to your mobile");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send OTP");
    }

    setLoading(false);
  };

  const handleOTPVerification = async () => {
    if (!signupData && !isSigninOTP) return;

    const otpString = otp.join("");
    if (otpString.length !== 6) {
      toast.error("Please enter complete OTP");
      return;
    }

    setLoading(true);

    try {
      const otpResponse = await fetch(
        import.meta.env.VITE_API_URL + "/api/otp/verify-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mobile: signupData?.phone || mobile,
            otp: otpString,
          }),
        }
      );

      if (!otpResponse.ok) {
        const otpError = await otpResponse.json();
        throw new Error(otpError.error || "Invalid OTP");
      }

      const otpResult = await otpResponse.json();

      if (isSigninOTP) {
        localStorage.setItem("auth_token", otpResult.token);
        toast.success("Signed in successfully!");
        navigate("/dashboard");
        return;
      }

      const response = await fetch(
        import.meta.env.VITE_API_URL + "/api/auth/signup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: signupData?.email,
            password: signupData?.password,
            full_name: signupData?.fullName,
            phone: signupData?.phone,
            username: signupData?.username,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Signup failed");
      }

      const user = await response.json();

      if (user.success && user.token) {
        localStorage.setItem("auth_token", user.token);
        toast.success("Account created successfully! 🎉");
        navigate("/dashboard", { replace: true });
      } else {
        throw new Error("Invalid server response");
      }
    } catch (error: any) {
      toast.error(error.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL + "/api/auth/signin",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        throw new Error("Sign in failed");
      }

      const user = await response.json();
      localStorage.setItem("auth_token", user.token);

      toast.success("Signed in successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message);
    }

    setLoading(false);
  };

  // ---------- UI BELOW (UNCHANGED STRUCTURE) ----------

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 relative overflow-hidden">
      {/* UI unchanged */}
    </div>
  );
};

export default Auth;
