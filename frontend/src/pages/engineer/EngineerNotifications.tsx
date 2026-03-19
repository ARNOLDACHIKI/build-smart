import { useState, useEffect, useCallback } from 'react';
import { Bell, Mail, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { apiUrl } from '@/lib/api';

type Inquiry = {
  id: string;
  senderName: string;
  senderEmail: string;
  message: string;
  status: 'PENDING' | 'READ' | 'REPLIED';
  createdAt: string;
};

const EngineerNotifications = () => {
  const { token } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchInquiries = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(apiUrl('/api/inquiries'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Show only recent (last 7 days) and unread
        const recent = data.filter((inq: Inquiry) => {
          const age = Date.now() - new Date(inq.createdAt).getTime();
          return age < 7 * 24 * 60 * 60 * 1000; // 7 days
        });
        setInquiries(recent);
      }
    } catch (error) {
      console.error('Fetch inquiries error:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    void fetchInquiries();
  }, [fetchInquiries, token]);

  const markAsRead = async (id: string) => {
    if (!token) return;

    try {
      const response = await fetch(apiUrl(`/api/inquiries/${id}`), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'READ' }),
      });

      if (response.ok) {
        setInquiries(prev => prev.map(inq => 
          inq.id === id ? { ...inq, status: 'READ' } : inq
        ));
        toast.success('Marked as read');
      }
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const pendingCount = inquiries.filter(i => i.status === 'PENDING').length;
  const unreadCount = inquiries.filter(i => i.status === 'PENDING' || i.status === 'READ').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Stay updated on new inquiries and activities</p>
        </div>
        {pendingCount > 0 && (
          <Badge variant="default" className="text-lg px-4 py-2">
            {pendingCount} New
          </Badge>
        )}
      </div>

      {inquiries.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No notifications</h3>
            <p className="text-muted-foreground">You're all caught up!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inquiry) => (
            <Card 
              key={inquiry.id} 
              className={`hover:shadow-md transition-shadow cursor-pointer ${
                inquiry.status === 'PENDING' ? 'border-primary bg-primary/5' : ''
              }`}
              onClick={() => navigate('/engineer/inbox')}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    inquiry.status === 'PENDING' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h3 className="font-semibold">New inquiry from {inquiry.senderName}</h3>
                        <p className="text-sm text-muted-foreground">{inquiry.senderEmail}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                        {formatDate(inquiry.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm line-clamp-2 mb-2">{inquiry.message}</p>
                    <div className="flex items-center gap-2">
                      {inquiry.status === 'PENDING' && (
                        <Badge variant="default" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />Unread
                        </Badge>
                      )}
                      {inquiry.status === 'READ' && (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle2 className="w-3 h-3 mr-1" />Read
                        </Badge>
                      )}
                      {inquiry.status === 'REPLIED' && (
                        <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                          <CheckCircle2 className="w-3 h-3 mr-1" />Replied
                        </Badge>
                      )}
                      {inquiry.status === 'PENDING' && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-xs h-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(inquiry.id);
                          }}
                        >
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {inquiries.length > 0 && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => navigate('/engineer/inbox')}>
            View All in Inbox
          </Button>
        </div>
      )}
    </div>
  );
};

export default EngineerNotifications;
