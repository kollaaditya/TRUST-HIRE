import { useEffect, useState } from "react";
import { mongoAPI as supabase } from "@/lib/mongodb-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, Calendar, MapPin, Users } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Job {
  id: string;
  title: string;
  location: string;
  category: string;
  status: string;
  created_at: string;
  applications: {
    id: string;
    status: string;
    profiles: {
      full_name: string;
    };
  }[];
}

interface Application {
  id: string;
  created_at: string;
  status: string;
  jobs: {
    title: string;
    location: string;
    category: string;
  };
}

interface JobHistoryProps {
  userId: string;
}

export const JobHistory = ({ userId }: JobHistoryProps) => {
  const [postedJobs, setPostedJobs] = useState<Job[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobHistory();
  }, [userId]);

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', applicationId);

      if (error) {
        console.error('Update error:', error);
        toast.error('Failed to update: ' + error.message);
      } else {
        toast.success('Application status updated');
        fetchJobHistory();
      }
    } catch (err) {
      console.error('Update failed:', err);
      toast.error('Update failed');
    }
  };

  const fetchJobHistory = async () => {
    try {
      // Fetch posted jobs with applications
      const { data: posted, error: postedError } = await supabase
        .from('jobs')
        .select(`
          id, 
          title, 
          location, 
          category, 
          status, 
          created_at,
          applications(
            id,
            status,
            profiles(full_name)
          )
        `)
        .eq('employer_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (postedError) throw postedError;

      // Fetch applied jobs
      const { data: applied, error: appliedError } = await supabase
        .from('applications')
        .select(`
          id,
          created_at,
          status,
          jobs (
            title,
            location,
            category
          )
        `)
        .eq('applicant_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (appliedError) throw appliedError;

      setPostedJobs(posted || []);
      setAppliedJobs(applied || []);
    } catch (error: any) {
      console.error("Error fetching job history:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading job history...</div>;
  }

  return (
    <div className="grid md:grid-cols-2 gap-6 mt-6">
      {/* Posted Jobs History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            Recent Posted Jobs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {postedJobs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No jobs posted yet</p>
          ) : (
            <div className="space-y-3">
              {postedJobs.map((job) => (
                <div key={job.id} className="border-l-4 border-primary pl-3 py-2">
                  <h4 className="font-semibold text-sm">{job.title}</h4>
                  <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(job.created_at), 'MMM d, yyyy')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      {job.applications?.length || 0} applicants
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                      {job.status}
                    </Badge>
                    {job.applications && job.applications.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Recent: {job.applications.slice(0, 2).map(app => app.profiles.full_name).join(', ')}
                        {job.applications.length > 2 && ` +${job.applications.length - 2} more`}
                      </div>
                    )}
                  </div>
                  {job.applications && job.applications.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {job.applications.slice(0, 3).map((app) => (
                        <div key={app.id} className="flex items-center justify-between text-xs bg-muted/50 p-2 rounded">
                          <span>{app.profiles.full_name}</span>
                          <Select
                            value={app.status}
                            onValueChange={(value) => updateApplicationStatus(app.id, value)}
                          >
                            <SelectTrigger className="w-24 h-6 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="accepted">Accept</SelectItem>
                              <SelectItem value="rejected">Reject</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                      {job.applications.length > 3 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full h-6 text-xs"
                          onClick={() => window.location.href = '/my-jobs'}
                        >
                          View All {job.applications.length} Applicants
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Applied Jobs History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-accent" />
            Recent Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {appliedJobs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No applications yet</p>
          ) : (
            <div className="space-y-3">
              {appliedJobs.map((app) => (
                <div key={app.id} className="border-l-4 border-accent pl-3 py-2">
                  <h4 className="font-semibold text-sm">{app.jobs.title}</h4>
                  <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {app.jobs.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(app.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <Badge variant={app.status === 'accepted' ? 'default' : app.status === 'rejected' ? 'destructive' : 'secondary'} className="mt-1">
                    {app.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
