import React, { useState } from 'react';
import { User as UserIcon, Key, RefreshCw, SlidersHorizontal, Check, Moon, Sun, Monitor, LogOut, Globe } from 'lucide-react';
import { User } from 'firebase/auth';

interface SettingsViewProps {
  user: User | null;
  onLogout: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ user, onLogout }) => {
  const [youtubeApiAccess, setYoutubeApiAccess] = useState(true);
  const [autoSaveWorkbench, setAutoSaveWorkbench] = useState(true);
  const [defaultFilterRule, setDefaultFilterRule] = useState('বাংলা সিরিয়াল ও নাটক');

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-[#dae2fd]">সেটিংস ও পছন্দসমূহ (Settings)</h1>
        <p className="text-sm text-[#c7c4d7]">
          আপনার একাউন্ট, ইউটিউব এপিআই অ্যাক্সেস এবং ওয়ার্কবেঞ্চের ডিফল্ট প্রেফারেন্স পরিচালনা করুন।
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Section */}
        <div className="bg-[#171f33] rounded-3xl border border-[#464554]/30 p-6 space-y-5 shadow-lg">
          <div className="flex items-center space-x-2 text-[#8083ff]">
            <UserIcon size={20} />
            <h2 className="text-sm font-bold text-[#dae2fd]">একাউন্ট সংযোগ</h2>
          </div>

          <div className="p-4 bg-[#0b1326] rounded-2xl border border-[#464554]/30 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-[#dae2fd] block">গুগল একাউন্ট</span>
              <span className="text-[11px] text-[#c7c4d7]/70 block truncate max-w-[180px]">
                {user?.email || 'user@episodeflow.com'}
              </span>
            </div>

            <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-full border border-emerald-500/30">
              সক্রিয় সেশন
            </span>
          </div>

          <button
            onClick={onLogout}
            className="w-full py-2.5 bg-[#222a3d] hover:bg-rose-500/20 text-[#dae2fd] hover:text-rose-300 text-xs font-semibold rounded-xl border border-[#464554]/30 transition-colors flex items-center justify-center space-x-2"
          >
            <LogOut size={16} />
            <span>লগ আউট করুন</span>
          </button>
        </div>

        {/* Permissions Section */}
        <div className="bg-[#171f33] rounded-3xl border border-[#464554]/30 p-6 space-y-5 shadow-lg">
          <div className="flex items-center space-x-2 text-[#8083ff]">
            <Key size={20} />
            <h2 className="text-sm font-bold text-[#dae2fd]">এপিআই ও পারমিশন</h2>
          </div>

          <div className="p-4 bg-[#0b1326] rounded-2xl border border-[#464554]/30 flex items-center justify-between">
            <div className="space-y-0.5 pr-2">
              <span className="text-xs font-bold text-[#dae2fd] block">ইউটিউব এপিআই কানেকশন</span>
              <span className="text-[11px] text-[#c7c4d7]/70 block">
                প্লেলিস্ট তৈরি ও মেটাডেটা সিঙ্কের জন্য সক্রিয়
              </span>
            </div>

            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={youtubeApiAccess}
                onChange={(e) => setYoutubeApiAccess(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#2d3449] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8083ff]"></div>
            </label>
          </div>

          <p className="text-[11px] text-[#c7c4d7]/60 leading-relaxed">
            পারমিশন সক্রিয় থাকলে প্লেলিস্ট ব্যাকগ্রাউন্ডে ইউটিউব চ্যানেলের সাথে স্বয়ংক্রিয়ভাবে সিঙ্ক থাকবে।
          </p>
        </div>

        {/* Sync & Storage Section */}
        <div className="bg-[#171f33] rounded-3xl border border-[#464554]/30 p-6 space-y-5 shadow-lg">
          <div className="flex items-center space-x-2 text-[#b9c8de]">
            <RefreshCw size={20} />
            <h2 className="text-sm font-bold text-[#dae2fd]">অটো-সেভ ও ক্লাউড স্টোরেজ</h2>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-[#dae2fd] block">ওয়ার্কবেঞ্চ অটো-সেভ</span>
              <span className="text-[11px] text-[#c7c4d7]/70 block">
                প্রতিটি পরিবর্তনের পর লোকাল স্টোরেজে সেভ হয়
              </span>
            </div>

            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={autoSaveWorkbench}
                onChange={(e) => setAutoSaveWorkbench(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#2d3449] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8083ff]"></div>
            </label>
          </div>

          <div className="p-3.5 bg-[#0b1326] rounded-2xl border border-[#464554]/30 space-y-2">
            <div className="flex justify-between text-xs text-[#dae2fd]">
              <span>লোকাল স্টোরেজ স্ট্যাটাস</span>
              <span className="text-emerald-400 font-bold">সিঙ্ক করা হয়েছে</span>
            </div>
            <div className="w-full bg-[#222a3d] h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#8083ff] h-full w-[100%] rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-[#171f33] rounded-3xl border border-[#464554]/30 p-6 space-y-5 shadow-lg">
          <div className="flex items-center space-x-2 text-[#ffb783]">
            <SlidersHorizontal size={20} />
            <h2 className="text-sm font-bold text-[#dae2fd]">ভাষা ও ডিফল্ট পছন্দসমূহ</h2>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#c7c4d7]">ডিফল্ট প্লেলিস্ট টাইপ</label>
            <select
              value={defaultFilterRule}
              onChange={(e) => setDefaultFilterRule(e.target.value)}
              className="w-full bg-[#060e20] border border-[#464554]/40 rounded-xl px-3.5 py-2.5 text-xs text-[#dae2fd] focus:outline-none focus:border-[#8083ff]"
            >
              <option>বাংলা সিরিয়াল ও মেগা নাটক</option>
              <option>কঠোর ধারাবাহিক ক্রম ফিল্টারিং</option>
              <option>সকল টিজার ও প্রমো ক্লিপ বাদ</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#c7c4d7]">ইন্টারফেস থিম</label>
            <div className="grid grid-cols-3 gap-2">
              <button className="py-2.5 rounded-xl border border-[#8083ff] bg-[#8083ff]/15 text-[#c0c1ff] text-xs font-bold flex items-center justify-center space-x-1.5">
                <Moon size={14} />
                <span>ডার্ক</span>
              </button>
              <button className="py-2.5 rounded-xl border border-[#464554]/30 text-[#c7c4d7] text-xs font-semibold flex items-center justify-center space-x-1.5 hover:bg-[#222a3d]">
                <Sun size={14} />
                <span>লাইট</span>
              </button>
              <button className="py-2.5 rounded-xl border border-[#464554]/30 text-[#c7c4d7] text-xs font-semibold flex items-center justify-center space-x-1.5 hover:bg-[#222a3d]">
                <Monitor size={14} />
                <span>সিস্টেম</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
