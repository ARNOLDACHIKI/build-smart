import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { ScrollText, CreditCard, Brain, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { authStorage } from '@/lib/auth';
import { apiUrl } from '@/lib/api';

// Simple placeholder pages for admin sub-sections

export const AdminProjects = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold font-['Space_Grotesk']">Projects Monitoring</h1>
    <div className="grid sm:grid-cols-3 gap-4">
      {[{ label: 'Total Projects', value: '234' }, { label: 'At Risk', value: '12' }, { label: 'Flagged', value: '3' }].map((s, i) => (
        <Card key={i} className="glass-card border-0"><CardContent className="p-4"><div className="text-2xl font-bold font-['Space_Grotesk']">{s.value}</div><div className="text-xs text-muted-foreground">{s.label}</div></CardContent></Card>
      ))}
    </div>
    <Card className="glass-card border-0 p-6 text-center text-muted-foreground">Full project monitoring view with risk pattern detection coming with backend integration.</Card>
  </div>
);

export const AdminSubscriptions = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold font-['Space_Grotesk']">Subscription Management</h1>
    <div className="grid sm:grid-cols-3 gap-4">
      {[{ plan: 'Free', count: 450, color: 'text-muted-foreground' }, { plan: 'Pro', count: 720, color: 'text-primary' }, { plan: 'Enterprise', count: 180, color: 'text-accent' }].map((p, i) => (
        <Card key={i} className="glass-card border-0">
          <CardContent className="p-4 text-center">
            <CreditCard className={`w-8 h-8 mx-auto mb-2 ${p.color}`} />
            <div className="text-xl font-bold font-['Space_Grotesk']">{p.count}</div>
            <div className="text-sm">{p.plan}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export const AdminContent = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold font-['Space_Grotesk']">Content Management</h1>
    <div className="grid sm:grid-cols-2 gap-4">
      {['Landing Page', 'Help Articles', 'FAQs', 'Announcements'].map((item) => (
        <Card key={item} className="glass-card border-0 cursor-pointer hover:ring-1 hover:ring-primary/30">
          <CardContent className="p-4 flex items-center justify-between">
            <span className="font-medium">{item}</span>
            <Button size="sm" variant="outline">Edit</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export const AdminLogs = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold font-['Space_Grotesk']">Audit Logs</h1>
    <Card className="glass-card border-0">
      <CardContent className="p-4 space-y-2">
        {[
          { action: 'User login', user: 'james@buildco.ke', time: '5 min ago' },
          { action: 'Project created', user: 'amina@buildco.ke', time: '1 hour ago' },
          { action: 'Budget updated', user: 'peter@lake.ke', time: '2 hours ago' },
          { action: 'File uploaded', user: 'sarah@design.ke', time: '3 hours ago' },
          { action: 'User suspended', user: 'admin', time: '5 hours ago' },
          { action: 'API key generated', user: 'david@highland.ke', time: '1 day ago' },
        ].map((log, i) => (
          <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 text-sm">
            <ScrollText className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium flex-1">{log.action}</span>
            <span className="text-muted-foreground">{log.user}</span>
            <span className="text-xs text-muted-foreground">{log.time}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
);

export const AdminAI = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [chatLimit, setChatLimit] = useState(12);
  const [dailyLimit, setDailyLimit] = useState(50);
  const [defaults, setDefaults] = useState({ chatLimit: 12, dailyMessageLimit: 50 });
  const [debugPrompt, setDebugPrompt] = useState('find engineers in nairobi');
  const [debugLoading, setDebugLoading] = useState(false);
  const [debugResult, setDebugResult] = useState<{
    source?: string;
    reply?: string;
    routing?: {
      intent_name: string;
      confidence: number;
      function_to_call: string;
      required_parameters: Record<string, string>;
      extracted_parameters: Record<string, string | number | boolean | null>;
      missing_parameters: string[];
      expected_response_format: { type: string; fields: string[] };
    };
  } | null>(null);

  const loadAssistantLimits = async () => {
    const token = authStorage.getToken();
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(apiUrl('/api/admin/assistant-limits'), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load assistant limits');
      }

      const payload = await response.json() as {
        chatLimit: number;
        dailyMessageLimit: number;
        defaults?: { chatLimit: number; dailyMessageLimit: number };
      };

      setChatLimit(payload.chatLimit);
      setDailyLimit(payload.dailyMessageLimit);
      if (payload.defaults) {
        setDefaults(payload.defaults);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load assistant limits';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAssistantLimits();
  }, []);

  const saveAssistantLimits = async () => {
    const token = authStorage.getToken();
    if (!token) return;

    setSaving(true);
    try {
      const response = await fetch(apiUrl('/api/admin/assistant-limits'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chatLimit: Math.max(1, Math.floor(chatLimit)),
          dailyMessageLimit: Math.max(1, Math.floor(dailyLimit)),
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({})) as { error?: string };
        throw new Error(payload.error || 'Failed to save assistant limits');
      }

      toast.success('Assistant limits updated');
      await loadAssistantLimits();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save assistant limits';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const runIntentDebug = async () => {
    const token = authStorage.getToken();
    if (!token || !debugPrompt.trim()) return;

    setDebugLoading(true);
    try {
      let conversationId: string | undefined;
      const conversationsResponse = await fetch(apiUrl('/api/ai/conversations'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (conversationsResponse.ok) {
        const conversationsPayload = await conversationsResponse.json() as { conversations?: Array<{ id: string }> };
        conversationId = conversationsPayload.conversations?.[0]?.id;
      }

      const response = await fetch(apiUrl('/api/ai/assistant'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: debugPrompt,
          history: [],
          ...(conversationId ? { conversationId } : {}),
        }),
      });

      const payload = await response.json().catch(() => ({})) as {
        error?: string;
        source?: string;
        reply?: string;
        routing?: {
          intent_name: string;
          confidence: number;
          function_to_call: string;
          required_parameters: Record<string, string>;
          extracted_parameters: Record<string, string | number | boolean | null>;
          missing_parameters: string[];
          expected_response_format: { type: string; fields: string[] };
        };
      };

      if (!response.ok) {
        throw new Error(payload.error || 'Intent debug request failed');
      }

      setDebugResult(payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Intent debug request failed';
      toast.error(message);
    } finally {
      setDebugLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-['Space_Grotesk']">AI Engine Control</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-base font-['Space_Grotesk'] flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" /> Assistant Limits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs">Saved chat slots per user</Label>
              <Input
                type="number"
                min={1}
                value={chatLimit}
                onChange={(event) => setChatLimit(Number(event.target.value || 1))}
                disabled={loading || saving}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Daily assistant messages per user</Label>
              <Input
                type="number"
                min={1}
                value={dailyLimit}
                onChange={(event) => setDailyLimit(Number(event.target.value || 1))}
                disabled={loading || saving}
              />
            </div>

            <div className="text-xs text-muted-foreground rounded-lg bg-muted/50 p-3">
              Defaults: chats {defaults.chatLimit}, daily messages {defaults.dailyMessageLimit}
            </div>

            <div className="flex gap-2">
              <Button onClick={() => void saveAssistantLimits()} disabled={loading || saving}>
                Save limits
              </Button>
              <Button variant="outline" onClick={() => void loadAssistantLimits()} disabled={loading || saving}>
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardHeader><CardTitle className="text-base font-['Space_Grotesk']">Thresholds</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div><Label className="text-sm">Risk Alert Threshold</Label><Slider defaultValue={[70]} max={100} step={5} className="mt-2" /><div className="text-xs text-muted-foreground mt-1">Alert when risk score &gt; 70%</div></div>
            <div><Label className="text-sm">Cost Overrun Threshold</Label><Slider defaultValue={[10]} max={50} step={1} className="mt-2" /><div className="text-xs text-muted-foreground mt-1">Alert when overrun &gt; 10%</div></div>
            <div className="flex items-center justify-between"><Label className="text-sm">Auto-retrain models</Label><Switch defaultChecked /></div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="text-base font-['Space_Grotesk']">Intent Debug Panel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Test prompt</Label>
            <Textarea
              value={debugPrompt}
              onChange={(event) => setDebugPrompt(event.target.value)}
              rows={3}
              placeholder="Type a user message to inspect detected intent and routed function"
            />
          </div>

          <Button onClick={() => void runIntentDebug()} disabled={debugLoading || !debugPrompt.trim()}>
            {debugLoading ? 'Running...' : 'Run intent debug'}
          </Button>

          {debugResult?.routing && (
            <div className="rounded-lg border p-4 text-sm space-y-2">
              <div><span className="font-semibold">Source:</span> {debugResult.source || 'n/a'}</div>
              <div><span className="font-semibold">Detected intent:</span> {debugResult.routing.intent_name}</div>
              <div><span className="font-semibold">Confidence:</span> {debugResult.routing.confidence.toFixed(2)}</div>
              <div><span className="font-semibold">Function:</span> {debugResult.routing.function_to_call}</div>
              <div>
                <span className="font-semibold">Missing parameters:</span>{' '}
                {debugResult.routing.missing_parameters.length > 0 ? debugResult.routing.missing_parameters.join(', ') : 'none'}
              </div>
              <div>
                <span className="font-semibold">Extracted parameters:</span>
                <pre className="mt-1 whitespace-pre-wrap text-xs bg-muted/40 p-2 rounded">
{JSON.stringify(debugResult.routing.extracted_parameters, null, 2)}
                </pre>
              </div>
              <div>
                <span className="font-semibold">Expected response format:</span>
                <pre className="mt-1 whitespace-pre-wrap text-xs bg-muted/40 p-2 rounded">
{JSON.stringify(debugResult.routing.expected_response_format, null, 2)}
                </pre>
              </div>
              {debugResult.reply && (
                <div>
                  <span className="font-semibold">Assistant reply preview:</span>
                  <p className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap">{debugResult.reply}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export const AdminSettings = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold font-['Space_Grotesk']">System Settings</h1>
    <div className="grid md:grid-cols-2 gap-6">
      {[
        { title: 'Email Server', fields: ['SMTP Host', 'Port', 'Username'] },
        { title: 'Storage', fields: ['Max Upload Size', 'Storage Limit', 'CDN URL'] },
        { title: 'Maintenance', fields: ['Maintenance Mode', 'Backup Schedule'] },
        { title: 'Security', fields: ['Rate Limit', 'Session Timeout', 'CORS Origins'] },
      ].map((section) => (
        <Card key={section.title} className="glass-card border-0">
          <CardHeader><CardTitle className="text-base font-['Space_Grotesk']">{section.title}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {section.fields.map((field) => (
              <div key={field} className="space-y-1">
                <Label className="text-xs">{field}</Label>
                <Input placeholder={field} className="h-9" />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
    <Button className="gradient-primary text-primary-foreground">Save Settings</Button>
  </div>
);
