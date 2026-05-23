import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import ArticlesTab from './tabs/ArticlesTab';
import DiscussionsTab from './tabs/DiscussionsTab';
import EventsTab from './tabs/EventsTab';
import MarketplaceTab from './tabs/MarketplaceTab';
import QATab from './tabs/QATab';
import SimpleTabsWithCount from './SimpleTabsWithCount';
import { localArticles, discussionThreads, eventAnnouncements, marketplaceItems, qaItems } from './data';
import type { TabItem } from './SimpleTabsWithCount';

type TabType = 'articles' | 'discussions' | 'events' | 'marketplace' | 'qa';

const CommunityPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('articles');
  const navigate = useNavigate();

  const tabs: TabItem[] = [
    { id: 'articles', label: 'Articles', count: localArticles.length, active: activeTab === 'articles' },
    { id: 'discussions', label: 'Discussions', count: discussionThreads.length, active: activeTab === 'discussions' },
    { id: 'events', label: 'Events', count: eventAnnouncements.length, active: activeTab === 'events' },
    { id: 'marketplace', label: 'Marketplace', count: marketplaceItems.length, active: activeTab === 'marketplace' },
    { id: 'qa', label: 'Q&A', count: qaItems.length, active: activeTab === 'qa' },
  ];

  const renderContent = () => {
    const commonProps = {
      persona: 'user',
      search: '',
      density: 'comfortable' as const,
      isMutating: false,
      bookmarks: {},
      follows: {},
      votes: {},
      onBookmark: async () => {},
      onFollow: async () => {},
      onVote: async () => {},
    };

    switch (activeTab) {
      case 'articles':
        return <ArticlesTab {...commonProps} />;
      case 'discussions':
        return <DiscussionsTab {...commonProps} />;
      case 'events':
        return <EventsTab {...commonProps} />;
      case 'marketplace':
        return <MarketplaceTab {...commonProps} />;
      case 'qa':
        return <QATab {...commonProps} />;
      default:
        return <ArticlesTab {...commonProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1117]">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-[#2A2D3C] bg-[#121420]/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-100">Community</h1>
          <button
            onClick={() => navigate('/create')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#BED234] text-[#121420] font-semibold hover:brightness-110 transition"
          >
            <Plus className="h-4 w-4" />
            Create Post
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <SimpleTabsWithCount 
          tabs={tabs} 
          onTabChange={(tabId) => setActiveTab(tabId as TabType)} 
        />

        {/* Tab Content */}
        <div className="mt-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
