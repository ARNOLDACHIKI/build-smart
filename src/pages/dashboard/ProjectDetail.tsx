import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, Upload, Plus, Share2, Users, FileText, AlertTriangle, Brain } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const budgetBreakdown = [
  { category: 'Materials', planned: 45, actual: 42 },
  { category: 'Labor', planned: 30, actual: 35 },
  { category: 'Equipment', planned: 15, actual: 12 },
  { category: 'Permits', planned: 5, actual: 5 },
  { category: 'Other', planned: 5, actual: 6 },
];

const milestones = [
  { name: 'Foundation Complete', date: '2026-02-15', status: 'completed' },
  { name: 'Structural Frame', date: '2026-04-30', status: 'completed' },
  { name: 'Roofing', date: '2026-06-15', status: 'in-progress' },
  { name: 'Interior Finishing', date: '2026-08-01', status: 'upcoming' },
  { name: 'Final Inspection', date: '2026-08-15', status: 'upcoming' },
];

const ProjectDetail = () => {
  const { t } = useLanguage();
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/projects"><Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold font-['Space_Grotesk']">Nairobi Tower Complex</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="bg-primary/10 text-primary">Active</Badge>
            <span className="text-sm text-muted-foreground">72% complete</span>
          </div>
        </div>
        <Button variant="outline" size="sm"><Share2 className="w-4 h-4 mr-1" /> Share</Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="glass">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="budget">{t('projects.budget')}</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="tasks">{t('sidebar.tasks')}</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="team">{t('sidebar.team')}</TabsTrigger>
          <TabsTrigger value="risks">Risk Analysis</TabsTrigger>
          <TabsTrigger value="insights">{t('dashboard.aiInsights')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <Card className="glass-card border-0"><CardContent className="p-4"><div className="text-xs text-muted-foreground">Budget</div><div className="text-xl font-bold font-['Space_Grotesk']">KES 120M</div><div className="text-xs text-muted-foreground">Spent: KES 87M</div></CardContent></Card>
            <Card className="glass-card border-0"><CardContent className="p-4"><div className="text-xs text-muted-foreground">Deadline</div><div className="text-xl font-bold font-['Space_Grotesk']">Aug 15, 2026</div><div className="text-xs text-primary">On track</div></CardContent></Card>
            <Card className="glass-card border-0"><CardContent className="p-4"><div className="text-xs text-muted-foreground">Team Size</div><div className="text-xl font-bold font-['Space_Grotesk']">24</div><div className="text-xs text-muted-foreground">members</div></CardContent></Card>
          </div>

          <Card className="glass-card border-0">
            <CardHeader><CardTitle className="text-base font-['Space_Grotesk']">Milestones</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {milestones.map((m, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${m.status === 'completed' ? 'bg-primary' : m.status === 'in-progress' ? 'bg-accent animate-pulse' : 'bg-muted-foreground/30'}`} />
                  <div className="flex-1"><div className="text-sm font-medium">{m.name}</div><div className="text-xs text-muted-foreground">{m.date}</div></div>
                  <Badge variant="secondary" className="text-xs">{m.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="mt-4">
          <Card className="glass-card border-0">
            <CardHeader><CardTitle className="text-base font-['Space_Grotesk']">Budget Breakdown (KES Millions)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={budgetBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="category" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Bar dataKey="planned" fill="hsl(var(--primary))" opacity={0.3} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actual" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <Card className="glass-card border-0 p-6">
            <div className="space-y-4">
              {milestones.map((m, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-4 h-4 rounded-full border-2 ${m.status === 'completed' ? 'bg-primary border-primary' : m.status === 'in-progress' ? 'border-accent bg-accent/20' : 'border-muted-foreground/30'}`} />
                    {i < milestones.length - 1 && <div className="w-0.5 h-12 bg-border" />}
                  </div>
                  <div className="pb-8">
                    <div className="font-medium text-sm">{m.name}</div>
                    <div className="text-xs text-muted-foreground">{m.date}</div>
                    {m.status === 'in-progress' && <Progress value={60} className="h-1.5 w-32 mt-2" />}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="mt-4"><Card className="glass-card border-0 p-6 text-center text-muted-foreground">Task management coming soon. Use the Tasks page for now.</Card></TabsContent>
        <TabsContent value="files" className="mt-4">
          <Card className="glass-card border-0 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Project Files</h3>
              <Button size="sm" variant="outline"><Upload className="w-4 h-4 mr-1" /> Upload</Button>
            </div>
            <div className="space-y-2">
              {['Architectural Plans v3.pdf', 'Soil Analysis Report.pdf', 'Budget Revision Feb.xlsx', 'Site Photos March.zip'].map((file, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="text-sm flex-1">{file}</span>
                  <Button variant="ghost" size="sm">Download</Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
        <TabsContent value="team" className="mt-4"><Card className="glass-card border-0 p-6 text-center text-muted-foreground">Team details shown on Team page.</Card></TabsContent>
        <TabsContent value="risks" className="mt-4">
          <Card className="glass-card border-0 p-6">
            <div className="space-y-3">
              {[{ risk: 'Labor shortage during peak season', level: 'High', mitigation: 'Pre-contract additional crews' },
                { risk: 'Material price fluctuation', level: 'Medium', mitigation: 'Lock-in pricing with suppliers' },
                { risk: 'Weather delays', level: 'Low', mitigation: 'Build buffer into schedule' }].map((r, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <AlertTriangle className={`w-4 h-4 mt-0.5 ${r.level === 'High' ? 'text-destructive' : r.level === 'Medium' ? 'text-accent' : 'text-muted-foreground'}`} />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{r.risk}</div>
                    <div className="text-xs text-muted-foreground mt-1">Mitigation: {r.mitigation}</div>
                  </div>
                  <Badge variant="secondary">{r.level}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
        <TabsContent value="insights" className="mt-4">
          <Card className="glass-card border-0 p-6">
            <div className="flex items-center gap-2 mb-4"><Brain className="w-5 h-5 text-primary" /><h3 className="font-semibold">AI Recommendations</h3></div>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">Based on current progress, this project will complete 2 weeks ahead of schedule if current pace is maintained.</div>
              <div className="p-3 rounded-lg bg-muted/50 text-sm">Labor costs are trending 16% above plan. Consider optimizing crew schedules to reduce overtime.</div>
              <div className="p-3 rounded-lg bg-muted/50 text-sm">Similar projects in Nairobi have achieved 12% cost savings by bulk-purchasing materials in Q3.</div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDetail;
