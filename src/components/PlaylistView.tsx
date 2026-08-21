import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { CheckCircle2, ListVideo, ExternalLink, Save } from 'lucide-react';

interface Episode {
  title: string;
  episodeNumber: number;
  duration?: string;
  summary?: string;
  url?: string;
  notes?: string;
}

interface PlaylistViewProps {
  playlist: Episode[];
  uid: string;
}

export function PlaylistView({ playlist, uid }: PlaylistViewProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const saveToFirebase = async () => {
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'users', uid, 'playlists'), {
        episodes: playlist,
        createdAt: serverTimestamp(),
      });
      setIsSaved(true);
    } catch (error) {
      console.error("Error saving playlist:", error);
      alert("Failed to save playlist.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[600px]">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
        <div className="flex items-center space-x-3">
          <ListVideo className="text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-800">Generated Playlist</h2>
        </div>
        <button
          onClick={saveToFirebase}
          disabled={isSaving || isSaved}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 transition-colors text-sm font-medium"
        >
          {isSaved ? <CheckCircle2 size={16} /> : <Save size={16} />}
          <span>{isSaved ? 'Saved' : isSaving ? 'Saving...' : 'Save to Account'}</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {playlist.map((ep, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-gray-100 bg-white hover:border-blue-200 transition-colors flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold flex-shrink-0">
                {ep.episodeNumber}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">{ep.title}</h3>
                  {ep.duration && (
                    <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{ep.duration}</span>
                  )}
                </div>
                {ep.summary && <p className="text-sm text-gray-600 mt-2 leading-relaxed">{ep.summary}</p>}
                {ep.notes && <p className="text-sm text-amber-600 mt-2 font-medium">{ep.notes}</p>}
              </div>
              {ep.url && (
                <a 
                  href={ep.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors flex-shrink-0 ml-2"
                  title="Watch Episode"
                >
                  <ExternalLink size={18} />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
