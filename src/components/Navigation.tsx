import React from 'react';
import { 
  LayoutDashboard, Wand2, SlidersHorizontal, History, Settings, 
  Tv2, Send, CheckCircle2, User, LogOut, ArrowRight, Layers, Globe
} from 'lucide-react';
import { NavTab } from '../types';
import { User as FirebaseUser } from 'firebase/auth';

interface NavigationProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  user: FirebaseUser | null;
  onLogout: () => void;
  gapsCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  user,
  onLogout,
  gapsCount = 0
}) => {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'ড্যাশবোর্ড', enLabel: 'Dashboard', icon: LayoutDashboard },
    { id: 'extractor' as NavTab, label: 'এক্সট্রাক্টর', enLabel: 'Extractor', icon: Wand2 },
    { id: 'workbench' as NavTab, label: 'ওয়ার্কবেঞ্চ', enLabel: 'Workbench', icon: SlidersHorizontal },
    { 
      id: 'gap-resolver' as NavTab, 
      label: 'গ্যাপ রেজলভার', 
      enLabel: 'Gap Resolver',
      icon: Layers, 
      badge: gapsCount > 0 ? gapsCount : undefined 
    },
    { id: 'publish' as NavTab, label: 'পাবলিশ ও এক্সপোর্ট', enLabel: 'Publish', icon: Send },
    { id: 'history' as NavTab, label: 'হিস্ট্রি স্ন্যাপশট', enLabel: 'History', icon: History },
    { id: 'settings' as NavTab, label: 'সেটিংস', enLabel: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Top Bar Header */}
      <header className="fixed top-0 left-0 w-full z-40 h-16 bg-[#0b1326] border-b border-[#464554]/20 px-4 md:px-8 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div 
            onClick={() => onSelectTab('dashboard')} 
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 bg-[#8083ff]/20 text-[#c0c1ff] rounded-xl flex items-center justify-center border border-[#8083ff]/30 group-hover:bg-[#8083ff]/30 transition-colors shadow-sm">
              <Tv2 size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#c0c1ff] tracking-tight leading-none">EpisodeFlow</h1>
              <span className="text-[10px] text-[#c7c4d7]/70 font-medium">এআই টিভি সিরিয়াল প্লেলিস্ট ওয়ার্কবেঞ্চ</span>
            </div>
          </div>
        </div>

        {/* Desktop Quick Nav Tabs */}
        <nav className="hidden lg:flex items-center space-x-1 bg-[#131b2e] p-1 rounded-xl border border-[#464554]/30">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all relative ${
                  isActive 
                    ? 'bg-[#8083ff] text-[#0d0096] shadow-sm' 
                    : 'text-[#c7c4d7] hover:text-[#dae2fd] hover:bg-[#222a3d]/50'
                }`}
              >
                <Icon size={14} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className={`px-1.5 py-0.5 text-[10px] rounded-full font-bold ${
                    isActive ? 'bg-[#0d0096] text-white' : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Info & Actions */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 bg-[#171f33] px-3 py-1.5 rounded-full border border-[#464554]/30">
            <div className="w-5 h-5 rounded-full bg-[#8083ff]/30 text-[#c0c1ff] flex items-center justify-center text-[10px] font-bold">
              {user?.displayName ? user.displayName[0].toUpperCase() : 'U'}
            </div>
            <span className="text-xs font-medium text-[#dae2fd] max-w-[120px] truncate">
              {user?.displayName || user?.email || 'ইউজার'}
            </span>
          </div>

          <button
            onClick={onLogout}
            title="লগ আউট করুন"
            className="p-2 text-[#c7c4d7] hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Desktop Sidebar (Left side) */}
      <aside className="hidden md:flex flex-col fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-[#131b2e] border-r border-[#464554]/20 z-30 py-6 px-4">
        <div className="text-[11px] font-bold text-[#c7c4d7]/60 tracking-wider uppercase px-3 mb-3">
          ওয়ার্কস্পেস ভিউ
        </div>

        <div className="space-y-1.5 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#8083ff]/15 text-[#c0c1ff] border-l-4 border-[#8083ff] font-semibold'
                    : 'text-[#c7c4d7] hover:text-[#dae2fd] hover:bg-[#171f33]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon size={18} className={isActive ? 'text-[#c0c1ff]' : 'text-[#c7c4d7]/70'} />
                  <div className="text-left">
                    <span className="block leading-tight font-semibold">{item.label}</span>
                    <span className="text-[10px] text-[#c7c4d7]/50 block">{item.enLabel}</span>
                  </div>
                </div>
                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 text-[11px] bg-amber-500/20 text-amber-300 font-bold rounded-full border border-amber-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Engine Card */}
        <div className="p-4 bg-[#171f33] rounded-xl border border-[#464554]/30 text-xs">
          <div className="flex items-center justify-between text-[#c7c4d7] mb-2 font-semibold">
            <span>EpisodeFlow ইঞ্জিন</span>
            <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> সক্রিয়
            </span>
          </div>
          <p className="text-[11px] text-[#c7c4d7]/70 leading-relaxed">
            স্বয়ংক্রিয় সিরিয়াল নম্বর বিশ্লেষণ, মিসিং এপিসোড সনাক্তকরণ ও প্রমো ক্লিপ ফিল্টারিং।
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-[#171f33] border-t border-[#464554]/30 px-2 py-2 flex justify-around items-center shadow-2xl">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors relative ${
                isActive ? 'text-[#c0c1ff]' : 'text-[#c7c4d7]/70 hover:text-[#dae2fd]'
              }`}
            >
              <div className={`p-1.5 rounded-full ${isActive ? 'bg-[#8083ff]/20' : ''}`}>
                <Icon size={18} />
              </div>
              <span className="mt-0.5">{item.label}</span>
              {item.badge !== undefined && (
                <span className="absolute -top-1 right-1 w-4 h-4 bg-amber-500 text-gray-950 rounded-full text-[9px] font-bold flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};
