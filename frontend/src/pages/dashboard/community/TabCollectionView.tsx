import { Bookmark, BookmarkCheck, ThumbsDown, ThumbsUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { FeedDensity, LocalItem } from './types';

type TabCollectionViewProps = {
  items: LocalItem[];
  density: FeedDensity;
  isLoading: boolean;
  isMutating: boolean;
  bookmarks: Record<string, boolean>;
  follows: Record<string, boolean>;
  votes: Record<string, 'up' | 'down' | null>;
  onBookmark: (id: string) => Promise<void>;
  onFollow: (id: string) => Promise<void>;
  onVote: (id: string, vote: 'up' | 'down') => Promise<void>;
};

const TabCollectionView = ({
  items,
  density,
  isLoading,
  isMutating,
  bookmarks,
  follows,
  votes,
  onBookmark,
  onFollow,
  onVote,
}: TabCollectionViewProps) => {
  const isCompact = density === 'compact';

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="animate-pulse rounded-xl border border-[#2A2D3C] bg-[#1A1D2B] p-4">
            <div className="h-4 w-2/3 rounded bg-[#2A2D3C]" />
            <div className="mt-2 h-3 w-full rounded bg-[#2A2D3C]" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#2A2D3C] px-4 py-10 text-center text-sm text-slate-400">
        No results found in this tab.
      </div>
    );
  }

  return (
    <div className={isCompact ? 'space-y-3' : 'space-y-4'}>
      {items.map((item, index) => (
        <article
          key={item.id}
          className={`group rounded-xl border border-[#2A2D3C] bg-[#1A1D2B] transition hover:border-[#3A4156] animate-in fade-in slide-in-from-bottom-1 duration-300 ${
            isCompact ? 'p-3.5' : 'p-4'
          }`}
          style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
        >
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {item.kind && <Badge variant="outline" className="border-[#2A2D3C] text-slate-300">{item.kind}</Badge>}
            <Badge variant="secondary" className="border border-[#2A2D3C] bg-[#121420] text-slate-300">{item.field}</Badge>
            {item.status && <Badge variant="outline" className="border-[#2A2D3C] text-slate-300">{item.status}</Badge>}
            {item.budget && <Badge variant="outline" className="border-[#2A2D3C] text-slate-300">{item.budget}</Badge>}
          </div>
          <h3 className="text-[18px] font-semibold leading-6 text-slate-100">{item.title}</h3>
          <p className={`${isCompact ? 'mt-2' : 'mt-3'} line-clamp-3 text-[14px] leading-6 text-slate-300`}>{item.summary}</p>
          <div className={`${isCompact ? 'mt-3' : 'mt-4'} flex flex-wrap gap-2`}>
            {item.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-md border border-[#2A2D3C] bg-[#121420] px-2 py-1 text-[12px] text-slate-400">#{tag}</span>
            ))}
          </div>
          <div className={`${isCompact ? 'mt-3 pt-2.5' : 'mt-4 pt-3'} flex items-center justify-between border-t border-[#2A2D3C]`}>
            <span className="text-[12px] text-slate-500">{item.metrics}</span>
            <div className="flex items-center gap-1">
              <Button size="sm" variant={follows[item.id] ? 'secondary' : 'ghost'} onClick={() => void onFollow(item.id)} disabled={isMutating} className="community-action-reveal h-8 border border-[#2A2D3C] bg-transparent px-2 text-slate-300 opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:pointer-events-auto hover:bg-[#121420]" style={{ transitionDelay: '0ms' }}>
                {follows[item.id] ? 'Following' : 'Follow'}
              </Button>
              <Button size="sm" variant={votes[item.id] === 'up' ? 'secondary' : 'ghost'} onClick={() => void onVote(item.id, 'up')} disabled={isMutating} className="community-action-reveal h-8 w-8 border border-transparent p-0 text-slate-300 opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:pointer-events-auto hover:border-[#2A2D3C] hover:bg-[#121420]" style={{ transitionDelay: '20ms' }}>
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <Button size="sm" variant={votes[item.id] === 'down' ? 'secondary' : 'ghost'} onClick={() => void onVote(item.id, 'down')} disabled={isMutating} className="community-action-reveal h-8 w-8 border border-transparent p-0 text-slate-300 opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:pointer-events-auto hover:border-[#2A2D3C] hover:bg-[#121420]" style={{ transitionDelay: '42ms' }}>
                <ThumbsDown className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => void onBookmark(item.id)} disabled={isMutating} className="community-action-reveal h-8 w-8 border border-transparent p-0 text-slate-300 opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:pointer-events-auto hover:border-[#2A2D3C] hover:bg-[#121420]" style={{ transitionDelay: '92ms' }}>
                {bookmarks[item.id] ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

export default TabCollectionView;
