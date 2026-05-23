import { Bookmark, BookmarkCheck, ThumbsUp } from 'lucide-react';
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
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="animate-pulse rounded-lg border border-[#2A2D3C] bg-[#1A1D2B] p-3">
            <div className="h-3 w-2/3 rounded bg-[#2A2D3C]" />
            <div className="mt-2 h-2.5 w-full rounded bg-[#2A2D3C]" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[#2A2D3C] px-4 py-12 text-center">
        <p className="text-sm text-slate-400">No content available</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="pb-3 mb-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{items.length} items</p>
      </div>
      <div className={isCompact ? 'space-y-2' : 'space-y-3'}>
        {items.map((item, index) => (
          <article
            key={item.id}
            className={`group rounded-lg border border-[#2A2D3C] bg-[#1A1D2B] hover:border-[#3A4156] transition-all duration-200 animate-in fade-in slide-in-from-bottom-1 ${
              isCompact ? 'p-3' : 'p-3.5'
            }`}
            style={{ animationDelay: `${Math.min(index, 8) * 30}ms` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  {item.kind && <Badge variant="secondary" className="text-xs bg-[#121420] border-[#2A2D3C]">{item.kind}</Badge>}
                  {item.status && <Badge variant="outline" className="text-xs border-[#2A2D3C]">{item.status}</Badge>}
                </div>
                <h3 className="text-sm font-semibold text-slate-100 line-clamp-2">{item.title}</h3>
                <p className="mt-1 text-xs text-slate-400 line-clamp-2">{item.summary}</p>
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  {item.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="text-xs text-slate-500">#{tag}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => void onVote(item.id, 'up')} 
                  disabled={isMutating} 
                  className="h-7 w-7 p-0 text-slate-400 hover:text-slate-200 hover:bg-[#2A2D3C]/50"
                >
                  <ThumbsUp className={`h-3.5 w-3.5 ${votes[item.id] === 'up' ? 'fill-current' : ''}`} />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => void onBookmark(item.id)} 
                  disabled={isMutating} 
                  className="h-7 w-7 p-0 text-slate-400 hover:text-slate-200 hover:bg-[#2A2D3C]/50"
                >
                  {bookmarks[item.id] ? <BookmarkCheck className="h-3.5 w-3.5 fill-current" /> : <Bookmark className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>{item.metrics}</span>
              <Button 
                size="sm" 
                variant={follows[item.id] ? 'secondary' : 'ghost'} 
                onClick={() => void onFollow(item.id)} 
                disabled={isMutating}
                className="h-6 px-2 text-xs border-[#2A2D3C] hover:bg-[#2A2D3C]/50"
              >
                {follows[item.id] ? 'Following' : 'Follow'}
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default TabCollectionView;
