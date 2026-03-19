import { useCallback, useEffect, useState } from 'react';
import { Clock, Mail, MessageSquare, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { apiUrl } from '@/lib/api';

type Inquiry = {
  id: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string | null;
  message: string;
  replyMessage?: string | null;
  respondedAt?: string | null;
  status: 'PENDING' | 'READ' | 'REPLIED';
  createdAt: string;
  updatedAt: string;
};

const RoleInbox = () => {
  const { token } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'READ' | 'REPLIED'>('all');

  const fetchInquiries = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(apiUrl('/api/inquiries'), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch inquiries');
      }

      const data = await response.json();
      setInquiries(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load messages');
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

  const updateInquiryStatus = async (id: string, status: Inquiry['status']) => {
    if (!token) return;

    const response = await fetch(apiUrl(`/api/inquiries/${id}`), {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (response.ok) {
      setInquiries((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
      if (selectedInquiry?.id === id) {
        setSelectedInquiry((prev) => (prev ? { ...prev, status } : prev));
      }
    }
  };

  const openInquiry = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setDialogOpen(true);
    if (inquiry.status === 'PENDING') {
      void updateInquiryStatus(inquiry.id, 'READ');
    }
  };

  const sendReply = async (id: string, content: string) => {
    if (!token) return;

    try {
      const response = await fetch(apiUrl(`/api/inquiries/${id}/reply`), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ replyMessage: content }),
      });

      if (!response.ok) {
        throw new Error('Failed to send reply');
      }

      const updatedInquiry = await response.json() as Inquiry;
      setInquiries((prev) => prev.map((item) => (item.id === id ? updatedInquiry : item)));
      setSelectedInquiry(updatedInquiry);
      setReplyMessage('');
      toast.success('Reply saved successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to send reply');
    }
  };

  const filtered = filter === 'all' ? inquiries : inquiries.filter((item) => item.status === filter);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const statusBadge = (status: Inquiry['status']) => {
    if (status === 'PENDING') return <Badge className="bg-yellow-500">Pending</Badge>;
    if (status === 'READ') return <Badge variant="secondary">Read</Badge>;
    return <Badge variant="outline" className="text-green-600 border-green-600">Replied</Badge>;
  };

  if (loading) {
    return <div className="h-80 grid place-items-center text-muted-foreground">Loading messages...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Inbox</h1>
        <p className="text-muted-foreground mt-2">View inquiries and support requests sent to your portal.</p>
      </div>

      <Tabs value={filter} onValueChange={(value) => setFilter(value as typeof filter)}>
        <TabsList>
          <TabsTrigger value="all">All ({inquiries.length})</TabsTrigger>
          <TabsTrigger value="PENDING">Pending ({inquiries.filter((item) => item.status === 'PENDING').length})</TabsTrigger>
          <TabsTrigger value="READ">Read ({inquiries.filter((item) => item.status === 'READ').length})</TabsTrigger>
          <TabsTrigger value="REPLIED">Replied ({inquiries.filter((item) => item.status === 'REPLIED').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">No messages yet.</CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filtered.map((inquiry) => (
                <Card key={inquiry.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openInquiry(inquiry)}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                            {inquiry.senderName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold truncate">{inquiry.senderName}</p>
                            <p className="text-sm text-muted-foreground truncate">{inquiry.senderEmail}</p>
                          </div>
                        </div>
                        <p className="text-sm text-foreground/90 line-clamp-2 whitespace-pre-wrap">{inquiry.message}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3">
                          <Clock className="w-3 h-3" />
                          {formatDate(inquiry.createdAt)}
                        </div>
                      </div>
                      {statusBadge(inquiry.status)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>Message from {selectedInquiry?.senderName}</DialogTitle>
            <DialogDescription>{selectedInquiry ? formatDate(selectedInquiry.createdAt) : ''}</DialogDescription>
          </DialogHeader>
          {selectedInquiry && (
            <div className="space-y-4 py-2">
              <div className="space-y-2 rounded-lg bg-muted/40 p-4 text-sm">
                <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> {selectedInquiry.senderEmail}</div>
                {selectedInquiry.senderPhone && <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {selectedInquiry.senderPhone}</div>}
                <div>{statusBadge(selectedInquiry.status)}</div>
              </div>

              <div>
                <Label>Message</Label>
                <div className="mt-2 rounded-lg border p-4 text-sm whitespace-pre-wrap max-h-72 overflow-auto">{selectedInquiry.message}</div>
              </div>

              {selectedInquiry.replyMessage && (
                <div>
                  <Label>Saved Reply</Label>
                  <div className="mt-2 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm whitespace-pre-wrap max-h-72 overflow-auto">
                    {selectedInquiry.replyMessage}
                    {selectedInquiry.respondedAt && (
                      <p className="text-xs text-muted-foreground mt-2">Sent {formatDate(selectedInquiry.respondedAt)}</p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="reply">Reply notes</Label>
                <Textarea
                  id="reply"
                  rows={4}
                  value={replyMessage}
                  onChange={(event) => setReplyMessage(event.target.value)}
                  placeholder="Write your response or notes here..."
                  className="mt-2"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => {
                    if (!replyMessage.trim()) {
                      toast.error('Add a reply note first');
                      return;
                    }
                    void sendReply(selectedInquiry.id, replyMessage);
                  }}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Reply
                </Button>
                {selectedInquiry.status !== 'READ' && selectedInquiry.status !== 'REPLIED' && (
                  <Button variant="outline" onClick={() => void updateInquiryStatus(selectedInquiry.id, 'READ')}>
                    Mark Read
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoleInbox;
