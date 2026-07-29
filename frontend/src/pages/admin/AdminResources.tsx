import { useState, useEffect } from "react";
import { api } from "../../lib/api";
import { Plus, Link, Youtube, Globe, Trash2, Loader2, ExternalLink, AlertCircle, Pencil } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ReportIssueModal } from "../../components/admin/ReportIssueModal";

interface Resource {
  _id: string;
  title: string;
  url: string;
  type: "youtube" | "website";
  subject?: string;
  semester?: number;
  branch?: string;
  createdAt: string;
  user?: { _id: string; name: string };
}

export function AdminResources() {
  const { user } = useAuth();
  const isOwner = user?.role === "owner" || user?.role === "co-owner";

  const [resources, setResources] = useState<Resource[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportItem, setReportItem] = useState({ id: "", type: "", title: "" });

  const [showUpload, setShowUpload] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    type: "youtube" as "youtube" | "website",
    subject: "",
    semester: "",
    branch: ""
  });

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editFormData, setEditFormData] = useState({
    _id: "",
    title: "",
    url: "",
    type: "youtube" as "youtube" | "website",
    subject: "",
    semester: "",
    branch: ""
  });

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      const [res, sub] = await Promise.all([
        api.get("/admin/resources"),
        api.get("/admin/subjects")
      ]);
      setResources(res.data);
      setSubjects(sub.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.url) {
      alert("Title and URL are required.");
      return;
    }

    try {
      setUploadLoading(true);
      await api.post("/admin/resources/link", {
        ...formData,
        semester: formData.semester ? parseInt(formData.semester) : undefined,
        branch: formData.branch || undefined,
        subject: formData.subject || undefined
      });
      setShowUpload(false);
      setFormData({
        title: "",
        url: "",
        type: "youtube",
        subject: "",
        semester: "",
        branch: ""
      });
      loadContent();
    } catch (err: any) {
      alert(err.response?.data?.message || "Upload failed");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleEditClick = (item: Resource) => {
    setEditFormData({
      _id: item._id,
      title: item.title,
      url: item.url,
      type: item.type,
      subject: item.subject || "",
      semester: item.semester ? item.semester.toString() : "",
      branch: item.branch || ""
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData.title || !editFormData.url) {
      alert("Title and URL are required.");
      return;
    }

    try {
      setEditLoading(true);
      await api.put(`/admin/resources/${editFormData._id}`, {
        title: editFormData.title,
        url: editFormData.url,
        type: editFormData.type,
        semester: editFormData.semester ? parseInt(editFormData.semester) : undefined,
        branch: editFormData.branch || undefined,
        subject: editFormData.subject || undefined
      });
      setEditModalOpen(false);
      loadContent();
    } catch (err: any) {
      alert(err.response?.data?.message || "Edit failed");
    } finally {
      setEditLoading(false);
    }
  };

  const deleteResource = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      await api.delete(`/admin/resources/${id}`);
      loadContent();
    } catch (e) {
      console.error(e);
      alert("Failed to delete resource");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-zinc-500">
        <Loader2 className="animate-spin text-[#FF9000]" size={40} />
      </div>
    );
  }

  const branches = ["CSE", "IT", "ET&T", "EE", "MECH", "CIVIL", "MINING"];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Study Resources</h1>
          <p className="text-zinc-400">Manage global or branch-specific YouTube channels and websites.</p>
        </div>
        
        <button
          onClick={() => setShowUpload(true)}
          className="bg-[#FF9000] text-black px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-[#E58100] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#FF9000]/20"
        >
          <Plus size={18} strokeWidth={3} />
          Add Resource
        </button>
      </div>

      <div className="rounded-2xl border border-[#222] bg-[#0A0A0A] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400 border-collapse min-w-[800px]">
            <thead className="bg-[#111] text-xs uppercase border-b border-[#222]">
              <tr>
                <th className="px-5 py-4 font-semibold">Title</th>
                <th className="px-5 py-4 font-semibold">Type</th>
                <th className="px-5 py-4 font-semibold">Target (Branch/Sem/Sub)</th>
                <th className="px-5 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]">
              {resources.map((item) => (
                <tr key={item._id} className="hover:bg-[#111] transition-colors">
                  <td className="px-5 py-4 font-medium text-white flex items-center gap-3">
                    <div className="p-2 bg-[#1A1A1A] rounded-lg">
                      {item.type === 'youtube' ? <Youtube size={16} className="text-red-500" /> : <Globe size={16} className="text-blue-500" />}
                    </div>
                    {item.title}
                  </td>
                  <td className="px-5 py-4 uppercase text-xs font-bold tracking-wider">{item.type}</td>
                  <td className="px-5 py-4">
                    {!item.branch && !item.semester && !item.subject ? (
                      <span className="bg-[#222] px-2 py-1 rounded-md text-xs font-medium">Global</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {item.branch && <span className="bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded text-xs">{item.branch}</span>}
                        {item.semester && <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-xs">Sem {item.semester}</span>}
                        {item.subject && <span className="bg-green-500/10 text-green-400 px-2 py-0.5 rounded text-xs">{item.subject}</span>}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="p-2 text-zinc-500 hover:text-white bg-[#111] hover:bg-[#222] rounded-lg transition-all" title="Visit Link">
                        <ExternalLink size={16} />
                      </a>
                      {isOwner || item.user?._id === user?.id ? (
                        <>
                          <button onClick={() => handleEditClick(item)} className="p-2 text-zinc-500 hover:text-blue-500 bg-[#111] hover:bg-blue-500/10 rounded-lg transition-all" title="Edit">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => deleteResource(item._id, item.title)} className="p-2 text-zinc-500 hover:text-red-500 bg-[#111] hover:bg-red-500/10 rounded-lg transition-all" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setReportItem({ id: item._id, type: "Resource", title: item.title });
                            setReportModalOpen(true);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#FF9000]/10 text-[#FF9000] rounded-lg hover:bg-[#FF9000]/20 transition-colors border border-[#FF9000]/20 ml-2"
                          title="Report Issue"
                        >
                          <AlertCircle size={14} />
                          Report Issue
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {resources.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-zinc-500">
                      <div className="w-16 h-16 bg-[#111] rounded-2xl flex items-center justify-center mb-4 border border-[#222]">
                        <Link size={32} className="opacity-40" />
                      </div>
                      <p className="font-medium text-white mb-1">No resources found.</p>
                      <p className="text-sm">Click "Add Resource" to create one.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#0A0A0A] border border-[#222] rounded-2xl w-full max-w-lg shadow-2xl relative">
            <div className="p-6 border-b border-[#222] flex justify-between items-center bg-[#111] rounded-t-2xl">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Link size={20} className="text-[#FF9000]" />
                Add New Resource
              </h2>
              <button onClick={() => setShowUpload(false)} className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-[#222]">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleUploadSubmit} className="p-6 space-y-5">
              <div className="flex gap-6 mb-4 p-3 bg-[#111] rounded-lg border border-[#222]">
                <label className="flex items-center gap-2 text-sm font-bold text-zinc-300 cursor-pointer hover:text-white transition-colors">
                  <input type="radio" checked={formData.type === "youtube"} onChange={() => setFormData({...formData, type: "youtube"})} className="accent-[#FF9000] w-4 h-4" />
                  YouTube Channel
                </label>
                <label className="flex items-center gap-2 text-sm font-bold text-zinc-300 cursor-pointer hover:text-white transition-colors">
                  <input type="radio" checked={formData.type === "website"} onChange={() => setFormData({...formData, type: "website"})} className="accent-[#FF9000] w-4 h-4" />
                  Website / Article
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Title / Name *</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-[#111] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#FF9000] transition-colors" placeholder="e.g. Neso Academy" />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Resource URL *</label>
                <input required type="url" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} className="w-full bg-[#111] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#FF9000] transition-colors" placeholder="https://..." />
              </div>

              <div className="p-4 bg-[#111] rounded-xl border border-[#222] space-y-4">
                <p className="text-xs text-zinc-400">Leave the below fields empty to make this resource available to everyone (Global).</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Target Branch</label>
                    <select value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#FF9000]">
                      <option value="">All Branches</option>
                      {branches.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Target Semester</label>
                    <select value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#FF9000]">
                      <option value="">All Semesters</option>
                      {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Specific Subject</label>
                  <select value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#FF9000]">
                    <option value="">No specific subject</option>
                    {subjects.map(s => <option key={s._id} value={s.name}>{s.name} ({s.code})</option>)}
                  </select>
                </div>
              </div>

              <button disabled={uploadLoading} type="submit" className="w-full bg-[#FF9000] text-black font-bold py-3 rounded-lg hover:bg-[#E58100] transition-colors disabled:opacity-50 flex justify-center items-center gap-2 mt-6">
                {uploadLoading && <Loader2 className="animate-spin" size={18} />}
                {uploadLoading ? "Adding..." : "Add Resource"}
              </button>
            </form>
          </div>
        </div>
      )}

      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#0A0A0A] border border-[#222] rounded-2xl w-full max-w-lg shadow-2xl relative">
            <div className="p-6 border-b border-[#222] flex justify-between items-center bg-[#111] rounded-t-2xl">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Pencil size={20} className="text-[#FF9000]" />
                Edit Resource
              </h2>
              <button onClick={() => setEditModalOpen(false)} className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-[#222]">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
              <div className="flex gap-6 mb-4 p-3 bg-[#111] rounded-lg border border-[#222]">
                <label className="flex items-center gap-2 text-sm font-bold text-zinc-300 cursor-pointer hover:text-white transition-colors">
                  <input type="radio" checked={editFormData.type === "youtube"} onChange={() => setEditFormData({...editFormData, type: "youtube"})} className="accent-[#FF9000] w-4 h-4" />
                  YouTube Channel
                </label>
                <label className="flex items-center gap-2 text-sm font-bold text-zinc-300 cursor-pointer hover:text-white transition-colors">
                  <input type="radio" checked={editFormData.type === "website"} onChange={() => setEditFormData({...editFormData, type: "website"})} className="accent-[#FF9000] w-4 h-4" />
                  Website / Article
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Title / Name *</label>
                <input required type="text" value={editFormData.title} onChange={e => setEditFormData({...editFormData, title: e.target.value})} className="w-full bg-[#111] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#FF9000] transition-colors" placeholder="e.g. Neso Academy" />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Resource URL *</label>
                <input required type="url" value={editFormData.url} onChange={e => setEditFormData({...editFormData, url: e.target.value})} className="w-full bg-[#111] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#FF9000] transition-colors" placeholder="https://..." />
              </div>

              <div className="p-4 bg-[#111] rounded-xl border border-[#222] space-y-4">
                <p className="text-xs text-zinc-400">Leave the below fields empty to make this resource available to everyone (Global).</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Target Branch</label>
                    <select value={editFormData.branch} onChange={e => setEditFormData({...editFormData, branch: e.target.value})} className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#FF9000]">
                      <option value="">All Branches</option>
                      {branches.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Target Semester</label>
                    <select value={editFormData.semester} onChange={e => setEditFormData({...editFormData, semester: e.target.value})} className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#FF9000]">
                      <option value="">All Semesters</option>
                      {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Specific Subject</label>
                  <select value={editFormData.subject} onChange={e => setEditFormData({...editFormData, subject: e.target.value})} className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#FF9000]">
                    <option value="">No specific subject</option>
                    {subjects.map(s => <option key={s._id} value={s.name}>{s.name} ({s.code})</option>)}
                  </select>
                </div>
              </div>

              <button disabled={editLoading} type="submit" className="w-full bg-[#FF9000] text-black font-bold py-3 rounded-lg hover:bg-[#E58100] transition-colors disabled:opacity-50 flex justify-center items-center gap-2 mt-6">
                {editLoading && <Loader2 className="animate-spin" size={18} />}
                {editLoading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}      <ReportIssueModal 
        isOpen={reportModalOpen} 
        onClose={() => setReportModalOpen(false)} 
        itemId={reportItem.id} 
        itemType={reportItem.type} 
        itemTitle={reportItem.title} 
      />
    </div>
  );
}
