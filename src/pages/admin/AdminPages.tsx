import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { ScrollText, CreditCard, Brain, Settings } from 'lucide-react';

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

export const AdminAI = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold font-['Space_Grotesk']">AI Engine Control</h1>
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="glass-card border-0">
        <CardHeader><CardTitle className="text-base font-['Space_Grotesk'] flex items-center gap-2"><Brain className="w-4 h-4 text-primary" /> Model Status</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[{ name: 'Risk Prediction', status: 'active', accuracy: '94%' }, { name: 'Cost Forecasting', status: 'active', accuracy: '89%' }, { name: 'Delay Prediction', status: 'training', accuracy: '82%' }].map((m, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm font-medium">{m.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Accuracy: {m.accuracy}</span>
                <Badge variant="secondary" className={m.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}>{m.status}</Badge>
              </div>
            </div>
          ))}
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
  </div>
);

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
