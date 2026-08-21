import React, { useState, useRef, useEffect } from 'react';
import { Send, User as UserIcon, Bot, PlayCircle, Sparkles, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
}

interface ChatInterfaceProps {
  onPlaylistGenerated: (playlist: any) => void;
  uid: string;
  finalPlaylist: any[] | null;
  externalPrompt?: string | null;
  onClearExternalPrompt?: () => void;
}

export function ChatInterface({ onPlaylistGenerated, uid, finalPlaylist, externalPrompt, onClearExternalPrompt }: ChatInterfaceProps) {
  const [history, setHistory] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'পর্বের ধারাবাহিকতা চেক করো এবং মিসিং পর্বগুলো খুঁজে বের করো',
    'প্রমো ও শর্ট ক্লিপগুলো বাদ দিয়ে শুধু মূল পর্বগুলো সাজাও',
    'বাংলা টাইটেল \'পর্ব ০১\' ফরম্যাটে সাজাও'
  ];

  const sendPrompt = async (promptText: string) => {
    if (!promptText.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', parts: [{ text: promptText }] };
    setHistory(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: promptText, history, currentPlaylist: finalPlaylist })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        let displayError = "দুঃখিত, এআই সার্ভারে সংযোগে ত্রুটি দেখা দিয়েছে। দয়া করে পুনরায় চেষ্টা করুন।";
        
        try {
          const rawError = errorData.error;
          if (rawError) {
            let parsed = rawError;
            if (typeof rawError === 'string') {
              try {
                parsed = JSON.parse(rawError);
              } catch (_) {}
            }
            
            const errMsg = parsed?.error?.message || parsed?.message || String(rawError);
            if (errMsg.toLowerCase().includes("quota") || errMsg.toLowerCase().includes("resource_exhausted") || errMsg.includes("429")) {
              displayError = "⚠️ **Gemini API কোটা সীমা পূর্ণ হয়েছে (429)**\n\nদয়া করে এক মিনিট অপেক্ষা করে পুনরায় মেসেজ পাঠান।";
            } else {
              displayError = `⚠️ **এপিআই বার্তা:**\n\n${errMsg}`;
            }
          }
        } catch (e) {
          console.error("Failed to parse detailed error", e);
        }
        
        throw new Error(displayError);
      }

      const data = await res.json();
      
      const modelMessage: Message = { role: 'model', parts: [{ text: data.text }] };
      setHistory(prev => [...prev, modelMessage]);

      if (data.playlist) {
        onPlaylistGenerated(data.playlist);
      }

    } catch (error: any) {
      console.error(error);
      const errorMessage: Message = { role: 'model', parts: [{ text: error.message || "ত্রুটি দেখা দিয়েছে।" }] };
      setHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (externalPrompt && externalPrompt.trim()) {
      sendPrompt(externalPrompt);
      if (onClearExternalPrompt) onClearExternalPrompt();
    }
  }, [externalPrompt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendPrompt(input);
  };

  return (
    <div className="flex flex-col h-[740px] border border-[#464554]/30 rounded-3xl bg-[#171f33] shadow-xl overflow-hidden">
      {/* Top Header */}
      <div className="px-5 py-3.5 bg-[#131b2e] border-b border-[#464554]/30 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-[#dae2fd]">এআই প্লেলিস্ট অ্যাসিস্ট্যান্ট</span>
        </div>
        <span className="text-[10px] text-[#c0c1ff] font-semibold bg-[#8083ff]/15 px-2.5 py-0.5 rounded-full border border-[#8083ff]/30">
          Gemini Powered
        </span>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {history.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-[#c7c4d7] space-y-4 px-4">
            <div className="w-12 h-12 rounded-2xl bg-[#8083ff]/20 text-[#c0c1ff] flex items-center justify-center border border-[#8083ff]/30">
              <Sparkles size={24} />
            </div>
            <div className="text-center max-w-sm space-y-1">
              <h3 className="font-bold text-[#dae2fd] text-sm">টিভি সিরিয়াল প্লেলিস্ট সাজান</h3>
              <p className="text-xs text-[#c7c4d7]/70 leading-relaxed">
                ইউটিউব লিঙ্ক বা পর্বের তালিকা পেস্ট করুন। এআই স্বয়ংক্রিয়ভাবে পর্ব নম্বর, সময়কাল ও ধারাবাহিকতা বিশ্লেষণ করবে।
              </p>
            </div>

            {/* Quick Prompts Chips */}
            <div className="w-full max-w-sm space-y-2 pt-2">
              <span className="text-[11px] font-semibold text-[#c7c4d7]/60 block text-center">দ্রুত নির্দেশসমূহ:</span>
              {quickPrompts.map((qPrompt, idx) => (
                <button
                  key={idx}
                  onClick={() => sendPrompt(qPrompt)}
                  className="w-full text-left p-2.5 rounded-xl bg-[#0b1326] hover:bg-[#222a3d] border border-[#464554]/30 hover:border-[#8083ff]/40 text-xs text-[#dae2fd] transition-all flex items-center justify-between group"
                >
                  <span className="truncate">{qPrompt}</span>
                  <Send size={12} className="text-[#8083ff] opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {history.map((msg, i) => (
          <div key={i} className={cn("flex gap-3 max-w-[88%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "")}>
            <div className={cn(
              "w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold",
              msg.role === 'user' ? "bg-[#8083ff] text-[#0d0096]" : "bg-[#222a3d] text-[#c0c1ff] border border-[#464554]/30"
            )}>
              {msg.role === 'user' ? <UserIcon size={14} /> : <Bot size={14} />}
            </div>
            <div className={cn(
              "px-4 py-3 rounded-2xl text-xs",
              msg.role === 'user' 
                ? "bg-[#8083ff] text-[#0d0096] font-semibold rounded-tr-none shadow-md" 
                : "bg-[#0b1326] text-[#dae2fd] rounded-tl-none border border-[#464554]/30 shadow-sm"
            )}>
              {msg.role === 'user' ? (
                <p className="whitespace-pre-wrap leading-relaxed">{msg.parts[0].text}</p>
              ) : (
                <div className="prose prose-invert prose-sm leading-relaxed max-w-none text-xs">
                  <ReactMarkdown>{msg.parts[0].text}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 max-w-[85%]">
            <div className="w-7 h-7 rounded-xl bg-[#222a3d] text-[#c0c1ff] border border-[#464554]/30 flex items-center justify-center flex-shrink-0">
              <Bot size={14} />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-[#0b1326] text-[#dae2fd] rounded-tl-none border border-[#464554]/30 flex items-center space-x-2">
              <div className="w-2 h-2 bg-[#8083ff] rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-[#8083ff] rounded-full animate-bounce delay-75"></div>
              <div className="w-2 h-2 bg-[#8083ff] rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSubmit} className="p-3 bg-[#131b2e] border-t border-[#464554]/30">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="প্লেলিস্ট লিঙ্ক বা কোনো নির্দেশ লিখুন..."
            className="w-full pl-4 pr-12 py-3 rounded-xl bg-[#0b1326] border border-[#464554]/40 text-xs text-[#dae2fd] placeholder-[#c7c4d7]/40 focus:outline-none focus:border-[#8083ff] transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 text-[#0d0096] bg-[#8083ff] hover:bg-[#c0c1ff] rounded-lg disabled:opacity-40 transition-colors"
          >
            <Send size={15} />
          </button>
        </div>
      </form>
    </div>
  );
}
