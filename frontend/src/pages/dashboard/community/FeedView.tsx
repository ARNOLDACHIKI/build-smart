import { useEffect, useMemo, useRef, useState } from 'react';
import { Bookmark, BookmarkCheck, Flag, ThumbsDown, ThumbsUp } from 'lucide-react';
import { assetUrl } from '@/lib/api';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { FeedDensity, FeedItem } from './types';

type FeedViewProps = {
  posts: FeedItem[];
  density: FeedDensity;
  isLoading: boolean;
  isMutating: boolean;
  bookmarks: Record<string, boolean>;
  votes: Record<string, 'up' | 'down' | null>;
  onBookmark: (id: string) => Promise<void>;
  onVote: (id: string, vote: 'up' | 'down') => Promise<void>;
  onReport: (id: string) => Promise<void>;
  onJoinLiveRoom: (payload: { roomId: string; title: string }) => void;
};

const INITIAL_BATCH_SIZE = 8;
const LOAD_STEP = 5;

const FeedView = ({
  posts,
  density,
  isLoading,
  isMutating,
  bookmarks,
  votes,
  onBookmark,
  onVote,
  onReport,
  onJoinLiveRoom,
}: FeedViewProps) => {
    const isCompact = density === 'compact';

  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

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
          setVisibleCount((current) => Math.min(posts.length, current + LOAD_STEP));
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [posts.length]);

  const visiblePosts = useMemo(() => posts.slice(0, visibleCount), [posts, visibleCount]);

  const initials = (name: string) => {
    const tokens = name
      .split(' ')
      .map((token) => token.trim())
      .filter(Boolean)
      .slice(0, 2);
    if (tokens.length === 0) return 'CM';
    return tokens.map((token) => token[0]?.toUpperCase() || '').join('');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="animate-pulse rounded-xl border border-[#2A2D3C] bg-[#1A1D2B] p-4">
            <div className="h-3 w-24 rounded bg-[#2A2D3C]" />
            <div className="mt-3 h-5 w-2/3 rounded bg-[#2A2D3C]" />
            <div className="mt-2 h-3 w-full rounded bg-[#2A2D3C]" />
            <div className="mt-2 h-3 w-5/6 rounded bg-[#2A2D3C]" />
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#2A2D3C] px-4 py-10 text-center text-sm text-slate-400">
        No posts matched your current filters.
      </div>
    );
  }

  return (
    <div className={isCompact ? 'space-y-3' : 'space-y-4'}>
      {visiblePosts.map((post, index) => (
        <article
          key={post.id}
          className={`group rounded-xl border border-[#2A2D3C] bg-[#1A1D2B] transition hover:border-[#3A4156] animate-in fade-in slide-in-from-bottom-1 duration-300 ${
            isCompact ? 'p-3.5' : 'p-4'
          }`}
          style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
        >
          <div className={`flex items-center justify-between gap-3 ${isCompact ? 'mb-2' : 'mb-3'}`}>
            <div className="flex min-w-0 items-center gap-2">
              <Avatar className="h-8 w-8 border border-[#2A2D3C] bg-[#232738]">
                <AvatarFallback className="bg-[#232738] text-[10px] text-slate-200">{initials(post.author)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-100">{post.author}</p>
                <p className="truncate text-xs text-slate-400">{post.field}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-[#2A2D3C] bg-transparent text-[10px] uppercase tracking-wide text-slate-300">
                {post.kind || 'Post'}
              </Badge>
              {post.verified && <Badge className="border-0 bg-[#BED234] text-[10px] text-[#121420]">Verified</Badge>}
            </div>
          </div>

          <h2 className="text-[18px] font-semibold leading-6 text-slate-100">{post.title}</h2>
          <p className={`line-clamp-3 text-[14px] leading-6 text-slate-300 ${isCompact ? 'mt-1.5' : 'mt-2'}`}>{post.summary}</p>

          {post.media && post.media.length > 0 && (
            <div className={`${isCompact ? 'mt-3' : 'mt-4'} grid gap-2 sm:grid-cols-2`}>
              {post.media.slice(0, 4).map((media) => {
                const src = assetUrl(media.url);
                if (!src) return null;

                return media.mediaType === 'video' ? (
                  <video key={`${post.id}-${media.url}`} controls className="h-44 w-full rounded-lg border border-[#2A2D3C] bg-black/80 object-cover">
                    <source src={src} />
                  </video>
                ) : (
                  <img
                    key={`${post.id}-${media.url}`}
                    src={src}
                    alt={media.fileName}
                    className="h-44 w-full rounded-lg border border-[#2A2D3C] object-cover"
                    loading="lazy"
                  />
                );
              })}
            </div>
          )}

          {post.liveSession && (
            <div className={`${isCompact ? 'mt-3' : 'mt-4'} rounded-lg border border-[#2A2D3C] bg-[#121420] p-3`}>
              <p className="text-sm font-semibold text-slate-100">Live Session: {post.liveSession.title}</p>
              <p className="mt-1 text-xs text-slate-400">Starts: {new Date(post.liveSession.startsAt).toLocaleString()}</p>
              {post.liveSession.description && (
                <p className="mt-1 text-xs text-slate-400">{post.liveSession.description}</p>
              )}
              {post.liveSession.roomId ? (
                <button
                  type="button"
                  onClick={() => onJoinLiveRoom({ roomId: post.liveSession!.roomId!, title: post.liveSession!.title })}
                  className="mt-2 inline-flex rounded-md bg-[#BED234] px-3 py-1.5 text-xs font-medium text-[#121420] hover:brightness-95"
                >
                  Join live room
                </button>
              ) : (
                <a
                  href={post.liveSession.roomUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex rounded-md bg-[#BED234] px-3 py-1.5 text-xs font-medium text-[#121420] hover:brightness-95"
                >
                  Join live room
                </a>
              )}
            </div>
          )}

          <div className={`${isCompact ? 'mt-3' : 'mt-4'} flex flex-wrap gap-2`}>
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-md border border-[#2A2D3C] bg-[#121420] px-2 py-1 text-[12px] text-slate-400">
                #{tag}
              </span>
            ))}
          </div>

          <div className={`${isCompact ? 'mt-3 pt-2.5' : 'mt-4 pt-3'} flex items-center justify-between gap-2 border-t border-[#2A2D3C]`}>
            <span className="text-[12px] text-slate-500">{post.metrics}</span>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant={votes[post.id] === 'up' ? 'secondary' : 'ghost'}
                onClick={() => void onVote(post.id, 'up')}
                disabled={isMutating}
                className="community-action-reveal h-8 w-8 border border-transparent p-0 text-slate-300 opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:pointer-events-auto hover:border-[#2A2D3C] hover:bg-[#121420]"
                style={{ transitionDelay: '0ms' }}
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={votes[post.id] === 'down' ? 'secondary' : 'ghost'}
                onClick={() => void onVote(post.id, 'down')}
                disabled={isMutating}
                className="community-action-reveal h-8 w-8 border border-transparent p-0 text-slate-300 opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:pointer-events-auto hover:border-[#2A2D3C] hover:bg-[#121420]"
                style={{ transitionDelay: '22ms' }}
              >
                <ThumbsDown className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => void onBookmark(post.id)} disabled={isMutating} className="community-action-reveal h-8 w-8 border border-transparent p-0 text-slate-300 opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:pointer-events-auto hover:border-[#2A2D3C] hover:bg-[#121420]" style={{ transitionDelay: '70ms' }}>
                {bookmarks[post.id] ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => void onReport(post.id)} disabled={isMutating} className="community-action-reveal h-8 w-8 border border-transparent p-0 text-slate-300 opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:pointer-events-auto hover:border-[#2A2D3C] hover:bg-[#121420]" style={{ transitionDelay: '128ms' }}>
                <Flag className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </article>
      ))}

      <div ref={sentinelRef} className="h-3" />
    </div>
  );
};

export default FeedView;
