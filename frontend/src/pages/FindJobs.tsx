import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, MapPin, Briefcase, Calendar, Search, DollarSign, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LocationDetector } from "@/components/LocationDetector";
import { EnhancedFilters } from "@/components/EnhancedFilters";
import EmployerProfileModal from "@/components/EmployerProfileModal";

interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  application_deadline: string | null;
  created_at: string;
  employer_id: string;
  salary_min: number | null;
  salary_max: number | null;
  job_type: string | null;
  employer: {
    full_name: string;
    username: string;
    profile_photo_url?: string;
  };
}

const categories = [
  "All Categories",
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

const FindJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployerId, setSelectedEmployerId] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [filters, setFilters] = useState({
    searchTerm: "",
    category: "All Categories",
    location: "",
    jobType: "All Types",
    salaryMin: "",
    salaryMax: ""
  });

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        navigate("/auth");
        return;
      }
      
      try {
        const response = await fetch('http://localhost:3001/api/auth/user', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          localStorage.removeItem('auth_token');
          navigate("/auth");
          return;
        }
        
        fetchJobs();
      } catch (error) {
        localStorage.removeItem('auth_token');
        navigate("/auth");
      }
    };
    checkAuth();
  }, [navigate]);

  const fetchJobs = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:3001/api/jobs');
      
      if (response.ok) {
        const jobsData = await response.json();
        const formattedJobs = jobsData.map((job: any) => ({
          id: job._id,
          title: job.title,
          description: job.description,
          category: job.category,
          location: job.location,
          application_deadline: job.deadline,
          created_at: job.created_at,
          employer_id: job.employer_id,
          salary_min: job.salary_min,
          salary_max: job.salary_max,
          job_type: job.job_type,
          employer: job.employer || { full_name: "Employer", username: "unknown" }
        }));
        setJobs(formattedJobs);
      } else {
        setJobs([]);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = !filters.searchTerm || 
      job.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    const matchesCategory = filters.category === "All Categories" || job.category === filters.category;
    
    const matchesLocation = !filters.location || 
      job.location.toLowerCase().includes(filters.location.toLowerCase());
    
    const matchesJobType = filters.jobType === "All Types" || 
      job.job_type === filters.jobType;
    
    const matchesSalaryMin = !filters.salaryMin || 
      (job.salary_min && job.salary_min >= parseInt(filters.salaryMin));
    
    const matchesSalaryMax = !filters.salaryMax || 
      (job.salary_max && job.salary_max <= parseInt(filters.salaryMax));
    
    return matchesSearch && matchesCategory && matchesLocation && 
           matchesJobType && matchesSalaryMin && matchesSalaryMax;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary to-secondary animate-pulse" />
          <p className="mt-4 text-muted-foreground">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-10 left-10 text-6xl animate-float">🔍</div>
        <div className="absolute top-32 right-20 text-5xl animate-float" style={{animationDelay: '0.5s'}}>💼</div>
        <div className="absolute bottom-40 left-1/4 text-4xl animate-float" style={{animationDelay: '1s'}}>⭐</div>
        <div className="absolute top-1/2 right-10 text-5xl animate-float" style={{animationDelay: '1.5s'}}>🎯</div>
        <div className="absolute bottom-20 right-1/3 text-4xl animate-float" style={{animationDelay: '2s'}}>✨</div>
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

        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center space-y-3 animate-fade-in">
            <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Find Your Next Opportunity 🚀
            </h1>
            <p className="text-muted-foreground text-xl">Browse and apply to amazing jobs in your area 🌟</p>
          </div>

          {/* Enhanced Filters */}
          <EnhancedFilters
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={() => setFilters({
              searchTerm: "",
              category: "All Categories",
              location: "",
              jobType: "All Types",
              salaryMin: "",
              salaryMax: ""
            })}
          />

          {/* Job Listings */}
          <div className="space-y-4">
            {filteredJobs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No jobs found matching your criteria</p>
                </CardContent>
              </Card>
            ) : (
              filteredJobs.map((job) => (
                <Card key={job.id} className="hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-primary/10 hover:border-primary/30 animate-scale-in">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1 cursor-pointer" onClick={() => navigate(`/jobs/${job.id}`)}>
                        <CardTitle className="text-2xl hover:underline">{job.title}</CardTitle>
                        <CardDescription className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            {job.employer?.full_name || "Employer"}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </span>
                        </CardDescription>
                      </div>
                      <Badge>{job.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-2 mb-4 cursor-pointer hover:underline" onClick={() => navigate(`/jobs/${job.id}`)}>
                      {job.description}
                    </p>
                    
                    {/* Job Details */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.job_type && (
                        <Badge variant="outline">
                          {job.job_type.split('-').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </Badge>
                      )}

                      {(job.salary_min || job.salary_max) && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {job.salary_min && job.salary_max 
                            ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
                            : job.salary_min 
                            ? `$${job.salary_min.toLocaleString()}+`
                            : `Up to $${job.salary_max?.toLocaleString()}`
                          }
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center gap-4">
                      <div className="flex-1">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Posted {new Date(job.created_at).toLocaleDateString()}
                        </span>
                        {job.application_deadline && (
                          <span className="text-sm text-destructive block">
                            Deadline: {new Date(job.application_deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEmployerId(job.employer_id);
                          setShowProfileModal(true);
                        }}
                        className="flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      <EmployerProfileModal 
        employerId={selectedEmployerId}
        isOpen={showProfileModal}
        onClose={() => {
          setShowProfileModal(false);
          setSelectedEmployerId(null);
        }}
      />
    </div>
  );
};

export default FindJobs;
