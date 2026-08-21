import React, { useState, useEffect } from 'react';
import { 
  Send, CheckCircle2, Download, ShieldCheck, Eye, EyeOff, Save, Play, Clock, 
  HardDrive, Share2, Loader2, Sparkles, AlertCircle, Copy, ExternalLink, RefreshCw, XCircle
} from 'lucide-react';
import { Episode, NavTab } from '../types';

interface PublishViewProps {
  sequence: Episode[];
  onSelectTab: (tab: NavTab) => void;
  onSaveSnapshot: (title: string) => void;
}

type RenderPhase = 'idle' | 'analyzing' | 'rendering_assets' | 'syncing_youtube' | 'completed';

export const PublishView: React.FC<PublishViewProps> = ({
  sequence,
  onSelectTab,
  onSaveSnapshot
}) => {
  const [privacy, setPrivacy] = useState<'unlisted' | 'public' | 'private'>('unlisted');
  const [saveSnapshotCheck, setSaveSnapshotCheck] = useState(true);
  const [playlistTitle, setPlaylistTitle] = useState('টিভি সিরিয়াল সম্পূর্ণ প্লেলিস্ট - সিজন ০১');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Rendering & Export Progress Simulation
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [renderPhase, setRenderPhase] = useState<RenderPhase>('idle');
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const totalRuntimeSeconds = sequence.reduce((acc, ep) => {
    if (ep.durationSeconds) return acc + ep.durationSeconds;
    if (ep.duration) {
      const parts = ep.duration.split(':').map(Number);
      if (parts.length === 2) return acc + parts[0] * 60 + parts[1];
    }
    return acc + 1320; // Default ~22 mins
  }, 0);

  const formatRuntime = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    if (hours > 0) return `${hours} ঘণ্টা ${mins} মিনিট`;
    return `${mins} মিনিট`;
  };

  // Run simulated rendering / export process
  const startPublishPipeline = () => {
    setIsExporting(true);
    setExportProgress(5);
    setRenderPhase('analyzing');
    setPublishedUrl(null);

    // Phase 1: Analyzing (0% -> 30%)
    setTimeout(() => {
      setExportProgress(30);
      setRenderPhase('rendering_assets');
    }, 900);

    // Phase 2: Rendering Assets & Thumbnails (30% -> 70%)
    setTimeout(() => {
      setExportProgress(70);
      setRenderPhase('syncing_youtube');
    }, 2000);

    // Phase 3: Syncing to YouTube (70% -> 100%)
    setTimeout(() => {
      setExportProgress(100);
      setRenderPhase('completed');
      setIsExporting(false);
      
      const mockId = 'PL_' + Math.random().toString(36).substring(2, 10).toUpperCase();
      const generatedLink = `https://www.youtube.com/playlist?list=${mockId}`;
      setPublishedUrl(generatedLink);

      if (saveSnapshotCheck) {
        onSaveSnapshot(playlistTitle);
      }
      setToastMessage('প্লেলিস্ট সফলভাবে রেন্ডার ও পাবলিশ হয়েছে!');
      setTimeout(() => setToastMessage(null), 4000);
    }, 3200);
  };

  const handleCancelExport = () => {
    setIsExporting(false);
    setExportProgress(0);
    setRenderPhase('idle');
    setToastMessage('রেন্ডারিং প্রক্রিয়া বাতিল করা হয়েছে');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sequence, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${playlistTitle.replace(/\s+/g, '_')}_export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setToastMessage('JSON ডাটা ফাইল ডাউনলোড হয়েছে');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleCopyShareLink = () => {
    if (publishedUrl) {
      navigator.clipboard.writeText(publishedUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const getPhaseTitle = (phase: RenderPhase) => {
    switch (phase) {
      case 'analyzing':
        return 'ধাপ ১/৪: প্লেলিস্ট মেটাডেটা ও পর্বের ক্রম যাচাই করা হচ্ছে...';
      case 'rendering_assets':
        return 'ধাপ ২/৪: ভিডিও থাম্বনেইল ও মেটা-ট্যাগ রেন্ডার করা হচ্ছে...';
      case 'syncing_youtube':
        return 'ধাপ ৩/৪: ইউটিউব প্লেলিস্ট এপিআই-তে সিঙ্ক্রোনাইজ করা হচ্ছে...';
      case 'completed':
        return 'ধাপ ৪/৪: প্লেলিস্ট সফলভাবে রেন্ডার ও পাবলিশ সম্পন্ন!';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#8083ff] text-[#0d0096] font-bold px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 border border-white/20 animate-bounce">
          <CheckCircle2 size={20} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-[#dae2fd] flex items-center gap-2">
            <span>প্লেলিস্ট প্রকাশ ও এক্সপোর্ট</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 bg-[#8083ff]/20 text-[#c0c1ff] rounded-full border border-[#8083ff]/30">
              {sequence.length} টি পর্ব প্রস্তুত
            </span>
          </h1>
          <p className="text-sm text-[#c7c4d7]">
            চূড়ান্ত সিকোয়েন্স যাচাই করুন, রেন্ডার ও পাবলিশিং প্রগ্রেস ট্র্যাক করুন এবং ইউটিউবে প্লেলিস্ট সিঙ্ক করুন।
          </p>
        </div>

        <button
          onClick={() => onSelectTab('workbench')}
          className="px-4 py-2 bg-[#222a3d] hover:bg-[#2d3449] text-[#dae2fd] text-xs font-bold rounded-xl border border-[#464554]/30 transition-colors"
        >
          ওয়ার্কবেঞ্চে ফিরে যান
        </button>
      </div>

      {/* Simulated Rendering / Exporting Progress Bar Banner */}
      {(isExporting || renderPhase === 'completed') && (
        <div className="bg-[#171f33] rounded-2xl border border-[#8083ff]/40 p-6 space-y-4 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#8083ff]/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                {isExporting ? (
                  <Loader2 size={18} className="animate-spin text-[#8083ff]" />
                ) : (
                  <CheckCircle2 size={18} className="text-emerald-400" />
                )}
                <span className="text-sm font-bold text-[#dae2fd]">
                  {getPhaseTitle(renderPhase)}
                </span>
              </div>
              <p className="text-xs text-[#c7c4d7]/70">
                {isExporting 
                  ? 'ভিডিও আইডি, ধারাবাহিক টাইমস্ট্যাম্প এবং সিকোয়েন্স ম্যাপিং প্রস্তুত হচ্ছে।'
                  : 'সকল পর্বের সিকোয়েন্স সিঙ্ক হয়েছে। এখন সরাসরি ইউটিউব অথবা লোকাল এক্সপোর্ট ব্যবহার করতে পারেন।'}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-2xl font-mono font-extrabold text-[#c0c1ff]">
                {exportProgress}%
              </span>
              {isExporting && (
                <button
                  onClick={handleCancelExport}
                  className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1"
                >
                  <XCircle size={14} />
                  <span>বাতিল</span>
                </button>
              )}
            </div>
          </div>

          {/* Animated Progress Bar */}
          <div className="relative w-full h-3 bg-[#0b1326] rounded-full overflow-hidden border border-[#464554]/40">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                renderPhase === 'completed'
                  ? 'bg-emerald-400'
                  : 'bg-gradient-to-r from-[#8083ff] via-[#b9c8de] to-[#c0c1ff]'
              }`}
              style={{ width: `${exportProgress}%` }}
            />
          </div>

          {/* Phase Stepper indicator */}
          <div className="grid grid-cols-4 gap-2 pt-1 text-[11px]">
            <div className={`p-2 rounded-lg border text-center transition-all ${
              exportProgress >= 25 ? 'bg-[#8083ff]/15 border-[#8083ff]/40 text-[#c0c1ff] font-bold' : 'bg-[#0b1326]/60 border-[#464554]/20 text-[#c7c4d7]/50'
            }`}>
              ১. মেটাডেটা যাচাই
            </div>
            <div className={`p-2 rounded-lg border text-center transition-all ${
              exportProgress >= 60 ? 'bg-[#8083ff]/15 border-[#8083ff]/40 text-[#c0c1ff] font-bold' : 'bg-[#0b1326]/60 border-[#464554]/20 text-[#c7c4d7]/50'
            }`}>
              ২. অ্যাসেট রেন্ডারিং
            </div>
            <div className={`p-2 rounded-lg border text-center transition-all ${
              exportProgress >= 90 ? 'bg-[#8083ff]/15 border-[#8083ff]/40 text-[#c0c1ff] font-bold' : 'bg-[#0b1326]/60 border-[#464554]/20 text-[#c7c4d7]/50'
            }`}>
              ৩. ইউটিউব সিঙ্ক
            </div>
            <div className={`p-2 rounded-lg border text-center transition-all ${
              exportProgress >= 100 ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold' : 'bg-[#0b1326]/60 border-[#464554]/20 text-[#c7c4d7]/50'
            }`}>
              ৪. সম্পূর্ণ প্রস্তুত
            </div>
          </div>

          {/* Successful publish result box */}
          {publishedUrl && (
            <div className="p-4 bg-[#0b1326] rounded-xl border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-2">
              <div className="space-y-1">
                <span className="text-xs font-bold text-emerald-300 flex items-center space-x-1.5">
                  <Sparkles size={14} />
                  <span>লাইভ ইউটিউব প্লেলিস্ট লিঙ্ক জেনারেট হয়েছে:</span>
                </span>
                <span className="text-xs font-mono text-[#dae2fd] break-all block">
                  {publishedUrl}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyShareLink}
                  className="px-3 py-1.5 bg-[#222a3d] hover:bg-[#2d3449] text-[#dae2fd] text-xs font-semibold rounded-lg border border-[#464554]/40 flex items-center space-x-1 transition-colors"
                >
                  <Copy size={13} />
                  <span>{copiedLink ? 'কপি হয়েছে!' : 'লিঙ্ক কপি করুন'}</span>
                </button>

                <a
                  href={publishedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-[#8083ff] hover:bg-[#c0c1ff] text-[#0d0096] text-xs font-bold rounded-lg flex items-center space-x-1 transition-colors"
                >
                  <ExternalLink size={13} />
                  <span>প্লেলিস্ট খুলুন</span>
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Grid: Preview & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Sequence Preview */}
        <div className="lg:col-span-8 bg-[#171f33] rounded-2xl border border-[#464554]/30 overflow-hidden shadow-lg flex flex-col">
          <div className="px-6 py-4 bg-[#131b2e] border-b border-[#464554]/30 flex justify-between items-center">
            <h2 className="text-sm font-bold text-[#dae2fd] flex items-center space-x-2">
              <Play size={16} className="text-[#8083ff]" />
              <span>চূড়ান্ত পর্বের সিকোয়েন্স প্রিভিউ ({sequence.length} টি পর্ব)</span>
            </h2>
            <span className="text-xs font-semibold text-[#c0c1ff] bg-[#8083ff]/15 px-2.5 py-1 rounded-full border border-[#8083ff]/30">
              ধারাবাহিক ক্রম নিশ্চিত
            </span>
          </div>

          <div className="p-4 space-y-2.5 max-h-[500px] overflow-y-auto flex-1">
            {sequence.length === 0 ? (
              <div className="py-16 text-center text-[#c7c4d7]/60 space-y-2">
                <AlertCircle className="w-10 h-10 mx-auto text-[#c7c4d7]/40" />
                <p className="text-sm">কোনো পর্ব এখনও নির্বাচিত হয়নি।</p>
                <p className="text-xs">প্রথমে এক্সট্রাক্টর বা ওয়ার্কবেঞ্চ থেকে পর্ব সাজিয়ে নিন।</p>
              </div>
            ) : (
              sequence.map((ep, idx) => (
                <div
                  key={ep.id || idx}
                  className="flex items-center space-x-3.5 p-3 rounded-xl bg-[#0b1326] border border-[#464554]/20 hover:border-[#8083ff]/40 transition-all"
                >
                  <div className="w-8 text-center text-xs font-mono font-bold text-[#8083ff]">
                    #{idx + 1}
                  </div>

                  <div className="w-20 h-12 bg-[#222a3d] rounded-lg overflow-hidden flex-shrink-0 relative border border-[#464554]/30">
                    <img
                      src={`https://img.youtube.com/vi/${ep.videoId || 'default'}/hqdefault.jpg`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80';
                      }}
                      alt={ep.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] font-mono px-1 rounded">
                      {ep.duration || '22:00'}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-[#dae2fd] truncate">{ep.title}</h3>
                    <p className="text-[11px] text-[#c7c4d7]/60 truncate">পর্ব {ep.episodeNumber} • যাচাইকৃত সিকোয়েন্স</p>
                  </div>

                  <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-full border border-emerald-500/30">
                    প্রস্তুত
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Publish Summary & Actions */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-[#171f33] rounded-2xl border border-[#464554]/30 p-6 space-y-5 shadow-lg">
            <h2 className="text-sm font-bold text-[#dae2fd] border-b border-[#464554]/30 pb-3 flex items-center space-x-2">
              <Send size={16} className="text-[#8083ff]" />
              <span>পাবলিশ ও সিঙ্ক সেটিংস</span>
            </h2>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#c7c4d7]">প্লেলিস্টের নাম (Title)</label>
              <input
                type="text"
                value={playlistTitle}
                onChange={(e) => setPlaylistTitle(e.target.value)}
                className="w-full bg-[#060e20] border border-[#464554]/40 rounded-xl px-3.5 py-2.5 text-xs text-[#dae2fd] focus:outline-none focus:border-[#8083ff]"
              />
            </div>

            <div className="space-y-3 pt-1 text-xs">
              <div className="flex justify-between text-[#c7c4d7]">
                <span className="flex items-center space-x-1.5">
                  <Play size={14} className="text-[#8083ff]" />
                  <span>মোট পর্ব সংখ্যা:</span>
                </span>
                <span className="font-bold text-[#dae2fd]">{sequence.length} টি পর্ব</span>
              </div>

              <div className="flex justify-between text-[#c7c4d7]">
                <span className="flex items-center space-x-1.5">
                  <Clock size={14} className="text-[#8083ff]" />
                  <span>মোট রানটাইম:</span>
                </span>
                <span className="font-bold text-[#dae2fd]">{formatRuntime(totalRuntimeSeconds)}</span>
              </div>

              <div className="flex justify-between text-[#c7c4d7]">
                <span className="flex items-center space-x-1.5">
                  <Eye size={14} className="text-[#8083ff]" />
                  <span>গোপনীয়তা (Privacy):</span>
                </span>
                <select
                  value={privacy}
                  onChange={(e) => setPrivacy(e.target.value as any)}
                  className="bg-[#060e20] border border-[#464554]/40 rounded-lg text-xs text-[#dae2fd] px-2.5 py-1 font-semibold"
                >
                  <option value="unlisted">আনলিস্টেড (Unlisted)</option>
                  <option value="public">পাবলিক (Public)</option>
                  <option value="private">প্রাইভেট (Private)</option>
                </select>
              </div>
            </div>

            <div className="bg-[#131b2e] p-3.5 rounded-xl border border-[#464554]/30 flex items-start space-x-3">
              <input
                type="checkbox"
                id="snapshotCheck"
                checked={saveSnapshotCheck}
                onChange={(e) => setSaveSnapshotCheck(e.target.checked)}
                className="mt-0.5 rounded border-[#464554] text-[#8083ff] focus:ring-[#8083ff]"
              />
              <label htmlFor="snapshotCheck" className="text-xs text-[#c7c4d7] cursor-pointer leading-snug">
                <span className="font-semibold text-[#dae2fd] block">ভার্সন স্ন্যাপশট সংরক্ষণ করুন</span>
                হিস্ট্রি ভিউ থেকে যেকোনো সময় এই প্লেলিস্টে রোলব্যাক করা যাবে।
              </label>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={startPublishPipeline}
                disabled={isExporting || sequence.length === 0}
                className="w-full py-3 bg-[#8083ff] hover:bg-[#c0c1ff] text-[#0d0096] font-bold text-xs rounded-xl transition-all shadow-lg shadow-[#8083ff]/20 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isExporting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>রেন্ডারিং ও সিঙ্ক প্রক্রিয়াধীন...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>ইউটিউব প্লেলিস্ট সিঙ্ক ও রেন্ডার করুন</span>
                  </>
                )}
              </button>

              <button
                onClick={handleExportJSON}
                disabled={sequence.length === 0}
                className="w-full py-2.5 bg-[#222a3d] hover:bg-[#2d3449] text-[#dae2fd] font-semibold text-xs rounded-xl border border-[#464554]/30 transition-colors flex items-center justify-center space-x-2 disabled:opacity-40"
              >
                <Download size={15} />
                <span>JSON ডাটা এক্সপোর্ট করুন</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
