import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Search, LogOut, Sparkles, MessageCircle } from "lucide-react";
import postJobImage from "@/assets/post-job.jpg";
import findJobImage from "@/assets/find-job.jpg";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('auth_token');
      console.log('Dashboard: Checking token:', token ? 'Found' : 'Not found');
      
      if (!token) {
        console.log('Dashboard: No token, redirecting to auth');
        navigate("/auth");
        return;
      }
      
      try {
        console.log('Dashboard: Making API call to verify user');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/user`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Dashboard: API response status:', response.status);
        
        if (!response.ok) {
          console.log('Dashboard: API call failed, removing token');
          localStorage.removeItem('auth_token');
          navigate("/auth");
          return;
        }
        
        const data = await response.json();
        console.log('Dashboard: User data received:', data);
        setUser(data.user);
      } catch (error) {
        console.error('Dashboard: Error checking user:', error);
        localStorage.removeItem('auth_token');
        navigate("/auth");
      }
      
      setLoading(false);
    };

    checkUser();
  }, [navigate]);

  const handleSignOut = async () => {
    localStorage.removeItem('auth_token');
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary to-accent animate-pulse" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent animate-fade-in">
            TRUST-HIRE
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/messages")} className="hover:bg-primary/5 transition-all">
              <MessageCircle className="mr-2 h-4 w-4" />
              Messages
            </Button>
            <Button variant="outline" onClick={() => navigate("/my-jobs")} className="hover:bg-primary/5 transition-all">
              My Jobs
            </Button>
            <Button variant="outline" onClick={() => navigate("/my-applications")} className="hover:bg-primary/5 transition-all">
              My Applications
            </Button>
            <Button variant="outline" onClick={() => navigate("/profile")} className="hover:bg-primary/5 transition-all">
              Profile
            </Button>
            <Button variant="ghost" onClick={handleSignOut} className="hover:bg-destructive/10 hover:text-destructive transition-all">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm text-primary mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Your personalized dashboard</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Welcome back, {user?.full_name || "User"}! 👋
            </h2>
            <p className="text-muted-foreground text-lg">What would you like to do today?</p>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-primary/20 hover:border-primary/40 transition-all hover:shadow-2xl cursor-pointer group overflow-hidden animate-slide-up" onClick={() => navigate("/post-job")}>
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={postJobImage} 
                  alt="Post a job" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
              </div>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/50 rounded-xl flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-2xl">Post a Job</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Looking to hire? Post your job opportunity and connect with qualified candidates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full shadow-lg hover:shadow-xl group-hover:scale-105 transition-all">
                  Get Started
                </Button>
              </CardContent>
            </Card>

            <Card className="border-accent/20 hover:border-accent/40 transition-all hover:shadow-2xl cursor-pointer group overflow-hidden animate-slide-up" style={{ animationDelay: "0.1s" }} onClick={() => navigate("/find-jobs")}>
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={findJobImage} 
                  alt="Find a job" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
              </div>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent/50 rounded-xl flex items-center justify-center">
                    <Search className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl">Find a Job</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Searching for opportunities? Browse available positions that match your skills
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full hover:bg-accent/5 border-accent/20 group-hover:scale-105 transition-all">
                  Start Searching
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
