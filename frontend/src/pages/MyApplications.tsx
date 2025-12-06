import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Calendar, Briefcase } from "lucide-react";

interface Application {
  id: string;
  status: string;
  message: string | null;
  created_at: string;
  jobs: {
    id: string;
    title: string;
    location: string;
    category: string;
    profiles: {
      full_name: string;
    };
  };
}

const MyApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
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
        
        const data = await response.json();
        const userId = data.user._id || data.user.id;
        fetchApplications(userId);
      } catch (error) {
        localStorage.removeItem('auth_token');
        navigate("/auth");
      }
    };
    checkAuthAndFetch();
  }, [navigate]);

  const fetchApplications = async (userId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:3001/api/applications/my-applications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const applicationsData = await response.json();
        console.log('Applications data:', applicationsData);
        const formattedApplications = applicationsData.map((app: any) => ({
          id: app._id,
          status: app.status,
          message: app.message,
          created_at: app.created_at,
          jobs: {
            id: app.job._id,
            title: app.job.title,
            location: app.job.location,
            category: app.job.category,
            profiles: {
              full_name: "Employer"
            }
          }
        }));
        setApplications(formattedApplications);
      } else {
        setApplications([]);
      }
    } catch (error) {
      setApplications([]);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary to-secondary animate-pulse" />
          <p className="mt-4 text-muted-foreground">Loading applications...</p>
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

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">My Applications</h1>
          <p className="text-muted-foreground mb-8">Track your job application status</p>

          {applications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No applications yet</p>
                <Button onClick={() => navigate("/find-jobs")}>Browse Jobs</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <Card key={application.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{application.jobs.title}</CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {application.jobs.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Applied {new Date(application.created_at).toLocaleDateString()}
                          </span>
                        </CardDescription>
                      </div>
                      <Badge 
                        variant={
                          application.status === 'accepted' ? 'default' : 
                          application.status === 'rejected' ? 'destructive' : 
                          'secondary'
                        }
                      >
                        {application.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        <strong>Employer:</strong> {application.jobs.profiles.full_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Category:</strong> {application.jobs.category}
                      </p>
                      {application.message && (
                        <div>
                          <p className="text-sm font-medium">Your Message:</p>
                          <p className="text-sm text-muted-foreground bg-muted p-2 rounded mt-1">
                            {application.message}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/jobs/${application.jobs.id}`)}
                      >
                        View Job
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyApplications;
