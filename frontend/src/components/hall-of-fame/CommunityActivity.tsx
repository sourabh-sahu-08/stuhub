import { motion } from "framer-motion";
import { BookOpen, Clock, FileText, FileCode, CheckSquare } from "lucide-react";

export type Activity = {
  id: string;
  title: string;
  type: "Note" | "PYQ" | "CT-PYQ" | "Assignment";
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
};

export function CommunityActivity({ activities }: { activities: Activity[] }) {
  if (!activities || activities.length === 0) return null;

  const getTypeIcon = (type: Activity["type"]) => {
    switch (type) {
      case "Note": return <FileText className="text-blue-400" size={16} />;
      case "PYQ": return <Clock className="text-amber-500" size={16} />;
      case "CT-PYQ": return <FileCode className="text-orange-500" size={16} />;
      case "Assignment": return <CheckSquare className="text-emerald-400" size={16} />;
      default: return <BookOpen className="text-zinc-400" size={16} />;
    }
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return `1 day ago`;
    return `${diffDays} days ago`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto mt-32 mb-24 relative z-20">
      <div className="flex flex-col items-center text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-3">Recent Community Activity</h2>
        <p className="text-zinc-500 max-w-xl">See what other students are sharing across the campus right now.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activities.slice(0, 9).map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-white/[0.05] flex items-center justify-center shrink-0">
              {getTypeIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white truncate">{activity.title}</h4>
              <p className="text-xs text-zinc-500 truncate mt-0.5">
                <span className="text-zinc-400 font-medium">{activity.user.name}</span> shared a {activity.type}
              </p>
            </div>
            <div className="text-[10px] text-zinc-600 font-medium whitespace-nowrap">
              {getRelativeTime(activity.createdAt)}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
