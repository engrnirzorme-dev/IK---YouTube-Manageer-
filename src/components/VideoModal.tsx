import React from 'react';
import { X, ExternalLink, Eye, Clock, Tv } from 'lucide-react';
import { Episode } from '../types';

interface VideoModalProps {
  episode: Episode | null;
  onClose: () => void;
}

export function VideoModal({ episode, onClose }: VideoModalProps) {
  if (!episode) return null;

  // Extract YouTube ID from url or videoId
  const getYouTubeId = (url?: string, videoId?: string) => {
    if (videoId) return videoId;
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : null;
  };

  const ytId = getYouTubeId(episode.url, episode.videoId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
              Ep {episode.episodeNumber}
            </span>
            <h3 className="font-semibold text-gray-900 truncate max-w-md">{episode.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Video Player Embed */}
          {ytId ? (
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black shadow-inner">
              <iframe
                src={`https://www.youtube.com/embed/${ytId}?autoplay=0`}
                title={episode.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="aspect-video rounded-xl bg-gray-100 flex flex-col items-center justify-center text-gray-400 p-6 text-center border-2 border-dashed border-gray-200">
              <Tv className="w-12 h-12 mb-2 text-gray-300" />
              <p className="text-sm font-medium text-gray-600">No direct video embed link available</p>
              <p className="text-xs text-gray-400 mt-1">You can search for this episode on YouTube using the title</p>
            </div>
          )}

          {/* Stats Bar */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
            {episode.duration && (
              <div className="flex items-center space-x-1.5 bg-white px-2.5 py-1 rounded-md border border-gray-200">
                <Clock size={14} className="text-gray-500" />
                <span className="font-mono text-xs">{episode.duration}</span>
              </div>
            )}
            {episode.viewCount && (
              <div className="flex items-center space-x-1.5 bg-white px-2.5 py-1 rounded-md border border-gray-200">
                <Eye size={14} className="text-gray-500" />
                <span className="text-xs">{episode.viewCount} views</span>
              </div>
            )}
            {episode.uploadDate && (
              <div className="text-xs text-gray-500">
                Uploaded: {episode.uploadDate}
              </div>
            )}
          </div>

          {/* Summary / Notes */}
          {episode.summary && (
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Episode Summary</h4>
              <p className="text-sm text-gray-700 leading-relaxed bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                {episode.summary}
              </p>
            </div>
          )}

          {episode.description && (
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Full Video Description</h4>
              <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-200 whitespace-pre-wrap max-h-40 overflow-y-auto">
                {episode.description}
              </p>
            </div>
          )}

          {episode.notes && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium">
              Note: {episode.notes}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
          {episode.url && (
            <a
              href={episode.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
            >
              <span>Watch on YouTube</span>
              <ExternalLink size={16} />
            </a>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
