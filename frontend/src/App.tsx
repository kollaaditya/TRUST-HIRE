import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import PostJob from "./pages/PostJob";
import FindJobs from "./pages/FindJobs";
import JobDetails from "./pages/JobDetails";
import MyJobs from "./pages/MyJobs";
import MyApplications from "./pages/MyApplications";
import Messages from "./pages/Messages";
import NotFound from "./pages/NotFound";
import OTPVerification from "./components/OTPVerification";
import OTPLogin from "./pages/OTPLogin";
import ForgotPassword from "./pages/ForgotPassword";
import FollowRequests from "./pages/FollowRequests";
import Followers from "./pages/Followers";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/post-job" element={<PostJob />} />
          <Route path="/find-jobs" element={<FindJobs />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/my-jobs" element={<MyJobs />} />
          <Route path="/my-applications" element={<MyApplications />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/otp-verification" element={<OTPVerification />} />
          <Route path="/otp-login" element={<OTPLogin />} />
          <Route path="/follow-requests" element={<FollowRequests />} />
          <Route path="/followers" element={<Followers />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
