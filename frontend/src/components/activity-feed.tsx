import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Loader2 } from "lucide-react";

interface Activity {
  _id: string;
  user: {
    name: string;
    username: string;
    avatar: string;
  };
  type: string;
  platform: string;
  metadata: any;
  createdAt: string;
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await api.get("/activity/friends");
        setActivities(response.data.data);
      } catch (err: any) {
        console.error("Failed to fetch activity feed", err);
        setError("Could not load activity feed.");
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="animate-spin text-blueprint-blue" size={32} />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 font-mono text-sm py-4">{error}</div>;
  }

  if (activities.length === 0) {
    return (
      <div className="text-sketch-black/60 font-mono text-sm py-4">
        No recent activity from your friends. Follow more people to see their updates!
      </div>
    );
  }

  const getActivityMessage = (activity: Activity) => {
    switch (activity.type) {
      case "ACCOUNT_LINKED":
        return `Linked their ${activity.platform} account`;
      case "SCORE_INCREASED":
        return `Gained Arena Score: ${activity.metadata?.oldScore || 0} → ${activity.metadata?.newScore || 0}`;
      default:
        return `Completed an activity on ${activity.platform}`;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "leetcode": return "bg-green-500";
      case "codeforces": return "bg-blue-500";
      case "github": return "bg-purple-500";
      default: return "bg-blueprint-blue";
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {activities.map((act, i) => (
        <div 
          key={act._id} 
          className={`flex items-start gap-4 pb-4 ${
            i < activities.length - 1 ? "border-b-2 border-dashed border-sketch-black/20" : ""
          }`}
        >
          <img src={act.user.avatar} alt={act.user.username} className="w-10 h-10 rounded-full rough-border" />
          <div className="flex-1">
            <p className="font-mono text-sm text-sketch-black">
              <span className="font-bold">{act.user.name}</span> (@{act.user.username})
            </p>
            <p className="font-mono text-sm text-sketch-black/80 flex items-center gap-2 mt-1">
              <span className={`w-2 h-2 rounded-full ${getPlatformColor(act.platform)}`}></span>
              {getActivityMessage(act)}
            </p>
          </div>
          <span className="font-mono text-xs text-sketch-black/50 ml-auto whitespace-nowrap">
            {new Date(act.createdAt).toLocaleDateString()}
          </span>
        </div>
      ))}
    </div>
  );
}
