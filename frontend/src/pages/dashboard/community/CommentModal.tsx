import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { addCommunityPostComment, getCommunityPostComments, type CommunityPostComment } from '@/lib/community';
import { useToast } from '@/hooks/use-toast';
import type { FeedItem } from './types';

type CommentModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: FeedItem | null;
  onCommentCountChange?: (postId: string, count: number) => void;
};

const CommentModal = ({ open, onOpenChange, post, onCommentCountChange }: CommentModalProps) => {
  const { toast } = useToast();
  const [comments, setComments] = useState<CommunityPostComment[]>([]);
  const [draftComment, setDraftComment] = useState('');
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const commentsById = useMemo(() => {
    return new Map(comments.map((comment) => [comment.id, comment]));
  }, [comments]);

  const replyTarget = useMemo(() => {
    if (!replyToCommentId) return null;
    return commentsById.get(replyToCommentId) || null;
  }, [commentsById, replyToCommentId]);

  const getCommentDepth = (comment: CommunityPostComment): number => {
    let depth = 0;
    let current = comment;
    const seen = new Set<string>();

    while (current.replyToCommentId && depth < 3) {
      if (seen.has(current.id)) break;
      seen.add(current.id);
      const parent = commentsById.get(current.replyToCommentId);
      if (!parent) break;
      depth += 1;
      current = parent;
    }

    return depth;
  };

  useEffect(() => {
    if (!open || !post?.id) {
      setComments([]);
      setDraftComment('');
      setReplyToCommentId(null);
      setIsLoading(false);
      setIsSubmitting(false);
      return;
    }

    let isMounted = true;

    const loadComments = async () => {
      try {
        setIsLoading(true);
        const result = await getCommunityPostComments(post.id);
        if (!isMounted) return;
        setComments(result.comments);
        onCommentCountChange?.(post.id, result.comments.length);
      } catch (error) {
        if (!isMounted) return;
        toast({
          title: 'Unable to load comments',
          description: error instanceof Error ? error.message : 'Please try again.',
          variant: 'destructive',
        });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadComments();

    return () => {
      isMounted = false;
    };
  }, [onCommentCountChange, open, post?.id, toast]);

  const submitComment = async () => {
    if (!post?.id) return;

    const message = draftComment.trim();
    if (!message) {
      toast({
        title: 'Comment is empty',
        description: 'Please write a comment before posting.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await addCommunityPostComment(post.id, message, replyToCommentId);
      setComments(result.comments);
      setDraftComment('');
      setReplyToCommentId(null);
      onCommentCountChange?.(post.id, result.comments.length);
      toast({ title: replyToCommentId ? 'Reply posted' : 'Comment added' });
    } catch (error) {
      toast({
        title: 'Unable to add comment',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-hidden border-[#2A2D3C] bg-[#121420] text-slate-100 sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
          <DialogDescription className="text-slate-400">
            Keep discussion focused while staying anchored to the original post.
          </DialogDescription>
        </DialogHeader>

        {post ? (
          <div className="flex max-h-[70vh] flex-col gap-3">
            <div className="relative flex-1 overflow-y-auto rounded-xl border border-[#2A2D3C] bg-[#1A1D2B]">
              <div className="sticky top-0 z-10 border-b border-[#2A2D3C] bg-[#1A1D2B]/95 p-3 backdrop-blur">
                <p className="text-sm font-semibold text-slate-100">{post.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-slate-400">{post.summary}</p>
              </div>

              <div className="space-y-2 p-3">
                {isLoading ? (
                  <div className="rounded-lg border border-[#2A2D3C] px-3 py-6 text-center text-sm text-slate-400">
                    Loading comments...
                  </div>
                ) : comments.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-[#2A2D3C] px-3 py-6 text-center text-sm text-slate-400">
                    No comments yet. Start the conversation.
                  </div>
                ) : (
                  comments.map((comment) => {
                    const depth = getCommentDepth(comment);
                    const parent = comment.replyToCommentId ? commentsById.get(comment.replyToCommentId) : null;

                    return (
                      <div
                        key={comment.id}
                        className="rounded-lg border border-[#2A2D3C] bg-[#121420] px-3 py-2"
                        style={{ marginLeft: `${depth * 14}px` }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-200">{comment.author}</p>
                          <p className="text-[11px] text-slate-500">{new Date(comment.createdAt).toLocaleString()}</p>
                        </div>
                        {parent && (
                          <p className="mt-1 text-xs text-slate-500">Replying to {parent.author}</p>
                        )}
                        <p className="mt-1 text-sm text-slate-300">{comment.message}</p>
                        <button
                          type="button"
                          className="mt-2 text-xs font-semibold text-[#BED234] transition hover:text-[#d0e855]"
                          onClick={() => setReplyToCommentId(comment.id)}
                        >
                          Reply
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="space-y-2 rounded-xl border border-[#2A2D3C] bg-[#1A1D2B] p-3">
              {replyTarget && (
                <div className="flex items-center justify-between rounded-lg border border-[#2A2D3C] bg-[#121420] px-3 py-2 text-xs text-slate-300">
                  <p>
                    Replying to <span className="font-semibold text-slate-200">{replyTarget.author}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => setReplyToCommentId(null)}
                    className="font-semibold text-slate-400 transition hover:text-slate-200"
                  >
                    Cancel
                  </button>
                </div>
              )}

              <Textarea
                value={draftComment}
                onChange={(event) => setDraftComment(event.target.value)}
                placeholder={replyTarget ? `Write a reply to ${replyTarget.author}...` : 'Write your comment...'}
                className="min-h-[90px] border-[#2A2D3C] bg-[#121420] text-slate-100 placeholder:text-slate-500"
                maxLength={2000}
              />
              <Button
                variant="outline"
                className="h-9 w-full border-[#2A2D3C] bg-transparent text-slate-200 hover:bg-[#121420]"
                onClick={() => void submitComment()}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Posting...' : replyTarget ? 'Post reply' : 'Add comment'}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400">No post selected.</p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CommentModal;
