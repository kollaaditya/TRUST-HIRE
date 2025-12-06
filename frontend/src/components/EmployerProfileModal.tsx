import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Mail, Phone, UserPlus, Clock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface EmployerProfile {
  _id: string;
  full_name: string;
  username: string;
  email: string;
  phone: string;
  location: string;
  profile_photo_url: string;
  user_role: string;
  created_at: string;
}

interface FollowStatus {
  isFollowing: boolean;
  hasPendingRequest: boolean;
  followId: string | null;
}

const EmployerProfileModal = ({ employerId, isOpen, onClose }: { employerId: string | null; isOpen: boolean; onClose: () => void }) => {
  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [followStatus, setFollowStatus] = useState<FollowStatus>({
    isFollowing: false,
    hasPendingRequest: false,
    followId: null
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const token = localStorage.getItem('auth_token');

  useEffect(() => {
    if (isOpen && employerId) {
      fetchEmployerProfile();
      getFollowStatus();
    }
  }, [isOpen, employerId]);

  const fetchEmployerProfile = async () => {
    if (!employerId || !token) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/users/${employerId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const getFollowStatus = async () => {
    if (!employerId || !token) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/follows/status/${employerId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFollowStatus(data);
      }
    } catch (error) {
      console.error('Error fetching follow status:', error);
    }
  };

  const handleFollowClick = async () => {
    if (!employerId || !token) return;
    
    setLoading(true);
    try {
      if (followStatus.isFollowing || followStatus.hasPendingRequest) {
        // Remove follow
        if (followStatus.followId) {
          const response = await fetch(`http://localhost:3001/api/follows/${followStatus.followId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (response.ok) {
            toast({
              title: "Success",
              description: "Follow removed successfully"
            });
            setFollowStatus({
              isFollowing: false,
              hasPendingRequest: false,
              followId: null
            });
            // notify profile to refresh follow lists
            try { window.dispatchEvent(new CustomEvent('statsUpdate')); } catch (e) { /* ignore */ }
              try {
                if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
                  const bc = new BroadcastChannel('trusthire-updates');
                  bc.postMessage({ type: 'follow_sent', followingId: employerId });
                  bc.close();
                }
              } catch (e) { /* ignore */ }
          }
        }
      } else {
        // Send follow request
        const response = await fetch('http://localhost:3001/api/follows', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ followingId: employerId })
        });
        
        if (response.ok) {
          const data = await response.json();
          toast({
            title: "Success",
            description: "Follow request sent successfully"
          });
          setFollowStatus({
            isFollowing: false,
            hasPendingRequest: true,
            followId: data.follow._id
          });
          // notify profile to refresh follow lists
          try { window.dispatchEvent(new CustomEvent('statsUpdate')); } catch (e) { /* ignore */ }
            try {
              if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
                const bc = new BroadcastChannel('trusthire-updates');
                bc.postMessage({ type: 'follow_removed', followingId: employerId });
                bc.close();
              }
            } catch (e) { /* ignore */ }
        } else {
          const error = await response.json();
          toast({
            title: "Error",
            description: error.error || "Failed to send follow request",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{profile?.full_name || "Loading..."}</CardTitle>
              <CardDescription>@{profile?.username}</CardDescription>
            </div>
            <button 
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground text-2xl leading-none"
            >
              ×
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile?.profile_photo_url && (
            <div className="flex justify-center">
              <img 
                src={profile.profile_photo_url} 
                alt={profile.full_name}
                className="w-32 h-32 rounded-full object-cover"
              />
            </div>
          )}
          
          <div className="space-y-2">
            {profile?.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{profile.location}</span>
              </div>
            )}
            
            {profile?.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4" />
                <span>{profile.email}</span>
              </div>
            )}
            
            {profile?.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4" />
                <span>{profile.phone}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Joined {new Date(profile?.created_at || "").toLocaleDateString()}</span>
            </div>
          </div>
          
          <Badge className="w-full text-center justify-center py-1">
            {profile?.user_role === 'employer' ? '💼 Employer' : 
             profile?.user_role === 'job_seeker' ? '🔍 Job Seeker' : 
             '👥 Both'}
          </Badge>
          
          <Button 
            onClick={handleFollowClick}
            disabled={loading}
            className="w-full"
            variant={followStatus.isFollowing ? "destructive" : "default"}
          >
            {loading ? "Processing..." : 
             followStatus.isFollowing ? "Unfollow" :
             followStatus.hasPendingRequest ? (
               <>
                 <Clock className="w-4 h-4 mr-2" />
                 Pending
               </>
             ) : (
               <>
                 <UserPlus className="w-4 h-4 mr-2" />
                 Follow
               </>
             )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployerProfileModal;
