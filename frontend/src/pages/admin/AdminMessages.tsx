import { useState, useEffect } from "react";
import { api } from "../../lib/api";
import { MessageSquare, Calendar, ShieldCheck, Mail } from "lucide-react";
import { motion } from "framer-motion";

interface AdminMessage {
  _id: string;
  text: string;
  sender: {
    name: string;
    email: string;
    avatar: string;
  };
  createdAt: string;
}

export function AdminMessages() {
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data } = await api.get("/messages/admin");
      setMessages(data);
    } catch (error) {
      console.error("Failed to fetch admin messages", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#FF9000] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#FF9000]/10 rounded-lg text-[#FF9000]">
          <MessageSquare size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Requests</h1>
          <p className="text-zinc-400">Messages from students requesting admin access to contribute.</p>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="bg-[#111] border border-white/5 rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-600">
            <Mail size={32} />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No Requests</h3>
          <p className="text-zinc-500 max-w-sm mx-auto">
            You don't have any admin requests at the moment. When students request to join the team, they will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {messages.map((message, index) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={message._id}
              className="bg-[#111] border border-white/5 rounded-xl p-5 md:p-6"
            >
              <div className="flex flex-col md:flex-row gap-4 md:items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={message.sender.avatar || `https://ui-avatars.com/api/?name=${message.sender.name}&background=1a1a1a&color=fff`}
                    alt={message.sender.name}
                    className="w-10 h-10 rounded-full bg-[#1a1a1a]"
                  />
                  <div>
                    <div className="font-medium text-white flex items-center gap-2">
                      {message.sender.name}
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-[#FF9000]/10 text-[#FF9000] border border-[#FF9000]/20 flex items-center gap-1">
                        <ShieldCheck size={10} /> Request
                      </span>
                    </div>
                    <div className="text-sm text-zinc-400">{message.sender.email}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Calendar size={14} />
                  {new Date(message.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit"
                  })}
                </div>
              </div>
              
              <div className="bg-[#0a0a0a] rounded-lg p-4 text-zinc-300 whitespace-pre-wrap text-sm border border-white/5">
                {message.text}
              </div>
              
              <div className="mt-4 flex justify-end gap-2">
                <a 
                  href={`mailto:${message.sender.email}`}
                  className="px-4 py-2 bg-[#FF9000]/10 hover:bg-[#FF9000]/20 text-[#FF9000] rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
                >
                  <Mail size={16} /> Reply via Email
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
