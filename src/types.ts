export interface Episode {
  id: string;
  title: string;
  episodeNumber: number;
  duration?: string; // e.g. "22:45"
  durationSeconds?: number;
  summary?: string;
  url?: string;
  videoId?: string;
  description?: string;
  viewCount?: string;
  uploadDate?: string;
  isPromo?: boolean;
  notes?: string;
  status?: 'verified' | 'rendering' | 'review' | 'missing';
}

export interface PlaylistFilter {
  minDurationMinutes: number;
  keywordExclusions: string[];
  maxUploadDate?: string;
}

export type SortMode = 
  | 'auto_numeric'       // স্বয়ংক্রিয় সংখ্যা ক্রম (১, ২, ৩...)
  | 'pattern_bangla'     // বাংলা প্যাটার্ন ('পর্ব ০১', 'পর্ব ০২'...)
  | 'pattern_english'    // ইংরেজি প্যাটার্ন ('Episode 1', 'Ep 02'...)
  | 'duration_desc'      // দীর্ঘতম পর্ব আগে (Full Episodes first)
  | 'duration_asc'       // সংক্ষিপ্ত পর্ব আগে
  | 'custom_manual';     // ম্যানুয়াল ড্র্যাগ ও ড্রপ

export interface SavedPlaylist {
  id: string;
  title: string;
  episodes: Episode[];
  leftovers?: Episode[];
  createdAt: any;
}

export interface ProjectItem {
  id: string;
  title: string;
  status: 'In Progress' | 'Reviewing' | 'Completed';
  resolvedCount: number;
  leftoversCount: number;
  gapsCount: number;
  thumbnailUrl?: string;
  lastUpdated: string;
}

export interface HistoryItem {
  id: string;
  title: string;
  timestamp: string;
  isLatest?: boolean;
  changeLog: string[];
  sequenceState: Episode[];
  leftoverState: Episode[];
}

export interface GapCandidate {
  id: string;
  title: string;
  duration: string;
  matchScore: number;
  matchReason: string;
  channelName: string;
  uploadedTime: string;
  url: string;
  videoId: string;
}

export type NavTab = 'dashboard' | 'extractor' | 'workbench' | 'gap-resolver' | 'publish' | 'history' | 'settings';

export type SyncStatus = 'saved' | 'syncing' | 'pending_offline' | 'error';


