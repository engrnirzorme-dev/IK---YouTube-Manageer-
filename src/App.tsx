import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, loginWithGoogle, logout } from './lib/firebase';
import { ChatInterface } from './components/ChatInterface';
import { WorkbenchTab } from './components/WorkbenchTab';
import { Navigation } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { ExtractorView } from './components/ExtractorView';
import { GapResolverView } from './components/GapResolverView';
import { PublishView } from './components/PublishView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { Tv2, Sparkles, SlidersHorizontal, LogIn } from 'lucide-react';
import { Episode, NavTab, HistoryItem } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  
  // App state
  const [finalPlaylist, setFinalPlaylist] = useState<Episode[] | null>(null);
  const [externalPrompt, setExternalPrompt] = useState<string | null>(null);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [missingGapEpNumber, setMissingGapEpNumber] = useState<number>(3);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Compute gaps count in current sequence
  const gapsCount = React.useMemo(() => {
    if (!finalPlaylist || finalPlaylist.length === 0) return 1;
    let gaps = 0;
    for (let i = 0; i < finalPlaylist.length - 1; i++) {
      const currentNum = finalPlaylist[i].episodeNumber;
      const nextNum = finalPlaylist[i + 1].episodeNumber;
      if (nextNum > currentNum + 1) {
        gaps += (nextNum - currentNum - 1);
      }
    }
    return gaps;
  }, [finalPlaylist]);

  const handleExtractComplete = (urls: string[]) => {
    // Generate AI prompt in Bangla from extracted URLs
    const prompt = `এই ভিডিও লিংকগুলো বিশ্লেষণ করো এবং বাংলা টিভি সিরিয়ালের ধারাবাহিক পর্ব হিসেবে ক্রম সাজাও। প্রমো ও শর্ট ক্লিপগুলো আলাদা রাখো:\n${urls.join('\n')}`;
    setExternalPrompt(prompt);
    setCurrentTab('workbench');
  };

  const handleResolveGap = (newEp: Episode) => {
    if (!finalPlaylist) {
      setFinalPlaylist([newEp]);
    } else {
      const updated = [...finalPlaylist, newEp].sort((a, b) => a.episodeNumber - b.episodeNumber);
      setFinalPlaylist(updated);
    }
  };

  const handleSaveSnapshot = (snapshotTitle: string) => {
    const newHistory: HistoryItem = {
      id: `hist-${Date.now()}`,
      title: snapshotTitle || 'টিভি সিরিয়াল স্ন্যাপশট',
      timestamp: 'এইমাত্র',
      isLatest: true,
      changeLog: [
        `${finalPlaylist?.length || 0} টি পর্বের সিকোয়েন্স স্ন্যাপশট হিসেবে সংরক্ষণ করা হয়েছে`,
        'ধারাবাহিক ক্রম ও টাইটেল যাচাই সম্পন্ন'
      ],
      sequenceState: finalPlaylist || [],
      leftoverState: []
    };
    setHistoryItems(prev => [newHistory, ...prev.map(h => ({ ...h, isLatest: false }))]);
  };

  const handleRestoreHistory = (item: HistoryItem) => {
    if (item.sequenceState && item.sequenceState.length > 0) {
      setFinalPlaylist(item.sequenceState);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1326] flex flex-col items-center justify-center text-[#dae2fd]">
        <div className="w-10 h-10 border-4 border-[#8083ff] border-t-transparent rounded-full animate-spin mb-3"></div>
        <span className="text-xs font-semibold text-[#c7c4d7]">EpisodeFlow ইঞ্জিন লোড হচ্ছে...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0b1326] flex flex-col items-center justify-center p-4 selection:bg-[#8083ff] selection:text-[#0d0096]">
        <div className="max-w-md w-full bg-[#171f33] rounded-3xl border border-[#464554]/30 p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="w-20 h-20 bg-[#8083ff]/20 text-[#c0c1ff] rounded-3xl flex items-center justify-center mx-auto border border-[#8083ff]/30 shadow-inner">
            <Tv2 size={40} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-[#dae2fd]">EpisodeFlow ওয়ার্কবেঞ্চ</h1>
            <p className="text-[#c7c4d7] text-xs leading-relaxed">
              ইউটিউব টিভি সিরিয়াল ও নাটকের অগোছালো প্লেলিস্ট সুন্দরভাবে সাজান, এআই দিয়ে পর্বের নম্বর ও টাইটেল প্যাটার্ন শনাক্ত করুন এবং মিসিং পর্বের সমাধান করুন।
            </p>
          </div>
          <button
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center space-x-3 bg-white text-gray-900 py-3.5 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-all shadow-lg"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            <span>Google একাউন্ট দিয়ে শুরু করুন</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1326] text-[#dae2fd] font-sans antialiased selection:bg-[#8083ff] selection:text-[#0d0096]">
      {/* Top Header & Navigation */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        user={user}
        onLogout={logout}
        gapsCount={gapsCount}
      />

      {/* Main Content Area */}
      <main className="pt-20 pb-24 md:pb-10 md:pl-64 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {currentTab === 'dashboard' && (
          <DashboardView
            onSelectTab={setCurrentTab}
            sequenceCount={finalPlaylist?.length || 15}
            leftoversCount={3}
            gapsCount={gapsCount}
            onNewExtraction={() => setCurrentTab('extractor')}
          />
        )}

        {currentTab === 'extractor' && (
          <ExtractorView
            onExtractComplete={handleExtractComplete}
            onSelectTab={setCurrentTab}
          />
        )}

        {currentTab === 'workbench' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: AI Serial Assistant Chat */}
            <div className="lg:col-span-5 flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-[#dae2fd] uppercase tracking-wider flex items-center space-x-2">
                  <Sparkles size={16} className="text-[#8083ff]" />
                  <span>এআই প্লেলিস্ট সহায়ক (AI Assistant)</span>
                </h2>
              </div>
              <ChatInterface
                uid={user.uid}
                onPlaylistGenerated={(playlist) => setFinalPlaylist(playlist)}
                finalPlaylist={finalPlaylist}
                externalPrompt={externalPrompt}
                onClearExternalPrompt={() => setExternalPrompt(null)}
              />
            </div>

            {/* Right Column: Interactive Sequence Workbench */}
            <div className="lg:col-span-7 flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-[#dae2fd] uppercase tracking-wider flex items-center space-x-2">
                  <SlidersHorizontal size={16} className="text-[#8083ff]" />
                  <span>সিকোয়েন্স এডিটর ও ব্যাচ অ্যাকশন</span>
                </h2>
              </div>
              <WorkbenchTab
                initialEpisodes={finalPlaylist}
                uid={user.uid}
                onAskAI={(promptText) => setExternalPrompt(promptText)}
                onUpdateEpisodes={(updated) => setFinalPlaylist(updated)}
              />
            </div>
          </div>
        )}

        {currentTab === 'gap-resolver' && (
          <GapResolverView
            missingEpisodeNumber={missingGapEpNumber}
            onResolveGap={handleResolveGap}
            onSelectTab={setCurrentTab}
          />
        )}

        {currentTab === 'publish' && (
          <PublishView
            sequence={finalPlaylist || [
              { id: '1', title: 'মেগা সিরিয়াল নাটক পর্ব ০১ (এইচডি)', episodeNumber: 1, duration: '২৪:১৫', status: 'verified' },
              { id: '2', title: 'মেগা সিরিয়াল নাটক পর্ব ০২ (এইচডি)', episodeNumber: 2, duration: '২৬:৪০', status: 'verified' },
              { id: '3', title: 'মেগা সিরিয়াল নাটক পর্ব ০৩ (এইচডি)', episodeNumber: 3, duration: '২৫:১০', status: 'verified' }
            ]}
            onSelectTab={setCurrentTab}
            onSaveSnapshot={handleSaveSnapshot}
          />
        )}

        {currentTab === 'history' && (
          <HistoryView
            historyItems={historyItems}
            onRestore={handleRestoreHistory}
            onSelectTab={setCurrentTab}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            user={user}
            onLogout={logout}
          />
        )}
      </main>
    </div>
  );
}
