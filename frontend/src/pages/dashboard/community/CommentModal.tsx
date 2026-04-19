import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { FeedItem } from './types';

type CommentModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: FeedItem | null;
};

const CommentModal = ({ open, onOpenChange, post }: CommentModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#2A2D3C] bg-[#121420] text-slate-100 sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
          <DialogDescription className="text-slate-400">
            Discussion is opened only on demand to keep the main feed clean.
          </DialogDescription>
        </DialogHeader>

        {post ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-[#2A2D3C] bg-[#1A1D2B] p-3">
              <p className="text-sm font-semibold text-slate-100">{post.title}</p>
              <p className="mt-1 line-clamp-3 text-sm text-slate-400">{post.summary}</p>
            </div>

            <div className="space-y-2 rounded-xl border border-[#2A2D3C] bg-[#1A1D2B] p-3">
              <p className="text-xs text-slate-500">No comments loaded in this lightweight view yet.</p>
              <div className="rounded-lg border border-dashed border-[#2A2D3C] px-3 py-6 text-center text-sm text-slate-400">
                Comment threads open here to keep scrolling distraction-free.
              </div>
              <Button
                variant="outline"
                className="h-9 w-full border-[#2A2D3C] bg-transparent text-slate-200 hover:bg-[#121420]"
              >
                Add comment
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
