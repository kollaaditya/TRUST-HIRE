import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, MapPin, Calendar, Eye, Trash2, CheckCircle, XCircle, Users, MessageSquare, FileText, MessageCircle } from "lucide-react";
import { ChatSystem } from "@/components/ChatSystem";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Application {
  id: string;
  status: string;
  message: string | null;
  created_at: string;
  applicant_id: string;
  profiles: {
    full_name: string;
    username: string | null;
    phone: string | null;
    resume_url: string | null;
    date_of_birth: string | null;
    location: string | null;
    user_role: string;
  };
}

interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  status: "active" | "closed" | "filled" | "inactive";
  created_at: string;
  applications: Application[];
}

const MyJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedJobApplications, setSelectedJobApplications] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] = useState<{jobId: string, applicantId: string, applicantName: string} | null>(null);
  const [selectedApplicant, setSelectedApplicant] = useState<Application | null>(null);

  useEffect(() => {
  const checkAuthAndFetch = async () => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      navigate("/auth");
      return;
    }

    try {
      // ✅ FIRST VERIFY USER
      const userResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/user`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!userResponse.ok) {
        localStorage.removeItem("auth_token");
        navigate("/auth");
        return;
      }

      const userData = await userResponse.json();
      setUserId(userData.user._id);

      // ✅ THEN FETCH JOBS
      fetchMyJobs(userData.user._id);
    } catch (error) {
      localStorage.removeItem("auth_token");
      navigate("/auth");
    }
  };

  checkAuthAndFetch();
}, [navigate]);


  const fetchMyJobs = async (currentUserId: string) => {
    setLoading(true);
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/jobs/my-jobs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const jobsData = await response.json();
        const formattedJobs = await Promise.all(jobsData.map(async (job: any) => {
          // Fetch applicant details for each application
          const applicationsWithDetails = await Promise.all(
            (job.applications || []).map(async (app: any) => {
              try {
                const userResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${app.applicant_id}`, {
                  headers: { 'Authorization': `Bearer ${token}` }
                });
                
                let applicantProfile = null;
                if (userResponse.ok) {
                  const userData = await userResponse.json();
                  applicantProfile = {
                    full_name: userData.full_name,
                    username: userData.username,
                    phone: userData.phone,
                    date_of_birth: userData.date_of_birth,
                    location: userData.location,
                    user_role: userData.user_role,
                    resume_url: userData.resume_url
                  };
                }
                
                return {
                  id: app._id,
                  status: app.status,
                  message: app.message,
                  created_at: app.created_at,
                  applicant_id: app.applicant_id,
                  profiles: applicantProfile
                };
              } catch (error) {
                console.error('Error fetching applicant:', error);
                return {
                  id: app._id,
                  status: app.status,
                  message: app.message,
                  created_at: app.created_at,
                  applicant_id: app.applicant_id,
                  profiles: null
                };
              }
            })
          );
          
          return {
            id: job._id,
            title: job.title,
            description: job.description,
            category: job.category,
            location: job.location,
            status: job.status,
            created_at: job.created_at,
            applications: applicationsWithDetails
          };
        }));
        setJobs(formattedJobs);
      } else {
        setJobs([]);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/jobs/${jobId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        setJobs(jobs.map(job => 
          job.id === jobId ? { ...job, status: newStatus as any } : job
        ));
        toast.success("Job status updated");
      } else {
        toast.error("Failed to update job status");
      }
    } catch (error) {
      toast.error("Failed to update job status");
    }
  };

  const fetchApplicantDetails = async (applicantId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${applicantId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const userData = await response.json();
        return {
          full_name: userData.full_name,
          username: userData.username,
          phone: userData.phone,
          date_of_birth: userData.date_of_birth,
          location: userData.location,
          user_role: userData.user_role,
          resume_url: userData.resume_url
        };
      }
    } catch (error) {
      console.error('Error fetching applicant details:', error);
    }
    return null;
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: 'pending' | 'reviewed' | 'accepted' | 'rejected') => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        // Update local state
        setJobs(jobs.map(job => ({
          ...job,
          applications: job.applications.map(app => 
            app.id === applicationId ? { ...app, status: newStatus } : app
          )
        })));
        toast.success(`Application ${newStatus}`);
      } else {
        toast.error('Failed to update application status');
      }
    } catch (error) {
      toast.error('Failed to update application status');
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job posting?")) return;
    // Placeholder for now
    toast.success("Job deleted successfully");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary to-secondary animate-pulse" />
          <p className="mt-4 text-muted-foreground">Loading your jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold">My Job Postings</h1>
              <p className="text-muted-foreground mt-2">Manage your active job listings</p>
            </div>
            <Button onClick={() => navigate("/post-job")}>
              Post New Job
            </Button>
          </div>

          {jobs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">You haven't posted any jobs yet</p>
                <Button onClick={() => navigate("/post-job")}>Post Your First Job</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <Card key={job.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-2xl">{job.title}</CardTitle>
                          <Badge variant={job.status === "active" ? "default" : job.status === "inactive" ? "destructive" : "secondary"}>
                            {job.status}
                          </Badge>
                        </div>
                        <CardDescription className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Posted {new Date(job.created_at).toLocaleDateString()}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-2 mb-4">
                      {job.description}
                    </p>
                    
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Applications:</span>
                          <Badge variant="outline">{job.applications?.length || 0}</Badge>
                          {job.applications && job.applications.some(app => app.status === 'accepted') && (
                            <Badge variant="default" className="bg-green-500">
                              ✓ {job.applications.filter(app => app.status === 'accepted').length} Approved
                            </Badge>
                          )}
                          {job.applications && job.applications.some(app => app.status === 'rejected') && (
                            <Badge variant="destructive">
                              ✗ {job.applications.filter(app => app.status === 'rejected').length} Rejected
                            </Badge>
                          )}
                        </div>

                        <div className="flex-1" />

                        <Select
                          value={job.status}
                          onValueChange={(value) => handleStatusChange(job.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">
                              <span className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Active
                              </span>
                            </SelectItem>
                            <SelectItem value="closed">
                              <span className="flex items-center gap-2">
                                <XCircle className="w-4 h-4" />
                                Closed
                              </span>
                            </SelectItem>
                            <SelectItem value="filled">
                              <span className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Filled
                              </span>
                            </SelectItem>
                            <SelectItem value="inactive">
                              <span className="flex items-center gap-2">
                                <XCircle className="w-4 h-4" />
                                Inactive
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          variant="outline"
                          onClick={() => setSelectedJobApplications(
                            selectedJobApplications === job.id ? null : job.id
                          )}
                          disabled={!job.applications || job.applications.length === 0}
                        >
                          <Users className="w-4 h-4 mr-2" />
                          {selectedJobApplications === job.id ? "Hide" : "View"} Applicants ({job.applications?.length || 0})
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => navigate(`/jobs/${job.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>

                        <Button
                          variant="destructive"
                          onClick={() => handleDelete(job.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>

                      {/* Applicants List */}
                      {selectedJobApplications === job.id && (
                        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Applicants ({job.applications?.length || 0})
                          </h4>
                          {job.applications && job.applications.length > 0 ? (
                            <div className="space-y-3">
                              {job.applications.map((application, index) => (
                              <div key={application.id || index} className="flex items-start justify-between p-3 bg-background rounded border">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium">
                                      {application.profiles?.full_name || `Applicant ${index + 1}`}
                                    </span>
                                    {application.profiles?.username && (
                                      <span className="text-xs text-muted-foreground">
                                        @{application.profiles.username}
                                      </span>
                                    )}

                                    <Select
                                      value={application.status || 'pending'}
                                      onValueChange={(value) => updateApplicationStatus(application.id, value as any)}
                                    >
                                      <SelectTrigger className="w-32">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="reviewed">Reviewed</SelectItem>
                                        <SelectItem value="accepted">Accepted</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-2">
                                    Applied on {application.created_at ? new Date(application.created_at).toLocaleDateString() : 'Unknown date'}
                                  </p>
                                </div>
                                <div className="flex flex-col gap-2 ml-4">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedApplicant(application);
                                    }}
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    View Details
                                  </Button>
                                </div>
                              </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted-foreground text-center py-4">
                              No applications yet
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Chat Modal */}
          {selectedChat && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-background rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    Chat with {selectedChat.applicantName}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedChat(null)}
                  >
                    ✕
                  </Button>
                </div>
                <div className="p-4">
                  <ChatSystem
                    jobId={selectedChat.jobId}
                    receiverId={selectedChat.applicantId}
                    receiverName={selectedChat.applicantName}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Applicant Details Modal */}
          {selectedApplicant && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-background rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-2xl font-semibold">
                      {selectedApplicant.profiles?.full_name || 'Applicant Details'}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedApplicant(null)}
                    >
                      ✕
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Username</label>
                        <p className="text-lg">{selectedApplicant.profiles?.username || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Phone</label>
                        <p className="text-lg">{selectedApplicant.profiles?.phone || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Location</label>
                        <p className="text-lg">{selectedApplicant.profiles?.location || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                        <p className="text-lg">
                          {selectedApplicant.profiles?.date_of_birth 
                            ? new Date(selectedApplicant.profiles.date_of_birth).toLocaleDateString()
                            : 'Not provided'
                          }
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Role</label>
                        <p className="text-lg">{selectedApplicant.profiles?.user_role?.replace('_', ' ') || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Applied On</label>
                        <p className="text-lg">{selectedApplicant.created_at ? new Date(selectedApplicant.created_at).toLocaleDateString() : 'Unknown date'}</p>
                      </div>
                    </div>
                    
                    {selectedApplicant.message && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Cover Letter</label>
                        <p className="mt-1 p-3 bg-muted rounded-lg">{selectedApplicant.message}</p>
                      </div>
                    )}
                    
                    <div className="flex gap-3 pt-4">
                      {selectedApplicant.profiles?.resume_url && (
                        <Button
                          variant="outline"
                          onClick={() => window.open(selectedApplicant.profiles.resume_url!, '_blank')}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          View Resume
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedChat({
                            jobId: '',
                            applicantId: selectedApplicant.applicant_id,
                            applicantName: selectedApplicant.profiles?.full_name || 'Unknown'
                          });
                          setSelectedApplicant(null);
                        }}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Start Chat
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}


        </div>
      </div>
    </div>
  );
};

export default MyJobs;
