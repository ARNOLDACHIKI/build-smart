import React, { useState } from 'react';
import FeedList from '@/components/community/FeedList';
import CreatePostModal from '@/components/community/CreatePostModal';
import { Link, useNavigate } from 'react-router-dom';

const LeftNav = ({ onOpenCreate }:{ onOpenCreate: ()=>void }) => (
  <nav className="w-56 pr-4 hidden lg:block">
    <div className="sticky top-20 space-y-2">
      <button className="w-full text-left px-3 py-2 rounded hover:bg-muted">Feed</button>
      <button className="w-full text-left px-3 py-2 rounded hover:bg-muted">Requests</button>
      <button className="w-full text-left px-3 py-2 rounded hover:bg-muted">Professionals</button>
      <Link to="/saved" className="w-full block px-3 py-2 rounded hover:bg-muted">Saved</Link>
      <button onClick={onOpenCreate} className="mt-3 w-full bg-primary text-primary-foreground px-3 py-2 rounded">Create Post</button>
    </div>
  </nav>
);

const RightPanel = () => (
  <aside className="w-56 hidden lg:block pl-4">
    <div className="sticky top-20 space-y-4">
      <div className="p-3 border rounded">
        <h4 className="font-semibold">Trending Tags</h4>
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="px-2 py-1 bg-background border rounded text-sm">#safety</span>
          <span className="px-2 py-1 bg-background border rounded text-sm">#materials</span>
          <span className="px-2 py-1 bg-background border rounded text-sm">#equipment</span>
        </div>
      </div>

      <div className="p-3 border rounded">
        <h4 className="font-semibold">Suggested Pros</h4>
        <ul className="mt-2 text-sm">
          <li className="py-1">Jane Doe · Engineer</li>
          <li className="py-1">Ahmed Ali · Contractor</li>
          <li className="py-1">Lydia Kim · QS</li>
        </ul>
      </div>
    </div>
  </aside>
);

const CommunityPage = () => {
  const [showCreate, setShowCreate] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex gap-6">
        <LeftNav onOpenCreate={() => setShowCreate(true)} />

        <main className="flex-1">
          <div className="mx-auto max-w-[720px]">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">Community</h1>
              <div className="space-x-2">
                <button className="px-3 py-1 border rounded" onClick={() => navigate('/community')}>All</button>
                <button className="px-3 py-1 border rounded">Discussions</button>
                <button className="px-3 py-1 border rounded">Requests</button>
              </div>
            </div>

            <FeedList onOpenPost={(id:string) => navigate(`/community/post/${id}`)} />
          </div>
        </main>

        <RightPanel />
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl">
            <CreatePostModal onClose={() => setShowCreate(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityPage;
