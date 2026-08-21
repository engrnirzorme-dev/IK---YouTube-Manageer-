import React, { useState, useEffect } from 'react';
import { 
  Filter, Undo, Redo, Search, ArrowUpDown, Trash2, Plus, Play, Info, 
  Sparkles, Save, CheckCircle2, Cloud, CloudOff, ChevronDown, ChevronUp, 
  AlertCircle, GripVertical, ExternalLink, ListPlus, SlidersHorizontal, RefreshCw, X,
  CheckSquare, Square, Edit3, ArrowUp, ArrowDown, Hash, Film, Clock
} from 'lucide-react';
import { Episode, PlaylistFilter, SyncStatus, SavedPlaylist, SortMode } from '../types';
import { SequenceEmptySVG, LeftoverEmptySVG } from './SVGIllustrations';
import { VideoModal } from './VideoModal';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { useToast } from './ToastProvider';

interface WorkbenchTabProps {
  initialEpisodes: Episode[] | null;
  uid: string;
  onAskAI: (prompt: string) => void;
  onUpdateEpisodes: (episodes: Episode[]) => void;
}

const LOCAL_STORAGE_KEY = 'tv_playlist_workbench_state_v1';

export function WorkbenchTab({ initialEpisodes, uid, onAskAI, onUpdateEpisodes }: WorkbenchTabProps) {
  const { showToast } = useToast();
  // State
  const [resolvedSequence, setResolvedSequence] = useState<Episode[]>([]);
  const [leftoverBin, setLeftoverBin] = useState<Episode[]>([]);
  const [undoStack, setUndoStack] = useState<{ sequence: Episode[]; leftover: Episode[] }[]>([]);
  const [redoStack, setRedoStack] = useState<{ sequence: Episode[]; leftover: Episode[] }[]>([]);
  
  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Sorting Mode
  const [sortMode, setSortMode] = useState<SortMode>('auto_numeric');

  // Inline editing state
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);

  // Filters
  const [filters, setFilters] = useState<PlaylistFilter>({
    minDurationMinutes: 0,
    keywordExclusions: ['promo', 'teaser', 'trailer', 'reaction', 'review', 'প্রমো', 'টিজার'],
  });
  const [newKeyword, setNewKeyword] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState<'sequence' | 'leftovers' | 'saved'>('sequence');
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [leftoversExpanded, setLeftoversExpanded] = useState(true);
  const [aiPromptInput, setAiPromptInput] = useState('');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('saved');
  const [isSavingFirestore, setIsSavingFirestore] = useState(false);
  const [savedPlaylists, setSavedPlaylists] = useState<SavedPlaylist[]>([]);

  // 1. Initial Load & LocalStorage Restoration
  useEffect(() => {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.sequence && Array.isArray(parsed.sequence) && parsed.sequence.length > 0) {
          setResolvedSequence(parsed.sequence);
          setLeftoverBin(parsed.leftover || []);
          if (parsed.filters) setFilters(parsed.filters);
        }
      } catch (e) {
        console.error("Failed to parse local storage workbench", e);
      }
    }
  }, []);

  // Update when initialEpisodes change from parent
  useEffect(() => {
    if (initialEpisodes && initialEpisodes.length > 0) {
      pushUndoState();
      filterAndProcessEpisodes(initialEpisodes);
    }
  }, [initialEpisodes]);

  // Auto-Save to LocalStorage
  useEffect(() => {
    const data = {
      sequence: resolvedSequence,
      leftover: leftoverBin,
      filters
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    setSyncStatus('saved');
  }, [resolvedSequence, leftoverBin, filters]);

  // Push to Undo Stack
  const pushUndoState = () => {
    setUndoStack(prev => [...prev.slice(-15), { sequence: [...resolvedSequence], leftover: [...leftoverBin] }]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, { sequence: [...resolvedSequence], leftover: [...leftoverBin] }]);
    setResolvedSequence(previous.sequence);
    setLeftoverBin(previous.leftover);
    setUndoStack(prev => prev.slice(0, prev.length - 1));
    showToast("পূর্ববর্তী পরিবর্তন ফেরত নেওয়া হয়েছে (Undo)");
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, { sequence: [...resolvedSequence], leftover: [...leftoverBin] }]);
    setResolvedSequence(next.sequence);
    setLeftoverBin(next.leftover);
    setRedoStack(prev => prev.slice(0, prev.length - 1));
    showToast("পুনরায় পরিবর্তন প্রয়োগ করা হয়েছে (Redo)");
  };

  // Filter Logic
  const filterAndProcessEpisodes = (rawList: Episode[]) => {
    const keep: Episode[] = [];
    const leftover: Episode[] = [];

    rawList.forEach((ep) => {
      let isExcluded = false;

      // Duration check
      if (filters.minDurationMinutes > 0 && ep.duration) {
        const mins = parseDurationToMinutes(ep.duration);
        if (mins < filters.minDurationMinutes) {
          isExcluded = true;
        }
      }

      // Keyword exclusion check
      if (!isExcluded && filters.keywordExclusions.length > 0) {
        const lowerTitle = (ep.title + " " + (ep.summary || "")).toLowerCase();
        for (const kw of filters.keywordExclusions) {
          if (kw.trim() && lowerTitle.includes(kw.trim().toLowerCase())) {
            isExcluded = true;
            break;
          }
        }
      }

      if (isExcluded) {
        leftover.push({ ...ep, isPromo: true });
      } else {
        keep.push(ep);
      }
    });

    // Apply sorting
    sortEpisodes(keep, sortMode);

    setResolvedSequence(keep);
    setLeftoverBin(leftover);
    onUpdateEpisodes(keep);
    showToast(`ফিল্টার প্রয়োগ সম্পন্ন: ${keep.length} টি মূল পর্ব, ${leftover.length} টি লেফটওভার`);
  };

  const parseDurationToMinutes = (durStr: string): number => {
    const parts = durStr.split(':').map(Number);
    if (parts.length === 3) return parts[0] * 60 + parts[1];
    if (parts.length === 2) return parts[0];
    return 0;
  };

  // Sorting Function
  const sortEpisodes = (list: Episode[], mode: SortMode) => {
    if (mode === 'auto_numeric') {
      list.sort((a, b) => a.episodeNumber - b.episodeNumber);
    } else if (mode === 'duration_desc') {
      list.sort((a, b) => {
        const durA = parseDurationToMinutes(a.duration || '0:0');
        const durB = parseDurationToMinutes(b.duration || '0:0');
        return durB - durA;
      });
    } else if (mode === 'duration_asc') {
      list.sort((a, b) => {
        const durA = parseDurationToMinutes(a.duration || '0:0');
        const durB = parseDurationToMinutes(b.duration || '0:0');
        return durA - durB;
      });
    } else if (mode === 'pattern_bangla') {
      list.sort((a, b) => a.episodeNumber - b.episodeNumber);
      // Format titles with Bengali style
      list.forEach((ep) => {
        if (!ep.title.startsWith('পর্ব')) {
          const numStr = ep.episodeNumber < 10 ? `০${ep.episodeNumber}` : `${ep.episodeNumber}`;
          ep.title = `পর্ব ${numStr} - ${ep.title.replace(/^.*(?:Episode|Ep|পর্ব|\#)\s*\d+[\s\-\:]*/i, '')}`;
        }
      });
    } else if (mode === 'pattern_english') {
      list.sort((a, b) => a.episodeNumber - b.episodeNumber);
      list.forEach((ep) => {
        const numStr = ep.episodeNumber < 10 ? `0${ep.episodeNumber}` : `${ep.episodeNumber}`;
        ep.title = `Episode ${numStr} - ${ep.title.replace(/^.*(?:Episode|Ep|পর্ব|\#)\s*\d+[\s\-\:]*/i, '')}`;
      });
    }
  };

  const handleSortChange = (newMode: SortMode) => {
    pushUndoState();
    setSortMode(newMode);
    const updated = [...resolvedSequence];
    sortEpisodes(updated, newMode);
    setResolvedSequence(updated);
    onUpdateEpisodes(updated);
    showToast(`বাছাইকৃত মোডে সাজানো হয়েছে: ${getSortModeLabel(newMode)}`);
  };

  const getSortModeLabel = (mode: SortMode) => {
    switch (mode) {
      case 'auto_numeric': return 'স্বয়ংক্রিয় সংখ্যা ক্রম (১, ২, ৩...)';
      case 'pattern_bangla': return "বাংলা ফরম্যাট ('পর্ব ০১ - ...')";
      case 'pattern_english': return "ইংরেজি ফরম্যাট ('Episode 01 - ...')";
      case 'duration_desc': return 'দীর্ঘতম পর্ব আগে (>২০ মিনিট)';
      case 'duration_asc': return 'সংক্ষিপ্ত ক্লিপ আগে';
      default: return 'কাস্টম সিকোয়েন্স';
    }
  };

  // Multi-Selection Handlers
  const toggleSelectEpisode = (id: string) => {
    const updated = new Set(selectedIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedIds(updated);
  };

  const selectAllEpisodes = () => {
    if (selectedIds.size === resolvedSequence.length) {
      setSelectedIds(new Set());
    } else {
      const allIds = new Set(resolvedSequence.map(ep => ep.id));
      setSelectedIds(allIds);
    }
  };

  // Batch Operations
  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return;
    pushUndoState();
    const toDelete: Episode[] = [];
    const remaining: Episode[] = [];

    resolvedSequence.forEach(ep => {
      if (selectedIds.has(ep.id)) {
        toDelete.push({ ...ep, isPromo: true });
      } else {
        remaining.push(ep);
      }
    });

    setResolvedSequence(remaining);
    setLeftoverBin(prev => [...toDelete, ...prev]);
    setSelectedIds(new Set());
    onUpdateEpisodes(remaining);
    showToast(`${toDelete.length} টি পর্ব সফলভাবে লেফটওভার বিনে পাঠানো হয়েছে`);
  };

  const handleBatchRenumber = () => {
    if (resolvedSequence.length === 0) return;
    pushUndoState();
    const updated = resolvedSequence.map((ep, idx) => ({
      ...ep,
      episodeNumber: idx + 1
    }));
    setResolvedSequence(updated);
    onUpdateEpisodes(updated);
    showToast(`সকল পর্বের ক্রম নম্বর ১ থেকে ${updated.length} পর্যন্ত ধারাবাহিক করা হয়েছে`);
  };

  const handleBatchMoveUp = () => {
    if (selectedIds.size === 0) return;
    pushUndoState();
    const list = [...resolvedSequence];
    for (let i = 1; i < list.length; i++) {
      if (selectedIds.has(list[i].id) && !selectedIds.has(list[i - 1].id)) {
        const temp = list[i];
        list[i] = list[i - 1];
        list[i - 1] = temp;
      }
    }
    setResolvedSequence(list);
    onUpdateEpisodes(list);
  };

  const handleBatchMoveDown = () => {
    if (selectedIds.size === 0) return;
    pushUndoState();
    const list = [...resolvedSequence];
    for (let i = list.length - 2; i >= 0; i--) {
      if (selectedIds.has(list[i].id) && !selectedIds.has(list[i + 1].id)) {
        const temp = list[i];
        list[i] = list[i + 1];
        list[i + 1] = temp;
      }
    }
    setResolvedSequence(list);
    onUpdateEpisodes(list);
  };

  // Move Single Episode between Sequence and Leftovers
  const moveToLeftovers = (index: number) => {
    pushUndoState();
    const item = resolvedSequence[index];
    setResolvedSequence(prev => prev.filter((_, i) => i !== index));
    setLeftoverBin(prev => [item, ...prev]);
    showToast(`"${item.title}" লেফটওভার বিনে স্থানান্তর করা হয়েছে`);
  };

  const moveToSequence = (index: number) => {
    pushUndoState();
    const item = leftoverBin[index];
    setLeftoverBin(prev => prev.filter((_, i) => i !== index));
    const updated = [...resolvedSequence, item].sort((a, b) => a.episodeNumber - b.episodeNumber);
    setResolvedSequence(updated);
    onUpdateEpisodes(updated);
    showToast(`পর্ব ${item.episodeNumber} মূল সিকোয়েন্সে যুক্ত করা হয়েছে`);
  };

  // Drag / Single reordering
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    pushUndoState();
    const updated = [...resolvedSequence];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setResolvedSequence(updated);
    onUpdateEpisodes(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index >= resolvedSequence.length - 1) return;
    pushUndoState();
    const updated = [...resolvedSequence];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setResolvedSequence(updated);
    onUpdateEpisodes(updated);
  };

  // Inline Edit Save
  const handleSaveEdit = () => {
    if (!editingEpisode) return;
    pushUndoState();
    const updated = resolvedSequence.map(ep => ep.id === editingEpisode.id ? editingEpisode : ep);
    setResolvedSequence(updated);
    onUpdateEpisodes(updated);
    setEditingEpisode(null);
    showToast("পর্বের তথ্য সফলভাবে আপডেট হয়েছে");
  };

  // Filter Management
  const addKeywordExclusion = () => {
    if (!newKeyword.trim()) return;
    const updatedKw = [...filters.keywordExclusions, newKeyword.trim().toLowerCase()];
    setFilters(prev => ({ ...prev, keywordExclusions: updatedKw }));
    setNewKeyword('');
    filterAndProcessEpisodes([...resolvedSequence, ...leftoverBin]);
  };

  const removeKeywordExclusion = (kw: string) => {
    const updatedKw = filters.keywordExclusions.filter(k => k !== kw);
    setFilters(prev => ({ ...prev, keywordExclusions: updatedKw }));
    filterAndProcessEpisodes([...resolvedSequence, ...leftoverBin]);
  };

  // Gap Detection Algorithm
  const renderSequenceWithGaps = () => {
    if (resolvedSequence.length === 0) return null;

    const elements: React.ReactNode[] = [];
    let expectedEp = resolvedSequence[0]?.episodeNumber || 1;

    resolvedSequence.forEach((ep, i) => {
      // Check if there is a gap before this episode
      if (ep.episodeNumber > expectedEp) {
        for (let g = expectedEp; g < ep.episodeNumber; g++) {
          elements.push(
            <div 
              key={`gap-${g}`} 
              className="p-4 rounded-2xl border-2 border-dashed border-amber-400/50 bg-amber-500/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-200 transition-all shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center font-bold text-amber-300 text-sm">
                  পর্ব {g}
                </div>
                <div>
                  <div className="font-bold text-sm flex items-center gap-1.5 text-amber-300">
                    <AlertCircle size={15} className="text-amber-400" />
                    <span>মিসিং পর্ব সনাক্ত হয়েছে (পর্ব {g})</span>
                  </div>
                  <p className="text-xs text-amber-200/80 mt-0.5">
                    ধারাবাহিক ক্রমটিতে পর্ব {g} অনুপস্থিত রয়েছে।
                  </p>
                </div>
              </div>
              <button
                onClick={() => onAskAI(`ইউটিউবে এই টিভি সিরিয়ালের মিসিং পর্ব ${g} খুঁজে বের করো এবং লিঙ্ক প্রদান করো`)}
                className="flex items-center space-x-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-gray-950 rounded-xl text-xs font-bold shadow-md transition-colors w-full sm:w-auto justify-center"
              >
                <Search size={14} />
                <span>AI দিয়ে পর্ব {g} খুঁজুন</span>
              </button>
            </div>
          );
        }
      }

      const isSelected = selectedIds.has(ep.id);

      // Render actual episode card
      elements.push(
        <div 
          key={ep.id || `ep-${i}`} 
          className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group ${
            isSelected
              ? 'border-[#8083ff] bg-[#8083ff]/10 shadow-md ring-1 ring-[#8083ff]/30'
              : 'border-[#464554]/30 bg-[#171f33] hover:border-[#8083ff]/40 shadow-sm'
          }`}
        >
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {/* Multi-Select Checkbox */}
            <button
              onClick={() => toggleSelectEpisode(ep.id)}
              className="text-[#c7c4d7] hover:text-[#dae2fd] transition-colors p-1"
              title="Select for batch action"
            >
              {isSelected ? (
                <CheckSquare size={18} className="text-[#8083ff]" />
              ) : (
                <Square size={18} className="text-[#464554]" />
              )}
            </button>

            {/* Episode Number Badge */}
            <div className="w-10 h-10 rounded-xl bg-[#0b1326] border border-[#464554]/40 text-[#c0c1ff] font-bold flex items-center justify-center text-xs flex-shrink-0 group-hover:border-[#8083ff]/60 group-hover:text-white transition-colors">
              #{ep.episodeNumber}
            </div>

            {/* Thumbnail Preview if videoId */}
            {ep.videoId && (
              <div className="hidden sm:block w-14 h-9 bg-[#0b1326] rounded-lg overflow-hidden flex-shrink-0 relative border border-[#464554]/30">
                <img
                  src={`https://img.youtube.com/vi/${ep.videoId}/hqdefault.jpg`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80';
                  }}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h4 className="font-bold text-[#dae2fd] text-xs sm:text-sm truncate">{ep.title}</h4>
                {ep.duration && (
                  <span className="text-[10px] font-mono bg-[#0b1326] text-[#c0c1ff] px-2 py-0.5 rounded-full border border-[#464554]/30 flex-shrink-0">
                    {ep.duration}
                  </span>
                )}
              </div>
              {ep.summary && (
                <p className="text-[11px] text-[#c7c4d7]/70 mt-0.5 line-clamp-1">
                  {ep.summary}
                </p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-1.5 self-end sm:self-center">
            {/* Reorder Buttons */}
            <button
              onClick={() => handleMoveUp(i)}
              disabled={i === 0}
              className="p-1.5 text-[#c7c4d7] hover:text-[#dae2fd] hover:bg-[#222a3d] disabled:opacity-20 rounded-lg transition-colors"
              title="উপরে নিন"
            >
              <ChevronUp size={16} />
            </button>
            <button
              onClick={() => handleMoveDown(i)}
              disabled={i === resolvedSequence.length - 1}
              className="p-1.5 text-[#c7c4d7] hover:text-[#dae2fd] hover:bg-[#222a3d] disabled:opacity-20 rounded-lg transition-colors"
              title="নিচে নিন"
            >
              <ChevronDown size={16} />
            </button>

            {/* Quick Edit button */}
            <button
              onClick={() => setEditingEpisode({ ...ep })}
              className="p-1.5 text-[#c7c4d7] hover:text-[#8083ff] hover:bg-[#8083ff]/10 rounded-lg transition-colors"
              title="সম্পাদনা করুন"
            >
              <Edit3 size={15} />
            </button>

            {/* View / Play Details */}
            <button
              onClick={() => setSelectedEpisode(ep)}
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-[#8083ff]/20 text-[#c0c1ff] hover:bg-[#8083ff]/30 rounded-lg text-xs font-bold transition-colors"
            >
              <Play size={12} className="fill-current" />
              <span>প্রিভিউ</span>
            </button>

            {/* Move to leftovers */}
            <button
              onClick={() => moveToLeftovers(i)}
              className="p-1.5 text-[#c7c4d7] hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              title="বাদ দিন / লেফটওভারে নিন"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      );

      expectedEp = ep.episodeNumber + 1;
    });

    return elements;
  };

  // Save to Firestore
  const handleSaveToFirestore = async () => {
    if (resolvedSequence.length === 0) {
      showToast("সংরক্ষণ করার মতো কোনো পর্ব নেই");
      return;
    }

    setIsSavingFirestore(true);
    try {
      await addDoc(collection(db, 'users', uid, 'playlists'), {
        title: `টিভি সিরিয়াল প্লেলিস্ট (${resolvedSequence.length} টি পর্ব)`,
        episodes: resolvedSequence,
        leftovers: leftoverBin,
        createdAt: serverTimestamp(),
      });
      showToast("প্লেলিস্ট সফলভাবে আপনার ফায়ারস্টোর একাউন্টে সংরক্ষিত হয়েছে!");
    } catch (e) {
      console.error("Firestore save error", e);
      showToast("সংরক্ষণ করতে সমস্যা হয়েছে");
    } finally {
      setIsSavingFirestore(false);
    }
  };

  // Load Saved Playlists
  const loadSavedPlaylists = async () => {
    try {
      const q = query(collection(db, 'users', uid, 'playlists'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const list: SavedPlaylist[] = [];
      snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() } as SavedPlaylist);
      });
      setSavedPlaylists(list);
    } catch (e) {
      console.error("Failed to load saved playlists", e);
    }
  };

  useEffect(() => {
    if (activeTab === 'saved') {
      loadSavedPlaylists();
    }
  }, [activeTab]);

  return (
    <div className="bg-[#171f33] border border-[#464554]/30 rounded-3xl shadow-xl overflow-hidden flex flex-col h-[740px] relative">
      {/* Top Header & Toolbar */}
      <div className="p-4 border-b border-[#464554]/30 bg-[#131b2e] flex flex-wrap items-center justify-between gap-3">
        {/* Navigation Tabs */}
        <div className="flex items-center bg-[#0b1326] p-1 rounded-2xl space-x-1 text-xs font-semibold border border-[#464554]/30">
          <button
            onClick={() => setActiveTab('sequence')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'sequence' 
                ? 'bg-[#8083ff] text-[#0d0096] font-bold shadow-md' 
                : 'text-[#c7c4d7] hover:text-[#dae2fd]'
            }`}
          >
            মূল সিকোয়েন্স ({resolvedSequence.length})
          </button>
          <button
            onClick={() => setActiveTab('leftovers')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'leftovers' 
                ? 'bg-[#8083ff] text-[#0d0096] font-bold shadow-md' 
                : 'text-[#c7c4d7] hover:text-[#dae2fd]'
            }`}
          >
            লেফটওভার বিন ({leftoverBin.length})
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'saved' 
                ? 'bg-[#8083ff] text-[#0d0096] font-bold shadow-md' 
                : 'text-[#c7c4d7] hover:text-[#dae2fd]'
            }`}
          >
            সংরক্ষিত হিস্ট্রি
          </button>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center space-x-2">
          {/* Sorting Dropdown */}
          <div className="relative">
            <select
              value={sortMode}
              onChange={(e) => handleSortChange(e.target.value as SortMode)}
              className="bg-[#0b1326] border border-[#464554]/40 text-[#dae2fd] text-xs font-semibold rounded-xl px-3 py-2 pr-7 focus:outline-none focus:border-[#8083ff] cursor-pointer"
            >
              <option value="auto_numeric">স্বয়ংক্রিয় সংখ্যা ক্রম (১, ২, ৩...)</option>
              <option value="pattern_bangla">বাংলা প্যাটার্ন (পর্ব ০১...)</option>
              <option value="pattern_english">ইংরেজি প্যাটার্ন (Episode 01...)</option>
              <option value="duration_desc">দীর্ঘতম পর্ব আগে (&gt;২০ মিনিট)</option>
              <option value="duration_asc">সংক্ষিপ্ত ক্লিপ আগে</option>
            </select>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-xl text-xs font-semibold border flex items-center space-x-1.5 transition-colors ${
              showFilters 
                ? 'bg-[#8083ff]/20 border-[#8083ff] text-[#c0c1ff]' 
                : 'bg-[#0b1326] border-[#464554]/40 text-[#c7c4d7] hover:text-[#dae2fd]'
            }`}
          >
            <SlidersHorizontal size={15} />
            <span className="hidden sm:inline">ফিল্টার</span>
          </button>

          {/* Undo / Redo */}
          <button
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            className="p-2 bg-[#0b1326] border border-[#464554]/40 text-[#c7c4d7] hover:text-[#dae2fd] disabled:opacity-30 rounded-xl text-xs transition-colors"
            title="পূর্ববর্তী পরিবর্তন ফেরত নিন (Undo)"
          >
            <Undo size={15} />
          </button>
          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className="p-2 bg-[#0b1326] border border-[#464554]/40 text-[#c7c4d7] hover:text-[#dae2fd] disabled:opacity-30 rounded-xl text-xs transition-colors"
            title="পুনরায় পরিবর্তন করুন (Redo)"
          >
            <Redo size={15} />
          </button>

          {/* Save to Firestore Account */}
          <button
            onClick={handleSaveToFirestore}
            disabled={isSavingFirestore || resolvedSequence.length === 0}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#8083ff] hover:bg-[#c0c1ff] text-[#0d0096] font-bold rounded-xl text-xs shadow-md transition-all disabled:opacity-40"
          >
            <Save size={14} />
            <span className="hidden sm:inline">{isSavingFirestore ? 'সংরক্ষণ হচ্ছে...' : 'প্লেলিস্ট সেভ'}</span>
          </button>
        </div>
      </div>

      {/* Expandable Filter Panel */}
      {showFilters && (
        <div className="p-4 bg-[#0b1326] border-b border-[#464554]/30 text-xs space-y-3 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Min Duration */}
            <div className="flex items-center space-x-2">
              <label className="font-semibold text-[#c7c4d7]">সর্বনিম্ন সময়কাল:</label>
              <select
                value={filters.minDurationMinutes}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setFilters(p => ({ ...p, minDurationMinutes: val }));
                  filterAndProcessEpisodes([...resolvedSequence, ...leftoverBin]);
                }}
                className="bg-[#171f33] border border-[#464554]/40 rounded-lg px-2.5 py-1 text-[#dae2fd] focus:border-[#8083ff]"
              >
                <option value={0}>সব দৈর্ঘ্য (All)</option>
                <option value={5}>&gt; ৫ মিনিট</option>
                <option value={10}>&gt; ১০ মিনিট</option>
                <option value={20}>&gt; ২০ মিনিট (সম্পূর্ণ পর্ব)</option>
              </select>
            </div>

            {/* Keyword Exclusion input */}
            <div className="flex items-center space-x-2">
              <label className="font-semibold text-[#c7c4d7]">কীওয়ার্ড ফিল্টার:</label>
              <input
                type="text"
                placeholder="যেমন: প্রমো, টিজার, ক্লিপ"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addKeywordExclusion()}
                className="bg-[#171f33] border border-[#464554]/40 rounded-lg px-2.5 py-1 text-[#dae2fd] w-40 focus:border-[#8083ff]"
              />
              <button
                onClick={addKeywordExclusion}
                className="px-3 py-1 bg-[#8083ff] text-[#0d0096] rounded-lg font-bold hover:bg-[#c0c1ff]"
              >
                যোগ
              </button>
            </div>
          </div>

          {/* Active Keyword Chips */}
          {filters.keywordExclusions.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[#c7c4d7]/70 text-[11px]">বাদ দেওয়া কীওয়ার্ড:</span>
              {filters.keywordExclusions.map((kw, idx) => (
                <span key={idx} className="bg-[#171f33] text-[#dae2fd] border border-[#464554]/40 px-2 py-0.5 rounded-full flex items-center space-x-1 text-[11px]">
                  <span>{kw}</span>
                  <button onClick={() => removeKeywordExclusion(kw)} className="text-[#c7c4d7] hover:text-rose-400">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Batch Actions Bar (Shows when items are selected) */}
      {selectedIds.size > 0 && (
        <div className="p-3 bg-[#8083ff]/15 border-b border-[#8083ff]/40 flex flex-wrap items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold text-[#c0c1ff] bg-[#0b1326] px-3 py-1 rounded-full border border-[#8083ff]/40">
              {selectedIds.size} টি পর্ব নির্বাচিত
            </span>
            <button
              onClick={selectAllEpisodes}
              className="text-xs text-[#dae2fd] hover:underline font-semibold"
            >
              {selectedIds.size === resolvedSequence.length ? 'সব বাতিল' : 'সব নির্বাচন'}
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleBatchMoveUp}
              className="px-3 py-1.5 bg-[#0b1326] hover:bg-[#222a3d] text-[#dae2fd] rounded-xl text-xs font-semibold flex items-center space-x-1 border border-[#464554]/30"
              title="নির্বাচিত পর্বগুলো উপরে তুলুন"
            >
              <ArrowUp size={14} />
              <span>উপরে নিন</span>
            </button>

            <button
              onClick={handleBatchMoveDown}
              className="px-3 py-1.5 bg-[#0b1326] hover:bg-[#222a3d] text-[#dae2fd] rounded-xl text-xs font-semibold flex items-center space-x-1 border border-[#464554]/30"
              title="নির্বাচিত পর্বগুলো নিচে নামান"
            >
              <ArrowDown size={14} />
              <span>নিচে নিন</span>
            </button>

            <button
              onClick={handleBatchRenumber}
              className="px-3 py-1.5 bg-[#0b1326] hover:bg-[#222a3d] text-[#dae2fd] rounded-xl text-xs font-semibold flex items-center space-x-1 border border-[#464554]/30"
              title="ক্রম নম্বর রি-অর্ডার করুন"
            >
              <Hash size={14} />
              <span>ক্রম ঠিক করুন</span>
            </button>

            <button
              onClick={handleBatchDelete}
              className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-xl text-xs font-bold flex items-center space-x-1 border border-rose-500/40"
              title="নির্বাচিত পর্বগুলো লেফটওভার বিনে পাঠান"
            >
              <Trash2 size={14} />
              <span>ব্যাচ বাদ দিন</span>
            </button>
          </div>
        </div>
      )}

      {/* Quick AI Workbench Natural Language Bar */}
      <div className="p-3.5 bg-[#0b1326] border-b border-[#464554]/30 flex items-center space-x-2">
        <Sparkles size={18} className="text-[#8083ff] flex-shrink-0" />
        <input
          type="text"
          placeholder="AI নির্দেশ দিন: যেমন 'ধারাবাহিক পর্বগুলো সাজাও, মিসিং পর্ব ৫ খোঁজ', 'প্রোমো বাদ দাও'"
          value={aiPromptInput}
          onChange={(e) => setAiPromptInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && aiPromptInput.trim()) {
              onAskAI(aiPromptInput);
              setAiPromptInput('');
            }
          }}
          className="flex-1 bg-[#171f33] text-xs px-3.5 py-2.5 rounded-xl border border-[#464554]/40 text-[#dae2fd] placeholder-[#c7c4d7]/40 focus:outline-none focus:border-[#8083ff]"
        />
        <button
          onClick={() => {
            if (aiPromptInput.trim()) {
              onAskAI(aiPromptInput);
              setAiPromptInput('');
            }
          }}
          className="px-4 py-2.5 bg-[#8083ff] hover:bg-[#c0c1ff] text-[#0d0096] rounded-xl text-xs font-bold flex items-center space-x-1 transition-colors"
        >
          <span>AI চালান</span>
        </button>
      </div>

      {/* Main Workbench Content Views */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#0b1326]/50 space-y-3">
        {/* VIEW 1: Resolved Sequence */}
        {activeTab === 'sequence' && (
          <div className="space-y-3">
            {resolvedSequence.length === 0 ? (
              <div className="py-16 text-center text-[#c7c4d7]/60 space-y-3">
                <SequenceEmptySVG />
                <h3 className="font-bold text-[#dae2fd] text-sm">কোনো সিকোয়েন্স এখনো তৈরি হয়নি</h3>
                <p className="text-xs max-w-sm mx-auto text-[#c7c4d7]/70">
                  বামপাশের চ্যাটে প্লেলিস্ট লিঙ্ক পেস্ট করুন অথবা এক্সট্রাক্টর থেকে মিডিয়া ইমপোর্ট করুন।
                </p>
              </div>
            ) : (
              renderSequenceWithGaps()
            )}
          </div>
        )}

        {/* VIEW 2: Leftover Bin */}
        {activeTab === 'leftovers' && (
          <div className="space-y-3">
            {leftoverBin.length === 0 ? (
              <div className="py-16 text-center text-[#c7c4d7]/60 space-y-3">
                <LeftoverEmptySVG />
                <h3 className="font-bold text-[#dae2fd] text-sm">লেফটওভার বিন খালি</h3>
                <p className="text-xs max-w-sm mx-auto text-[#c7c4d7]/70">
                  কোনো প্রোমো, সংক্ষিপ্ত ক্লিপ বা বাদ দেওয়া ভিডিও নেই। সব ভিডিও মূল সিকোয়েন্সে সাজানো আছে।
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#c7c4d7] uppercase tracking-wider">বাদ দেওয়া / নন-সিরিয়াল আইটেম</span>
                  <button 
                    onClick={() => setLeftoversExpanded(!leftoversExpanded)}
                    className="text-xs text-[#8083ff] hover:underline flex items-center space-x-1"
                  >
                    <span>{leftoversExpanded ? 'সংকুচিত করুন' : 'প্রসারিত করুন'}</span>
                  </button>
                </div>

                {leftoversExpanded && (
                  <div className="space-y-2">
                    {leftoverBin.map((ep, i) => (
                      <div key={i} className="p-3 bg-[#171f33] border border-[#464554]/30 rounded-xl flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center space-x-2 min-w-0">
                          <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded font-semibold text-[10px]">
                            {ep.isPromo ? 'প্রমো/টিজার' : `পর্ব ${ep.episodeNumber}`}
                          </span>
                          <span className="font-medium text-[#dae2fd] truncate">{ep.title}</span>
                          {ep.duration && <span className="text-[10px] text-[#c7c4d7]/60">({ep.duration})</span>}
                        </div>
                        <button
                          onClick={() => moveToSequence(i)}
                          className="px-3 py-1.5 bg-[#8083ff]/20 text-[#c0c1ff] hover:bg-[#8083ff]/30 rounded-lg font-bold flex items-center space-x-1 flex-shrink-0"
                        >
                          <Plus size={13} />
                          <span>মূল সিকোয়েন্সে যোগ</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: Saved History */}
        {activeTab === 'saved' && (
          <div className="space-y-3">
            {savedPlaylists.length === 0 ? (
              <div className="py-16 text-center text-[#c7c4d7]/60 space-y-2">
                <CloudOff className="w-12 h-12 mx-auto text-[#464554]" />
                <p className="text-sm font-bold text-[#dae2fd]">কোনো সংরক্ষিত প্লেলিস্ট পাওয়া যায়নি</p>
                <p className="text-xs text-[#c7c4d7]/70">উপরের বার থেকে "প্লেলিস্ট সেভ" বাটনে ক্লিক করে বর্তমান সিকোয়েন্স সংরক্ষণ করুন।</p>
              </div>
            ) : (
              savedPlaylists.map((pl) => (
                <div key={pl.id} className="p-4 bg-[#171f33] border border-[#464554]/30 rounded-2xl hover:border-[#8083ff]/50 transition-all flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-[#dae2fd]">{pl.title}</h4>
                    <p className="text-xs text-[#c7c4d7]/70 mt-0.5">
                      {pl.episodes?.length || 0} টি পর্ব • একাউন্টে সংরক্ষিত
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      pushUndoState();
                      setResolvedSequence(pl.episodes || []);
                      setLeftoverBin(pl.leftovers || []);
                      setActiveTab('sequence');
                      showToast("সংরক্ষিত প্লেলিস্ট ওয়ার্কবেঞ্চে লোড হয়েছে");
                    }}
                    className="px-4 py-2 bg-[#8083ff] hover:bg-[#c0c1ff] text-[#0d0096] rounded-xl text-xs font-bold transition-all shadow-md"
                  >
                    ওয়ার্কবেঞ্চে লোড করুন
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Inline Editing Modal */}
      {editingEpisode && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171f33] border border-[#464554]/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center border-b border-[#464554]/30 pb-3">
              <h3 className="text-sm font-bold text-[#dae2fd] flex items-center space-x-2">
                <Edit3 size={16} className="text-[#8083ff]" />
                <span>পর্বের তথ্য সম্পাদনা করুন</span>
              </h3>
              <button
                onClick={() => setEditingEpisode(null)}
                className="text-[#c7c4d7] hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#c7c4d7] block mb-1 font-semibold">পর্বের শিরোনাম (Title)</label>
                <input
                  type="text"
                  value={editingEpisode.title}
                  onChange={(e) => setEditingEpisode({ ...editingEpisode, title: e.target.value })}
                  className="w-full bg-[#0b1326] border border-[#464554]/40 rounded-xl px-3 py-2 text-[#dae2fd] focus:border-[#8083ff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#c7c4d7] block mb-1 font-semibold">পর্ব নম্বর (Episode #)</label>
                  <input
                    type="number"
                    value={editingEpisode.episodeNumber}
                    onChange={(e) => setEditingEpisode({ ...editingEpisode, episodeNumber: Number(e.target.value) })}
                    className="w-full bg-[#0b1326] border border-[#464554]/40 rounded-xl px-3 py-2 text-[#dae2fd] focus:border-[#8083ff]"
                  />
                </div>

                <div>
                  <label className="text-[#c7c4d7] block mb-1 font-semibold">সময়কাল (Duration)</label>
                  <input
                    type="text"
                    value={editingEpisode.duration || '22:00'}
                    onChange={(e) => setEditingEpisode({ ...editingEpisode, duration: e.target.value })}
                    className="w-full bg-[#0b1326] border border-[#464554]/40 rounded-xl px-3 py-2 text-[#dae2fd] focus:border-[#8083ff]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#c7c4d7] block mb-1 font-semibold">সারাংশ / নোট (Summary)</label>
                <textarea
                  rows={3}
                  value={editingEpisode.summary || ''}
                  onChange={(e) => setEditingEpisode({ ...editingEpisode, summary: e.target.value })}
                  className="w-full bg-[#0b1326] border border-[#464554]/40 rounded-xl px-3 py-2 text-[#dae2fd] focus:border-[#8083ff] resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setEditingEpisode(null)}
                className="px-4 py-2 bg-[#222a3d] text-[#dae2fd] rounded-xl text-xs font-semibold"
              >
                বাতিল
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-[#8083ff] text-[#0d0096] rounded-xl text-xs font-bold hover:bg-[#c0c1ff]"
              >
                আপডেট সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Preview Modal */}
      <VideoModal episode={selectedEpisode} onClose={() => setSelectedEpisode(null)} />
    </div>
  );
}
