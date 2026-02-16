import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface FollowRequest {
  _id: string;
  follower: {
    _id: string;
    full_name: string;
    username: string;
    location: string;
  };
}

const FollowRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<FollowRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        navigate("/auth");
        return;
      }

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/follows/requests`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        const data = await res.json();
        setRequests(data);
      } catch (err) {
        toast.error("Failed to fetch requests");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [navigate]);

  const acceptRequest = async (id: string) => {
    const token = localStorage.getItem("auth_token");
    await fetch(`${import.meta.env.VITE_API_URL}/api/follows/${id}/accept`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` }
    });

    setRequests(requests.filter(r => r._id !== id));
    toast.success("Request accepted");
  };

  const rejectRequest = async (id: string) => {
    const token = localStorage.getItem("auth_token");
    await fetch(`${import.meta.env.VITE_API_URL}/api/follows/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    setRequests(requests.filter(r => r._id !== id));
    toast.success("Request rejected");
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Follow Requests</h1>

      {requests.length === 0 ? (
        <p>No pending requests</p>
      ) : (
        requests.map(req => (
          <Card key={req._id} className="mb-4">
            <CardContent className="flex justify-between items-center p-4">
              <div>
                <p className="font-semibold">{req.follower.full_name}</p>
                <p className="text-sm text-muted-foreground">
                  @{req.follower.username}
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => acceptRequest(req._id)}>
                  Accept
                </Button>
                <Button variant="destructive" onClick={() => rejectRequest(req._id)}>
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default FollowRequests;
