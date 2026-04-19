import { Bell, BookmarkCheck, Clock3, ShieldAlert, Users } from 'lucide-react';
import type { CommunityAd, CommunityUpdate } from '@/lib/community';
import { Button } from '@/components/ui/button';
import type { LocalItem } from './types';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

type ActivityDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notifications: Array<{ id: string; title: string; body: string }>;
  followIds: string[];
  bookmarkIds: string[];
  moderationQueue: Array<{ id: string; title: string; body: string }>;
  canModerate: boolean;
  polls: LocalItem[];
  pollVotes: Record<string, string>;
  onVotePoll: (id: string) => Promise<void>;
  canPinUpdates: boolean;
  canApproveAds: boolean;
  updates: CommunityUpdate[];
  ads: CommunityAd[];
  onPinUpdate: (id: string, isPinned: boolean) => Promise<void>;
  onApproveAd: (id: string, isApproved: boolean) => Promise<void>;
  isMutating: boolean;
};

const ActivityDrawer = ({
  open,
  onOpenChange,
  notifications,
  followIds,
  bookmarkIds,
  moderationQueue,
  canModerate,
  polls,
  pollVotes,
  onVotePoll,
  canPinUpdates,
  canApproveAds,
  updates,
  ads,
  onPinUpdate,
  onApproveAd,
  isMutating,
}: ActivityDrawerProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full overflow-y-auto border-r border-[#2A2D3C] bg-[#121420] text-slate-100 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:w-[320px] sm:max-w-[320px]">
        <SheetHeader>
          <SheetTitle className="text-slate-100">Activity</SheetTitle>
          <SheetDescription className="text-slate-400">Notifications, follows, and recent interactions.</SheetDescription>
        </SheetHeader>

        <div className="mt-5 space-y-5">
          <section className="space-y-2">
            <h3 className="flex items-center gap-2 text-sm font-medium text-slate-200">
              <Bell className="h-4 w-4 text-primary" /> Notifications
            </h3>
            {notifications.map((item) => (
              <div key={item.id} className="rounded-lg border border-[#2A2D3C] bg-[#1A1D2B] px-3 py-3">
                <p className="text-sm font-semibold text-slate-100">{item.title}</p>
                <p className="text-xs text-slate-400">{item.body}</p>
              </div>
            ))}
          </section>

          <section className="space-y-2">
            <h3 className="flex items-center gap-2 text-sm font-medium text-slate-200">
              <Users className="h-4 w-4 text-primary" /> Follows
            </h3>
            <div className="rounded-lg border border-[#2A2D3C] bg-[#1A1D2B] px-3 py-3 text-sm text-slate-400">
              Following {followIds.length} entities
            </div>
            <div className="flex flex-wrap gap-1.5">
              {followIds.slice(0, 8).map((id) => (
                <Badge key={id} variant="secondary" className="border border-[#2A2D3C] bg-[#1A1D2B] text-[10px] text-slate-300">
                  {id}
                </Badge>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="flex items-center gap-2 text-sm font-medium text-slate-200">
              <Clock3 className="h-4 w-4 text-primary" /> Recent interactions
            </h3>
            <div className="rounded-lg border border-[#2A2D3C] bg-[#1A1D2B] px-3 py-3 text-sm text-slate-400">
              {bookmarkIds.length > 0 ? (
                <span className="inline-flex items-center gap-1">
                  <BookmarkCheck className="h-4 w-4" /> {bookmarkIds.length} saved items
                </span>
              ) : (
                'No saved interactions yet.'
              )}
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="flex items-center gap-2 text-sm font-medium text-slate-200">
              <Users className="h-4 w-4 text-primary" /> Polls
            </h3>
            {polls.map((poll) => (
              <div key={poll.id} className="rounded-lg border border-[#2A2D3C] bg-[#1A1D2B] px-3 py-3">
                <p className="text-sm font-semibold text-slate-100">{poll.title}</p>
                <p className="text-xs text-slate-400">{poll.summary}</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 border-[#2A2D3C] bg-transparent text-slate-300 hover:bg-[#121420]"
                  onClick={() => void onVotePoll(poll.id)}
                >
                  {pollVotes[poll.id] ? 'Voted' : 'Vote'}
                </Button>
              </div>
            ))}
          </section>

          <section className="space-y-2">
            <h3 className="flex items-center gap-2 text-sm font-medium text-slate-200">
              <ShieldAlert className="h-4 w-4 text-primary" /> Moderation
            </h3>
            {canModerate ? (
              <>
                {moderationQueue.map((item) => (
                  <div key={item.id} className="rounded-lg border border-[#2A2D3C] bg-[#1A1D2B] px-3 py-3">
                    <p className="text-sm font-semibold text-slate-100">{item.title}</p>
                    <p className="text-xs text-slate-400">{item.body}</p>
                  </div>
                ))}

                {canPinUpdates && updates.map((update) => (
                  <div key={update.id} className="rounded-lg border border-[#2A2D3C] bg-[#1A1D2B] px-3 py-3">
                    <p className="text-sm font-semibold text-slate-100">Update: {update.title}</p>
                    <p className="text-xs text-slate-400">{update.body}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 border-[#2A2D3C] bg-transparent text-slate-300 hover:bg-[#121420]"
                      onClick={() => void onPinUpdate(update.id, !update.isPinned)}
                      disabled={isMutating}
                    >
                      {update.isPinned ? 'Unpin update' : 'Pin update'}
                    </Button>
                  </div>
                ))}

                {canApproveAds && ads.map((ad) => (
                  <div key={ad.id} className="rounded-lg border border-[#2A2D3C] bg-[#1A1D2B] px-3 py-3">
                    <p className="text-sm font-semibold text-slate-100">Ad: {ad.title}</p>
                    <p className="text-xs text-slate-400">{ad.copy}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 border-[#2A2D3C] bg-transparent text-slate-300 hover:bg-[#121420]"
                      onClick={() => void onApproveAd(ad.id, !ad.approvedAt)}
                      disabled={isMutating}
                    >
                      {ad.approvedAt ? 'Unapprove ad' : 'Approve ad'}
                    </Button>
                  </div>
                ))}
              </>
            ) : (
              <div className="rounded-lg border border-dashed border-[#2A2D3C] px-3 py-2 text-sm text-slate-400">
                Reported content and elevated controls are available for moderators.
              </div>
            )}
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ActivityDrawer;
