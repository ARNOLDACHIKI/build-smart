import { useMemo, useState } from 'react';
import { MessageCircle, MoreHorizontal, Share2, ThumbsUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { FeedItem } from './types';
import MediaRenderer from './MediaRenderer';

type PostCardProps = {
  post: FeedItem;
  isMutating: boolean;
  isHighlighted: boolean;
  isLiked: boolean;
  isSaved: boolean;
  onLike: (id: string) => Promise<void>;
  onSave: (id: string) => Promise<void>;
  onReport: (id: string) => Promise<void>;
  onShare: (id: string) => void;
  onViewDiscussion: (id: string) => void;
  onJoinLiveRoom: (payload: { roomId: string; title: string }) => void;
};

const getInitials = (name: string) => {
  const tokens = name
    .split(' ')
    .map((token) => token.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (tokens.length === 0) return 'CM';
  return tokens.map((token) => token[0]?.toUpperCase() || '').join('');
};

const formatPublishedAt = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
};

const PostCard = ({
  post,
  isMutating,
  isHighlighted,
  isLiked,
  isSaved,
  onLike,
  onSave,
  onReport,
  onShare,
  onViewDiscussion,
  onJoinLiveRoom,
}: PostCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const canExpand = post.summary.length > 150;
  const visibleSummary = useMemo(() => {
    if (isExpanded || !canExpand) return post.summary;
    return `${post.summary.slice(0, 150).trim()}...`;
  }, [canExpand, isExpanded, post.summary]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={
        isHighlighted
          ? {
              opacity: 1,
              y: 0,
              scale: [1, 1.012, 1],
            }
          : {
              opacity: 1,
              y: 0,
              scale: 1,
            }
      }
      transition={{ duration: isHighlighted ? 0.6 : 0.24, ease: 'easeOut' }}
      className={`overflow-hidden rounded-2xl border bg-[#1A1D2B] shadow-[0_12px_28px_-24px_rgba(0,0,0,0.9)] transition-all hover:border-[#3A4156] ${
        isHighlighted
          ? 'border-[#BED234] shadow-[0_0_0_1px_rgba(190,210,52,0.25),0_14px_34px_-18px_rgba(190,210,52,0.45)]'
          : 'border-[#2A2D3C]'
      }`}
    >
      <div className="flex items-start justify-between gap-2.5 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar className="h-8 w-8 flex-shrink-0 border border-[#2A2D3C] bg-[#232738]">
            <AvatarFallback className="bg-[#232738] text-[9px] font-semibold text-slate-200">{getInitials(post.author)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-sm font-semibold leading-tight text-slate-100">{post.author}</p>
              {post.verified && <Badge className="h-4 flex-shrink-0 border-0 bg-[#BED234] px-1.5 text-[8px] font-medium text-[#121420]">Verified</Badge>}
            </div>
            <p className="truncate text-[11px] leading-snug text-slate-500">{post.field} • {formatPublishedAt(post.createdAt)}</p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" className="h-8 w-8 rounded-full border border-transparent p-0 text-slate-300 hover:border-[#2A2D3C] hover:bg-[#121420]">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="border-[#2A2D3C] bg-[#1A1D2B] text-slate-100">
            <DropdownMenuItem onClick={() => void onSave(post.id)} className="focus:bg-[#121420] focus:text-slate-100">
              {isSaved ? 'Saved' : 'Save post'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onShare(post.id)} className="focus:bg-[#121420] focus:text-slate-100">
              Share post
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => void onReport(post.id)} className="focus:bg-[#121420] focus:text-slate-100">
              Report post
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {post.media && post.media.length > 0 && <MediaRenderer media={post.media} />}

      <div className="space-y-2.5 px-4 py-4">
        <p className="text-base font-semibold leading-snug text-slate-100">{post.title}</p>
        <p className="text-sm leading-relaxed text-slate-300">{visibleSummary}</p>
        {canExpand && (
          <button
            type="button"
            onClick={() => setIsExpanded((current) => !current)}
            className="mt-1 text-xs font-semibold text-[#BED234] transition hover:text-[#d0e855]"
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        )}

        {post.liveSession && (
          <button
            type="button"
            onClick={() => post.liveSession?.roomId && onJoinLiveRoom({ roomId: post.liveSession.roomId, title: post.liveSession.title })}
            className="inline-flex rounded-full bg-[#BED234] px-3 py-1.5 text-xs font-semibold text-[#121420]"
          >
            Join live room
          </button>
        )}
      </div>

      <div className="flex items-center gap-1 border-t border-[#2A2D3C] px-3 py-2.5">
        <Button
          size="sm"
          variant={isLiked ? 'secondary' : 'ghost'}
          onClick={() => void onLike(post.id)}
          disabled={isMutating}
          className="h-8 rounded-full px-3 text-xs font-medium text-slate-400 transition hover:bg-[#1A1D2B] hover:text-slate-200 disabled:opacity-50"
        >
          <ThumbsUp className="mr-1.5 h-3.5 w-3.5" /> Like
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => onViewDiscussion(post.id)}
          className="h-8 rounded-full px-3 text-xs font-medium text-slate-400 transition hover:bg-[#1A1D2B] hover:text-slate-200"
        >
          <MessageCircle className="mr-1.5 h-3.5 w-3.5" /> Comment
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => onShare(post.id)}
          className="ml-auto h-8 w-8 rounded-full p-0 text-slate-400 transition hover:bg-[#1A1D2B] hover:text-slate-200"
          aria-label="Share post"
        >
          <Share2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </motion.article>
  );
};

export default PostCard;
