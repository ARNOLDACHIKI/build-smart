import { useEffect, useMemo, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import RolePortalSidebar from '@/components/roleportal/RolePortalSidebar';
import ICDBOAssistantWidget from '@/components/ai/ICDBOAssistantWidget';
import { useAuth } from '@/contexts/AuthContext';
import { apiUrl } from '@/lib/api';

type SentInquiryNotification = {
  id: string;
  replyMessage?: string | null;
  senderViewedAt?: string | null;
  senderHasUnreadReply?: boolean;
};

const RolePortalLayout = () => {
  const { token } = useAuth();
  const location = useLocation();
  const [sentNotifications, setSentNotifications] = useState<SentInquiryNotification[]>([]);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    const loadSentNotifications = async () => {
      try {
        const response = await fetch(apiUrl('/api/inquiries/sent'), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as SentInquiryNotification[];
        if (!cancelled) {
          setSentNotifications(data);
        }
      } catch (error) {
        console.error('Load role portal notification counts error:', error);
      }
    };

    void loadSentNotifications();
    const intervalId = window.setInterval(() => {
      void loadSentNotifications();
    }, 15000);

    const refreshListener = () => {
      void loadSentNotifications();
    };

    window.addEventListener('portal-replies-updated', refreshListener);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener('portal-replies-updated', refreshListener);
    };
  }, [token]);

  const unreadRepliesCount = useMemo(
    () => sentNotifications.filter((item) => item.senderHasUnreadReply || (item.replyMessage && !item.senderViewedAt)).length,
    [sentNotifications],
  );

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <RolePortalSidebar unreadRepliesCount={unreadRepliesCount} />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card/50 px-4 py-3">
              <div>
                <p className="text-sm font-medium">Portal notifications</p>
                <p className="text-xs text-muted-foreground">
                  {unreadRepliesCount > 0
                    ? `You have ${unreadRepliesCount} unread repl${unreadRepliesCount === 1 ? 'y' : 'ies'} from professionals.`
                    : 'No unread replies at the moment.'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {unreadRepliesCount > 0 && <Badge variant="default">{unreadRepliesCount} unread</Badge>}
                {location.pathname !== '/portal/notifications' && (
                  <Button asChild variant="outline" size="sm">
                    <Link to="/portal/notifications">
                      <Bell className="mr-2 h-4 w-4" /> View notifications
                    </Link>
                  </Button>
                )}
              </div>
            </div>
            <Outlet />
          </div>
        </main>
      </div>
      <ICDBOAssistantWidget />
    </SidebarProvider>
  );
};

export default RolePortalLayout;
