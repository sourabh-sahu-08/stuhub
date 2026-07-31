import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { X, Award, Zap, BookOpen, Star } from "lucide-react";
import { api } from "../../lib/api";
import type { Contributor } from "./HallOfFameSection";

interface ProfileModalProps {
  user: Contributor;
  onClose: () => void;
}

export function ProfileModal({ user, onClose }: ProfileModalProps) {
  const [pyqScanState, setPyqScanState] = useState<"idle" | "scanning" | "done">("idle");

  // Helper to generate last 364 dates
  const heatmapDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 363; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }, []);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "auto"; };
  }, [user._id]);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get(`/gamification/profile/${user._id}`);
      setProfileData(data);
    } catch (error) {
      console.error("Failed to fetch profile", error);
    } finally {
      setLoading(false);
    }
  };

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=111&color=fff`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />

      {/* Modal */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="relative w-full max-w-4xl max-h-[90vh] bg-[#111111] border border-white/[0.08] rounded-[24px] shadow-2xl overflow-hidden flex flex-col"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex-1 overflow-y-auto hide-scrollbar">
          {/* Minimal Header Cover */}
          <div className="h-32 bg-gradient-to-b from-white/[0.02] to-transparent relative border-b border-white/[0.04]" />
          
          <div className="px-8 pb-10">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-14 mb-12 relative z-10">
            <img 
              src={user.avatar || fallbackAvatar} 
              alt={user.name}
              onError={(e) => { (e.target as HTMLImageElement).src = fallbackAvatar; }}
              className="w-28 h-28 rounded-full border-[6px] border-[#111111] object-cover bg-[#111] shadow-xl"
            />
            <div className="flex-1 pb-2">
              <h2 className="text-3xl font-semibold text-white mb-2 tracking-tight">{user.name}</h2>
              <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400">
                {user.department && <span className="px-2.5 py-1 rounded-md bg-white/[0.05] border border-white/[0.05]">{user.department.name}</span>}
                <span className="flex items-center gap-1.5 font-medium"><Star size={14} className="text-zinc-500"/> Lvl {user.gamification?.level || 1}</span>
                <span className="flex items-center gap-1.5 font-medium"><Zap size={14} className="text-zinc-500"/> {user.gamification?.xp || 0} XP</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-6 h-6 rounded-full border-2 border-zinc-800 border-t-zinc-400 animate-spin" />
            </div>
          ) : (
            <div className="space-y-12">
              
              {/* Badges */}
              {profileData?.badges?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
                    <Award className="text-zinc-500" size={16} /> Achievements
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {profileData.badges.map((badge: any) => (
                      <div key={badge._id} className="flex flex-col items-center p-4 rounded-[16px] bg-white/[0.02] border border-white/[0.05] min-w-[110px] hover:bg-white/[0.04] hover:border-white/[0.1] transition-colors cursor-default">
                        <span className="text-3xl mb-2">{badge.title.split(' ')[0]}</span>
                        <span className="text-xs font-medium text-zinc-400 text-center">{badge.title.substring(badge.title.indexOf(' ') + 1)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Heatmap (Simplified CSS Grid) */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
                  <BookOpen className="text-zinc-500" size={16} /> Contributions
                </h3>
                <div className="p-6 rounded-[20px] bg-white/[0.02] border border-white/[0.05] overflow-hidden">
                  <div className="grid grid-rows-7 grid-flow-col gap-1 overflow-x-auto pb-2">
                    {heatmapDates.map((dateStr, i) => {
                      const activeLog = profileData?.heatmapData?.find((log: any) => log.date === dateStr);
                      const intensity = activeLog ? activeLog.count : 0;
                      const dateObj = new Date(dateStr);
                      const formattedDate = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                      const titleText = `${intensity} upload${intensity === 1 ? '' : 's'} on ${formattedDate}`;
                      return (
                        <div 
                          key={i}
                          title={titleText}
                          className={`w-3 h-3 rounded-[3px] transition-transform hover:scale-110 cursor-help ${
                            intensity === 0 ? 'bg-white/[0.04]' : 
                            intensity < 2 ? 'bg-zinc-600' : 
                            intensity < 5 ? 'bg-zinc-400' : 
                            'bg-white'
                          }`}
                        />
                      );
                    })}
                  </div>
                  <div className="mt-5 text-xs font-medium text-zinc-500 flex justify-between items-center">
                    <span>{profileData?.totalUploads} uploads in the last year</span>
                    <div className="flex items-center gap-1.5">
                      <span className="mr-1">Less</span>
                      <div className="w-3 h-3 rounded-[3px] bg-white/[0.04]" />
                      <div className="w-3 h-3 rounded-[3px] bg-zinc-600" />
                      <div className="w-3 h-3 rounded-[3px] bg-zinc-400" />
                      <div className="w-3 h-3 rounded-[3px] bg-white" />
                      <span className="ml-1">More</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Uploads */}
              {profileData?.recentUploads?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
                    <BookOpen className="text-zinc-500" size={16} /> Recent Uploads
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {profileData.recentUploads.map((upload: any) => (
                      <div key={upload.id} className="p-4 rounded-[16px] bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors group">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/[0.05] text-zinc-400 group-hover:text-amber-500 group-hover:bg-amber-500/10 transition-colors">
                            {upload.type}
                          </span>
                          <span className="text-xs text-zinc-500">{new Date(upload.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h4 className="text-sm font-medium text-zinc-200 truncate">{upload.title}</h4>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline */}
              {profileData?.activityTimeline?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-zinc-300 mb-4 uppercase tracking-wider">Recent Activity</h3>
                  <div className="space-y-4">
                    {profileData.activityTimeline.map((activity: any) => (
                      <div key={activity._id} className="flex items-start gap-4 p-4 rounded-[16px] bg-white/[0.02] border border-white/[0.02] hover:border-white/[0.05] transition-colors">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-zinc-400 shrink-0" />
                        <div>
                          <p className="text-sm text-zinc-200 font-medium">{activity.description || activity.actionType}</p>
                          <p className="text-xs text-zinc-500 mt-1">{new Date(activity.createdAt).toLocaleDateString()}</p>
                        </div>
                        {activity.xpEarned > 0 && (
                          <div className="ml-auto text-xs font-bold text-white bg-white/[0.1] px-2.5 py-1 rounded-md">
                            +{activity.xpEarned} XP
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
