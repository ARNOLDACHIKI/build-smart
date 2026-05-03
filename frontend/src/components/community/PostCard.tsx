import React from 'react';
import { ArrowUp, ArrowDown, MessageSquare, Bookmark, Share2 } from 'lucide-react';
import MediaRenderer from './MediaRenderer';
import { useLocalCommunity } from '@/hooks/useLocalCommunity';

type Props = {
  post: any;
  onOpen?: (id: string) => void;
};

const PostCard = ({ post, onOpen }: Props) => {
  const { vote, userVotes, votes, toggleSave, saved } = useLocalCommunity() as any;

  const score = (votes && votes[post.id]) || 0;
  const myVote = (userVotes && userVotes[post.id]) || 0;

  return (
    <article className="flex gap-4 p-4 border-b border-border">
      <div className="flex flex-col items-center w-12 text-center">
        <button aria-label="upvote" onClick={() => vote(post.id, 1)} className={`p-1 ${myVote===1? 'text-emerald-500': 'text-muted-foreground'}`}>
          <ArrowUp />
        </button>
        <div className="text-sm font-semibold">{score}</div>
        <button aria-label="downvote" onClick={() => vote(post.id, -1)} className={`p-1 ${myVote===-1? 'text-rose-500': 'text-muted-foreground'}`}>
          <ArrowDown />
        </button>
      </div>

      <div className="flex-1 max-w-[720px]">
        <header className="flex items-center gap-3 text-xs text-muted-foreground mb-1">
          <span className="font-semibold text-sm">{post.author?.name || post.author || 'Anonymous'}</span>
          <span className="px-2 py-0.5 rounded bg-muted text-xs">{post.field || 'Construction'}</span>
          <span>·</span>
          <span>{new Date(post.createdAt).toLocaleString()}</span>
        </header>

        <h3 className="font-bold text-lg leading-6 cursor-pointer" onClick={() => onOpen?.(post.id)}>{post.title || post.summary.slice(0, 80)}</h3>

        <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{post.summary}</p>

        <div className="mt-3">
          <MediaRenderer media={post.media} />
        </div>

        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <button className="flex items-center gap-2" onClick={() => onOpen?.(post.id)}><MessageSquare /> Comment</button>
          <button className="flex items-center gap-2"><Share2 /> Share</button>
          <button className="flex items-center gap-2" onClick={() => toggleSave(post.id)}>{saved && saved[post.id] ? <Bookmark className="text-amber-500" /> : <Bookmark />} Save</button>
        </div>
      </div>

      <aside className="hidden md:block w-36 text-xs text-muted-foreground">
        <div className="mb-2">Tags</div>
        <div className="flex flex-col gap-2">
          {(post.interests || []).slice(0,3).map((t:any) => <span key={t} className="text-sm px-2 py-1 bg-background border rounded">{t}</span>)}
        </div>
      </aside>
    </article>
  );
};

export default PostCard;
