import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Inbox, Bell, MessageSquare, TrendingUp, Mail, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { apiUrl } from '@/lib/api';

type Inquiry = {
  id: string;
  status: 'PENDING' | 'READ' | 'REPLIED';
  createdAt: string;
};

const EngineerHome = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    void fetchInquiries();
  }, [token]);

  const fetchInquiries = async () => {
    if (!token) return;

    try {
      const response = await fetch(apiUrl('/api/inquiries'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInquiries(data);
      }
    } catch (error) {
      console.error('Fetch inquiries error:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: inquiries.length,
    pending: inquiries.filter(i => i.status === 'PENDING').length,
    read: inquiries.filter(i => i.status === 'READ').length,
    replied: inquiries.filter(i => i.status === 'REPLIED').length,
  };

  // Calculate weekly trend
  const lastWeek = inquiries.filter(i => {
    const age = Date.now() - new Date(i.createdAt).getTime();
    return age < 7 * 24 * 60 * 60 * 1000;
  }).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user?.name || 'Engineer'}!</h1>
        <p className="text-muted-foreground">Here's what's happening with your inquiries</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">New Inquiries</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Inquiries</CardTitle>
            <Inbox className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Replied</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.replied}</div>
            <p className="text-xs text-muted-foreground mt-1">Conversations completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lastWeek}</div>
            <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            className="h-24 flex flex-col items-center justify-center gap-2"
            onClick={() => navigate('/engineer/inbox')}
          >
            <Inbox className="h-8 w-8" />
            <span>View Inbox</span>
            {stats.pending > 0 && (
              <span className="text-xs text-yellow-600 font-semibold">{stats.pending} pending</span>
            )}
          </Button>

          <Button 
            variant="outline" 
            className="h-24 flex flex-col items-center justify-center gap-2"
            onClick={() => navigate('/engineer/notifications')}
          >
            <Bell className="h-8 w-8" />
            <span>Notifications</span>
          </Button>

          <Button 
            variant="outline" 
            className="h-24 flex flex-col items-center justify-center gap-2"
            onClick={() => navigate('/engineer/profile')}
          >
            <CheckCircle2 className="h-8 w-8" />
            <span>Update Profile</span>
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {loading ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Loading recent activity...
          </CardContent>
        </Card>
      ) : inquiries.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="py-8 text-center">
            <Mail className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No inquiries yet</h3>
            <p className="text-muted-foreground">When clients contact you, they'll appear here</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inquiries.slice(0, 5).map((inquiry) => {
                const date = new Date(inquiry.createdAt);
                return (
                  <div key={inquiry.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => navigate('/engineer/inbox')}>
                    <div className={`w-2 h-2 rounded-full ${
                      inquiry.status === 'PENDING' ? 'bg-yellow-500' :
                      inquiry.status === 'READ' ? 'bg-blue-500' :
                      'bg-green-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm">
                        {inquiry.status === 'PENDING' ? 'New inquiry received' :
                         inquiry.status === 'READ' ? 'Inquiry marked as read' :
                         'Reply sent'}
                      </p>
                      <p className="text-xs text-muted-foreground">{date.toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EngineerHome;
