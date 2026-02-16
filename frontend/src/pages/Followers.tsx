import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Follower {
  _id: string;
  user: {
    full_name: string;
    username: string;
  };
}

const Followers = () => {
  const navigate = useNavigate();
  const [followers, setFollowers] = useState<Follower[]>([]);

  useEffect(() => {
    const fetchFollowers = async () => {
      const token = localStorage.getItem("auth_token");
      const userId = JSON.parse(atob(token!.split(".")[1])).userId;

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/follows/followers/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();
      setFollowers(data);
    };

    fetchFollowers();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Followers</h1>

      {followers.map(f => (
        <div key={f._id} className="p-4 border mb-2 rounded">
          {f.user.full_name} (@{f.user.username})
        </div>
      ))}
    </div>
  );
};

export default Followers;
