import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, X, Loader2, RefreshCcw, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { api } from "../../lib/api";

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

export function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm your advanced AI study assistant. How can I help you excel today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Fetch settings to check if chatbot is enabled
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get("/settings");
        setIsEnabled(data.isAiChatbotEnabled);
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      }
    };
    fetchSettings();
  }, []);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isLoading, isOpen]);

  if (!isEnabled) return null;

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage: Message = { role: "user", content: trimmed };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const chatHistory = messages.filter(m => m.role !== "system");
      const payload = { messages: [...chatHistory, userMessage] };
      
      const { data } = await api.post("/ai/chat", payload);
      
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to communicate with AI.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([{ role: "assistant", content: "Chat history cleared. How can I help you?" }]);
    setError(null);
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-[#FF9000] to-[#E58100] text-white shadow-xl shadow-[#FF9000]/20 flex items-center justify-center hover:scale-105 transition-transform"
        >
          <div className="relative">
            <Sparkles size={24} />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-emerald-500 rounded-full border-2 border-[#FF9000]"></span>
          </div>
        </button>
      )}

      {/* Chat Popover */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] h-[600px] max-h-[85vh] max-w-[calc(100vw-3rem)] flex flex-col bg-[#050505] rounded-2xl border border-[#1A1A1A] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200">
          {/* Header */}
          <div className="flex-none p-4 border-b border-[#1A1A1A] bg-[#0A0A0A] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#FF9000] to-[#E58100] flex items-center justify-center shadow-lg shadow-[#FF9000]/20">
                <Sparkles className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-white font-semibold text-base tracking-tight">StuHub AI</h1>
                <p className="text-xs text-emerald-400 font-medium">Online</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={handleClear}
                title="Clear Chat"
                className="p-2 text-zinc-500 hover:text-white hover:bg-[#222] rounded-lg transition-colors"
              >
                <RefreshCcw size={16} />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-zinc-500 hover:text-white hover:bg-[#222] rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} group`}>
                <div className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className="flex-shrink-0 mt-1">
                    {msg.role === "assistant" ? (
                      <div className="h-7 w-7 rounded-full bg-[#111] border border-[#333] flex items-center justify-center text-[#FF9000]">
                        <Bot size={14} />
                      </div>
                    ) : (
                      <div className="h-7 w-7 rounded-full bg-zinc-800 flex items-center justify-center text-white">
                        <User size={14} />
                      </div>
                    )}
                  </div>
                  
                  <div className={`px-4 py-2.5 rounded-2xl ${
                    msg.role === "user" 
                      ? "bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A] border border-[#333] text-white rounded-tr-sm" 
                      : "bg-transparent border border-[#1A1A1A] text-zinc-300 rounded-tl-sm shadow-sm"
                  }`}>
                    {msg.role === "assistant" ? (
                      <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-[#0A0A0A] prose-pre:border prose-pre:border-[#222]">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[85%] flex-row">
                  <div className="flex-shrink-0 mt-1 h-7 w-7 rounded-full bg-[#111] border border-[#333] flex items-center justify-center text-[#FF9000]">
                    <Loader2 size={14} className="animate-spin" />
                  </div>
                  <div className="px-4 py-2.5 rounded-2xl bg-transparent border border-[#1A1A1A] text-zinc-400 rounded-tl-sm flex items-center gap-2">
                    <span className="animate-pulse text-sm">Thinking</span>
                    <div className="flex gap-1">
                      <span className="h-1 w-1 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                      <span className="h-1 w-1 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                      <span className="h-1 w-1 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {error && (
              <div className="text-center bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs">
                {error}
              </div>
            )}
            
            <div ref={endOfMessagesRef} className="h-1" />
          </div>

          {/* Input Area */}
          <div className="flex-none p-3 bg-[#0A0A0A] border-t border-[#1A1A1A]">
            <form 
              onSubmit={handleSend} 
              className="relative flex items-center bg-[#111] border border-[#222] rounded-xl focus-within:border-[#FF9000] focus-within:ring-1 focus-within:ring-[#FF9000]/50 transition-all shadow-inner"
            >
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                placeholder="Ask AI..." 
                className="w-full bg-transparent text-white placeholder:text-zinc-600 pl-4 pr-10 py-3 focus:outline-none text-sm disabled:opacity-50"
              />
              <button 
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-1.5 p-1.5 bg-[#FF9000] text-black rounded-lg hover:bg-[#FF9000]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send size={16} className={input.trim() && !isLoading ? "translate-x-0.5 -translate-y-0.5 transition-transform" : ""} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
