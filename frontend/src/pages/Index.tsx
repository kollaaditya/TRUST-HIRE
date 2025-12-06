import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Briefcase, MapPin, Users, Star, Sparkles, TrendingUp } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-background z-0" />
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm text-primary">
                <Sparkles className="w-4 h-4" />
                <span>Trusted by thousands of professionals</span>
              </div>
              <h1 className="text-6xl lg:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                TRUST-HIRE
              </h1>
              <p className="text-xl text-muted-foreground">
                Your trusted platform for connecting talented professionals with their dream opportunities. Find the perfect match today.
              </p>
              <div className="flex gap-4">
                <Button size="lg" onClick={() => navigate("/auth")} className="shadow-lg hover:shadow-xl transition-all group">
                  Get Started
                  <TrendingUp className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/auth")} className="hover:bg-primary/5">
                  Sign In
                </Button>
                <Button size="lg" variant="secondary" onClick={() => navigate("/otp-verification")} className="hover:bg-accent/80">
                  OTP Verification
                </Button>
              </div>
            </div>
            <div className="animate-slide-in-right">
              <img 
                src={heroImage} 
                alt="Professional collaboration" 
                className="rounded-2xl shadow-2xl w-full animate-float"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-12 animate-slide-up">
          <h2 className="text-4xl font-bold mb-4">Why Choose TRUST-HIRE?</h2>
          <p className="text-muted-foreground text-lg">Everything you need to find or fill your next opportunity</p>
        </div>
        
        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg hover:-translate-y-2 duration-300 animate-scale-in" style={{ animationDelay: "0.1s" }}>
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/50 rounded-2xl flex items-center justify-center mb-4">
                <Briefcase className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle>Quality Jobs</CardTitle>
              <CardDescription>Access to verified and trusted job opportunities</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg hover:-translate-y-2 duration-300 animate-scale-in" style={{ animationDelay: "0.2s" }}>
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/50 rounded-2xl flex items-center justify-center mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <CardTitle>Location-Based</CardTitle>
              <CardDescription>Find opportunities near you with smart location filtering</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg hover:-translate-y-2 duration-300 animate-scale-in" style={{ animationDelay: "0.3s" }}>
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/50 rounded-2xl flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle>Direct Connect</CardTitle>
              <CardDescription>Connect directly with employers and job seekers</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg hover:-translate-y-2 duration-300 animate-scale-in" style={{ animationDelay: "0.4s" }}>
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/50 rounded-2xl flex items-center justify-center mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <CardTitle>Trusted Platform</CardTitle>
              <CardDescription>Build your career with confidence on our secure platform</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-primary via-accent to-primary text-primary-foreground border-0 overflow-hidden relative animate-slide-up">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20" />
          <CardContent className="p-12 text-center relative z-10">
            <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg mb-8 opacity-90">Join thousands of professionals finding their perfect match</p>
            <Button size="lg" variant="secondary" onClick={() => navigate("/auth")} className="shadow-lg hover:shadow-xl hover:scale-105 transition-all">
              Create Your Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
