import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getCommunityPostComments, addCommunityPostComment, type CommunityPostComment } from '@/lib/community';
import { useToast } from '@/hooks/use-toast';

type Props = {
  postId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canComment?: boolean;
  onRequestJoin?: () => Promise<void>;
};

const CommentThreadModal = ({ postId, open, onOpenChange }: Props) => {
  const { toast } = useToast();
  const [comments, setComments] = useState<CommunityPostComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [replyTo, setReplyTo] = useState<CommunityPostComment | null>(null);

  useEffect(() => {
    if (!open || !postId) return;
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await getCommunityPostComments(postId);
        if (!mounted) return;
        setComments(res.comments || []);
      } catch (err) {
        console.error('Failed to load comments', err);
        toast({ title: 'Failed to load comments', description: 'Please try again.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [open, postId, toast]);

  const handleSubmit = async () => {
    if (!postId || message.trim().length === 0) return;
    if (!canComment) {
      toast({ title: 'Not a member', description: 'You must join the community to comment.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await addCommunityPostComment(postId, message.trim(), replyTo?.id || null);
      // prepend the created comment and refresh
      setComments(res.comments || []);
      setMessage('');
      setReplyTo(null);
      toast({ title: 'Comment posted' });
    } catch (err) {
      console.error('Failed to post comment', err);
      toast({ title: 'Failed to post comment', description: err instanceof Error ? err.message : 'Try again', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle>Discussion</DialogTitle>
          <DialogDescription>Comments and replies for this post.</DialogDescription>
        </DialogHeader>

        <div className="mt-4 max-h-[60vh] overflow-auto space-y-3">
          {loading ? (
            <p className="text-sm text-slate-400">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-slate-400">No comments yet — be the first to reply.</p>
          ) : (
            <div className="space-y-3">
              {comments.map((c) => (
                <div key={c.id} className="rounded-lg border border-[#2A2D3C] bg-[#1A1D2B] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{c.author}</p>
                      <p className="text-[12px] text-slate-500">{new Date(c.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => setReplyTo(c)}
                        className="text-xs text-[#BED234]"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                  {c.replyToCommentId && (
                    <p className="mt-2 text-xs text-slate-500">Replying to {comments.find((x) => x.id === c.replyToCommentId)?.author || 'comment'}</p>
                  )}
                  <p className="mt-2 text-sm text-slate-300">{c.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4">
          {replyTo && (
            <div className="mb-2 flex items-center justify-between rounded-md border border-[#2A2D3C] bg-[#121420] p-2 text-sm text-slate-200">
              <div>Replying to <strong className="text-slate-100">{replyTo.author}</strong></div>
              <button type="button" onClick={() => setReplyTo(null)} className="text-xs text-slate-400">Cancel</button>
            </div>
          )}

          <Textarea
            value={message}
            onChange={(e: any) => setMessage(e.target.value)}
            placeholder={replyTo ? `Reply to ${replyTo.author}...` : 'Write a comment...'}
            className="min-h-[84px] bg-[#0F1218] text-slate-100 border-[#2A2D3C]"
          />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="mr-2">Close</Button>
          {!canComment ? (
            <div className="flex gap-2">
              <Button onClick={onRequestJoin} disabled={!onRequestJoin || submitting}>Join community</Button>
              <Button disabled className="opacity-60">Sign in to comment</Button>
            </div>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting || message.trim().length === 0}>{submitting ? 'Posting...' : replyTo ? 'Post reply' : 'Post comment'}</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CommentThreadModal;
