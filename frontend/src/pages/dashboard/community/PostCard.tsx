import { useEffect, useMemo, useState } from 'react';
import { MessageCircle, MoreHorizontal, Share2, ThumbsUp, Trash2, UserCheck, UserPlus } from 'lucide-react';
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
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { getCommunityPostComments, type CommunityPostComment, type CommunityShareTarget } from '@/lib/community';
import type { FeedItem } from './types';
import MediaRenderer from './MediaRenderer';
import DemoLabel from '@/components/community/DemoLabel';

type PostCardProps = {
  post: FeedItem;
  isMutating: boolean;
  isHighlighted: boolean;
  isLiked: boolean;
  isSaved: boolean;
  isFollowing: boolean;
  onLike: (id: string) => Promise<void>;
  onSave: (id: string) => Promise<void>;
  onFollow: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onReport: (id: string) => Promise<void>;
  onShare: (id: string, target?: CommunityShareTarget) => void;
  onViewDiscussion: (id: string) => void;
  onJoinLiveRoom: (payload: { roomId: string; title: string }) => void;
  onToggleEngagementVisibility: (
    id: string,
    payload: { showLikes?: boolean; showComments?: boolean; showFollows?: boolean }
  ) => Promise<void>;
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

const formatCountNoun = (count: number, singular: string, plural: string): string => {
  return `${count} ${count === 1 ? singular : plural}`;
};

const PostCard = ({
  post,
  isMutating,
  isHighlighted,
  isLiked,
  isSaved,
  isFollowing,
  onLike,
  onSave,
  onFollow,
  onDelete,
  onReport,
  onShare,
  onViewDiscussion,
  onJoinLiveRoom,
  onToggleEngagementVisibility,
}: PostCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [commentPreview, setCommentPreview] = useState<CommunityPostComment[]>([]);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [hasLoadedPreview, setHasLoadedPreview] = useState(false);

  const canExpand = post.summary.length > 150;
  const visibleSummary = useMemo(() => {
    if (isExpanded || !canExpand) return post.summary;
    return `${post.summary.slice(0, 150).trim()}...`;
  }, [canExpand, isExpanded, post.summary]);
  const engagement = post.engagement || {
    likes: 0,
    comments: 0,
    follows: 0,
    showLikes: true,
    showComments: true,
    showFollows: true,
  };
  const followerCount = Math.max(engagement.follows, isFollowing ? 1 : 0);
  const commentCount = Math.max(engagement.comments, commentPreview.length);
  const followLabel = formatCountNoun(followerCount, 'follower', 'followers');

  useEffect(() => {
    if (!hasLoadedPreview) {
      setCommentPreview([]);
    }
  }, [hasLoadedPreview, post.id]);

  const loadCommentPreview = async () => {
    if (hasLoadedPreview || isPreviewLoading) return;

    try {
      setIsPreviewLoading(true);
      const result = await getCommunityPostComments(post.id);
      setCommentPreview(result.comments.slice(0, 3));
      setHasLoadedPreview(true);
    } catch {
      setCommentPreview([]);
    } finally {
      setIsPreviewLoading(false);
    }
  };

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
      data-post-id={post.id}
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
            <DropdownMenuItem onClick={() => void onFollow(post.id)} className="focus:bg-[#121420] focus:text-slate-100">
              {isFollowing ? 'Following' : 'Follow'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onShare(post.id)} className="focus:bg-[#121420] focus:text-slate-100">
              Share post
            </DropdownMenuItem>
            {post.canDelete && (
              <DropdownMenuItem onClick={() => void onDelete(post.id)} className="text-red-300 focus:bg-[#121420] focus:text-red-300">
                Delete post
              </DropdownMenuItem>
            )}
            {post.canDelete && (
              <>
                <DropdownMenuItem
                  onClick={() => void onToggleEngagementVisibility(post.id, { showLikes: !engagement.showLikes })}
                  className="focus:bg-[#121420] focus:text-slate-100"
                >
                  {engagement.showLikes ? 'Hide likes count' : 'Show likes count'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => void onToggleEngagementVisibility(post.id, { showComments: !engagement.showComments })}
                  className="focus:bg-[#121420] focus:text-slate-100"
                >
                  {engagement.showComments ? 'Hide comments count' : 'Show comments count'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => void onToggleEngagementVisibility(post.id, { showFollows: !engagement.showFollows })}
                  className="focus:bg-[#121420] focus:text-slate-100"
                >
                  {engagement.showFollows ? 'Hide followers count' : 'Show followers count'}
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuItem onClick={() => void onReport(post.id)} className="focus:bg-[#121420] focus:text-slate-100">
              Report post
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {post.media && post.media.length > 0 && <MediaRenderer media={post.media} />}

      <div className="space-y-2.5 px-4 py-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-base font-semibold leading-snug text-slate-100 flex-1">{post.title}</p>
          {post.demoLabel && <DemoLabel variant="badge" demoLabel={post.demoLabel} />}
        </div>
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
          className="h-8 rounded-full px-3 text-xs font-medium text-slate-400 transition hover:bg-[#1A1D2B] hover:text-slate-200"
        >
          <ThumbsUp className="mr-1.5 h-3.5 w-3.5" />
          {engagement.showLikes ? `Like (${engagement.likes})` : 'Like'}
        </Button>

        <Button
          size="sm"
          variant={isFollowing ? 'secondary' : 'ghost'}
          onClick={() => void onFollow(post.id)}
          className="h-8 rounded-full px-3 text-xs font-medium text-slate-400 transition hover:bg-[#1A1D2B] hover:text-slate-200"
        >
          {isFollowing ? <UserCheck className="mr-1.5 h-3.5 w-3.5" /> : <UserPlus className="mr-1.5 h-3.5 w-3.5" />}
          {engagement.showFollows
            ? `${isFollowing ? 'Following' : 'Follow'} (${followLabel})`
            : isFollowing
              ? 'Following'
              : 'Follow'}
        </Button>

        <HoverCard openDelay={120} closeDelay={80}>
          <HoverCardTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onViewDiscussion(post.id)}
              onMouseEnter={() => void loadCommentPreview()}
              className="h-8 rounded-full px-3 text-xs font-medium text-slate-400 transition hover:bg-[#1A1D2B] hover:text-slate-200"
            >
              <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
              {engagement.showComments ? `Comment (${commentCount})` : 'Comment'}
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-80 border-[#2A2D3C] bg-[#121420] text-slate-100">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-slate-100">Recent comments</p>
                <p className="text-xs text-slate-500">Hover preview for this thread</p>
              </div>
              {isPreviewLoading ? (
                <p className="text-sm text-slate-400">Loading comments...</p>
              ) : commentPreview.length > 0 ? (
                <div className="space-y-2">
                  {commentPreview.map((comment) => (
                    <div key={comment.id} className="rounded-lg border border-[#2A2D3C] bg-[#1A1D2B] p-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-200">{comment.author}</p>
                        <p className="text-[10px] text-slate-500">{new Date(comment.createdAt).toLocaleDateString()}</p>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-300">{comment.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No comments yet.</p>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewDiscussion(post.id)}
                className="w-full border-[#2A2D3C] bg-transparent text-slate-200 hover:bg-[#1A1D2B]"
              >
                Open discussion
              </Button>
            </div>
          </HoverCardContent>
        </HoverCard>

        {post.canDelete && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => void onDelete(post.id)}
            disabled={isMutating}
            className="h-8 rounded-full px-3 text-xs font-medium text-red-300 transition hover:bg-[#1A1D2B] hover:text-red-200 disabled:opacity-50"
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="ml-auto h-8 w-8 rounded-full p-0 text-slate-400 transition hover:bg-[#1A1D2B] hover:text-slate-200"
              aria-label="Share post"
            >
              <Share2 className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="border-[#2A2D3C] bg-[#1A1D2B] text-slate-100">
            <DropdownMenuItem onClick={() => onShare(post.id, 'native')} className="focus:bg-[#121420] focus:text-slate-100">
              Share from device
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onShare(post.id, 'copy')} className="focus:bg-[#121420] focus:text-slate-100">
              Copy link
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onShare(post.id, 'whatsapp')} className="focus:bg-[#121420] focus:text-slate-100">
              WhatsApp
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onShare(post.id, 'facebook')} className="focus:bg-[#121420] focus:text-slate-100">
              Facebook
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onShare(post.id, 'linkedin')} className="focus:bg-[#121420] focus:text-slate-100">
              LinkedIn
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onShare(post.id, 'instagram')} className="focus:bg-[#121420] focus:text-slate-100">
              Instagram
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.article>
  );
};

export default PostCard;
