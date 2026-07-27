import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import { Send, Users, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatUser {
  _id: string;
  name: string;
  avatar?: string;
  role: string;
}

interface Message {
  _id: string;
  text: string;
  sender: ChatUser;
  createdAt: string;
}

const ChatAvatar = ({ user }: { user: ChatUser }) => {
  const [error, setError] = useState(false);
  
  if (user.avatar && !error) {
    return (
      <img 
        src={user.avatar} 
        alt={user.name} 
        className="w-8 h-8 rounded-full object-cover shrink-0" 
        onError={() => setError(true)} 
      />
    );
  }
  
  return (
    <div className="w-8 h-8 rounded-full bg-surface-container border border-outline flex items-center justify-center text-xs font-medium text-on-surface shrink-0">
      {user.name.charAt(0).toUpperCase()}
    </div>
  );
};

export function ChatPage() {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!token) return;

    // Use environment variable for backend URL, fallback to localhost for development
    const backendUrl = import.meta.env.MODE === "production"
      ? "/"
      : (import.meta.env.VITE_API_URL?.replace('/api', '') || `http://${window.location.hostname}:5000`);
    
    const newSocket = io(backendUrl, {
      auth: { token },
      withCredentials: true
    });

    newSocket.on("connect_error", (err) => {
      setError("Failed to connect to chat server.");
      console.error(err);
    });

    newSocket.on("chat_history", (history: Message[]) => {
      setMessages(history);
    });

    newSocket.on("receive_message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !socket) return;

    socket.emit("send_message", inputText);
    setInputText("");
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-surface overflow-hidden">
      {/* Header */}
      <div className="h-16 flex-none bg-surface-container border-b border-outline px-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-semibold text-on-surface">Community Chat</h1>
            <p className="text-xs text-on-surface-variant font-mono">Live campus discussions</p>
          </div>
        </div>
        
        {/* Connection Status */}
        <div className="flex items-center gap-2">
          {error ? (
            <span className="flex items-center gap-1.5 text-xs text-error font-medium bg-error/10 px-3 py-1.5 rounded-full">
              <AlertCircle className="w-3.5 h-3.5" /> {error}
            </span>
          ) : socket?.connected ? (
            <span className="flex items-center gap-1.5 text-xs text-green-500 font-medium bg-green-500/10 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Connected
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-yellow-500 font-medium bg-yellow-500/10 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" /> Connecting...
            </span>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar bg-black/20">
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => {
            const isMe = msg.sender._id === user?.id;
            const showAvatar = index === 0 || messages[index - 1].sender._id !== msg.sender._id;

            return (
              <motion.div
                key={msg._id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 max-w-[85%] ${isMe ? "self-end flex-row-reverse" : "self-start"}`}
              >
                {!isMe && (
                  <div className="flex-shrink-0 w-8">
                    {showAvatar && <ChatAvatar user={msg.sender} />}
                  </div>
                )}
                
                <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  {!isMe && showAvatar && (
                    <div className="flex items-center gap-2 mb-1 pl-1">
                      <span className="text-xs font-medium text-on-surface-variant">{msg.sender.name}</span>
                      {msg.sender.role === 'admin' && (
                        <span className="text-[10px] uppercase font-bold tracking-wider bg-primary/20 text-primary px-1.5 py-0.5 rounded">Admin</span>
                      )}
                    </div>
                  )}
                  <div
                    className={`px-4 py-2.5 rounded-2xl relative ${
                      isMe 
                        ? "bg-primary text-on-primary rounded-tr-sm" 
                        : "bg-surface-container text-on-surface border border-outline rounded-tl-sm"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    <span 
                      className={`text-[10px] mt-1 block ${isMe ? "text-on-primary/70 text-right" : "text-on-surface-variant"}`}
                    >
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-surface-container border-t border-outline flex-none">
        <form onSubmit={sendMessage} className="max-w-4xl mx-auto flex items-end gap-3 relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(e);
              }
            }}
            placeholder="Type a message... (Shift+Enter for new line)"
            className="flex-1 bg-surface border border-outline rounded-2xl py-3 px-4 pr-12 text-sm text-on-surface focus:outline-none focus:border-primary resize-none custom-scrollbar min-h-[52px] max-h-32 transition-colors"
            rows={1}
            style={{ 
              height: inputText ? (inputText.split('\n').length * 20 + 32 + 'px') : '52px'
            }}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || !socket?.connected}
            className={`absolute right-2 bottom-2 w-9 h-9 flex items-center justify-center rounded-xl transition-all ${
              inputText.trim() && socket?.connected
                ? "bg-primary text-on-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                : "bg-surface text-on-surface-variant cursor-not-allowed"
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
