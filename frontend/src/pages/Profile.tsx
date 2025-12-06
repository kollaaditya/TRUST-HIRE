import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Save, MapPin, Check, X, Lock } from "lucide-react";

interface Profile {
  id: string;
  full_name: string;
  username: string | null;
  phone: string | null;
  date_of_birth: string | null;
  profile_photo_url: string | null;
  resume_url: string | null;
  user_role: "job_seeker" | "employer" | "both";
  location: string | null;
}

interface UserStats {
  jobsPosted: number;
  jobsApplied: number;
  averageRating: number;
  totalRatings: number;
}

interface FollowRequest {
  _id: string;
  follower_id: string;
  following_id: string;
  status: string;
  created_at: string;
  follower?: {
    full_name: string;
    username: string;
    profile_photo_url?: string;
  };
}

interface Follower {
  _id: string;
  follower_id: string;
  following_id: string;
  status: string;
  user?: {
    full_name: string;
    username: string;
    profile_photo_url?: string;
    location?: string;
  };
}

interface Following {
  _id: string;
  follower_id: string;
  following_id: string;
  status: string;
  user?: {
    full_name: string;
    username: string;
    profile_photo_url?: string;
    location?: string;
  };
}

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<UserStats>({
    jobsPosted: 0,
    jobsApplied: 0,
    averageRating: 0,
    totalRatings: 0,
  });
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [location, setLocation] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<string | null>(null);
  const [resumeName, setResumeName] = useState<string>("");
  const [followRequests, setFollowRequests] = useState<FollowRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [following, setFollowing] = useState<Following[]>([]);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);


  const avatars = ["👤", "👨", "👩", "🧑", "👨‍💼", "👩‍💼", "👨‍💻", "👩‍💻", "👨‍🔬", "👩‍🔬", "👨‍🎓", "👩‍🎓"];

  useEffect(() => {
    const fetchProfile = async () => {
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
        const user = data.user;
        
        const userId = user._id || user.id;
        setUserId(userId);
        setUserEmail(user.email);
        
        // Always use current user data from API
        setProfile({
          id: user._id || user.id,
          full_name: user.full_name,
          username: user.username || null,
          phone: user.phone || null,
          date_of_birth: user.date_of_birth || null,
          profile_photo_url: user.profile_photo_url || null,
          resume_url: user.resume_url || null,
          user_role: user.user_role || "job_seeker",
          location: user.location || null
        });
        
        setLocation(user.location || "");
        
        // Load profile photo and resume from database
        setProfilePhoto(user.profile_photo_url || null);
        setResumeFile(user.resume_url || null);
        setResumeName(user.resume_name || "");
        
        // Fetch user stats and follow requests
        fetchUserStats(token, userId);
        fetchFollowRequests(token);
        fetchFollowersList(token, userId);
        fetchFollowingList(token, userId);
        
      } catch (error) {
        localStorage.removeItem('auth_token');
        navigate("/auth");
      }
      
      setLoading(false);
    };

    fetchProfile();
    
    // Listen for stats updates
    const handleStatsUpdate = () => {
      const token = localStorage.getItem('auth_token');
      if (token && userId) {
        fetchUserStats(token, userId);
        fetchFollowRequests(token);
        fetchFollowersList(token, userId);
        fetchFollowingList(token, userId);
      }
    };
    
    window.addEventListener('statsUpdate', handleStatsUpdate);
    // Also listen for cross-tab updates via BroadcastChannel
    let bc: BroadcastChannel | null = null;
    const setupBC = () => {
      try {
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
          bc = new BroadcastChannel('trusthire-updates');
          bc.addEventListener('message', () => {
            const token = localStorage.getItem('auth_token');
            if (token && userId) {
              fetchFollowRequests(token);
              fetchFollowersList(token, userId);
              fetchFollowingList(token, userId);
            }
          });
        }
      } catch (e) { bc = null; }
    };

    setupBC();

    return () => {
      window.removeEventListener('statsUpdate', handleStatsUpdate);
      try { if (bc) { bc.removeEventListener('message', () => {}); bc.close(); } } catch (e) { /* ignore */ }
    };
  }, [navigate, userId]);

  const fetchUserStats = async (token: string, userId: string) => {
    try {
      console.log('Fetching stats for user:', userId);
      const response = await fetch('http://localhost:3001/api/profile/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Received stats:', data);
        setStats({
          jobsPosted: data.jobsPosted,
          jobsApplied: data.jobsApplied,
          averageRating: data.avgRating,
          totalRatings: data.totalRatings
        });
      } else {
        console.error('Failed to fetch stats:', response.status);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchFollowRequests = async (token: string) => {
    setLoadingRequests(true);
    try {
      const response = await fetch('http://localhost:3001/api/follows/requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFollowRequests(data);
      }
    } catch (error) {
      console.error('Error fetching follow requests:', error);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleAcceptFollowRequest = async (followId: string) => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:3001/api/follows/${followId}/accept`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Follow request accepted!');
        setFollowRequests(followRequests.filter(req => req._id !== followId));
        try {
          if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
            const bc = new BroadcastChannel('trusthire-updates');
            bc.postMessage({ type: 'follow_accepted', followId });
            bc.close();
          }
        } catch (e) { /* ignore */ }
      } else {
        toast.error('Failed to accept follow request');
      }
    } catch (error) {
      console.error('Error accepting follow request:', error);
      toast.error('Error accepting follow request');
    }
  };

  const handleRejectFollowRequest = async (followId: string) => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:3001/api/follows/${followId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Follow request rejected');
        setFollowRequests(followRequests.filter(req => req._id !== followId));
        try {
          if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
            const bc = new BroadcastChannel('trusthire-updates');
            bc.postMessage({ type: 'follow_rejected', followId });
            bc.close();
          }
        } catch (e) { /* ignore */ }
      } else {
        toast.error('Failed to reject follow request');
      }
    } catch (error) {
      console.error('Error rejecting follow request:', error);
      toast.error('Error rejecting follow request');
    }
  };

  const fetchFollowersList = async (token: string, userId: string) => {
    setLoadingFollowers(true);
    try {
      const response = await fetch(`http://localhost:3001/api/follows/followers/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFollowers(data);
      }
    } catch (error) {
      console.error('Error fetching followers:', error);
    } finally {
      setLoadingFollowers(false);
    }
  };

  const handleRemoveFollower = async (followId: string) => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:3001/api/follows/${followId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Follower removed');
        setFollowers(followers.filter(f => f._id !== followId));
        try {
          if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
            const bc = new BroadcastChannel('trusthire-updates');
            bc.postMessage({ type: 'follower_removed', followId });
            bc.close();
          }
        } catch (e) { /* ignore */ }
      } else {
        toast.error('Failed to remove follower');
      }
    } catch (error) {
      console.error('Error removing follower:', error);
      toast.error('Error removing follower');
    }
  };

  const fetchFollowingList = async (token: string, userId: string) => {
    setLoadingFollowing(true);
    try {
      const response = await fetch(`http://localhost:3001/api/follows/following/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFollowing(data);
      }
    } catch (error) {
      console.error('Error fetching following list:', error);
    } finally {
      setLoadingFollowing(false);
    }
  };

  const handleUnfollow = async (followId: string) => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:3001/api/follows/${followId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Unfollowed successfully');
        setFollowing(following.filter(f => f._id !== followId));
        try {
          if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
            const bc = new BroadcastChannel('trusthire-updates');
            bc.postMessage({ type: 'unfollowed', followId });
            bc.close();
          }
        } catch (e) { /* ignore */ }
      } else {
        toast.error('Failed to unfollow');
      }
    } catch (error) {
      console.error('Error unfollowing:', error);
      toast.error('Error unfollowing');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (newPassword === currentPassword) {
      toast.error('New password must be different from current password');
      return;
    }

    setChangingPassword(true);
    const token = localStorage.getItem('auth_token');

    try {
      const response = await fetch('http://localhost:3001/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Password changed successfully!');
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowChangePassword(false);
      } else {
        toast.error(data.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:3001/api/auth/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: profile.username,
          full_name: profile.full_name,
          phone: profile.phone,
          date_of_birth: profile.date_of_birth,
          user_role: profile.user_role,
          location: location,
          profile_photo_url: profilePhoto,
          resume_url: resumeFile,
          resume_name: resumeName
        })
      });
      
      console.log('Update response status:', response.status);
      
      if (response.ok) {
        toast.success("Profile updated successfully!");
      } else {
        const errorText = await response.text();
        console.error('Update error:', errorText);
        toast.error(`Failed to update profile: ${response.status}`);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
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

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 max-w-lg mx-auto">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary">
                {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "N/A"}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Avg Rating</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary">{stats.totalRatings}</div>
              <div className="text-sm text-muted-foreground mt-1">Total Ratings</div>
            </CardContent>
          </Card>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>Update your personal information and preferences</CardDescription>
          </CardHeader>
          <CardContent>


            {/* Profile Picture */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 overflow-hidden">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  profile.full_name?.charAt(0)?.toUpperCase() || 'U'
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('photo-upload')?.click()}
              >
                Upload Photo
              </Button>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      setProfilePhoto(event.target?.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>

            {/* Display Email/Phone */}
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <Label className="text-sm text-muted-foreground">Contact</Label>
              <p className="text-lg font-medium">{userEmail}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  value={profile.username || ""}
                  onChange={(e) => setProfile({...profile, username: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={profile.full_name}
                  onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={profile.phone || ""}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  name="dob"
                  type="date"
                  value={profile.date_of_birth || ""}
                  onChange={(e) => setProfile({...profile, date_of_birth: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Location
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="location"
                    name="location"
                    placeholder="City, State"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition((position) => {
                          fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`)
                            .then(response => response.json())
                            .then(data => setLocation(`${data.city}, ${data.principalSubdivision}`))
                            .catch(() => setLocation('Location detected'));
                        });
                      }
                    }}
                  >
                    Detect
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="userRole">I am a...</Label>
                <Select name="userRole" value={profile.user_role} onValueChange={(value) => setProfile({...profile, user_role: value as any})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="job_seeker">Job Seeker</SelectItem>
                    <SelectItem value="employer">Employer</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Resume Upload */}
              <div className="space-y-2">
                <Label>Resume</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('resume-upload')?.click()}
                    className="flex-1"
                  >
                    {resumeName || "Upload Resume"}
                  </Button>
                  {resumeFile && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = resumeFile;
                        link.download = resumeName;
                        link.click();
                      }}
                    >
                      Open
                    </Button>
                  )}
                </div>
                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setResumeName(file.name);
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setResumeFile(event.target?.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>

              <Button type="submit" className="w-full" disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Security
                </CardTitle>
                <CardDescription>Manage your password and security settings</CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowChangePassword(!showChangePassword)}
              >
                {showChangePassword ? "Cancel" : "Change Password"}
              </Button>
            </div>
          </CardHeader>
          {showChangePassword && (
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="Enter your current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password (min 6 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700" 
                  disabled={changingPassword}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  {changingPassword ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          )}
        </Card>

        {/* Follow Requests Section */}
        {followRequests.length > 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle>Follow Requests</CardTitle>
              <CardDescription>You have {followRequests.length} pending follow request{followRequests.length > 1 ? 's' : ''}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {followRequests.map((request) => (
                  <div key={request._id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
                    <div className="flex items-center gap-3">
                      {request.follower?.profile_photo_url && (
                        <img 
                          src={request.follower.profile_photo_url} 
                          alt={request.follower.full_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <p className="font-semibold text-sm">{request.follower?.full_name}</p>
                        <p className="text-xs text-muted-foreground">@{request.follower?.username}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAcceptFollowRequest(request._id)}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectFollowRequest(request._id)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Followers Section */}
        {followers.length > 0 && (
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle>Your Followers</CardTitle>
              <CardDescription>You have {followers.length} follower{followers.length > 1 ? 's' : ''}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {followers.map((follower) => (
                  <div key={follower._id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-100">
                    <div className="flex items-center gap-3 flex-1">
                      {follower.user?.profile_photo_url && (
                        <img 
                          src={follower.user.profile_photo_url} 
                          alt={follower.user.full_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{follower.user?.full_name}</p>
                        <p className="text-xs text-muted-foreground">@{follower.user?.username}</p>
                        {follower.user?.location && (
                          <p className="text-xs text-muted-foreground">{follower.user.location}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveFollower(follower._id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Following Section */}
        {following.length > 0 && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle>Following</CardTitle>
              <CardDescription>You are following {following.length} user{following.length > 1 ? 's' : ''}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {following.map((follow) => (
                  <div key={follow._id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-100">
                    <div className="flex items-center gap-3 flex-1">
                      {follow.user?.profile_photo_url && (
                        <img 
                          src={follow.user.profile_photo_url} 
                          alt={follow.user.full_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{follow.user?.full_name}</p>
                        <p className="text-xs text-muted-foreground">@{follow.user?.username}</p>
                        {follow.user?.location && (
                          <p className="text-xs text-muted-foreground">{follow.user.location}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUnfollow(follow._id)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Unfollow
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}


      </div>
    </div>
  );
};

export default Profile;
