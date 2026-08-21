import React from 'react';

export function SequenceEmptySVG() {
  return (
    <svg className="w-48 h-48 mx-auto" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="30" width="160" height="140" rx="16" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="2" />
      <rect x="40" y="55" width="120" height="24" rx="6" fill="#3B82F6" fillOpacity="0.1" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="4 4" />
      <circle cx="55" cy="67" r="6" fill="#3B82F6" />
      <rect x="70" y="64" width="70" height="6" rx="3" fill="#3B82F6" />
      
      <rect x="40" y="88" width="120" height="24" rx="6" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.5" />
      <circle cx="55" cy="100" r="6" fill="#10B981" />
      <rect x="70" y="97" width="50" height="6" rx="3" fill="#9CA3AF" />

      <rect x="40" y="121" width="120" height="24" rx="6" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.5" />
      <circle cx="55" cy="133" r="6" fill="#8B5CF6" />
      <rect x="70" y="130" width="60" height="6" rx="3" fill="#9CA3AF" />
      
      <path d="M100 20 L100 30 M100 170 L100 180 M20 100 L10 100 M190 100 L180 100" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function LeftoverEmptySVG() {
  return (
    <svg className="w-48 h-48 mx-auto" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="80" fill="#F0FDF4" stroke="#BBF7D0" strokeWidth="2" />
      <path d="M70 100 L90 120 L135 75" stroke="#10B981" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="60" y="145" width="80" height="12" rx="6" fill="#D1FAE5" />
    </svg>
  );
}
