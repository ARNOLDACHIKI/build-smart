import React from 'react';
import { useParams } from 'react-router-dom';
import MediaRenderer from './MediaRenderer';
import CommentThread from './CommentThread';
import { useLocalCommunity } from '@/hooks/useLocalCommunity';

const PostDetail = () => {
  const { id } = useParams();
  const { posts } = useLocalCommunity() as any;
  const post = posts.find((p:any) => p.id === id);
  if (!post) return <div className="p-6">Post not found</div>;

  return (
    <div className="max-w-3xl mx-auto py-6">
      <div className="flex gap-6">
        <aside className="w-16 text-center">
          <div className="sticky top-20">
            <div className="text-muted-foreground">▲</div>
            <div className="font-semibold">0</div>
            <div className="text-muted-foreground">▼</div>
          </div>
        </aside>

        <main className="flex-1">
          <header className="text-sm text-muted-foreground">
            <span className="font-semibold">{post.author?.name || 'Author'}</span>
            <span className="ml-2">· {new Date(post.createdAt).toLocaleString()}</span>
          </header>

          <h1 className="text-2xl font-bold mt-2">{post.title}</h1>
          <div className="mt-4 text-sm text-muted-foreground">{post.summary}</div>

          <div className="mt-4"><MediaRenderer media={post.media} /></div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold">Discussion</h2>
            <CommentThread postId={post.id} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default PostDetail;
