import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Loader2, ArrowLeft, Youtube, Globe, ExternalLink, Link as LinkIcon } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

interface Resource {
  _id: string;
  title: string;
  url: string;
  type: "youtube" | "website";
  subject: string;
  semester: number;
  branch: string;
  createdAt: string;
  user?: { name: string; email: string };
}

export function ResourcesPage() {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user?.branch && user?.semester) {
      fetchResources();
    }
  }, [user]);

  const fetchResources = async (query = "") => {
    try {
      setLoading(true);
      const res = await api.get(`/resources/list/${user?.branch}/${user?.semester}`, {
        params: { q: query }
      });
      setResources(res.data);
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setLoading(false);
    }
  };

  // Group by Subject
  const groupedResources = resources.reduce((acc, curr) => {
    const subject = curr.subject || "General Resources";
    if (!acc[subject]) acc[subject] = [];
    acc[subject].push(curr);
    return acc;
  }, {} as Record<string, Resource[]>);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link to="/dashboard" className="p-2 -ml-2 rounded-xl hover:bg-[#1A1A1A] text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Study Resources</h1>
          <p className="text-zinc-400 mt-1">Recommended YouTube channels and websites for {user?.branch} Sem {user?.semester}</p>
        </div>
      </div>

      <div className="relative max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
        <input 
          type="text" 
          placeholder="Search by title or subject..." 
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            fetchResources(e.target.value);
          }}
          className="w-full bg-[#111] border border-[#222] rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-[#FF9000] focus:ring-1 focus:ring-[#FF9000] transition-all shadow-inner"
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <Loader2 className="animate-spin text-[#FF9000] mb-4" size={40} />
          <p className="font-medium">Curating study materials...</p>
        </div>
      ) : resources.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#111] border border-[#222] rounded-3xl text-center">
          <div className="w-20 h-20 bg-[#1A1A1A] rounded-2xl flex items-center justify-center mb-4 shadow-inner">
            <LinkIcon size={32} className="text-zinc-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Resources Found</h3>
          <p className="text-zinc-400 max-w-sm">We couldn't find any external study materials matching your criteria.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(groupedResources).map(([subject, subjectResources]) => (
            <div key={subject} className="space-y-4">
              <div className="flex items-center gap-3 border-b border-[#222] pb-3">
                <div className="h-8 w-1 rounded-full bg-[#FF9000]"></div>
                <h2 className="text-xl font-bold text-white">{subject}</h2>
                <span className="bg-[#222] text-zinc-400 text-xs px-2.5 py-1 rounded-full font-medium ml-auto">
                  {subjectResources.length} {subjectResources.length === 1 ? 'Link' : 'Links'}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjectResources.map((resource) => (
                  <a 
                    key={resource._id} 
                    href={resource.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group relative flex items-start gap-4 bg-[#111] border border-[#222] rounded-2xl p-5 hover:border-[#FF9000]/50 hover:bg-[#151515] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FF9000]/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className={`shrink-0 h-12 w-12 rounded-xl flex items-center justify-center shadow-inner ${
                      resource.type === 'youtube' 
                        ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                        : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                    }`}>
                      {resource.type === 'youtube' ? <Youtube size={24} /> : <Globe size={24} />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-zinc-200 group-hover:text-[#FF9000] truncate transition-colors text-base mb-1">
                        {resource.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs font-medium">
                        <span className={`px-2 py-0.5 rounded-full ${
                          resource.type === 'youtube' 
                            ? 'bg-red-500/5 text-red-400' 
                            : 'bg-blue-500/5 text-blue-400'
                        }`}>
                          {resource.type === 'youtube' ? 'YouTube Channel' : 'Educational Website'}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 self-center text-zinc-600 group-hover:text-[#FF9000] transition-colors group-hover:translate-x-1 duration-300">
                      <ExternalLink size={18} />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
