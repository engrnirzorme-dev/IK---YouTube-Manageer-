import React, { useState } from 'react';
import { Search, Sparkles, Check, Plus, AlertCircle, Link, ShieldCheck, HelpCircle, ArrowRight, Play } from 'lucide-react';
import { Episode, GapCandidate, NavTab } from '../types';

interface GapResolverViewProps {
  missingEpisodeNumber?: number;
  onResolveGap: (newEpisode: Episode) => void;
  onSelectTab: (tab: NavTab) => void;
}

export const GapResolverView: React.FC<GapResolverViewProps> = ({
  missingEpisodeNumber = 3,
  onResolveGap,
  onSelectTab
}) => {
  const [searchQuery, setSearchQuery] = useState(`টিভি সিরিয়াল নাটক পর্ব ০${missingEpisodeNumber} Full Episode HD`);
  const [candidates, setCandidates] = useState<GapCandidate[]>([
    {
      id: 'candidate-1',
      title: `জনপ্রিয় টিভি সিরিয়াল - পর্ব ০${missingEpisodeNumber} (ফুল এপিসোড)`,
      duration: '২২:১৫',
      matchScore: 98,
      matchReason: 'হুবহু টাইটেল ও ধারাবাহিক পর্বের নম্বর মিলেছে',
      channelName: 'অফিসিয়াল নাটক চ্যানেল',
      uploadedTime: '২ দিন আগে',
      url: `https://www.youtube.com/watch?v=sample_ep_${missingEpisodeNumber}`,
      videoId: `sample_ep_${missingEpisodeNumber}`
    },
    {
      id: 'candidate-2',
      title: `টিভি ড্রামা পর্ব ${missingEpisodeNumber} - আনকাট সম্পূর্ণ পর্ব`,
      duration: '২১:৫০',
      matchScore: 85,
      matchReason: 'সময়কাল এবং সিরিয়াল টাইটেল সঙ্গতিপূর্ণ',
      channelName: 'ড্রামা আর্কাইভ বিডি',
      uploadedTime: '১ সপ্তাহ আগে',
      url: `https://www.youtube.com/watch?v=sample_uncut_${missingEpisodeNumber}`,
      videoId: `sample_uncut_${missingEpisodeNumber}`
    }
  ]);

  const [manualUrl, setManualUrl] = useState('');

  const handleInsertCandidate = (cand: GapCandidate) => {
    const newEp: Episode = {
      id: `ep-${Date.now()}`,
      title: cand.title,
      episodeNumber: missingEpisodeNumber,
      duration: cand.duration,
      url: cand.url,
      videoId: cand.videoId,
      summary: `এআই গ্যাপ রেজলভারের মাধ্যমে সংগৃহীত (${cand.matchScore}% নির্ভুলতা)`,
      status: 'verified'
    };
    onResolveGap(newEp);
    onSelectTab('workbench');
  };

  const handleManualAdd = () => {
    if (!manualUrl.trim()) return;
    const newEp: Episode = {
      id: `ep-manual-${Date.now()}`,
      title: `টিভি সিরিয়াল নাটক পর্ব ০${missingEpisodeNumber} (ম্যানুয়াল এন্ট্রি)`,
      episodeNumber: missingEpisodeNumber,
      duration: '২২:০০',
      url: manualUrl,
      videoId: 'manual',
      summary: 'ব্যবহারকারী কর্তৃক সরাসরি লিংক ইনসার্ট করা হয়েছে',
      status: 'verified'
    };
    onResolveGap(newEp);
    onSelectTab('workbench');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#171f33] p-6 rounded-3xl border border-[#464554]/30 shadow-md">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 font-semibold text-xs mb-1">
            <AlertCircle size={15} />
            <span>অনুপস্থিত বা মিসিং পর্ব সনাক্তকরণ</span>
          </div>
          <h1 className="text-2xl font-bold text-[#dae2fd]">গ্যাপ সমাধান: পর্ব ০{missingEpisodeNumber}</h1>
          <p className="text-xs text-[#c7c4d7] mt-1">
            ইউটিউব সার্চ অথবা এআই ক্যান্ডিডেট ফলাফল থেকে সঠিক ভিডিওটি বেছে নিয়ে প্লেলিস্টের গ্যাপ পূরণ করুন।
          </p>
        </div>

        <button
          onClick={() => onSelectTab('workbench')}
          className="px-4 py-2 bg-[#222a3d] hover:bg-[#2d3449] text-[#dae2fd] text-xs font-semibold rounded-xl border border-[#464554]/30 transition-colors"
        >
          ওয়ার্কবেঞ্চে ফিরে যান
        </button>
      </div>

      {/* Search Lookup Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#c7c4d7]/60">
          <Search size={18} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ইউটিউব ভিডিও লিঙ্ক অথবা মিসিং পর্বের নাম লিখুন..."
          className="w-full pl-11 pr-28 py-3.5 bg-[#171f33] border border-[#464554]/50 rounded-2xl text-xs text-[#dae2fd] placeholder-[#c7c4d7]/40 focus:outline-none focus:border-[#8083ff] focus:ring-1 focus:ring-[#8083ff] transition-all shadow-inner"
        />
        <button className="absolute inset-y-1.5 right-1.5 px-5 bg-[#8083ff] text-[#0d0096] font-bold text-xs rounded-xl hover:bg-[#c0c1ff] transition-colors shadow-md">
          অনুসন্ধান
        </button>
      </div>

      {/* Suggested Candidates Header */}
      <div className="flex items-center space-x-2">
        <Sparkles size={18} className="text-[#8083ff]" />
        <h2 className="text-base font-bold text-[#dae2fd]">পর্ব #{missingEpisodeNumber} এর জন্য সম্ভাব্য এআই ম্যাচসমূহ</h2>
        <span className="text-[10px] font-bold text-[#c0c1ff] bg-[#8083ff]/20 px-2.5 py-0.5 rounded-full border border-[#8083ff]/30">
          স্বয়ংক্রিয়ভাবে পরীক্ষিত
        </span>
      </div>

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {candidates.map((cand) => (
          <div
            key={cand.id}
            className="bg-[#171f33] rounded-3xl border border-[#464554]/30 p-5 flex flex-col justify-between space-y-4 hover:border-[#8083ff]/50 transition-all shadow-md group"
          >
            <div className="space-y-3">
              <div className="relative h-36 bg-[#060e20] rounded-2xl overflow-hidden border border-[#464554]/30">
                <img
                  src={`https://img.youtube.com/vi/${cand.videoId}/hqdefault.jpg`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80';
                  }}
                  alt={cand.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80 group-hover:opacity-100"
                />
                <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-mono px-2 py-0.5 rounded backdrop-blur-sm">
                  {cand.duration}
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xs font-bold text-[#dae2fd] line-clamp-2 leading-snug group-hover:text-[#c0c1ff] transition-colors">
                  {cand.title}
                </h3>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center space-x-1 ${
                    cand.matchScore >= 90
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    <ShieldCheck size={12} />
                    <span>{cand.matchScore}% মিল</span>
                  </span>

                  <span className="text-[10px] text-[#c7c4d7]/70 bg-[#222a3d] px-2 py-0.5 rounded-full border border-[#464554]/20">
                    {cand.matchReason}
                  </span>
                </div>

                <p className="text-[11px] text-[#c7c4d7]/60 pt-1">
                  {cand.channelName} • {cand.uploadedTime}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleInsertCandidate(cand)}
              className="w-full py-2.5 bg-[#8083ff] hover:bg-[#c0c1ff] text-[#0d0096] font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center space-x-2"
            >
              <Plus size={16} />
              <span>পর্ব #{missingEpisodeNumber} হিসেবে যুক্ত করুন</span>
            </button>
          </div>
        ))}

        {/* Manual Input Fallback Card */}
        <div className="bg-[#131b2e] rounded-3xl border-2 border-dashed border-[#464554]/40 p-5 flex flex-col justify-between items-center text-center space-y-4 hover:border-[#8083ff]/50 transition-colors">
          <div className="space-y-2 my-auto">
            <div className="w-12 h-12 rounded-2xl bg-[#171f33] text-[#c0c1ff] flex items-center justify-center mx-auto border border-[#464554]/30">
              <Link size={20} />
            </div>
            <h3 className="text-xs font-bold text-[#dae2fd]">সরাসরি লিংক দিয়ে যুক্ত করুন</h3>
            <p className="text-[11px] text-[#c7c4d7]/70 max-w-[220px] mx-auto">
              পর্ব #{missingEpisodeNumber} এর যেকোনো ইউটিউব ভিডিওর ইউআরএল পেস্ট করুন।
            </p>

            <input
              type="text"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full bg-[#060e20] border border-[#464554]/40 rounded-xl px-3 py-2 text-xs text-[#dae2fd] placeholder-[#c7c4d7]/40 focus:outline-none focus:border-[#8083ff]"
            />
          </div>

          <button
            onClick={handleManualAdd}
            disabled={!manualUrl.trim()}
            className="w-full py-2.5 bg-[#222a3d] hover:bg-[#2d3449] text-[#dae2fd] font-bold text-xs rounded-xl border border-[#464554]/40 transition-colors disabled:opacity-40"
          >
            ম্যানুয়ালি নিশ্চিত করুন
          </button>
        </div>
      </div>
    </div>
  );
};
