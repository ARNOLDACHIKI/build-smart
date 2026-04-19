import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  castCommunityVote,
  createCommunityPost,
  deleteCommunityPost,
  getCommunityFeed,
  reportCommunityPost,
  toggleCommunityFollow,
  toggleCommunityBookmark,
  type CommunityFeedResponse,
} from '@/lib/community';
import CommentModal from './community/CommentModal';
import CommunityLayout from './community/CommunityLayout';
import CreatePostModal from './community/CreatePostModal';
import Feed from './community/Feed';
import LiveRoomModal from './community/LiveRoomModal';
import { ReelsPage } from './community/ReelsPage';
import { filterBySearch, sortByPersona } from './community/tabUtils';
import type { FeedItem } from './community/types';
import { expandedMockPosts } from './community/expandedMockPosts';

import mockCommunityData from './community/mockCommunityData';

const initialFeed: CommunityFeedResponse = {
  posts: [...mockCommunityData, ...expandedMockPosts],
  updates: [],
  ads: [],
  recommendations: [],
  state: {
    bookmarks: [],
    follows: [],
    votes: {},
    pollVotes: {},
    chatMessages: [],
  },
  personalization: {
    role: 'USER',
    inferredField: 'Engineering',
    interestTokens: [],
  },
  moderation: {
    canPinUpdates: false,
    canApproveAds: false,
  },
};

const inferContentTypes = (post: CommunityFeedResponse['posts'][number]) => {
  const types = new Set<string>(['text']);
  post.media?.forEach((media) => types.add(media.mediaType));
  const kind = post.type.toLowerCase();
  if (kind.includes('video')) types.add('video');
  if (kind.includes('audio')) types.add('audio');
  if (kind.includes('report') || kind.includes('document')) types.add('document');
  return Array.from(types);
};

const CommunityHubV2 = () => {
  const { toast } = useToast();

  const [feed, setFeed] = useState<CommunityFeedResponse>(initialFeed);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'feed' | 'reels'>('feed');

  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [isLiveRoomOpen, setIsLiveRoomOpen] = useState(false);
  const [activeLiveRoom, setActiveLiveRoom] = useState<{ roomId: string; title: string } | null>(null);

  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  const [follows, setFollows] = useState<Record<string, boolean>>({});
  const [votes, setVotes] = useState<Record<string, 'up' | 'down' | null>>({});
  const [highlightedPostId, setHighlightedPostId] = useState<string | null>(null);

  const loadIdRef = useRef(0);

  const hydrateUiState = (data: CommunityFeedResponse) => {
    setBookmarks(Object.fromEntries(data.state.bookmarks.map((id) => [id, true])));
    setFollows(Object.fromEntries(data.state.follows.map((id) => [id, true])));
    setVotes(
      Object.fromEntries(Object.entries(data.state.votes).map(([itemId, vote]) => [itemId, vote])) as Record<
        string,
        'up' | 'down' | null
      >
    );
  };

  const refreshFeed = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
    const currentLoadId = loadIdRef.current + 1;
    loadIdRef.current = currentLoadId;

    if (!silent) setIsLoading(true);

    try {
      const data = await getCommunityFeed({ q: search.trim() || undefined });
      if (currentLoadId !== loadIdRef.current) return;
      // Merge API posts with expanded mock posts for demo/fallback purposes
      const mergedData = {
        ...data,
        posts: data.posts.length > 0 ? [...data.posts, ...expandedMockPosts.slice(0, 8)] : expandedMockPosts,
      };
      setFeed(mergedData);
      hydrateUiState(mergedData);
    } catch (error) {
      // On error, fall back to expanded mock posts
      if (currentLoadId !== loadIdRef.current) return;
      setFeed(initialFeed);
      hydrateUiState(initialFeed);
      if (!silent) {
        toast({
          title: 'Using demo posts',
          description: 'Showing sample content while connecting to server.',
          variant: 'default',
        });
      }
    } finally {
      if (!silent && currentLoadId === loadIdRef.current) setIsLoading(false);
    }
  }, [search, toast]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshFeed();
    }, 220);

    return () => window.clearTimeout(timer);
  }, [refreshFeed]);

  useEffect(() => {
    if (!highlightedPostId) return;

    const timer = window.setTimeout(() => {
      setHighlightedPostId(null);
    }, 2600);

    return () => window.clearTimeout(timer);
  }, [highlightedPostId]);

  const feedItems = useMemo<FeedItem[]>(() => {
    return feed.posts.map((post) => ({
      id: post.id,
      title: post.title,
      summary: post.summary,
      field: post.field,
      tags: post.interests,
      location: feed.personalization.inferredField,
      contentTypes: inferContentTypes(post),
      author: post.author,
      metrics: post.stats,
      createdAt: post.createdAt,
      kind: post.type,
      verified: true,
      media: post.media,
      liveSession: post.liveSession,
      canDelete: Boolean(post.canDelete),
      source: 'api',
    }));
  }, [feed]);

  const visibleFeedItems = useMemo(() => {
    return filterBySearch(sortByPersona(feedItems, feed.personalization), search);
  }, [feed.personalization, feedItems, search]);

  const activeCommentPost = useMemo(
    () => visibleFeedItems.find((item) => item.id === activeCommentPostId) || null,
    [activeCommentPostId, visibleFeedItems]
  );

  const openComments = (id: string) => {
    setActiveCommentPostId(id);
    setIsCommentsOpen(true);
  };

  const sharePost = async (id: string) => {
    const link = `${window.location.origin}/community?post=${encodeURIComponent(id)}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: 'BuildSmart Community Post', url: link });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
      }
      toast({ title: 'Link ready', description: 'Post link prepared for sharing.' });
    } catch {
      toast({ title: 'Share cancelled' });
    }
  };

  const toggleBookmark = async (id: string) => {
    try {
      setIsMutating(true);
      const result = await toggleCommunityBookmark(id, !bookmarks[id]);
      setFeed((current) => ({ ...current, state: result.state }));
      hydrateUiState({ ...feed, state: result.state });
    } catch (error) {
      toast({
        title: 'Unable to update bookmark',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsMutating(false);
    }
  };

  const castVote = async (id: string, nextVote: 'up' | 'down') => {
    try {
      setIsMutating(true);
      const result = await castCommunityVote(id, votes[id] === nextVote ? null : nextVote);
      setFeed((current) => ({ ...current, state: result.state }));
      hydrateUiState({ ...feed, state: result.state });
    } catch (error) {
      toast({
        title: 'Unable to update like',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsMutating(false);
    }
  };

  const toggleFollow = async (id: string) => {
    try {
      setIsMutating(true);
      const result = await toggleCommunityFollow(id, !follows[id]);
      setFeed((current) => ({ ...current, state: result.state }));
      hydrateUiState({ ...feed, state: result.state });
    } catch (error) {
      toast({
        title: 'Unable to update follow',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsMutating(false);
    }
  };

  const removePost = async (id: string) => {
    try {
      setIsMutating(true);
      await deleteCommunityPost(id);
      setFeed((current) => ({ ...current, posts: current.posts.filter((post) => post.id !== id) }));
      setHighlightedPostId((current) => (current === id ? null : current));
      toast({ title: 'Post deleted' });
    } catch (error) {
      toast({
        title: 'Unable to delete post',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsMutating(false);
    }
  };

  const reportPost = async (postId: string) => {
    const reason = window.prompt('Why are you reporting this post?');
    if (!reason || reason.trim().length < 6) {
      toast({ title: 'Report cancelled', description: 'Please provide at least 6 characters.' });
      return;
    }

    try {
      setIsMutating(true);
      const result = await reportCommunityPost(postId, reason.trim());
      toast({ title: 'Post reported', description: result.message });
    } catch (error) {
      toast({
        title: 'Unable to report post',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsMutating(false);
    }
  };

  const submitPost = async (payload: {
    title: string;
    content: string;
    contentTypes: string[];
    scheduledAt: string;
    mediaFiles: File[];
    isLiveSession: boolean;
    liveTitle: string;
    liveStartsAt: string;
    liveRoomUrl: string;
    liveDescription: string;
  }) => {
    try {
      setIsMutating(true);
      const result = await createCommunityPost(payload);
      setFeed((current) => ({ ...current, posts: [result.post, ...current.posts] }));
      setHighlightedPostId(result.post.id);
      setSearch('');
      toast({
        title: 'Post published',
        description: `"${result.post.title}" is now live in your community feed.`,
      });
    } catch (error) {
      toast({
        title: 'Unable to publish post',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsMutating(false);
    }
  };

  const joinLiveRoom = (payload: { roomId: string; title: string }) => {
    setActiveLiveRoom(payload);
    setIsLiveRoomOpen(true);
  };

  return (
    <>
      {viewMode === 'reels' ? (
        <div className="relative">
          <ReelsPage />
          <button
            onClick={() => setViewMode('feed')}
            className="absolute top-6 left-6 z-50 px-4 py-2 bg-[#BED234] text-[#121420] font-bold rounded-full hover:brightness-110 transition text-sm"
          >
            ← Back to Feed
          </button>
        </div>
      ) : (
        <CommunityLayout
          search={search}
          onSearchChange={setSearch}
          onOpenCreatePost={() => setIsCreateOpen(true)}
          onOpenProfile={() => toast({ title: 'Profile panel hidden in feed mode' })}
          onOpenReels={() => setViewMode('reels')}
        >
          <Feed
            posts={visibleFeedItems}
            isLoading={isLoading}
            isMutating={isMutating}
            bookmarks={bookmarks}
            follows={follows}
            votes={votes}
            onBookmark={toggleBookmark}
            onFollow={toggleFollow}
            onVote={castVote}
            onDelete={removePost}
            onReport={reportPost}
            onShare={sharePost}
            onViewDiscussion={openComments}
            onJoinLiveRoom={joinLiveRoom}
            highlightedPostId={highlightedPostId}
          />
        </CommunityLayout>
      )}

      <CommentModal
        open={isCommentsOpen}
        onOpenChange={setIsCommentsOpen}
        post={activeCommentPost}
      />

      <CreatePostModal open={isCreateOpen} onOpenChange={setIsCreateOpen} onSubmit={submitPost} />

      <LiveRoomModal
        open={isLiveRoomOpen}
        onOpenChange={setIsLiveRoomOpen}
        session={activeLiveRoom}
      />
    </>
  );
};

export default CommunityHubV2;
