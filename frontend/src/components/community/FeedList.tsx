import React, { useEffect, useRef, useState } from 'react';
import PostCard from './PostCard';
import { useLocalCommunity } from '@/hooks/useLocalCommunity';

const FeedList = ({ onOpenPost }: { onOpenPost?: (id: string) => void }) => {
  const { posts, ensureMorePosts } = useLocalCommunity() as any;
  const [visibleCount, setVisibleCount] = useState(20);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleCount((c) => Math.min(posts.length, c + 10));
        if (posts.length - visibleCount < 50) ensureMorePosts(100);
      }
    }, { rootMargin: '300px' });
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [posts.length, visibleCount, ensureMorePosts]);

  return (
    <div className="space-y-2">
      {posts.slice(0, visibleCount).map((post:any) => (
        <PostCard key={post.id} post={post} onOpen={onOpenPost} />
      ))}

      <div ref={sentinelRef} className="h-6" />
    </div>
  );
};

export default FeedList;
