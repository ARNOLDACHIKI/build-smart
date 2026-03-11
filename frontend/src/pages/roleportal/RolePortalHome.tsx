import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, MessageSquareReply } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { apiUrl } from '@/lib/api';
import { ROLE_PORTAL_CONFIG, getRoleLabel } from '@/lib/roles';

type SentInquiry = {
  id: string;
  message: string;
  replyMessage?: string | null;
  status: 'PENDING' | 'READ' | 'REPLIED';
  respondedAt?: string | null;
  createdAt: string;
  recipient: {
    id: string;
    name: string | null;
    email: string;
  };
};

const RolePortalHome = () => {
  const { user, token } = useAuth();
  const config = ROLE_PORTAL_CONFIG[user?.role || 'USER'];
  const [sentRequests, setSentRequests] = useState<SentInquiry[]>([]);

  useEffect(() => {
    if (!token) return;

    const loadSentRequests = async () => {
      try {
        const response = await fetch(apiUrl('/api/inquiries/sent'), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as SentInquiry[];
        setSentRequests(data);
      } catch (error) {
        console.error('Load portal notifications error:', error);
      }
    };

    void loadSentRequests();
  }, [token]);

  const recentReplies = useMemo(() => {
    return [...sentRequests]
      .filter((item) => item.replyMessage)
      .sort((left, right) => new Date(right.respondedAt || right.createdAt).getTime() - new Date(left.respondedAt || left.createdAt).getTime())
      .slice(0, 3);
  }, [sentRequests]);

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="secondary" className="mb-3">{getRoleLabel(user?.role)}</Badge>
        <h1 className="text-3xl font-bold">{config.title}</h1>
        <p className="text-muted-foreground mt-2">{config.subtitle}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[config.primaryMetric, config.secondaryMetric, `${config.tasks.length} task tracks`, `${config.networkFocus.length} network priorities`].map((item) => (
          <Card key={item}>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Portal KPI</p>
              <p className="mt-2 text-xl font-semibold">{item}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{config.portfolioTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {config.portfolioItems.map((item) => (
              <div key={item} className="rounded-lg border p-3 text-sm">{item}</div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Priority tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {config.tasks.map((item) => (
              <div key={item} className="rounded-lg border p-3 text-sm">{item}</div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-4 w-4" /> Reply notifications
            </CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link to="/portal/notifications">Open notifications</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border p-3">
              <p className="text-sm text-muted-foreground">Replies received</p>
              <p className="mt-1 text-2xl font-semibold text-green-600">{sentRequests.filter((item) => item.status === 'REPLIED').length}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-sm text-muted-foreground">Requests awaiting reply</p>
              <p className="mt-1 text-2xl font-semibold">{sentRequests.filter((item) => item.status !== 'REPLIED').length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent replies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentReplies.length === 0 ? (
              <div className="rounded-lg border p-3 text-sm text-muted-foreground">
                No replies yet. When a professional responds to one of your requests, it will appear here.
              </div>
            ) : (
              recentReplies.map((item) => (
                <div key={item.id} className="rounded-lg border p-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{item.recipient.name || item.recipient.email}</p>
                    <Badge variant="default">Reply</Badge>
                  </div>
                  <p className="mt-2 text-muted-foreground line-clamp-2 whitespace-pre-wrap">{item.replyMessage}</p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <MessageSquareReply className="h-3.5 w-3.5" />
                    {item.respondedAt ? new Date(item.respondedAt).toLocaleString() : new Date(item.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RolePortalHome;
