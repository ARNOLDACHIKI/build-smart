import { useEffect, useMemo, useState } from 'react';
import { Mail, MessageSquareReply, Phone, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { apiUrl } from '@/lib/api';
import { toast } from 'sonner';

type SentInquiry = {
  id: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string | null;
  message: string;
  replyMessage?: string | null;
  status: 'PENDING' | 'READ' | 'REPLIED';
  respondedAt?: string | null;
  senderViewedAt?: string | null;
  senderHasUnreadReply?: boolean;
  createdAt: string;
  recipient: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    company?: string | null;
    location?: string | null;
  };
};

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

const RoleNotifications = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<SentInquiry[]>([]);
  const [filter, setFilter] = useState<'all' | 'REPLIED' | 'PENDING' | 'READ'>('all');
  const [selected, setSelected] = useState<SentInquiry | null>(null);

  const markAsViewed = async (id: string) => {
    if (!token) return;

    try {
      const response = await fetch(apiUrl(`/api/inquiries/sent/${id}/read`), {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to mark reply as read');
      }

      const updated = (await response.json()) as SentInquiry;
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
      setSelected((prev) => (prev?.id === id ? updated : prev));
      window.dispatchEvent(new Event('portal-replies-updated'));
    } catch (error) {
      console.error(error);
    }
  };

  const load = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(apiUrl('/api/inquiries/sent'), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load reply notifications');
      }

      const data = (await response.json()) as SentInquiry[];
      const sorted = [...data].sort((left, right) => {
        const leftTime = new Date(left.respondedAt || left.createdAt).getTime();
        const rightTime = new Date(right.respondedAt || right.createdAt).getTime();
        return rightTime - leftTime;
      });
      setItems(sorted);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load reply notifications';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    if (!token) return;

    const intervalId = window.setInterval(() => {
      void load();
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, [token]);

  const filtered = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter((item) => item.status === filter);
  }, [filter, items]);

  const replyCount = items.filter((item) => item.status === 'REPLIED').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-2">Track replies to the requests you sent from your portal.</p>
        </div>
        <Button variant="outline" onClick={() => void load()} disabled={loading}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total sent requests</p>
            <p className="mt-2 text-2xl font-semibold">{items.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Replies received</p>
            <p className="mt-2 text-2xl font-semibold text-green-600">{replyCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Awaiting response</p>
            <p className="mt-2 text-2xl font-semibold">{items.filter((item) => item.status !== 'REPLIED').length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={filter} onValueChange={(value) => setFilter(value as typeof filter)}>
        <TabsList>
          <TabsTrigger value="all">All ({items.length})</TabsTrigger>
          <TabsTrigger value="REPLIED">Replies ({replyCount})</TabsTrigger>
          <TabsTrigger value="PENDING">Pending ({items.filter((item) => item.status === 'PENDING').length})</TabsTrigger>
          <TabsTrigger value="READ">Read ({items.filter((item) => item.status === 'READ').length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Loading notifications...</CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">No notifications found for this filter.</CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <Card
              key={item.id}
              className={`cursor-pointer hover:shadow-sm transition-shadow ${item.senderHasUnreadReply ? 'border-primary bg-primary/5' : ''}`}
              onClick={() => {
                setSelected(item);
                if (item.senderHasUnreadReply) {
                  void markAsViewed(item.id);
                }
              }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-base">
                    {item.replyMessage ? 'Reply received from' : 'Request sent to'} {item.recipient.name || item.recipient.email}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {item.senderHasUnreadReply && <Badge variant="default">New reply</Badge>}
                    <Badge variant={item.status === 'REPLIED' ? 'default' : 'secondary'}>{item.status}</Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {item.respondedAt ? `Updated ${formatDate(item.respondedAt)}` : `Sent ${formatDate(item.createdAt)}`}
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm line-clamp-2 whitespace-pre-wrap">{item.message}</p>
                {item.replyMessage ? (
                  <div className="rounded-md bg-muted p-3">
                    <p className="text-xs font-medium mb-1">Latest reply</p>
                    <p className="text-sm line-clamp-2 whitespace-pre-wrap">{item.replyMessage}</p>
                  </div>
                ) : (
                  <div className="rounded-md border p-3 text-sm text-muted-foreground flex items-center gap-2">
                    <MessageSquareReply className="h-4 w-4" /> Waiting for a professional reply.
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selected?.recipient.name || selected?.recipient.email}
            </DialogTitle>
            <DialogDescription>
              {selected ? `Sent ${formatDate(selected.createdAt)}` : ''}
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> {selected.recipient.email}</div>
                {selected.senderPhone && <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {selected.senderPhone}</div>}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your Request</p>
                <div className="mt-1 rounded-md border p-3 text-sm whitespace-pre-wrap">{selected.message}</div>
              </div>

              {selected.replyMessage ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Professional Reply</p>
                  <div className="mt-1 rounded-md border bg-muted/40 p-3 text-sm whitespace-pre-wrap">
                    {selected.replyMessage}
                    {selected.respondedAt && (
                      <p className="mt-2 text-xs text-muted-foreground">Replied {formatDate(selected.respondedAt)}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-md border p-3 text-sm text-muted-foreground flex items-center gap-2">
                  <MessageSquareReply className="h-4 w-4" /> No reply yet. You will see it here once the professional responds.
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoleNotifications;