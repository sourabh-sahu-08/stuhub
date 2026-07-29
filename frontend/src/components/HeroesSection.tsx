import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Medal, ArrowUpCircle } from 'lucide-react';
import { api } from '../lib/api';

interface Contributor {
  _id: string;
  count: number;
  name: string;
  avatar?: string;
  branch?: string;
}

export function HeroesSection() {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopContributors = async () => {
      try {
        const response = await api.get('/auth/top-contributors');
        setContributors(response.data);
      } catch (error) {
        console.error('Failed to fetch top contributors', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopContributors();
  }, []);

  if (loading || contributors.length === 0) return null;

  return (
    <section id="heroes" className="py-24 bg-[#0A0A0A] border-t border-[#111111] px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,144,0,0.05),transparent_70%)]" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4 flex items-center justify-center gap-3">
            <Trophy className="text-[#FF9000] w-10 h-10" />
            Our Heroes
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            These amazing individuals have contributed the most notes and resources to help everyone succeed.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {contributors.map((contributor, index) => (
            <motion.div
              key={contributor._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#111] border border-[#222] rounded-2xl p-6 relative group overflow-hidden hover:border-[#FF9000]/50 transition-colors"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                {index === 0 ? <Trophy size={80} className="text-[#FF9000]" /> : 
                 index === 1 ? <Medal size={80} className="text-zinc-300" /> :
                 index === 2 ? <Medal size={80} className="text-amber-700" /> :
                 <Star size={80} className="text-zinc-600" />}
              </div>

              <div className="flex items-center gap-4 mb-4 relative z-10">
                {contributor.avatar ? (
                  <img 
                    src={contributor.avatar} 
                    alt={contributor.name} 
                    className="w-16 h-16 rounded-full border-2 border-[#222] group-hover:border-[#FF9000] transition-colors object-cover" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(contributor.name)}&background=222&color=FF9000`;
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#222] flex items-center justify-center text-xl font-bold text-[#FF9000] border-2 border-[#222] group-hover:border-[#FF9000] transition-colors shrink-0">
                    {contributor.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-[#FF9000] transition-colors truncate max-w-[150px]">
                    {contributor.name}
                  </h3>
                  {contributor.branch && (
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      {contributor.branch}
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-[#1A1A1A] rounded-xl p-4 flex items-center justify-between relative z-10 border border-[#222] group-hover:border-[#FF9000]/30 transition-colors">
                <div className="flex items-center gap-2">
                  <ArrowUpCircle className="text-[#FF9000] w-5 h-5" />
                  <span className="text-sm font-bold text-zinc-300">Contributions</span>
                </div>
                <div className="text-2xl font-black text-[#FF9000]">
                  {contributor.count}
                </div>
              </div>
              
              {/* Rank Badge */}
              <div className="absolute top-4 right-4 bg-[#222] text-zinc-400 text-xs font-black px-3 py-1 rounded-full group-hover:bg-[#FF9000] group-hover:text-black transition-colors shadow-lg z-10">
                #{index + 1}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
