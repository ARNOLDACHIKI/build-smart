import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useActivity } from '@/contexts/ActivityContext';
import {
  castCommunityVote,
  buildCommunityShareUrl,
  createCommunityPost,
  deleteCommunityPost,
  getCommunityActivity,
  getCommunityFeed,
  reportCommunityPost,
  markAllCommunityActivityRead,
  markCommunityActivityRead,
  toggleCommunityFollow,
  toggleCommunityBookmark,
  updateCommunityPostEngagementVisibility,
  type CommunityActivityNotification,
  type CommunityPostEngagement,
  type CommunityShareTarget,
  type CommunityFeedResponse,
} from '@/lib/community';
import CommentModal from './community/CommentModal';
import ActivityDrawer from './community/ActivityDrawer';
import CommunityLayout from './community/CommunityLayout';
import CreatePostModal from './community/CreatePostModal';
import Feed from './community/Feed';
import LiveRoomModal from './community/LiveRoomModal';
import PostSettingsDrawer from './community/PostSettingsDrawer';
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

  // Activity context for sidebar
  const {
    isActivityOpen,
    setIsActivityOpen,
    setActivityNotifications: setContextActivityNotifications,
    setActivityUnreadCount: setContextActivityUnreadCount,
    setFollowIds,
    setBookmarkIds,
    setSavedPosts,
  } = useActivity();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [isLiveRoomOpen, setIsLiveRoomOpen] = useState(false);
  const [activeLiveRoom, setActiveLiveRoom] = useState<{ roomId: string; title: string } | null>(null);
  const [isPostSettingsOpen, setIsPostSettingsOpen] = useState(false);
  const [activityNotifications, setActivityNotifications] = useState<CommunityActivityNotification[]>([]);
  const [activityUnreadCount, setActivityUnreadCount] = useState(0);
  const [postVisibilityDefaults, setPostVisibilityDefaults] = useState<{
    showLikes: boolean;
    showComments: boolean;
    showFollows: boolean;
  }>({ showLikes: true, showComments: true, showFollows: true });

  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  const [follows, setFollows] = useState<Record<string, boolean>>({});
  const [votes, setVotes] = useState<Record<string, 'up' | 'down' | null>>({});
  const [highlightedPostId, setHighlightedPostId] = useState<string | null>(null);

  const loadIdRef = useRef(0);

  const loadActivity = useCallback(async () => {
    try {
      const data = await getCommunityActivity();
      setActivityNotifications(data.notifications);
      setActivityUnreadCount(data.unreadCount);
    } catch {
      // Keep the current drawer state if activity cannot be loaded.
    }
  }, []);

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

  const applyPostEngagement = useCallback((postId: string, engagement?: CommunityPostEngagement) => {
    if (!engagement) return;
    setFeed((current) => ({
      ...current,
      posts: current.posts.map((post) => (post.id === postId ? { ...post, engagement } : post)),
    }));
  }, []);

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
    try {
      const raw = window.localStorage.getItem('community_post_visibility_defaults');
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<{ showLikes: boolean; showComments: boolean; showFollows: boolean }>;
      setPostVisibilityDefaults((current) => ({
        showLikes: typeof parsed.showLikes === 'boolean' ? parsed.showLikes : current.showLikes,
        showComments: typeof parsed.showComments === 'boolean' ? parsed.showComments : current.showComments,
        showFollows: typeof parsed.showFollows === 'boolean' ? parsed.showFollows : current.showFollows,
      }));
    } catch {
      // Ignore invalid localStorage payloads.
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('community_post_visibility_defaults', JSON.stringify(postVisibilityDefaults));
  }, [postVisibilityDefaults]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshFeed();
    }, 220);

    return () => window.clearTimeout(timer);
  }, [refreshFeed]);

  useEffect(() => {
    void loadActivity();
    const timer = window.setInterval(() => {
      void loadActivity();
    }, 45_000);

    return () => window.clearInterval(timer);
  }, [loadActivity]);

  // Sync activity data to context for sidebar
  useEffect(() => {
    setContextActivityNotifications(activityNotifications);
    setContextActivityUnreadCount(activityUnreadCount);
    setFollowIds(Object.keys(follows));
    setBookmarkIds(Object.keys(bookmarks));
  }, [activityNotifications, activityUnreadCount, follows, bookmarks, setContextActivityNotifications, setContextActivityUnreadCount, setFollowIds, setBookmarkIds]);

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
      engagement: post.engagement,
      canDelete: Boolean(post.canDelete),
      source: 'api',
    }));
  }, [feed]);

  const savedPosts = useMemo(() => {
    return feed.posts.filter((post) => bookmarks[post.id]);
  }, [feed.posts, bookmarks]);

  const openSavedPost = useCallback((postId: string) => {
    setHighlightedPostId(postId);
    setIsActivityOpen(false);
    const element = document.querySelector(`[data-post-id="${postId}"]`) as HTMLElement | null;
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  // Sync saved posts to context
  useEffect(() => {
    setSavedPosts(savedPosts);
  }, [savedPosts, setSavedPosts]);

  const visibleFeedItems = useMemo(() => {
    return filterBySearch(sortByPersona(feedItems, feed.personalization), search);
  }, [feed.personalization, feedItems, search]);

  const activeCommentPost = useMemo(
    () => visibleFeedItems.find((item) => item.id === activeCommentPostId) || null,
    [activeCommentPostId, visibleFeedItems]
  );

  const exampleAds = useMemo(
    () => [
      {
        id: 'ad-1',
        title: 'Concrete Mix Pro',
        copy: 'Order certified ready-mix faster with live dispatch updates and jobsite ETAs.',
        tag: 'Sponsored',
        cta: 'Explore offer',
      },
      {
        id: 'ad-2',
        title: 'Site Safety Checks',
        copy: 'Digitize toolbox talks, incident logs, and inspection sign-offs in one workflow.',
        tag: 'Recommended',
        cta: 'View demo',
      },
      {
        id: 'ad-3',
        title: 'Project Controls Suite',
        copy: 'Track progress, RFIs, and variation claims with a clean construction dashboard.',
        tag: 'Featured',
        cta: 'Get started',
      },
      {
        id: 'ad-4',
        title: 'Steel Supply Direct',
        copy: 'Compare reinforcement steel prices from verified suppliers and schedule delivery windows.',
        tag: 'Sponsored',
        cta: 'Request quote',
      },
      {
        id: 'ad-5',
        title: 'Blueprint Review AI',
        copy: 'Detect drawing conflicts early and reduce rework before site execution begins.',
        tag: 'Recommended',
        cta: 'Try now',
      },
      {
        id: 'ad-6',
        title: 'Equipment Hire Hub',
        copy: 'Book excavators, concrete pumps, and compactors with transparent daily rates.',
        tag: 'Featured',
        cta: 'Browse equipment',
      },
    ],
    []
  );

  const openComments = (id: string) => {
    setActiveCommentPostId(id);
    setIsCommentsOpen(true);
  };

  const sharePost = async (id: string, target: CommunityShareTarget = 'native') => {
    const link = `${window.location.origin}/community?post=${encodeURIComponent(id)}`;
    const post = feed.posts.find((item) => item.id === id);
    const title = post?.title || 'BuildSmart Community Post';
    const shareText = `${title}\n${link}`;

    try {
      if (target === 'copy') {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(shareText);
        }
      } else if (target === 'native' && navigator.share) {
        await navigator.share({ title, text: shareText, url: link });
      } else {
        const shareUrl = buildCommunityShareUrl(target, link, title);
        if (shareUrl) {
          if (target === 'instagram' && navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(shareText);
          }
          const opened = window.open(shareUrl, '_blank', 'noopener,noreferrer');
          if (!opened && navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(shareText);
          }
        }
      }
      toast({
        title: 'Share ready',
        description:
          target === 'instagram'
            ? 'Instagram was opened where possible. The text was copied so you can paste it if needed.'
            : 'Share action prepared.',
      });
    } catch {
      toast({ title: 'Share cancelled' });
    }
  };

  const toggleBookmark = async (id: string) => {
    const previousBookmarked = Boolean(bookmarks[id]);
    const nextBookmarked = !previousBookmarked;

    setBookmarks((current) => {
      if (nextBookmarked) {
        return { ...current, [id]: true };
      }

      const next = { ...current };
      delete next[id];
      return next;
    });

    try {
      const result = await toggleCommunityBookmark(id, nextBookmarked);
      setFeed((current) => ({ ...current, state: result.state }));
      hydrateUiState({ ...feed, state: result.state });
      toast({ title: nextBookmarked ? 'Post saved' : 'Post removed from saved' });
    } catch (error) {
      setBookmarks((current) => {
        if (previousBookmarked) {
          return { ...current, [id]: true };
        }

        const next = { ...current };
        delete next[id];
        return next;
      });
      toast({
        title: 'Unable to update bookmark',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const castVote = async (id: string, nextVote: 'up' | 'down') => {
    const previousVote = votes[id] || null;
    const resolvedVote: 'up' | 'down' | null = previousVote === nextVote ? null : nextVote;

    setVotes((current) => ({ ...current, [id]: resolvedVote }));

    const existing = feed.posts.find((post) => post.id === id)?.engagement;
    const fallback: CommunityPostEngagement = existing || {
      likes: 0,
      comments: 0,
      follows: 0,
      showLikes: true,
      showComments: true,
      showFollows: true,
    };

    const optimisticLikes =
      fallback.likes +
      (resolvedVote === 'up' ? 1 : 0) -
      (previousVote === 'up' ? 1 : 0);
    applyPostEngagement(id, { ...fallback, likes: Math.max(0, optimisticLikes) });

    try {
      const result = await castCommunityVote(id, resolvedVote);
      setFeed((current) => ({ ...current, state: result.state }));
      hydrateUiState({ ...feed, state: result.state });
      applyPostEngagement(id, result.engagement);
    } catch (error) {
      setVotes((current) => ({ ...current, [id]: previousVote }));
      applyPostEngagement(id, {
        ...fallback,
        likes: Math.max(0, fallback.likes),
      });
      toast({
        title: 'Unable to update like',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const toggleFollow = async (id: string) => {
    const previousFollowing = Boolean(follows[id]);
    const nextFollowing = !previousFollowing;

    setFollows((current) => {
      if (nextFollowing) {
        return { ...current, [id]: true };
      }

      const next = { ...current };
      delete next[id];
      return next;
    });

    const existing = feed.posts.find((post) => post.id === id)?.engagement;
    const fallback: CommunityPostEngagement = existing || {
      likes: 0,
      comments: 0,
      follows: 0,
      showLikes: true,
      showComments: true,
      showFollows: true,
    };

    const optimisticFollows = fallback.follows + (nextFollowing ? 1 : -1);
    applyPostEngagement(id, { ...fallback, follows: Math.max(0, optimisticFollows) });

    try {
      const result = await toggleCommunityFollow(id, nextFollowing);
      setFeed((current) => ({ ...current, state: result.state }));
      hydrateUiState({ ...feed, state: result.state });
      applyPostEngagement(
        id,
        result.engagement || {
          ...fallback,
          follows: result.following ? Math.max(1, fallback.follows) : Math.max(0, fallback.follows - 1),
        }
      );
    } catch (error) {
      setFollows((current) => {
        if (previousFollowing) {
          return { ...current, [id]: true };
        }

        const next = { ...current };
        delete next[id];
        return next;
      });
      applyPostEngagement(id, {
        ...fallback,
        follows: Math.max(0, fallback.follows),
      });
      toast({
        title: 'Unable to update follow',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
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
      await updateCommunityPostEngagementVisibility(result.post.id, postVisibilityDefaults);
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

  const markNotificationRead = async (notificationId: string) => {
    try {
      const result = await markCommunityActivityRead(notificationId);
      setActivityNotifications((current) => {
        const next = current.map((notification) =>
          notification.id === notificationId ? result.notification : notification
        );
        setActivityUnreadCount(next.filter((notification) => !notification.readAt).length);
        return next;
      });
    } catch {
      toast({ title: 'Unable to update activity', description: 'Please try again.', variant: 'destructive' });
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      const result = await markAllCommunityActivityRead();
      setActivityNotifications(result.notifications);
      setActivityUnreadCount(result.unreadCount);
    } catch {
      toast({ title: 'Unable to update activity', description: 'Please try again.', variant: 'destructive' });
    }
  };

  const updateEngagementVisibility = async (
    postId: string,
    payload: Partial<Pick<CommunityPostEngagement, 'showLikes' | 'showComments' | 'showFollows'>>
  ) => {
    try {
      setIsMutating(true);
      const result = await updateCommunityPostEngagementVisibility(postId, payload);
      applyPostEngagement(postId, result.engagement);
      toast({ title: 'Engagement visibility updated' });
    } catch (error) {
      toast({
        title: 'Unable to update visibility',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsMutating(false);
    }
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
          onOpenActivity={() => setIsActivityOpen(true)}
          onOpenPostSettings={() => setIsPostSettingsOpen(true)}
          onOpenReels={() => setViewMode('reels')}
          followCount={Object.keys(follows).length}
          activityCount={activityUnreadCount}
        >
          <div className="fixed left-0 right-0 top-16 z-50 bg-gradient-to-r from-[#2E3A1A]/95 to-[#23301A]/95 px-3 py-5 sm:px-4 md:left-[270px]">
            <div className="flex items-center justify-center gap-3">
              <span className="rounded-full bg-[#BED234] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#121420]">
                Advertise here
              </span>
              <span className="text-base font-semibold text-slate-100">Inquire at +254 727 796479</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 pt-32 xl:grid-cols-[minmax(0,1fr)_300px]">
            <div className="min-w-0">
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
                onToggleEngagementVisibility={updateEngagementVisibility}
                highlightedPostId={highlightedPostId}
              />
            </div>

            <aside className="hidden xl:block">
              <div className="sticky top-[92px] space-y-4">
                <section className="rounded-2xl border border-[#2A2D3C] bg-[#1A1D2B] p-4 shadow-[0_12px_28px_-24px_rgba(0,0,0,0.85)]">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#BED234]">Sponsored</p>
                    <span className="rounded-full border border-[#2A2D3C] bg-[#121420] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Ad space
                    </span>
                  </div>

                  <div className="mt-6 space-y-5">
                    {exampleAds.map((ad) => (
                      <div key={ad.id} className="rounded-xl border border-[#2A2D3C] bg-[#121420] p-4 transition hover:border-[#3A4156]">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{ad.tag}</p>
                            <p className="mt-2 text-sm font-semibold text-slate-100">{ad.title}</p>
                          </div>
                          <div className="h-10 w-10 rounded-full bg-[#BED234]/15 flex-shrink-0" />
                        </div>
                        <p className="mt-3 text-xs leading-relaxed text-slate-400">{ad.copy}</p>
                        <button
                          type="button"
                          className="mt-4 inline-flex h-8 items-center rounded-full bg-[#BED234] px-3 text-xs font-bold text-[#121420] transition hover:brightness-110"
                        >
                          {ad.cta}
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

              </div>
            </aside>
          </div>
        </CommunityLayout>
      )}

      <CommentModal
        open={isCommentsOpen}
        onOpenChange={setIsCommentsOpen}
        post={activeCommentPost}
        onCommentCountChange={(postId, count) => {
          const target = feed.posts.find((post) => post.id === postId);
          const fallback: CommunityPostEngagement = target?.engagement || {
            likes: 0,
            comments: 0,
            follows: 0,
            showLikes: true,
            showComments: true,
            showFollows: true,
          };
          applyPostEngagement(postId, { ...fallback, comments: Math.max(count, fallback.comments) });
        }}
      />

      <CreatePostModal open={isCreateOpen} onOpenChange={setIsCreateOpen} onSubmit={submitPost} />

      <LiveRoomModal
        open={isLiveRoomOpen}
        onOpenChange={setIsLiveRoomOpen}
        session={activeLiveRoom}
      />

      {/* Activity is now rendered in the sidebar via context */}
      {/* <ActivityDrawer
        open={isActivityOpen}
        onOpenChange={setIsActivityOpen}
        notifications={activityNotifications}
        followIds={Object.keys(follows)}
        bookmarkIds={Object.keys(bookmarks)}
        savedPosts={savedPosts}
        onOpenSavedPost={openSavedPost}
        moderationQueue={[]}
        canModerate={false}
        polls={[]}
        pollVotes={feed.state.pollVotes}
        onVotePoll={async () => {}}
        canPinUpdates={false}
        canApproveAds={false}
        updates={feed.updates}
        ads={feed.ads}
        onPinUpdate={async () => {}}
        onApproveAd={async () => {}}
        onMarkNotificationRead={markNotificationRead}
        onMarkAllNotificationsRead={markAllNotificationsRead}
        isMutating={isMutating}
      /> */}

      <PostSettingsDrawer
        open={isPostSettingsOpen}
        onOpenChange={setIsPostSettingsOpen}
        settings={postVisibilityDefaults}
        onChange={(patch) => setPostVisibilityDefaults((current) => ({ ...current, ...patch }))}
      />
    </>
  );
};

export default CommunityHubV2;
