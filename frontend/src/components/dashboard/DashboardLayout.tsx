import { useEffect, useMemo, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from '@/components/dashboard/AppSidebar';
import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { apiUrl } from '@/lib/api';
import ICDBOAssistantWidget from '@/components/ai/ICDBOAssistantWidget';
import MobileBottomNav from '@/components/mobile/MobileBottomNav';

type SentInquiryNotification = {
  id: string;
  replyMessage?: string | null;
  senderViewedAt?: string | null;
  senderHasUnreadReply?: boolean;
};

const DashboardLayout = () => {
  const { t } = useLanguage();
  const { token } = useAuth();
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
        console.error('Load dashboard notification counts error:', error);
      }
    };

    void loadSentNotifications();
    const intervalId = window.setInterval(() => {
      void loadSentNotifications();
    }, 15000);

    const refreshListener = () => {
      void loadSentNotifications();
    };

    window.addEventListener('dashboard-replies-updated', refreshListener);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener('dashboard-replies-updated', refreshListener);
    };
  }, [token]);

  const unreadRepliesCount = useMemo(
    () => sentNotifications.filter((item) => item.senderHasUnreadReply || (item.replyMessage && !item.senderViewedAt)).length,
    [sentNotifications],
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar unreadRepliesCount={unreadRepliesCount} />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-3 border-b border-border px-4 glass">
            <SidebarTrigger className="ml-0" />
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder={t('common.search')} className="pl-9 h-9 bg-muted/50 border-0" />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button asChild variant="ghost" size="icon" className="relative">
                <Link to="/dashboard/messages">
                  <Bell className="w-4 h-4" />
                  {unreadRepliesCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />}
                </Link>
              </Button>
              {unreadRepliesCount > 0 && <Badge variant="default">{unreadRepliesCount}</Badge>}
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6 pb-24 md:pb-6">
            <Outlet />
          </main>
        </div>
      </div>
      <MobileBottomNav
        homePath="/dashboard"
        homeActivePrefixes={['/dashboard/home']}
        searchPath="/dashboard/search"
        yourSpacePath="/dashboard/profile"
        confirmRequestPath="/dashboard/messages"
      />
      <ICDBOAssistantWidget />
    </SidebarProvider>
  );
};

export default DashboardLayout;
