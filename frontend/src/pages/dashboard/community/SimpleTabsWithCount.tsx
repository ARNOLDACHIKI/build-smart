import React from 'react';
import { Badge } from '@/components/ui/badge';

export type TabItem = {
  id: string;
  label: string;
  count: number;
  active: boolean;
  icon?: React.ReactNode;
};

type SimpleTabsWithCountProps = {
  tabs: TabItem[];
  onTabChange: (tabId: string) => void;
};

const SimpleTabsWithCount: React.FC<SimpleTabsWithCountProps> = ({ tabs, onTabChange }) => {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-4 border-b border-[#2A2D3C]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            tab.active
              ? 'bg-[#BED234] text-[#121420]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#2A2D3C]/50'
          }`}
        >
          {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
          <span>{tab.label}</span>
          <Badge 
            variant={tab.active ? 'secondary' : 'outline'}
            className={`text-xs ${
              tab.active 
                ? 'bg-[#121420]/40 text-[#121420]' 
                : 'bg-transparent border-slate-600 text-slate-400'
            }`}
          >
            {tab.count}
          </Badge>
        </button>
      ))}
    </div>
  );
};

export default SimpleTabsWithCount;
