import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { Bell, Clock, MessageSquareReply, RefreshCw } from 'lucide-react';
import { authStorage } from '@/lib/auth';
import { apiUrl } from '@/lib/api';
import { toast } from 'sonner';

type SentInquiryNotification = {
  id: string;
  message: string;
  replyMessage?: string | null;
  senderViewedAt?: string | null;
  senderHasUnreadReply?: boolean;
  status: 'PENDING' | 'READ' | 'REPLIED';
  respondedAt?: string | null;
  createdAt: string;
  recipient: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  };
};

const formatRelativeTime = (value?: string | null) => {
  if (!value) return 'Pending response';

  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

const Notifications = () => {
  const { t } = useLanguage();
  const [items, setItems] = useState<SentInquiryNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const token = authStorage.getToken();
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(apiUrl('/api/inquiries/sent'), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load notifications');
      }

      const data = (await response.json()) as SentInquiryNotification[];
      const sorted = [...data].sort((left, right) => {
        const leftTime = new Date(left.respondedAt || left.createdAt).getTime();
        const rightTime = new Date(right.respondedAt || right.createdAt).getTime();
        return rightTime - leftTime;
      });
      setItems(sorted);
      window.dispatchEvent(new Event('dashboard-replies-updated'));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load notifications';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const markAsViewed = async (id: string) => {
    const token = authStorage.getToken();
    if (!token) return;

    try {
      const response = await fetch(apiUrl(`/api/inquiries/sent/${id}/read`), {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      const updated = (await response.json()) as SentInquiryNotification;
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
      window.dispatchEvent(new Event('dashboard-replies-updated'));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to mark notification as read';
      toast.error(message);
    }
  };

  const unreadCount = useMemo(
    () => items.filter((item) => item.senderHasUnreadReply || (item.replyMessage && !item.senderViewedAt)).length,
    [items],
  );

  const markAllRead = async () => {
    const unread = items.filter((item) => item.senderHasUnreadReply || (item.replyMessage && !item.senderViewedAt));
    if (unread.length === 0) return;

    await Promise.all(unread.map((item) => markAsViewed(item.id)));
    toast.success('All reply notifications marked as read');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold font-['Space_Grotesk']">{t('sidebar.notifications')}</h1>
          <p className="text-sm text-muted-foreground mt-1">Live updates for replies to the requests you sent.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => void load()} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button size="sm" variant="outline" onClick={() => void markAllRead()} disabled={unreadCount === 0 || loading}>
            Mark all read
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {loading ? (
            <Card className="card-3d border-0">
              <CardContent className="p-4 text-sm text-muted-foreground">Loading notifications...</CardContent>
            </Card>
          ) : items.length === 0 ? (
            <Card className="card-3d border-0">
              <CardContent className="p-4 text-sm text-muted-foreground">No notifications yet.</CardContent>
            </Card>
          ) : (
            items.map((item) => {
              const unread = Boolean(item.senderHasUnreadReply || (item.replyMessage && !item.senderViewedAt));
              const Icon = item.replyMessage ? MessageSquareReply : Clock;

              return (
                <Card
                  key={item.id}
                  className={`card-3d border-0 cursor-pointer ${unread ? 'ring-1 ring-primary/20' : 'opacity-85'}`}
                  onClick={() => {
                    if (unread) {
                      void markAsViewed(item.id);
                    }
                  }}
                >
                  <CardContent className="p-4 flex items-start gap-3">
                    <Icon className={`w-5 h-5 mt-0.5 ${unread ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">
                            {item.replyMessage
                              ? `Reply from ${item.recipient.name || item.recipient.email}`
                              : `Awaiting response from ${item.recipient.name || item.recipient.email}`}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{formatRelativeTime(item.respondedAt || item.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {unread && <Badge variant="default">Unread</Badge>}
                          <Badge variant="secondary">{item.status}</Badge>
                        </div>
                      </div>
                      <p className="text-sm mt-3 line-clamp-2 whitespace-pre-wrap">{item.message}</p>
                      {item.replyMessage ? (
                        <div className="mt-3 rounded-md bg-muted p-3">
                          <p className="text-xs font-medium mb-1">Reply</p>
                          <p className="text-sm line-clamp-2 whitespace-pre-wrap">{item.replyMessage}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-3">No reply yet. We’ll show it here when it arrives.</p>
                      )}
                    </div>
                    {unread && <div className="w-2 h-2 rounded-full bg-primary mt-2" />}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        <Card className="card-3d border-0 h-fit">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Reply Summary</h3>
              <Badge variant="outline">{unreadCount} unread</Badge>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <span>Total tracked messages</span>
                <span className="font-semibold">{items.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <span>Replies received</span>
                <span className="font-semibold text-green-600">{items.filter((item) => item.status === 'REPLIED').length}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <span>Awaiting response</span>
                <span className="font-semibold">{items.filter((item) => item.status !== 'REPLIED').length}</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h3 className="font-semibold text-sm">Notification Preferences</h3>
              {[{ label: 'Email Notifications', key: 'email' }, { label: 'SMS Notifications', key: 'sms' }, { label: 'Push Notifications', key: 'push' }, { label: 'Reply Alerts', key: 'reply' }, { label: 'Status Changes', key: 'status' }].map((pref) => (
                <div key={pref.key} className="flex items-center justify-between">
                  <Label className="text-sm">{pref.label}</Label>
                  <Switch defaultChecked={pref.key !== 'sms'} />
                </div>
              ))}
            </div>

            <div className="rounded-lg border p-3 text-xs text-muted-foreground flex items-center gap-2">
              <Bell className="h-4 w-4" />
              New replies also update the dashboard sidebar badge and the header bell automatically.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Notifications;
