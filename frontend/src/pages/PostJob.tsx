import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Briefcase } from "lucide-react";
import { LocationDetector } from "@/components/LocationDetector";
import { sendNotification } from "@/lib/notifications";

const categories = [
  "Information Technology",
  "Healthcare",
  "Education & Training",
  "Sales & Marketing",
  "Finance & Accounting",
  "Engineering",
  "Construction",
  "Hospitality & Food Service",
  "Retail",
  "Transportation & Logistics",
  "Other"
];



const jobTypes = [
  "full-time",
  "part-time"
];

const PostJob = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [salaryMin, setSalaryMin] = useState("5000");
  const [salaryMax, setSalaryMax] = useState("10000");
  const [category, setCategory] = useState("");
  const [jobType, setJobType] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('auth_token');
      console.log('Checking user authentication, token:', token ? 'exists' : 'missing');
      
      if (!token) {
        console.log('No token found, redirecting to auth');
        navigate("/auth");
        return;
      }
      
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/jobs`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Auth response status:', response.status);
        
        if (!response.ok) {
          console.log('Auth failed, removing token');
          localStorage.removeItem('auth_token');
          navigate("/auth");
          return;
        }
        
        const data = await response.json();
        const userId = data.user._id || data.user.id;
        setUserId(userId);
        console.log('User authenticated successfully:', { userId, user: data.user });
      } catch (error) {
        console.error('Auth error:', error);
        localStorage.removeItem('auth_token');
        navigate("/auth");
      }
    };
    checkUser();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) {
      toast.error("User not authenticated");
      return;
    }

    setLoading(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      
      const jobData = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        category: category,
        location: location,
        qualification: formData.get("qualification") as string,
        contactEmail: formData.get("contactEmail") as string,
        contactPhone: formData.get("contactPhone") as string,
        jobType: jobType,
        salaryMin: salaryMin || null,
        salaryMax: salaryMax || null,
        deadline: formData.get("deadline") as string
      };

      console.log('Posting job data:', jobData);

      // Validate required fields
      if (!jobData.title?.trim()) {
        toast.error("Job title is required");
        return;
      }
      if (!jobData.description?.trim()) {
        toast.error("Job description is required");
        return;
      }
      if (!category?.trim()) {
        toast.error("Please select a category");
        return;
      }
      if (!location?.trim()) {
        toast.error("Location is required");
        return;
      }
      if (!jobData.contactEmail?.trim()) {
        toast.error("Contact email is required");
        return;
      }

      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error("Authentication token not found");
        navigate("/auth");
        return;
      }

      console.log('Sending request to backend...');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(jobData)
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Job posted successfully:', result);
      toast.success("Job posted successfully! 🎉");
      
      // Reset form
      setCategory("");
      setJobType("");
      setLocation("");
      setSalaryMin("5000");
      setSalaryMax("10000");
      
      navigate("/dashboard");
    } catch (error: any) {
      console.error('Error posting job:', error);
      toast.error(`Failed to post job: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-20 right-10 text-6xl animate-float">📝</div>
        <div className="absolute bottom-40 left-10 text-5xl animate-float" style={{animationDelay: '0.5s'}}>💼</div>
        <div className="absolute top-1/2 right-1/4 text-4xl animate-float" style={{animationDelay: '1s'}}>✨</div>
        <div className="absolute bottom-20 right-10 text-5xl animate-float" style={{animationDelay: '1.5s'}}>🎯</div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/dashboard")} 
          className="mb-6 hover:bg-primary/10 hover:scale-105 transition-all"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="max-w-3xl mx-auto shadow-2xl border-primary/20 animate-fade-in hover:shadow-primary/10 transition-all">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg animate-float">
                <Briefcase className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-3xl">Post a Job 📢</CardTitle>
                <CardDescription className="text-base mt-1">
                  Fill in the details to create a new job listing ✍️
                  {userId && <span className="text-green-600 ml-2">✓ Authenticated</span>}
                  {!userId && <span className="text-red-600 ml-2">⚠ Not authenticated</span>}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2 animate-slide-up">
                <Label htmlFor="title" className="text-base">💼 Job Title *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g., Software Developer, Sales Manager"
                  required
                  className="h-12 transition-all focus:scale-[1.01] hover:border-primary/50"
                />
              </div>

              <div className="space-y-2 animate-slide-up" style={{animationDelay: '0.1s'}}>
                <Label htmlFor="category" className="text-base">🏷️ Category *</Label>
                <Select name="category" required value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 animate-slide-up" style={{animationDelay: '0.2s'}}>
                <Label htmlFor="description" className="text-base">📋 Job Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe the role, responsibilities, and what you're looking for..."
                  rows={6}
                  required
                  className="transition-all focus:scale-[1.01] hover:border-primary/50"
                />
              </div>

              <div className="space-y-2 animate-slide-up" style={{animationDelay: '0.3s'}}>
                <Label htmlFor="qualification" className="text-base">🎓 Required Qualifications</Label>
                <Textarea
                  id="qualification"
                  name="qualification"
                  placeholder="List the qualifications, skills, or experience required..."
                  rows={4}
                  className="transition-all focus:scale-[1.01] hover:border-primary/50"
                />
              </div>

              <div className="space-y-2 animate-slide-up" style={{animationDelay: '0.4s'}}>
                <Label htmlFor="location" className="text-base">📍 Location *</Label>
                <div className="flex gap-2">
                  <Input
                    id="location"
                    name="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., New York, NY or Remote"
                    required
                    className="h-12 transition-all focus:scale-[1.01] hover:border-primary/50 flex-1"
                  />
                  <LocationDetector onLocationDetected={setLocation} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 animate-slide-up" style={{animationDelay: '0.5s'}}>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone" className="text-base">📞 Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    name="contactPhone"
                    type="tel"
                    placeholder="+1234567890"
                    className="h-12 transition-all focus:scale-[1.01] hover:border-primary/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactEmail" className="text-base">📧 Contact Email</Label>
                  <Input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    placeholder="employer@company.com"
                    required
                    className="h-12 transition-all focus:scale-[1.01] hover:border-primary/50"
                  />
                </div>
              </div>

              {/* Job Type */}
              <div className="space-y-2 animate-slide-up" style={{animationDelay: '0.6s'}}>
                <Label htmlFor="jobType" className="text-base">⏱️ Job Type</Label>
                <Select name="jobType" value={jobType} onValueChange={setJobType}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.split('-').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Salary Range */}
              <div className="grid md:grid-cols-2 gap-4 animate-slide-up" style={{animationDelay: '0.7s'}}>
                <div className="space-y-2">
                  <Label htmlFor="salaryMin" className="text-base">💰 Minimum Salary (Optional)</Label>
                  <Input
                    id="salaryMin"
                    type="number"
                    placeholder="5000"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    className="h-12 transition-all focus:scale-[1.01] hover:border-primary/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salaryMax" className="text-base">💰 Maximum Salary (Optional)</Label>
                  <Input
                    id="salaryMax"
                    type="number"
                    placeholder="10000"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    className="h-12 transition-all focus:scale-[1.01] hover:border-primary/50"
                  />
                </div>
              </div>

              <div className="space-y-2 animate-slide-up" style={{animationDelay: '0.8s'}}>
                <Label htmlFor="deadline" className="text-base">⏰ Application Deadline (Optional)</Label>
                <Input
                  id="deadline"
                  name="deadline"
                  type="date"
                  className="h-12 transition-all focus:scale-[1.01] hover:border-primary/50"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:shadow-2xl hover:scale-[1.02] transition-all animate-scale-in" 
                disabled={loading}
                style={{animationDelay: '0.9s'}}
              >
                {loading ? "Posting... ⏳" : "Post Job 🚀"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PostJob;
