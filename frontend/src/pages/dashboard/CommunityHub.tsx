import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, BriefcaseBusiness, Megaphone, Newspaper, Sparkles, Users } from 'lucide-react';
import { approveCommunityAd, getCommunityFeed, pinCommunityUpdate, reportCommunityPost, type CommunityFeedResponse } from '@/lib/community';
import { useToast } from '@/hooks/use-toast';

const initialFeed: CommunityFeedResponse = {
  posts: [],
  updates: [],
  ads: [],
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
};

const CommunityHub = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [field, setField] = useState('all');
  const [feed, setFeed] = useState<CommunityFeedResponse>(initialFeed);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setIsLoading(true);
        const data = await getCommunityFeed({
          q: search.trim() || undefined,
          field,
        });
        if (!cancelled) {
          setFeed(data);
        }
      } catch (error) {
        if (!cancelled) {
          toast({
            title: 'Failed to load community feed',
            description: error instanceof Error ? error.message : 'Please try again.',
            variant: 'destructive',
          });
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [field, search, toast]);

  const visiblePosts = useMemo(() => feed.posts, [feed.posts]);

  const handleReportPost = async (postId: string) => {
    const reason = window.prompt('Why are you reporting this post?');
    if (!reason || reason.trim().length < 6) {
      toast({
        title: 'Report cancelled',
        description: 'Please provide at least 6 characters for moderation context.',
      });
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

  const handlePinUpdate = async (updateId: string, isPinned: boolean) => {
    try {
      setIsMutating(true);
      const result = await pinCommunityUpdate(updateId, isPinned);
      setFeed((current) => ({
        ...current,
        updates: current.updates.map((item) => (item.id === updateId ? { ...item, isPinned: result.isPinned } : item)),
      }));
      toast({
        title: result.isPinned ? 'Update pinned' : 'Update unpinned',
      });
    } catch (error) {
      toast({
        title: 'Unable to update pin state',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsMutating(false);
    }
  };

  const handleApproveAd = async (adId: string, isApproved: boolean) => {
    try {
      setIsMutating(true);
      const result = await approveCommunityAd(adId, isApproved);
      toast({
        title: result.isApproved ? 'Ad approved' : 'Ad unapproved',
      });
      if (!result.isApproved) {
        setFeed((current) => ({
          ...current,
          ads: current.ads.filter((item) => item.id !== adId),
        }));
      }
    } catch (error) {
      toast({
        title: 'Unable to update ad approval',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold font-['Space_Grotesk']">Community</h1>
            <p className="text-sm text-muted-foreground">
              Collaborate through blogs and discussions, and discover updates, ads, and professional content tailored to your field.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Personalized for <span className="font-medium">{feed.personalization.role}</span> in{' '}
              <span className="font-medium">{feed.personalization.inferredField}</span>
            </p>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Users className="h-3 w-3" /> Field-aware feed
          </Badge>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card>
          <CardContent className="grid gap-3 p-4 md:grid-cols-[1fr_220px_auto]">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search discussions, blogs, and updates..."
            />
            <Select value={field} onValueChange={setField}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by field" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All fields</SelectItem>
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="Project Management">Project Management</SelectItem>
                <SelectItem value="Architecture">Architecture</SelectItem>
              </SelectContent>
            </Select>
            <Button className="w-full md:w-auto">Create Post</Button>
          </CardContent>
        </Card>
      </motion.div>

      {isLoading && (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">Loading community feed...</CardContent>
        </Card>
      )}

      <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.09 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Newspaper className="h-4 w-4 text-primary" /> Blogs and Discussions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {visiblePosts.map((post) => (
                <article key={post.id} className="rounded-lg border border-border/70 bg-muted/20 p-3">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{post.type}</Badge>
                    <Badge variant="secondary">{post.field}</Badge>
                  </div>
                  <h2 className="text-sm font-semibold leading-snug">{post.title}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">By {post.author}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{post.summary}</p>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{post.stats}</span>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">Join Discussion</Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isMutating}
                        onClick={() => void handleReportPost(post.id)}
                      >
                        Report
                      </Button>
                    </div>
                  </div>
                </article>
              ))}

              {visiblePosts.length === 0 && (
                <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  No community content matched this filter.
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bell className="h-4 w-4 text-primary" /> Community Updates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {feed.updates.map((item) => (
                  <div key={item.id} className="rounded-md border border-border/70 bg-muted/30 p-3 text-xs text-muted-foreground">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="font-medium text-foreground">{item.title}</span>
                      {item.isPinned && <Badge variant="secondary">Pinned</Badge>}
                    </div>
                    <p>{item.body}</p>
                    {feed.moderation.canPinUpdates && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="mt-2 h-7 px-2 text-xs"
                        disabled={isMutating}
                        onClick={() => void handlePinUpdate(item.id, !item.isPinned)}
                      >
                        {item.isPinned ? 'Unpin' : 'Pin'} update
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Megaphone className="h-4 w-4 text-primary" /> Sponsored Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {feed.ads.map((item) => (
                  <div key={item.id} className="rounded-md border border-amber-300/60 bg-amber-50 p-3 dark:border-amber-700/60 dark:bg-amber-950/30">
                    <p className="text-xs font-semibold">{item.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.copy}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <a href={item.ctaUrl} target="_blank" rel="noreferrer" className="text-xs font-medium underline underline-offset-4">
                        View offer
                      </a>
                      {feed.moderation.canApproveAds && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs"
                          disabled={isMutating}
                          onClick={() => void handleApproveAd(item.id, false)}
                        >
                          Unapprove
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BriefcaseBusiness className="h-4 w-4 text-primary" /> Professional Content For You
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {feed.recommendations.map((item) => (
                  <div key={item.title} className="rounded-md border border-border/70 bg-muted/20 p-3">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold">{item.title}</p>
                      <Badge variant="outline">{item.format}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.field}</p>
                  </div>
                ))}
                <Button variant="outline" className="w-full gap-1">
                  <Sparkles className="h-3.5 w-3.5" /> Load More Recommendations
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CommunityHub;
