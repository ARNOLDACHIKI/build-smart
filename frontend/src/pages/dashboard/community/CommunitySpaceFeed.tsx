import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  getCommunityFeed,
  getCommunitySpaces,
  type CommunityFeedResponse,
  type CommunitySpaceSummary,
} from '@/lib/community';
import Feed from './Feed';
import { expandedMockPosts } from './expandedMockPosts';
import CommentThreadModal from './CommentThreadModal';
import { joinCommunitySpace } from '@/lib/community';

const CommunitySpaceFeed = () => {
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [space, setSpace] = useState<CommunitySpaceSummary | null>(null);
  const [feed, setFeed] = useState<CommunityFeedResponse>({
    posts: [...expandedMockPosts.slice(0, 8)],
    updates: [],
    ads: [],
    state: {
      bookmarks: [],
      follows: [],
      votes: {},
      pollVotes: {},
      chatMessages: [],
    },
    recommendations: [],
    personalization: {
      role: 'USER',
      inferredField: 'Engineering',
      interestTokens: [],
    },
    moderation: {
      canPinUpdates: false,
      canApproveAds: false,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  const [follows, setFollows] = useState<Record<string, boolean>>({});
  const [votes, setVotes] = useState<Record<string, 'up' | 'down' | null>>({});
  const [highlightedPostId] = useState<string | null>(null);
  const [discussionOpen, setDiscussionOpen] = useState(false);
  const [activePostId, setActivePostId] = useState<string | null>(null);

  // Load space and feed
  useEffect(() => {
    const loadData = async () => {
      if (!spaceId) {
        navigate('/dashboard/community');
        return;
      }

      try {
        setIsLoading(true);

        // Get the space details
        const spacesResponse = await getCommunitySpaces();
        const currentSpace = spacesResponse.spaces.find((s) => s.id === spaceId);

        if (!currentSpace) {
          toast({
            title: 'Community not found',
            description: 'The community space you are looking for does not exist.',
            variant: 'destructive',
          });
          navigate('/dashboard/community');
          return;
        }

        setSpace(currentSpace);

        // Get the feed for this specific space
        const feedData = await getCommunityFeed({ spaceId });
        const mergedFeed = {
          ...feedData,
          posts: feedData.posts.length > 0 ? [...feedData.posts, ...expandedMockPosts.slice(0, 4)] : expandedMockPosts.slice(0, 8),
        };
        setFeed(mergedFeed);

        // Restore bookmarks and votes from feed state
        if (mergedFeed.state?.bookmarks) {
          const bookmarkMap: Record<string, boolean> = {};
          mergedFeed.state.bookmarks.forEach((id) => {
            bookmarkMap[id] = true;
          });
          setBookmarks(bookmarkMap);
        }

        if (mergedFeed.state?.follows) {
          const followMap: Record<string, boolean> = {};
          mergedFeed.state.follows.forEach((id) => {
            followMap[id] = true;
          });
          setFollows(followMap);
        }

        if (mergedFeed.state?.votes) {
          setVotes(mergedFeed.state.votes);
        }
      } catch (error) {
        console.error('Error loading community feed:', error);
        toast({
          title: 'Failed to load community feed',
          description: error instanceof Error ? error.message : 'Please try again.',
          variant: 'destructive',
        });
        // Use mock data as fallback
        setFeed({
          posts: expandedMockPosts.slice(0, 8),
          updates: [],
          ads: [],
          state: {
            bookmarks: [],
            follows: [],
            votes: {},
            pollVotes: {},
            chatMessages: [],
          },
          recommendations: [],
          personalization: {
            role: 'USER',
            inferredField: 'Engineering',
            interestTokens: [],
          },
          moderation: {
            canPinUpdates: false,
            canApproveAds: false,
          },
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [spaceId, navigate, toast]);

  const toggleBookmark = useCallback(async (postId: string) => {
    setBookmarks((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  }, []);

  const toggleFollow = useCallback(async (postId: string) => {
    setFollows((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  }, []);

  const castVote = useCallback(async (postId: string, voteType: 'up' | 'down') => {
    setVotes((prev) => ({
      ...prev,
      [postId]: prev[postId] === voteType ? null : voteType,
    }));
  }, []);

  const handleReport = useCallback(async (postId: string) => {
    toast({
      title: 'Post reported',
      description: 'Thank you for reporting this content.',
    });
  }, [toast]);

  const handleDelete = useCallback(async (postId: string) => {
    setFeed((prev) => ({
      ...prev,
      posts: prev.posts.filter((post) => post.id !== postId),
    }));
    toast({
      title: 'Post deleted',
      description: 'The post has been removed.',
    });
  }, [toast]);

  const handleJoinLiveRoom = useCallback(
    (payload: { roomId: string; title: string }) => {
      toast({
        title: 'Joining live room',
        description: `Connecting to ${payload.title}...`,
      });
      window.open(payload.roomUrl || `https://meet.google.com/${payload.roomId}`, '_blank');
    },
    [toast]
  );

  return (
    <div className="min-h-screen bg-[#0F1218]">
      <div className="border-b border-[#2A2D3C] bg-[#121420] sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/community')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Communities
          </Button>
          {space && (
            <div className="flex-1">
              <h1 className="text-xl font-bold text-slate-100">{space.name}</h1>
              <p className="text-sm text-slate-400">{space.description}</p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-[#2A2D3C] bg-[#1A1D2B] p-4">
                <div className="h-4 w-24 rounded bg-[#2A2D3C]" />
                <div className="mt-3 h-6 w-2/3 rounded bg-[#2A2D3C]" />
                <div className="mt-2 h-4 w-full rounded bg-[#2A2D3C]" />
              </div>
            ))}
          </div>
        ) : feed.posts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#3A4156] bg-[#1A1D2B]/50 px-6 py-12 text-center">
            <p className="text-sm font-medium text-slate-400">No posts in this community yet.</p>
            <p className="mt-1 text-xs text-slate-500">Be the first to share something!</p>
          </div>
        ) : (
            <Feed
            posts={feed.posts.map((post) => ({
              id: post.id,
              title: post.title,
              summary: post.summary,
              author: post.author,
              field: post.field,
              tags: post.interests || [],
              location: feed.personalization.inferredField,
              contentTypes: [],
              metrics: typeof post.stats === 'string' ? post.stats : `${post.stats?.likes || 0} likes, ${post.stats?.comments || 0} comments`,
              createdAt: post.createdAt,
              kind: post.type,
              verified: true,
              media: post.media || [],
              liveSession: post.liveSession || null,
              source: 'api',
              canDelete: post.canDelete || false,
            }))}
            isLoading={isLoading}
            isMutating={isMutating}
            highlightedPostId={highlightedPostId}
            bookmarks={bookmarks}
            follows={follows}
            votes={votes}
            onBookmark={toggleBookmark}
            onFollow={toggleFollow}
            onVote={castVote}
            onDelete={handleDelete}
            onReport={handleReport}
            onShare={() => {}}
            onViewDiscussion={() => {}}
            onJoinLiveRoom={handleJoinLiveRoom}
            onToggleEngagementVisibility={async () => {}}
            onViewDiscussion={(id) => {
              setActivePostId(id);
              setDiscussionOpen(true);
            }}
            />
        )}
      </div>
      <CommentThreadModal
        postId={activePostId}
        open={discussionOpen}
        canComment={Boolean(space && (space.isOwner || space.viewerMembership?.status === 'ACTIVE'))}
        onRequestJoin={async () => {
          if (!space) return;
          try {
            setIsMutating(true);
            const res = await joinCommunitySpace(space.id);
            if (res?.space) setSpace(res.space);
            toast({ title: 'Requested to join', description: res?.message || 'Membership updated.' });
          } catch (err) {
            toast({ title: 'Join failed', description: err instanceof Error ? err.message : 'Unable to join', variant: 'destructive' });
          } finally {
            setIsMutating(false);
          }
        }}
        onOpenChange={(open) => {
          setDiscussionOpen(open);
          if (!open) setActivePostId(null);
        }}
      />
    </div>
  );
};

export default CommunitySpaceFeed;
