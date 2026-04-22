import { BookmarkCheck, Clock3, Users, Bell, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { CommunityActivityNotification } from '@/lib/community';
import type { CommunityPost } from '@/lib/community';

type ActivitySidebarSectionProps = {
  isOpen: boolean;
  onClose: () => void;
  notifications: CommunityActivityNotification[];
  activityUnreadCount: number;
  followIds: string[];
  bookmarkIds: string[];
  savedPosts: CommunityPost[];
  onOpenSavedPost?: (postId: string) => void;
  onMarkNotificationRead?: (notificationId: string) => Promise<void>;
  isMutating?: boolean;
};

const ActivitySidebarSection = ({
  isOpen,
  onClose,
  notifications,
  activityUnreadCount,
  followIds,
  bookmarkIds,
  savedPosts,
  onOpenSavedPost,
  onMarkNotificationRead,
  isMutating = false,
}: ActivitySidebarSectionProps) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((notification) => !notification.readAt).length;

  return (
    <div className="border-t border-[#2A2D3C] bg-[#0F1117] px-3 py-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-100">
          <Bell className="h-4 w-4 text-primary" /> Activity
        </h3>
        <button
          onClick={onClose}
          className="text-xs text-slate-400 hover:text-slate-200 transition"
          aria-label="Close activity"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
        {/* Notifications */}
        <section className="space-y-2">
          <h4 className="flex items-center gap-2 text-xs font-medium text-slate-300">
            <Bell className="h-3.5 w-3.5 text-primary" /> Notifications
          </h4>
          {notifications.length > 0 ? (
            <div className="space-y-1.5">
              {notifications.slice(0, 5).map((item) => {
                const unread = !item.readAt;
                return (
                  <button
                    key={item.id}
                    onClick={() => void onMarkNotificationRead?.(item.id)}
                    className={`w-full rounded border px-2 py-1.5 text-left transition text-[11px] ${
                      unread ? 'border-[#BED234]/40 bg-[#1A1D2B]' : 'border-[#2A2D3C] bg-[#0F1117]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <p className="font-medium text-slate-100 line-clamp-1">{item.title}</p>
                      {unread && <span className="h-1.5 w-1.5 rounded-full bg-[#BED234] flex-shrink-0" />}
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{item.body}</p>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-[11px] text-slate-400">No notifications yet.</p>
          )}
        </section>

        {/* Follows */}
        {followIds.length > 0 && (
          <section className="space-y-2">
            <h4 className="flex items-center gap-2 text-xs font-medium text-slate-300">
              <Users className="h-3.5 w-3.5 text-primary" /> Follows
            </h4>
            <p className="text-[11px] text-slate-400">Following {followIds.length} entities</p>
            <div className="flex flex-wrap gap-1">
              {followIds.slice(0, 4).map((id) => (
                <Badge key={id} variant="secondary" className="border border-[#2A2D3C] bg-[#1A1D2B] text-[9px] text-slate-300">
                  {id.slice(0, 12)}...
                </Badge>
              ))}
            </div>
          </section>
        )}

        {/* Saved Posts */}
        {savedPosts.length > 0 && (
          <section className="space-y-2">
            <h4 className="flex items-center gap-2 text-xs font-medium text-slate-300">
              <Clock3 className="h-3.5 w-3.5 text-primary" /> Saved
            </h4>
            <div className="space-y-1.5">
              {savedPosts.slice(0, 3).map((post) => (
                <button
                  key={post.id}
                  onClick={() => onOpenSavedPost?.(post.id)}
                  className="w-full rounded border border-[#2A2D3C] bg-[#1A1D2B]/70 px-2 py-1.5 transition hover:border-[#BED234]/40 hover:bg-[#1A1D2B] text-left"
                >
                  <div className="flex items-start gap-1.5">
                    <BookmarkCheck className="h-3 w-3 flex-shrink-0 text-primary mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-slate-100 line-clamp-2">{post.title}</p>
                      {post.author && (
                        <p className="text-[9px] text-slate-400 mt-0.5">by {post.author}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ActivitySidebarSection;
