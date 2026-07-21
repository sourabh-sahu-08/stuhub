import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Loader2, RefreshCcw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { api } from "../lib/api";

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

export function AiChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm your advanced AI study assistant. How can I help you excel today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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
      const chatHistory = messages.filter(m => m.role !== "system"); // Keep simple context
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
    <div className="flex flex-col h-full bg-[#050505] relative overflow-hidden rounded-2xl border border-[#1A1A1A]">
      {/* Header */}
      <div className="flex-none p-4 border-b border-[#1A1A1A] bg-[#0A0A0A]/80 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#FF9000] to-[#E58100] flex items-center justify-center shadow-lg shadow-[#FF9000]/20">
            <Sparkles className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-white font-semibold text-base tracking-tight">StuHub AI</h1>
            <p className="text-xs text-zinc-500 font-medium flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Llama 3 Powered
            </p>
          </div>
        </div>
        <button 
          onClick={handleClear}
          title="Clear Chat"
          className="p-2 text-zinc-500 hover:text-white hover:bg-[#222] rounded-lg transition-colors"
        >
          <RefreshCcw size={18} />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-hide">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} group`}>
            <div className={`flex gap-4 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              {/* Avatar */}
              <div className="flex-shrink-0">
                {msg.role === "assistant" ? (
                  <div className="h-8 w-8 rounded-full bg-[#111] border border-[#333] flex items-center justify-center text-[#FF9000]">
                    <Bot size={16} />
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-white">
                    <User size={16} />
                  </div>
                )}
              </div>
              
              {/* Message Bubble */}
              <div className={`px-5 py-3.5 rounded-2xl ${
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
            <div className="flex gap-4 max-w-[85%] flex-row">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[#111] border border-[#333] flex items-center justify-center text-[#FF9000]">
                <Loader2 size={16} className="animate-spin" />
              </div>
              <div className="px-5 py-3.5 rounded-2xl bg-transparent border border-[#1A1A1A] text-zinc-400 rounded-tl-sm flex items-center gap-2">
                <span className="animate-pulse">Thinking</span>
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
          <div className="mx-auto text-center max-w-md bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <div ref={endOfMessagesRef} className="h-4" />
      </div>

      {/* Input Area */}
      <div className="flex-none p-4 bg-[#0A0A0A] border-t border-[#1A1A1A]">
        <form 
          onSubmit={handleSend} 
          className="max-w-4xl mx-auto relative flex items-center bg-[#111] border border-[#222] rounded-xl focus-within:border-[#FF9000] focus-within:ring-1 focus-within:ring-[#FF9000]/50 transition-all shadow-inner"
        >
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Ask StuHub AI anything..." 
            className="w-full bg-transparent text-white placeholder:text-zinc-600 px-5 py-4 focus:outline-none text-sm disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2.5 bg-[#FF9000] text-black rounded-lg hover:bg-[#FF9000]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send size={18} className={input.trim() && !isLoading ? "translate-x-0.5 -translate-y-0.5 transition-transform" : ""} />
          </button>
        </form>
        <p className="text-center text-[10px] text-zinc-600 mt-3 font-medium">
          StuHub AI can make mistakes. Consider verifying important information.
        </p>
      </div>
    </div>
  );
}
