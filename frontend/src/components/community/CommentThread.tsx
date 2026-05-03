import React, { useMemo, useState } from 'react';
import CommentItem from './CommentItem';
import { useLocalCommunity } from '@/hooks/useLocalCommunity';

const CommentThread = ({ postId }: { postId: string }) => {
  const { getCommentsForPost, addComment } = useLocalCommunity() as any;
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [text, setText] = useState('');
  const raw = getCommentsForPost(postId) as any[];

  const tree = useMemo(() => {
    const map: Record<string, any[]> = {};
    const roots: any[] = [];
    raw.forEach((c) => { map[c.id] = []; });
    raw.forEach((c) => {
      if (c.parentId) {
        (map[c.parentId] ||= []).push(c);
      } else roots.push(c);
    });
    const build = (node:any) => ({ ...node, replies: (map[node.id] || []).map(build) });
    return roots.map(build);
  }, [raw]);

  const renderNode = (node:any, depth = 0) => (
    <div key={node.id} className="mb-3">
      <CommentItem comment={node} onReply={(id) => setReplyTo(id)} />
      <div className="ml-4">
        {node.replies && node.replies.map((r:any) => renderNode(r, depth+1))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a comment" className="w-full rounded-md border p-2" />
        <div className="flex gap-2 mt-2">
          <button onClick={() => { if (text.trim()) { addComment(postId, text.trim(), replyTo || undefined); setText(''); setReplyTo(null); } }} className="px-3 py-1 bg-primary text-primary-foreground rounded">Comment</button>
          {replyTo && <button onClick={() => setReplyTo(null)} className="px-3 py-1 border rounded">Cancel Reply</button>}
        </div>
      </div>

      <div>
        {tree.length === 0 ? <div className="text-sm text-muted-foreground">No comments yet</div> : tree.map((n:any) => renderNode(n))}
      </div>
    </div>
  );
};

export default CommentThread;
