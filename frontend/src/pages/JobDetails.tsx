import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ArrowLeft, MapPin, Briefcase, Calendar, Mail, Phone, Send, Star, UserPlus, UserCheck, Eye, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { sendNotification } from "@/lib/notifications";
import { ChatSystem } from "@/components/ChatSystem";

interface JobDetails {
  id: string;
  title: string;
  description: string;
  qualification: string | null;
  category: string;
  location: string;
  contact_phone: string | null;
  contact_email: string | null;
  application_deadline: string | null;
  created_at: string;
  employer_id: string;
  applications: any[];
  profiles: {
    full_name: string;
    username: string | null;
    phone: string | null;
  };
}

interface EmployerProfile {
  full_name: string;
  username: string | null;
  location: string | null;
  jobsPosted: number;
  averageRating: number;
  totalRatings: number;
}

interface Rating {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [applicationMessage, setApplicationMessage] = useState("");
  const [employerProfile, setEmployerProfile] = useState<EmployerProfile | null>(null);
  const [showEmployerProfile, setShowEmployerProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [hasRated, setHasRated] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        navigate("/auth");
        return;
      }
      
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/user', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          localStorage.removeItem('auth_token');
          navigate("/auth");
          return;
        }
        
        const data = await response.json();
        const userId = data.user._id || data.user.id;
        setUserId(userId);
        fetchJobDetails();
        checkIfApplied(data.user.id);
        checkIfFollowing(data.user.id);
        checkIfRated(userId);
      } catch (error) {
        localStorage.removeItem('auth_token');
        navigate("/auth");
      }
    };
    checkAuthAndFetch();
  }, [id, navigate]);

  const fetchJobDetails = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/jobs/${id}`);
      
      if (!response.ok) {
        toast.error("Job not found");
        navigate("/find-jobs");
        return;
      }
      
      const jobData = await response.json();
      const formattedJob = {
        id: jobData._id,
        title: jobData.title,
        description: jobData.description,
        qualification: jobData.qualification,
        category: jobData.category,
        location: jobData.location,
        contact_phone: jobData.contact_phone,
        contact_email: jobData.contact_email,
        application_deadline: jobData.deadline,
        created_at: jobData.created_at,
        employer_id: jobData.employer_id,
        applications: [],
        profiles: {
          full_name: jobData.employer?.full_name || "Employer",
          username: jobData.employer?.username || null,
          phone: jobData.contact_phone
        }
      };
      
      setJob(formattedJob);
      fetchEmployerProfile(jobData.employer_id, jobData.employer);
      
      // Check if user has rated after job is loaded
      const token = localStorage.getItem('auth_token');
      if (token) {
        const userResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/user', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          const userId = userData.user._id || userData.user.id;
          checkIfRated(userId);
        }
      }
    } catch (error) {
      console.error('Error fetching job:', error);
      toast.error("Failed to load job details");
      navigate("/find-jobs");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployerProfile = async (employerId: string, employerData?: any) => {
    // Use employer data from API if available
    if (employerData) {
      setEmployerProfile({
        full_name: employerData.full_name || "Employer",
        username: employerData.username || null,
        location: employerData.location || null,
        jobsPosted: 0,
        averageRating: 0,
        totalRatings: 0
      });
      return;
    }

    // Fallback to sample data if no employer data provided
    const employerProfiles = {
      "emp1": {
        full_name: "Tech Corp",
        username: "techcorp",
        location: "New York, NY",
        jobsPosted: 5,
        averageRating: 4.5,
        totalRatings: 12
      },
      "emp2": {
        full_name: "Marketing Solutions Inc",
        username: "marketing_sol",
        location: "Los Angeles, CA",
        jobsPosted: 3,
        averageRating: 4.2,
        totalRatings: 8
      },
      "emp3": {
        full_name: "Data Insights LLC",
        username: "data_insights",
        location: "Remote",
        jobsPosted: 7,
        averageRating: 4.8,
        totalRatings: 15
      }
    };
    
    const profile = employerProfiles[employerId as keyof typeof employerProfiles];
    if (profile) {
      setEmployerProfile(profile);
    }
  };

  const checkIfApplied = async (currentUserId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/applications/check/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setHasApplied(data.hasApplied);
      }
    } catch (error) {
      setHasApplied(false);
    }
  };

  const checkIfFollowing = async (currentUserId: string) => {
    // For demo purposes, set to false
    setIsFollowing(false);
  };

  const checkIfRated = async (currentUserId: string) => {
    if (!job) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ratings/check/${id}/${job.employer_id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setHasRated(data.hasRated);
        if (data.rating) {
          setUserRating(data.rating.rating);
          setRatingComment(data.rating.comment || '');
        }
      }
    } catch (error) {
      setHasRated(false);
    }
  };

  const handleFollow = async () => {
    if (!userId || !job) return;

    if (isFollowing) {
      setIsFollowing(false);
      toast.success("Unfollowed successfully");
    } else {
      setIsFollowing(true);
      toast.success("Following! You'll be notified of new job posts");
    }
  };

  const handleRating = async () => {
    if (!userId || !id || !job || userRating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!hasApplied) {
      toast.error("You must apply to this job before rating");
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ratedUserId: job.employer_id,
          jobId: id,
          rating: userRating,
          comment: ratingComment
        })
      });
      
      if (response.ok) {
        if (hasRated) {
          toast.success("Rating updated successfully");
        } else {
          toast.success("Rating submitted successfully");
          setHasRated(true);
        }
        fetchEmployerProfile(job.employer_id);
      } else {
        toast.error("Failed to submit rating");
      }
    } catch (error) {
      toast.error("Failed to submit rating");
    }
  };

  const handleApply = async () => {
    if (!userId || !id) return;

    setApplying(true);
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          jobId: id,
          message: applicationMessage
        })
      });
      
      if (response.ok) {
        toast.success("Application submitted successfully! 🎉");
        setHasApplied(true);
        setApplicationMessage("");
        
        // Trigger stats refresh in profile if needed
        window.dispatchEvent(new CustomEvent('statsUpdate'));
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to submit application");
      }
    } catch (error) {
      toast.error("Failed to submit application");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary to-secondary animate-pulse" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/find-jobs")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Button>

        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-3xl mb-2">{job.title}</CardTitle>
                    <CardDescription className="text-lg">
                      Posted by {job.profiles?.full_name || "Employer"}
                    </CardDescription>
                  </div>
                  <Badge className="text-lg px-4 py-2">{job.category}</Badge>
                </div>

                <div className="flex flex-wrap gap-4 text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Posted {new Date(job.created_at).toLocaleDateString()}
                  </span>
                  {job.application_deadline && (
                    <span className="flex items-center gap-2 text-destructive">
                      <Calendar className="w-5 h-5" />
                      Deadline: {new Date(job.application_deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">Job Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{job.description}</p>
              </div>

              {job.qualification && (
                <div>
                  <h3 className="text-xl font-semibold mb-3">Required Qualifications</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{job.qualification}</p>
                </div>
              )}

              <div>
                <h3 className="text-xl font-semibold mb-3">Contact Information</h3>
                <div className="space-y-2">
                  {job.contact_email && (
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-5 h-5" />
                      {job.contact_email}
                    </p>
                  )}
                  {job.contact_phone && (
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-5 h-5" />
                      {job.contact_phone}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Employer Profile Section */}
          {employerProfile && job.employer_id !== userId && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Posted by {employerProfile.full_name}</CardTitle>
                    {employerProfile.username && (
                      <CardDescription>@{employerProfile.username}</CardDescription>
                    )}
                  </div>
                  <Button
                    onClick={() => setShowEmployerProfile(!showEmployerProfile)}
                    variant="outline"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {showEmployerProfile ? "Hide" : "View"} Profile
                  </Button>
                </div>
              </CardHeader>
              {showEmployerProfile && (
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {employerProfile.jobsPosted}
                      </div>
                      <div className="text-sm text-muted-foreground">Jobs Posted</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary flex items-center justify-center gap-1">
                        {employerProfile.averageRating > 0 ? employerProfile.averageRating.toFixed(1) : "N/A"}
                        {employerProfile.averageRating > 0 && <Star className="w-5 h-5 fill-primary" />}
                      </div>
                      <div className="text-sm text-muted-foreground">Avg Rating</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {employerProfile.totalRatings}
                      </div>
                      <div className="text-sm text-muted-foreground">Ratings</div>
                    </div>
                  </div>
                  {employerProfile.location && (
                    <p className="text-muted-foreground flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {employerProfile.location}
                    </p>
                  )}
                  <Separator />
                  <Button onClick={handleFollow} className="w-full" variant={isFollowing ? "outline" : "default"}>
                    {isFollowing ? (
                      <>
                        <UserCheck className="w-4 h-4 mr-2" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Follow for Updates
                      </>
                    )}
                  </Button>
                </CardContent>
              )}
            </Card>
          )}

          {/* Rating Section */}
          {hasApplied && job.employer_id !== userId && (
            <Card>
              <CardHeader>
                <CardTitle>Rate this Employer</CardTitle>
                <CardDescription>
                  {hasRated ? "Update your rating" : "Share your experience"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Rating</Label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setUserRating(star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= userRating
                              ? "fill-primary text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rating-comment">Comment (Optional)</Label>
                  <Textarea
                    id="rating-comment"
                    placeholder="Share your thoughts about this employer..."
                    rows={4}
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                  />
                </div>
                <Button onClick={handleRating} className="w-full">
                  {hasRated ? "Update Rating" : "Submit Rating"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Chat Section */}
          {hasApplied && job.employer_id !== userId && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Chat with Employer</CardTitle>
                    <CardDescription>
                      Communicate directly with the employer about this position
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setShowChat(!showChat)}
                    variant="outline"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {showChat ? "Hide Chat" : "Start Chat"}
                  </Button>
                </div>
              </CardHeader>
              {showChat && (
                <CardContent>
                  <ChatSystem
                    jobId={job.id}
                    receiverId={job.employer_id}
                    receiverName={job.profiles?.full_name || "Employer"}
                  />
                </CardContent>
              )}
            </Card>
          )}

          {/* Application Section */}
          {job.employer_id !== userId ? (
            <Card>
              <CardHeader>
                <CardTitle>Apply for this Position</CardTitle>
                <CardDescription>
                  {hasApplied 
                    ? "You have already applied to this job" 
                    : "Send your application to the employer"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {hasApplied ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Briefcase className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-lg font-medium">Application Submitted</p>
                    <p className="text-muted-foreground mt-2">
                      The employer will review your application and contact you if interested
                    </p>
                    <Button
                      onClick={() => setShowChat(true)}
                      variant="outline"
                      className="mt-4"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chat with Employer
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="message">Cover Letter / Message (Optional)</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell the employer why you're a great fit for this position..."
                        rows={6}
                        value={applicationMessage}
                        onChange={(e) => setApplicationMessage(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleApply} disabled={applying} className="w-full">
                      <Send className="w-4 h-4 mr-2" />
                      {applying ? "Submitting... ⏳" : "Submit Application 🚀"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                  <Briefcase className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium">This is your job posting</p>
                <p className="text-muted-foreground mt-2">
                  {job.applications?.length || 0} applications received
                </p>
                <Button
                  onClick={() => navigate('/my-jobs')}
                  variant="outline"
                  className="mt-4"
                >
                  Manage Applications
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
