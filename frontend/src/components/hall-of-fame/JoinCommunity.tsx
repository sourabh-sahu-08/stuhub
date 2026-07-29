import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X, Send, ShieldCheck } from "lucide-react";
import { api } from "../../lib/api";

export function JoinCommunity() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    setIsSubmitting(true);
    try {
      await api.post("/messages/admin-request", { message });
      setIsSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setIsSuccess(false);
        setMessage("");
      }, 2000);
    } catch (error) {
      console.error("Failed to send request", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-12 mb-8 md:mt-16 md:mb-12 relative z-20 px-4">
      
      {/* The CTA / Become a part of our community */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">Become a Part of Our Community</h2>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-10">
          Upload your notes, previous year questions, and assignments. Help your peers and earn your spot on the leaderboard.
        </p>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-4 bg-white hover:bg-zinc-200 text-black font-bold rounded-full transition-all inline-flex items-center gap-2 group"
        >
          Start Uploading
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>

      {/* Admin Request Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#111111] border border-white/[0.08] rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="mb-6">
                <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mb-4 border border-amber-500/20 text-amber-500">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Request Admin Access</h3>
                <p className="text-zinc-400 text-sm">
                  Want to contribute materials directly? Write a short message to Sourabh explaining why you'd be a great admin.
                </p>
              </div>

              {isSuccess ? (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="py-12 text-center"
                >
                  <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                    <ShieldCheck size={32} />
                  </div>
                  <h4 className="text-lg font-bold text-white">Request Sent!</h4>
                  <p className="text-zinc-400 text-sm mt-2">Sourabh will review your message soon.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Hey Sourabh, I have lots of notes for IT branch and would love to help..."
                    className="w-full h-32 bg-black border border-white/[0.08] rounded-xl p-4 text-white text-sm focus:outline-none focus:border-amber-500/50 resize-none mb-6 placeholder:text-zinc-600 transition-colors"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || !message.trim()}
                    className="w-full py-3.5 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    ) : (
                      <>
                        Send Request <Send size={16} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
