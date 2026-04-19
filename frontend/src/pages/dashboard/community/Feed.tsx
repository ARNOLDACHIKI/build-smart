import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { FeedItem } from './types';
import PostCard from './PostCard';

type FeedProps = {
  posts: FeedItem[];
  isLoading: boolean;
  isMutating: boolean;
  highlightedPostId: string | null;
  bookmarks: Record<string, boolean>;
  votes: Record<string, 'up' | 'down' | null>;
  onBookmark: (id: string) => Promise<void>;
  onVote: (id: string, vote: 'up' | 'down') => Promise<void>;
  onReport: (id: string) => Promise<void>;
  onShare: (id: string) => void;
  onViewDiscussion: (id: string) => void;
  onJoinLiveRoom: (payload: { roomId: string; title: string }) => void;
};

const INITIAL_BATCH_SIZE = 8;
const LOAD_STEP = 5;

const isArticleLikePost = (post: FeedItem) => {
  const kind = (post.kind || '').toLowerCase();
  const tags = (post.tags || []).map((tag) => tag.toLowerCase());
  const title = post.title.toLowerCase();

  if (
    kind.includes('article') ||
    kind.includes('guide') ||
    kind.includes('brief') ||
    kind.includes('research') ||
    kind.includes('method statement') ||
    kind.includes('site bulletin') ||
    kind.includes('technical note') ||
    kind.includes('checklist') ||
    kind.includes('case study')
  ) {
    return true;
  }

  if (tags.includes('article') || title.startsWith('article:')) {
    return true;
  }

  return false;
};

const Feed = ({
  posts,
  isLoading,
  isMutating,
  highlightedPostId,
  bookmarks,
  votes,
  onBookmark,
  onVote,
  onReport,
  onShare,
  onViewDiscussion,
  onJoinLiveRoom,
}: FeedProps) => {
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const spotlightPosts = useMemo(() => posts.filter(isArticleLikePost).slice(0, 3), [posts]);
  const spotlightIds = useMemo(() => new Set(spotlightPosts.map((post) => post.id)), [spotlightPosts]);
  const regularPosts = useMemo(() => posts.filter((post) => !spotlightIds.has(post.id)), [posts, spotlightIds]);

  useEffect(() => {
    setVisibleCount(INITIAL_BATCH_SIZE);
  }, [posts]);

  useEffect(() => {
    const target = sentinelRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          setVisibleCount((current) => Math.min(regularPosts.length, current + LOAD_STEP));
        }
      },
      { rootMargin: '260px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [regularPosts.length]);

  const visiblePosts = useMemo(() => regularPosts.slice(0, visibleCount), [regularPosts, visibleCount]);

  if (isLoading) {
    return (
      <div className="space-y-5">
        {Array.from({ length: 6 }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-2xl border border-[#2A2D3C] bg-[#1A1D2B] p-4"
          >
            <div className="h-3 w-24 animate-pulse rounded bg-[#2A2D3C]" />
            <div className="mt-3 h-5 w-2/3 animate-pulse rounded bg-[#2A2D3C]" />
            <div className="mt-2.5 h-3 w-full animate-pulse rounded bg-[#2A2D3C]" />
            <div className="mt-2 h-3 w-5/6 animate-pulse rounded bg-[#2A2D3C]" />
            <div className="mt-4 h-40 animate-pulse rounded-xl bg-[#2A2D3C]" />
          </motion.div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#3A4156] bg-[#1A1D2B]/50 px-6 py-12 text-center">
        <p className="text-sm font-medium text-slate-400">No posts matched your current filters.</p>
        <p className="mt-1 text-xs text-slate-500">Try adjusting your search or exploring other topics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {spotlightPosts.length > 0 && (
        <section className="overflow-hidden rounded-2xl border border-[#2A2D3C] bg-[#1A1D2B]/80 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#BED234]">Articles Spotlight</p>
            <p className="text-[11px] text-slate-500">Top reads from the construction community</p>
          </div>
          <div className="space-y-4">
            {spotlightPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isMutating={isMutating}
                isHighlighted={highlightedPostId === post.id}
                isLiked={votes[post.id] === 'up'}
                isSaved={Boolean(bookmarks[post.id])}
                onLike={(id) => onVote(id, 'up')}
                onSave={onBookmark}
                onReport={onReport}
                onShare={onShare}
                onViewDiscussion={onViewDiscussion}
                onJoinLiveRoom={onJoinLiveRoom}
              />
            ))}
          </div>
        </section>
      )}

      {visiblePosts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          isMutating={isMutating}
          isHighlighted={highlightedPostId === post.id}
          isLiked={votes[post.id] === 'up'}
          isSaved={Boolean(bookmarks[post.id])}
          onLike={(id) => onVote(id, 'up')}
          onSave={onBookmark}
          onReport={onReport}
          onShare={onShare}
          onViewDiscussion={onViewDiscussion}
          onJoinLiveRoom={onJoinLiveRoom}
        />
      ))}

      <div ref={sentinelRef} className="h-4" />
    </div>
  );
};

export default Feed;
