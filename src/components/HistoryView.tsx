import React from 'react';
import { History, RotateCcw, CheckCircle2, Clock, Calendar, Sparkles } from 'lucide-react';
import { HistoryItem, Episode, NavTab } from '../types';

interface HistoryViewProps {
  historyItems: HistoryItem[];
  onRestore: (item: HistoryItem) => void;
  onSelectTab: (tab: NavTab) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  historyItems,
  onRestore,
  onSelectTab
}) => {
  const defaultHistory: HistoryItem[] = [
    {
      id: 'h1',
      title: 'স্বয়ংক্রিয় এক্সট্রাকশন ও গ্যাপ বিশ্লেষণ',
      timestamp: 'আজ, ১৮:২০',
      isLatest: true,
      changeLog: [
        '১৫ টি ধারাবাহিক পর্ব এক্সট্রাক্ট করা হয়েছে',
        '৩ টি প্রমো ও টিজার ক্লিপ লেফটওভারে ফিল্টার করা হয়েছে',
        '১ টি মিসিং পর্বের গ্যাপ সনাক্ত করা হয়েছে (পর্ব ০৩)'
      ],
      sequenceState: [],
      leftoverState: []
    },
    {
      id: 'h2',
      title: 'ম্যানুয়াল সিকোয়েন্স রি-অর্ডার ও ফিল্টার',
      timestamp: 'গতকাল, ১৪:১৫',
      isLatest: false,
      changeLog: [
        'পর্ব ০২ ও পর্ব ০৩ ধারাবাহিক ক্রমে রিনাম্বার করা হয়েছে',
        'বিশেষ ক্লিপ আলাদা ট্যাগ যুক্ত করা হয়েছে'
      ],
      sequenceState: [],
      leftoverState: []
    },
    {
      id: 'h3',
      title: 'প্রাথমিক প্লেলিস্ট প্রজেক্ট সেটআপ',
      timestamp: '২ দিন আগে',
      isLatest: false,
      changeLog: [
        'নতুন টিভি সিরিয়াল প্লেলিস্ট ওয়ার্কস্পেস তৈরি করা হয়েছে',
        'কীওয়ার্ড ফিল্টার রুলস কনফিগার করা হয়েছে'
      ],
      sequenceState: [],
      leftoverState: []
    }
  ];

  const itemsToDisplay = historyItems.length > 0 ? historyItems : defaultHistory;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-[#dae2fd]">ভার্সন হিস্ট্রি ও রোলব্যাক</h1>
        <p className="text-sm text-[#c7c4d7]">
          পূর্ববর্তী পরিবর্তনসমূহ ও এআই এক্সট্রাকশন লগ পর্যালোচনা করুন এবং প্রয়োজনে যেকোনো পূর্বের ভার্সন ফিরিয়ে আনুন।
        </p>
      </div>

      <div className="relative border-l-2 border-[#464554]/40 ml-4 space-y-6">
        {itemsToDisplay.map((item, index) => (
          <div key={item.id} className="relative pl-6 sm:pl-8 group">
            {/* Timeline Dot */}
            <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-4 border-[#0b1326] ${
              item.isLatest ? 'bg-[#8083ff] ring-4 ring-[#8083ff]/20' : 'bg-[#464554]'
            }`} />

            <div className="bg-[#171f33] rounded-3xl border border-[#464554]/30 p-5 space-y-3 shadow-md hover:border-[#8083ff]/40 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {item.isLatest && (
                      <span className="px-2.5 py-0.5 bg-[#8083ff]/20 text-[#c0c1ff] border border-[#8083ff]/30 text-[10px] font-bold rounded-full uppercase tracking-wider">
                        সর্বশেষ ভার্সন
                      </span>
                    )}
                    <span className="text-xs text-[#c7c4d7]/70 flex items-center space-x-1">
                      <Clock size={12} />
                      <span>{item.timestamp}</span>
                    </span>
                  </div>
                  <h2 className="text-sm font-bold text-[#dae2fd]">{item.title}</h2>
                </div>

                {!item.isLatest && (
                  <button
                    onClick={() => {
                      onRestore(item);
                      onSelectTab('workbench');
                    }}
                    className="px-3.5 py-1.5 bg-[#222a3d] hover:bg-[#8083ff] text-[#dae2fd] hover:text-[#0d0096] text-xs font-bold rounded-xl border border-[#464554]/40 transition-all flex items-center space-x-1.5 self-start sm:self-auto"
                  >
                    <RotateCcw size={14} />
                    <span>এই ভার্সনে ফিরুন</span>
                  </button>
                )}
              </div>

              {/* Change Log */}
              <div className="bg-[#0b1326] rounded-2xl p-3.5 border border-[#464554]/20 space-y-1.5">
                <div className="text-[10px] font-bold text-[#c0c1ff] uppercase tracking-wider">পরিবর্তনের বিবরণ (Change Log)</div>
                <ul className="text-xs text-[#c7c4d7] space-y-1 list-disc list-inside">
                  {item.changeLog.map((log, i) => (
                    <li key={i}>{log}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
