import React from 'react';
import { Play, History, FolderOpen, ArrowRight, CheckCircle2, AlertTriangle, Layers, Sparkles, Plus, Video, Sliders } from 'lucide-react';
import { NavTab, Episode, ProjectItem } from '../types';

interface DashboardViewProps {
  onSelectTab: (tab: NavTab) => void;
  sequenceCount: number;
  leftoversCount: number;
  gapsCount: number;
  onNewExtraction: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectTab,
  sequenceCount,
  leftoversCount,
  gapsCount,
  onNewExtraction
}) => {
  const mockProjects: ProjectItem[] = [
    {
      id: 'p1',
      title: 'সক্রিয় টিভি সিরিয়াল প্লেলিস্ট',
      status: 'In Progress',
      resolvedCount: sequenceCount || 42,
      leftoversCount: leftoversCount || 12,
      gapsCount: gapsCount || 2,
      thumbnailUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      lastUpdated: 'কিছুক্ষণ আগে'
    },
    {
      id: 'p2',
      title: 'জনপ্রিয় মেগা ড্রামা - সিজন ০১',
      status: 'Reviewing',
      resolvedCount: 28,
      leftoversCount: 5,
      gapsCount: 0,
      thumbnailUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
      lastUpdated: 'গতকাল'
    }
  ];

  const recentActivities = [
    { id: 1, type: 'extraction', text: 'ইউটিউব প্লেলিস্ট থেকে ভিডিও এক্সট্রাক্ট করা হয়েছে', time: '১০ মিনিট আগে', color: 'bg-[#c0c1ff]' },
    { id: 2, type: 'gap', text: `${gapsCount > 0 ? gapsCount : 2} টি মিসিং এপিসোড সনাক্ত করা হয়েছে`, time: '১ ঘণ্টা আগে', color: 'bg-amber-400' },
    { id: 3, type: 'filter', text: 'টিজার ও প্রমো ক্লিপ বাদ দেওয়ার ফিল্টার প্রয়োগ করা হয়েছে', time: '৩ ঘণ্টা আগে', color: 'bg-emerald-400' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#171f33] p-6 rounded-3xl border border-[#464554]/20 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#8083ff]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="relative z-10 space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#dae2fd]">স্বাগতম, এডিটর!</h1>
          <p className="text-sm text-[#c7c4d7]">
            আপনার টিভি সিরিয়াল প্লেলিস্ট ওয়ার্কবেঞ্চ প্রস্তুত ও সিঙ্ক করা আছে।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            onClick={() => onSelectTab('workbench')}
            className="px-5 py-2.5 bg-[#8083ff] hover:bg-[#c0c1ff] text-[#0d0096] font-bold text-sm rounded-xl transition-all shadow-lg shadow-[#8083ff]/20 flex items-center space-x-2"
          >
            <Play size={16} className="fill-current" />
            <span>ওয়ার্কবেঞ্চে যান</span>
          </button>
          
          <button
            onClick={() => onSelectTab('extractor')}
            className="px-4 py-2.5 bg-[#222a3d] hover:bg-[#2d3449] text-[#dae2fd] border border-[#464554]/40 font-semibold text-sm rounded-xl transition-all flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>মিডিয়া ইমপোর্ট</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Activity */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#dae2fd] uppercase tracking-wider flex items-center space-x-2">
              <History size={16} className="text-[#b9c8de]" />
              <span>সাম্প্রতিক কার্যকলাপ</span>
            </h2>
            <button 
              onClick={() => onSelectTab('history')}
              className="text-xs font-semibold text-[#c0c1ff] hover:underline"
            >
              সব দেখুন
            </button>
          </div>

          <div className="bg-[#171f33] rounded-3xl border border-[#464554]/20 p-5 flex-1 flex flex-col justify-between space-y-4 shadow-md">
            <div className="space-y-3">
              {recentActivities.map((act) => (
                <div key={act.id} className="flex items-start space-x-3 p-3 rounded-2xl hover:bg-[#222a3d]/40 transition-colors">
                  <div className={`w-2.5 h-2.5 rounded-full ${act.color} mt-1.5 flex-shrink-0`} />
                  <div className="space-y-0.5">
                    <p className="text-xs text-[#dae2fd] font-medium leading-snug">{act.text}</p>
                    <span className="text-[10px] text-[#c7c4d7]/60 block">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => onSelectTab('history')}
              className="w-full py-2.5 text-xs font-semibold text-[#c0c1ff] hover:text-[#dae2fd] bg-[#222a3d]/50 hover:bg-[#222a3d] rounded-xl border border-[#464554]/30 transition-all flex items-center justify-center space-x-2"
            >
              <span>ভার্সন হিস্ট্রি ও রোলব্যাক</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Right Column: Active Projects */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#dae2fd] uppercase tracking-wider flex items-center space-x-2">
              <FolderOpen size={16} className="text-[#b9c8de]" />
              <span>সক্রিয় প্লেলিস্ট প্রজেক্ট</span>
            </h2>
            <span className="text-xs text-[#c7c4d7]/70">২ টি প্রজেক্ট</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockProjects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => onSelectTab('workbench')}
                className="bg-[#171f33] rounded-3xl border border-[#464554]/20 overflow-hidden hover:border-[#8083ff]/50 transition-all cursor-pointer group shadow-md hover:shadow-xl hover:shadow-[#8083ff]/5"
              >
                <div className="relative h-36 bg-[#222a3d] overflow-hidden">
                  <img
                    src={proj.thumbnailUrl}
                    alt={proj.title}
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#171f33] via-[#171f33]/30 to-transparent" />
                  
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 bg-[#0b1326]/80 text-[#c0c1ff] border border-[#8083ff]/30 text-[10px] font-bold rounded-full backdrop-blur-md">
                      {proj.status === 'In Progress' ? 'চলমান' : 'পর্যালোচনা'}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="text-base font-bold text-[#dae2fd] truncate group-hover:text-[#c0c1ff] transition-colors">
                      {proj.title}
                    </h3>
                    <span className="text-[11px] text-[#c7c4d7]/70">আপডেট: {proj.lastUpdated}</span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {/* Metric Chips */}
                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    <div className="bg-[#131b2e] p-2 rounded-xl border border-[#464554]/20">
                      <span className="text-sm font-bold text-[#dae2fd] block">{proj.resolvedCount}</span>
                      <span className="text-[10px] uppercase font-semibold text-emerald-400">ধারাবাহিক</span>
                    </div>

                    <div className="bg-[#131b2e] p-2 rounded-xl border border-[#464554]/20">
                      <span className="text-sm font-bold text-[#dae2fd] block">{proj.leftoversCount}</span>
                      <span className="text-[10px] uppercase font-semibold text-[#b9c8de]">লেফটওভার</span>
                    </div>

                    <div className="bg-[#131b2e] p-2 rounded-xl border border-[#464554]/20">
                      <span className="text-sm font-bold text-amber-300 block">{proj.gapsCount}</span>
                      <span className="text-[10px] uppercase font-semibold text-amber-400">মিসিং গ্যাপ</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold text-[#c0c1ff] pt-1 group-hover:translate-x-1 transition-transform">
                    <span>ওয়ার্কবেঞ্চে ওপেন করুন</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
