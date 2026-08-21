import React, { useState } from 'react';
import { Link, Zap, Upload, CheckCircle2, AlertCircle, Loader2, Sparkles, RefreshCw, FileText, ArrowRight, Play } from 'lucide-react';
import { Episode, NavTab, SortMode } from '../types';

interface ExtractorViewProps {
  onExtractComplete: (urls: string[]) => void;
  onSelectTab: (tab: NavTab) => void;
}

export const ExtractorView: React.FC<ExtractorViewProps> = ({ onExtractComplete, onSelectTab }) => {
  const [urlsInput, setUrlsInput] = useState<string>(
    'https://www.youtube.com/watch?v=sample_ep1 - নাটক পর্ব ০১\nhttps://www.youtube.com/watch?v=sample_ep2 - নাটক পর্ব ০২\nhttps://www.youtube.com/watch?v=sample_promo - বিশেষ প্রমো ক্লিপ (৩ মিনিট)'
  );
  const [selectedSort, setSelectedSort] = useState<SortMode>('auto_numeric');
  const [minDurationFilter, setMinDurationFilter] = useState<number>(0);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedQueue, setExtractedQueue] = useState<Array<{ id: number; title: string; progress: number; status: 'done' | 'processing' }>>([]);

  const handleExtract = () => {
    const lines = urlsInput.split('\n').filter(line => line.trim().length > 0);
    if (lines.length === 0) return;

    setIsExtracting(true);
    setExtractedQueue([
      { id: 1, title: '১. ইউটিউব লিঙ্ক ও টাইটেল থেকে পর্ব নম্বর বিশ্লেষণ করা হচ্ছে...', progress: 45, status: 'processing' },
      { id: 2, title: '২. সময়কাল (Duration) ও প্রমো/টিজার মেটাডেটা যাচাই করা হচ্ছে...', progress: 80, status: 'processing' },
      { id: 3, title: '৩. ধারাবাহিক ক্রম ও মিসিং গ্যাপ চেক করা হচ্ছে...', progress: 95, status: 'processing' },
    ]);

    setTimeout(() => {
      setExtractedQueue([
        { id: 1, title: 'নাটক পর্ব ০১ - সম্পূর্ণ পর্ব HD (২৪:১৫)', progress: 100, status: 'done' },
        { id: 2, title: 'নাটক পর্ব ০২ - দ্বিতীয় পর্ব HD (২৬:৩০)', progress: 100, status: 'done' },
        { id: 3, title: 'টিজার ও প্রমো ক্লিপ (০২:৪৫) - লেফটওভারে সরানো হয়েছে', progress: 100, status: 'done' },
      ]);
      setIsExtracting(false);
      onExtractComplete(lines);
    }, 1800);
  };

  const handlePresetExample = (type: 'bangla' | 'english' | 'playlist') => {
    if (type === 'bangla') {
      setUrlsInput(
        `https://www.youtube.com/watch?v=ep1 - মেগা সিরিয়াল নাটক পর্ব ০১\nhttps://www.youtube.com/watch?v=ep2 - মেগা সিরিয়াল নাটক পর্ব ০২\nhttps://www.youtube.com/watch?v=ep4 - মেগা সিরিয়াল নাটক পর্ব ০৪\nhttps://www.youtube.com/watch?v=ep5 - মেগা সিরিয়াল নাটক পর্ব ০৫\nhttps://www.youtube.com/watch?v=promo - আগামী পর্বের প্রমো (১ মিনিট)`
      );
    } else if (type === 'english') {
      setUrlsInput(
        `https://www.youtube.com/watch?v=ep1 - Thriller Series Episode 01 Full\nhttps://www.youtube.com/watch?v=ep2 - Thriller Series Episode 02 Full\nhttps://www.youtube.com/watch?v=ep3 - Thriller Series Episode 03 Full`
      );
    } else {
      setUrlsInput(`https://www.youtube.com/playlist?list=PL_SAMPLE_SERIAL_PLAYLIST_ID`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-[#dae2fd]">ইউটিউব সোর্স মিডিয়া ইমপোর্ট ও এক্সট্রাক্টর</h1>
        <p className="text-sm text-[#c7c4d7]">
          ইউটিউব প্লেলিস্টের লিঙ্ক বা ভিডিওর লিংক পেস্ট করে মেটাডেটা, পর্ব নম্বর এবং ধারাবাহিকতা স্বয়ংক্রিয়ভাবে নিষ্কাশন করুন।
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Input Card */}
        <div className="lg:col-span-8 bg-[#171f33] rounded-3xl border border-[#464554]/30 p-6 space-y-5 shadow-lg relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-sm font-bold text-[#dae2fd] flex items-center space-x-2">
              <Link size={18} className="text-[#8083ff]" />
              <span>ইউটিউব লিঙ্ক বা টেক্সট পেস্ট করুন</span>
            </label>

            {/* Quick Sample Presets */}
            <div className="flex items-center space-x-1.5 text-xs">
              <span className="text-[#c7c4d7]/70">নমুনা লিঙ্ক:</span>
              <button
                onClick={() => handlePresetExample('bangla')}
                className="px-2.5 py-1 bg-[#222a3d] hover:bg-[#8083ff]/20 text-[#c0c1ff] rounded-lg font-semibold transition-colors"
              >
                বাংলা নাটক
              </button>
              <button
                onClick={() => handlePresetExample('english')}
                className="px-2.5 py-1 bg-[#222a3d] hover:bg-[#8083ff]/20 text-[#c0c1ff] rounded-lg font-semibold transition-colors"
              >
                English Serial
              </button>
              <button
                onClick={() => handlePresetExample('playlist')}
                className="px-2.5 py-1 bg-[#222a3d] hover:bg-[#8083ff]/20 text-[#c0c1ff] rounded-lg font-semibold transition-colors"
              >
                Playlist URL
              </button>
            </div>
          </div>

          <div className="relative">
            <textarea
              value={urlsInput}
              onChange={(e) => setUrlsInput(e.target.value)}
              placeholder="প্রতি লাইনে একটি করে ইউটিউব লিংক বা প্লেলিস্ট URL পেস্ট করুন..."
              rows={6}
              className="w-full bg-[#060e20] border border-[#464554]/50 rounded-2xl p-4 text-xs font-mono text-[#dae2fd] placeholder-[#c7c4d7]/40 focus:outline-none focus:border-[#8083ff] focus:ring-1 focus:ring-[#8083ff] transition-all resize-none"
            />
          </div>

          {/* Quick Extraction Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#0b1326] p-3.5 rounded-2xl border border-[#464554]/30 text-xs">
            <div>
              <label className="text-[#c7c4d7] block mb-1 font-semibold">সাজানোর বিকল্প (Sort Mode)</label>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value as SortMode)}
                className="w-full bg-[#171f33] border border-[#464554]/40 rounded-xl px-3 py-2 text-[#dae2fd] focus:border-[#8083ff]"
              >
                <option value="auto_numeric">স্বয়ংক্রিয় সংখ্যা ক্রম (১, ২, ৩...)</option>
                <option value="pattern_bangla">বাংলা প্যাটার্ন ('পর্ব ০১', 'পর্ব ০২'...)</option>
                <option value="duration_desc">দীর্ঘতম পর্ব আগে (&gt;২০ মিনিট)</option>
              </select>
            </div>

            <div>
              <label className="text-[#c7c4d7] block mb-1 font-semibold">সময়কাল ফিল্টার (Duration Filter)</label>
              <select
                value={minDurationFilter}
                onChange={(e) => setMinDurationFilter(Number(e.target.value))}
                className="w-full bg-[#171f33] border border-[#464554]/40 rounded-xl px-3 py-2 text-[#dae2fd] focus:border-[#8083ff]"
              >
                <option value={0}>সকল ভিডিও অন্তর্ভুক্ত করুন</option>
                <option value={15}>১৫ মিনিটের বেশি (সম্পূর্ণ নাটক)</option>
                <option value={20}>২০ মিনিটের বেশি (ফুল এপিসোড)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => setUrlsInput('')}
              className="text-xs font-semibold text-[#c7c4d7] hover:text-[#dae2fd] px-3 py-2 rounded-xl hover:bg-[#222a3d] transition-colors"
            >
              টেক্সট মুছুন
            </button>

            <button
              onClick={handleExtract}
              disabled={isExtracting}
              className="px-6 py-3 bg-[#8083ff] hover:bg-[#c0c1ff] text-[#0d0096] font-bold text-xs rounded-xl transition-all shadow-lg shadow-[#8083ff]/20 flex items-center space-x-2 disabled:opacity-50"
            >
              {isExtracting ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
              <span>{isExtracting ? 'মেটাডেটা নিষ্কাশন হচ্ছে...' : 'এক্সট্রাক্ট ও পর্ব সাজান'}</span>
            </button>
          </div>
        </div>

        {/* Info & Drag/Drop Card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#171f33] rounded-3xl border border-[#464554]/30 p-5 space-y-4 shadow-md">
            <h2 className="text-sm font-bold text-[#dae2fd] flex items-center space-x-2">
              <Sparkles size={16} className="text-[#ffb783]" />
              <span>এআই এক্সট্রাক্টর বৈশিষ্ট্যসমূহ</span>
            </h2>

            <ul className="space-y-3 text-xs text-[#c7c4d7]">
              <li className="flex items-start space-x-2.5">
                <CheckCircle2 size={16} className="text-[#8083ff] flex-shrink-0 mt-0.5" />
                <span>টাইটেল থেকে 'পর্ব ০১', 'Episode 1' প্যাটার্ন স্বয়ংক্রিয়ভাবে শনাক্ত করে।</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <CheckCircle2 size={16} className="text-[#8083ff] flex-shrink-0 mt-0.5" />
                <span>ভিডিওর সময়কাল বিশ্লেষণ করে প্রমো ও ছোট ক্লিপ আলাদা করে।</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <CheckCircle2 size={16} className="text-[#8083ff] flex-shrink-0 mt-0.5" />
                <span>ধারাবাহিকতায় কোনো গ্যাপ বা অনুপস্থিত পর্ব থাকলে সতর্ক করে।</span>
              </li>
            </ul>
          </div>

          <div 
            onClick={() => handlePresetExample('bangla')}
            className="bg-[#131b2e] rounded-3xl border-2 border-dashed border-[#464554]/40 p-6 text-center space-y-2 hover:border-[#8083ff]/50 transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#171f33] text-[#c0c1ff] flex items-center justify-center mx-auto">
              <FileText size={18} />
            </div>
            <p className="text-xs font-semibold text-[#dae2fd]">CSV / JSON ফাইল ড্রপ করুন</p>
            <p className="text-[11px] text-[#c7c4d7]/60">অথবা প্রস্তুতকৃত স্যাম্পল ডেটা লোড করুন</p>
          </div>
        </div>
      </div>

      {/* Extraction Queue Preview */}
      {extractedQueue.length > 0 && (
        <div className="bg-[#171f33] rounded-3xl border border-[#464554]/30 p-6 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#dae2fd]">এক্সট্রাকশন প্রগ্রেস কিউ</h3>
            <button
              onClick={() => onSelectTab('workbench')}
              className="text-xs font-semibold text-[#8083ff] hover:underline flex items-center space-x-1"
            >
              <span>ওয়ার্কবেঞ্চে দেখুন</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="space-y-3">
            {extractedQueue.map((item) => (
              <div key={item.id} className="bg-[#0b1326] p-3.5 rounded-2xl border border-[#464554]/20 space-y-2">
                <div className="flex justify-between items-center text-xs font-medium text-[#dae2fd]">
                  <span>{item.title}</span>
                  <span className="text-[#c0c1ff] font-bold">{item.progress}%</span>
                </div>
                <div className="h-2 w-full bg-[#222a3d] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#8083ff] to-[#c0c1ff] rounded-full transition-all duration-500"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
