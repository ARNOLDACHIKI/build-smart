import { useState, useEffect } from 'react';
import { Mail, Phone, Clock, CheckCircle2, MessageSquare, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  AI_DRAFT_STORAGE_KEY,
  EngineerProject,
  appendProjectFromDraft,
  generateProjectDraftFromInquiry,
} from '@/lib/engineerProjectAgent';
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

const EngineerInbox = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'READ' | 'REPLIED'>('all');
  const [aiDraft, setAiDraft] = useState<Omit<EngineerProject, 'id'> | null>(null);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    void fetchInquiries();

    const intervalId = window.setInterval(() => {
      void fetchInquiries({ silent: true });
    }, 4000);

    return () => window.clearInterval(intervalId);
  }, [token]);

  const fetchInquiries = async (options?: { silent?: boolean }) => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(apiUrl('/api/inquiries'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInquiries(data);
      } else {
        if (!options?.silent) {
          toast.error('Failed to load inquiries');
        }
      }
    } catch (error) {
      console.error('Fetch inquiries error:', error);
      if (!options?.silent) {
        toast.error('Failed to load inquiries');
      }
    } finally {
      setLoading(false);
    }
  };

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
      }
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const markAsReplied = async (id: string) => {
    if (!token) return;

    try {
      const response = await fetch(apiUrl(`/api/inquiries/${id}`), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'REPLIED' }),
      });

      if (response.ok) {
        setInquiries(prev => prev.map(inq => 
          inq.id === id ? { ...inq, status: 'REPLIED' } : inq
        ));
        toast.success('Marked as replied');
        setDialogOpen(false);
        setReplyMessage('');
      }
    } catch (error) {
      console.error('Mark as replied error:', error);
      toast.error('Failed to update status');
    }
  };

  const handleViewInquiry = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setDialogOpen(true);
    if (inquiry.status === 'PENDING') {
      markAsRead(inquiry.id);
    }
  };

  const handleSendReply = () => {
    if (!replyMessage.trim()) {
      toast.error('Please enter a reply message');
      return;
    }
    
    if (selectedInquiry) {
      void sendReply(selectedInquiry.id, replyMessage);
    }
  };

  const sendReply = async (id: string, content: string) => {
    if (!token) return;

    try {
      const response = await fetch(apiUrl(`/api/inquiries/${id}/reply`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ replyMessage: content }),
      });

      if (!response.ok) {
        throw new Error('Failed to send reply');
      }

      const updatedInquiry = await response.json() as Inquiry;
      setInquiries(prev => prev.map(inq => inq.id === id ? updatedInquiry : inq));
      setSelectedInquiry(updatedInquiry);
      toast.success(`Reply sent to ${updatedInquiry.senderEmail}`);
      setReplyMessage('');
    } catch (error) {
      console.error('Send reply error:', error);
      toast.error('Failed to send reply');
    }
  };

  const handleAiScanInquiry = async () => {
    if (!selectedInquiry) {
      toast.error('No inquiry selected');
      return;
    }

    setIsGeneratingDraft(true);
    try {
      const draft = await generateProjectDraftFromInquiry({
        senderName: selectedInquiry.senderName,
        senderPhone: selectedInquiry.senderPhone,
        message: selectedInquiry.message,
      });

      setAiDraft(draft);
      setAiDialogOpen(true);
      toast.success('AI draft generated. Review before creating.');
    } catch {
      toast.error('Failed to generate AI draft.');
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  const handleReviewAiDraft = () => {
    if (!aiDraft) return;
    localStorage.setItem(AI_DRAFT_STORAGE_KEY, JSON.stringify(aiDraft));
    setAiDialogOpen(false);
    setDialogOpen(false);
    navigate('/engineer/projects?aiDraft=1');
  };

  const handleCreateProjectNow = () => {
    if (!aiDraft) return;
    const project = appendProjectFromDraft(aiDraft);
    setAiDialogOpen(false);
    setDialogOpen(false);
    toast.success(`Project ${project.id} created from inquiry.`);
    navigate('/engineer/projects');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="default" className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'READ':
        return <Badge variant="secondary"><CheckCircle2 className="w-3 h-3 mr-1" />Read</Badge>;
      case 'REPLIED':
        return <Badge variant="outline" className="text-green-600 border-green-600"><MessageSquare className="w-3 h-3 mr-1" />Replied</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
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

  const filteredInquiries = filter === 'all' 
    ? inquiries 
    : inquiries.filter(inq => inq.status === filter);

  const stats = {
    total: inquiries.length,
    pending: inquiries.filter(i => i.status === 'PENDING').length,
    read: inquiries.filter(i => i.status === 'READ').length,
    replied: inquiries.filter(i => i.status === 'REPLIED').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading inquiries...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inbox</h1>
          <p className="text-muted-foreground">Manage inquiries from potential clients</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Inquiries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Read</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.read}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Replied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.replied}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full">
        <TabsList>
          <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="PENDING">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="READ">Read ({stats.read})</TabsTrigger>
          <TabsTrigger value="REPLIED">Replied ({stats.replied})</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          {filteredInquiries.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No inquiries found
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredInquiries.map((inquiry) => (
                <Card key={inquiry.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleViewInquiry(inquiry)}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center font-bold">
                            {inquiry.senderName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold">{inquiry.senderName}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              {inquiry.senderEmail}
                              {inquiry.senderPhone && (
                                <>
                                  <span>•</span>
                                  <Phone className="w-3 h-3" />
                                  {inquiry.senderPhone}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm line-clamp-2 mb-2">{inquiry.message}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {formatDate(inquiry.createdAt)}
                        </div>
                      </div>
                      <div className="ml-4">
                        {getStatusBadge(inquiry.status)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Inquiry Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Inquiry from {selectedInquiry?.senderName}</DialogTitle>
            <DialogDescription>
              Received {selectedInquiry && formatDate(selectedInquiry.createdAt)}
            </DialogDescription>
          </DialogHeader>
          {selectedInquiry && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{selectedInquiry.senderEmail}</span>
                </div>
                {selectedInquiry.senderPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{selectedInquiry.senderPhone}</span>
                  </div>
                )}
                <div className="pt-2">
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedInquiry.status)}</div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Message</Label>
                <div className="mt-2 p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{selectedInquiry.message}</p>
                </div>
              </div>

              {selectedInquiry.replyMessage && (
                <div>
                  <Label className="text-sm font-medium">Saved Reply</Label>
                  <div className="mt-2 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedInquiry.replyMessage}</p>
                    {selectedInquiry.respondedAt && (
                      <p className="text-xs text-muted-foreground mt-2">Sent {formatDate(selectedInquiry.respondedAt)}</p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="reply">Your Reply</Label>
                <Textarea
                  id="reply"
                  placeholder="Type your reply here..."
                  rows={4}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={handleSendReply} className="flex-1 min-w-[140px]">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Reply
                </Button>
                <Button variant="outline" onClick={handleAiScanInquiry} disabled={isGeneratingDraft}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isGeneratingDraft ? 'Generating...' : 'AI: Generate Project'}
                </Button>
                {selectedInquiry.status === 'PENDING' && (
                  <Button variant="outline" onClick={() => markAsRead(selectedInquiry.id)}>
                    Mark as Read
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* AI Draft Dialog */}
      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> AI Project Draft Ready
            </DialogTitle>
            <DialogDescription>
              AI scanned the inquiry and prepared a draft. Review and add anything, or create immediately.
            </DialogDescription>
          </DialogHeader>

          {aiDraft && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Project Name</p>
                <p className="font-medium">{aiDraft.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Client</p>
                <p className="font-medium">{aiDraft.client}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Location</p>
                <p className="font-medium">{aiDraft.location}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Service Category</p>
                <p className="font-medium">{aiDraft.serviceCategory}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Project Type</p>
                <p className="font-medium">{aiDraft.projectType}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Priority</p>
                <p className="font-medium">{aiDraft.priority}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-muted-foreground">Scope Summary</p>
                <p>{aiDraft.scopeSummary}</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleReviewAiDraft}>Review & Add More</Button>
            <Button onClick={handleCreateProjectNow}>Create Project Now</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EngineerInbox;
