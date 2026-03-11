import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail, Phone, MessageSquareReply, RefreshCw } from "lucide-react";
import { apiUrl } from "@/lib/api";
import { authStorage } from "@/lib/auth";
import { toast } from "sonner";

type SentInquiry = {
  id: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string | null;
  message: string;
  replyMessage?: string | null;
  senderViewedAt?: string | null;
  senderHasUnreadReply?: boolean;
  status: "PENDING" | "READ" | "REPLIED";
  respondedAt?: string | null;
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

const MyMessages = () => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<SentInquiry[]>([]);
  const [filter, setFilter] = useState<"all" | "PENDING" | "READ" | "REPLIED">("all");
  const [selected, setSelected] = useState<SentInquiry | null>(null);

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
        throw new Error('Failed to mark reply as read');
      }

      const updated = (await response.json()) as SentInquiry;
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
      setSelected((prev) => (prev?.id === id ? updated : prev));
      window.dispatchEvent(new Event('dashboard-replies-updated'));
    } catch (error) {
      console.error(error);
    }
  };

  const load = async () => {
    const token = authStorage.getToken();
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(apiUrl("/api/inquiries/sent"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load sent messages");
      }

      const data = (await response.json()) as SentInquiry[];
      setItems(data);
      window.dispatchEvent(new Event('dashboard-replies-updated'));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load messages";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((item) => item.status === filter);
  }, [items, filter]);

  const unreadReplyCount = useMemo(
    () => items.filter((item) => item.senderHasUnreadReply || (item.replyMessage && !item.senderViewedAt)).length,
    [items],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">My Messages</h1>
          <p className="text-sm text-muted-foreground">Track requests you sent and replies from professionals.</p>
        </div>
        <Button variant="outline" onClick={() => void load()} disabled={loading}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total messages</p>
            <p className="mt-2 text-2xl font-semibold">{items.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Unread replies</p>
            <p className="mt-2 text-2xl font-semibold text-green-600">{unreadReplyCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Awaiting response</p>
            <p className="mt-2 text-2xl font-semibold">{items.filter((item) => item.status !== 'REPLIED').length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={filter} onValueChange={(next) => setFilter(next as typeof filter)}>
        <TabsList>
          <TabsTrigger value="all">All ({items.length})</TabsTrigger>
          <TabsTrigger value="PENDING">Pending ({items.filter((item) => item.status === "PENDING").length})</TabsTrigger>
          <TabsTrigger value="READ">Read ({items.filter((item) => item.status === "READ").length})</TabsTrigger>
          <TabsTrigger value="REPLIED">Replied ({items.filter((item) => item.status === "REPLIED").length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Loading your messages...</CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">No messages found for this filter.</CardContent>
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
                  <CardTitle className="text-base">To {item.recipient.name || item.recipient.email}</CardTitle>
                  <div className="flex items-center gap-2">
                    {item.senderHasUnreadReply && <Badge variant="default">New reply</Badge>}
                    <Badge variant="secondary">{item.status}</Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Sent {formatDate(item.createdAt)}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm line-clamp-2 whitespace-pre-wrap">{item.message}</p>
                {item.replyMessage && (
                  <div className="rounded-md bg-muted p-3">
                    <p className="text-xs font-medium mb-1">Latest Reply</p>
                    <p className="text-sm line-clamp-2 whitespace-pre-wrap">{item.replyMessage}</p>
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
              Conversation with {selected?.recipient.name || selected?.recipient.email}
            </DialogTitle>
            <DialogDescription>
              {selected ? `Sent ${formatDate(selected.createdAt)}` : ""}
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

export default MyMessages;
