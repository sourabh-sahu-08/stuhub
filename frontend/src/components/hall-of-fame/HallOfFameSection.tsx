import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Users, BookOpen, Download, TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import { api } from "../../lib/api";
import { FeaturedHero } from "./FeaturedHero";
import { TopRunnersUp } from "./TopRunnersUp";
import { ContributorList } from "./ContributorList";
import { ProfileModal } from "./ProfileModal";
import { CommunityActivity, type Activity } from "./CommunityActivity";
import { JoinCommunity } from "./JoinCommunity";

export type Contributor = {
  _id: string;
  name: string;
  avatar?: string;
  department?: { _id: string; name: string; code: string };
  branch?: string;
  gamification?: {
    xp: number;
    level: number;
    reputation: number;
    currentStreak: number;
    longestStreak: number;
  };
  totalContributions?: number;
};

const QUOTES = [
  "Knowledge increases by sharing but not by saving.",
  "The best way to learn is to teach others.",
  "Empower your peers. Elevate the campus.",
  "Your notes today could be someone's success tomorrow."
];

function AnimatedCounter({ value, label, icon: Icon }: { value: number; label: string; icon: any }) {
  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-[24px] bg-white/[0.02] border border-white/[0.05] relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <Icon className="w-6 h-6 text-zinc-500 mb-3 group-hover:text-amber-500 transition-colors duration-500" />
      <div className="text-4xl font-bold text-white tracking-tight mb-1">{value.toLocaleString()}</div>
      <div className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">{label}</div>
    </div>
  );
}

export function HallOfFameSection() {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState({ totalHeroes: 0, totalUploads: 0, totalDownloads: 0, monthlyContributions: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<Contributor | null>(null);
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % QUOTES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [leaderboardRes, statsRes, activityRes] = await Promise.all([
        api.get("/gamification/leaderboard?limit=50"),
        api.get("/gamification/leaderboard/stats"),
        api.get("/gamification/leaderboard/activity")
      ]);
      setContributors(leaderboardRes.data);
      setStats(statsRes.data);
      setActivities(activityRes.data);
    } catch (error) {
      console.error("Failed to fetch Hall of Fame data:", error);
    } finally {
      setLoading(false);
    }
  };

  const top3 = contributors.slice(0, 3);
  const rest = contributors.slice(3);

  return (
    <section id="heroes" className="relative min-h-screen bg-black overflow-hidden py-12 md:py-16 font-sans selection:bg-amber-500/30">
      {/* Premium Static Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Soft Radial Gradients */}
        <div className="absolute top-[-20%] left-[20%] w-[50%] h-[50%] rounded-full bg-amber-500/[0.03] blur-[120px]" />
        <div className="absolute top-[30%] right-[-10%] w-[40%] h-[40%] rounded-full bg-orange-600/[0.02] blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[40%] w-[60%] h-[60%] rounded-full bg-zinc-500/[0.01] blur-[150px]" />
        
        {/* Light Grid Texture */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_30%,#000_70%,transparent_100%)] opacity-70" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Hero Section & Stats */}
        <div className="text-center mb-24 relative z-10 pt-12">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-6"
          >
            Hall of Fame
          </motion.h2>
          
          <div className="h-10 relative mb-12">
            <AnimatePresence mode="wait">
              <motion.p
                key={quoteIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto absolute inset-0 font-medium"
              >
                "{QUOTES[quoteIndex]}"
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Animated Stats Grid */}
          {!loading && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto mt-16"
            >
              <AnimatedCounter value={stats.totalHeroes} label="Active Heroes" icon={Users} />
              <AnimatedCounter value={stats.totalUploads} label="Notes Shared" icon={BookOpen} />
              <AnimatedCounter value={stats.totalDownloads} label="Total Downloads" icon={Download} />
              <AnimatedCounter value={stats.monthlyContributions} label="Monthly Uploads" icon={TrendingUp} />
            </motion.div>
          )}
        </div>

        {/* Leaderboard Content */}
        {loading ? (
          <div className="flex justify-center py-32 relative z-10">
            <div className="w-8 h-8 rounded-full border-2 border-zinc-800 border-t-amber-500 animate-spin" />
          </div>
        ) : contributors.length === 0 ? (
          <div className="text-center py-32 max-w-lg mx-auto bg-[#111111] border border-white/[0.08] rounded-3xl backdrop-blur-md relative z-10">
            <Award className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No heroes found</h3>
            <p className="text-sm text-zinc-500 mb-8">Be the first to upload and claim the top spot!</p>
            <button className="px-6 py-2.5 bg-white hover:bg-zinc-200 text-black text-sm font-semibold rounded-full transition-all">
              Upload Notes
            </button>
          </div>
        ) : (
          <div className="relative z-10">
            <FeaturedHero contributor={contributors[0]} onClick={() => setSelectedUser(contributors[0])} />
            <TopRunnersUp rank2={contributors[1]} rank3={contributors[2]} onClick={setSelectedUser} />
            
            {contributors.length > 3 && (
              <div className="mt-24 max-w-7xl mx-auto">
                <div className="text-center mb-12">
                  <h3 className="text-2xl font-bold text-white">Top Contributors</h3>
                  <div className="w-12 h-1 bg-zinc-800 rounded-full mx-auto mt-4" />
                </div>
                <ContributorList contributors={contributors.slice(3)} startRank={4} onUserClick={setSelectedUser} />
              </div>
            )}

            <CommunityActivity activities={activities} />

            <JoinCommunity />
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedUser && (
          <ProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}
