import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Download, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

const projectNames = [
  'Nairobi Logistics Hub',
  'Mombasa Waterfront Residences',
  'Kisumu Innovation Campus',
] as const;

type ProjectName = (typeof projectNames)[number];

const analyticsByProject: Record<
  ProjectName,
  {
    costOverruns: Array<{ package: string; overrun: number }>;
    cashFlow: Array<{ month: string; inflow: number; outflow: number }>;
    laborData: Array<{ week: string; productivity: number }>;
    resourceUsage: Array<{ name: string; value: number }>;
  }
> = {
  'Nairobi Logistics Hub': {
    costOverruns: [
      { package: 'Foundation', overrun: 2 },
      { package: 'Structure', overrun: 4 },
      { package: 'MEP', overrun: 1 },
      { package: 'Finishes', overrun: -1 },
    ],
    cashFlow: [
      { month: 'Jan', inflow: 15, outflow: 12 },
      { month: 'Feb', inflow: 18, outflow: 16 },
      { month: 'Mar', inflow: 12, outflow: 14 },
      { month: 'Apr', inflow: 21, outflow: 17 },
      { month: 'May', inflow: 19, outflow: 18 },
      { month: 'Jun', inflow: 24, outflow: 20 },
    ],
    laborData: [
      { week: 'W1', productivity: 70 },
      { week: 'W2', productivity: 74 },
      { week: 'W3', productivity: 77 },
      { week: 'W4', productivity: 79 },
      { week: 'W5', productivity: 81 },
      { week: 'W6', productivity: 83 },
    ],
    resourceUsage: [
      { name: 'Materials', value: 42 },
      { name: 'Labor', value: 31 },
      { name: 'Equipment', value: 18 },
      { name: 'Admin', value: 9 },
    ],
  },
  'Mombasa Waterfront Residences': {
    costOverruns: [
      { package: 'Foundation', overrun: 6 },
      { package: 'Structure', overrun: 12 },
      { package: 'MEP', overrun: 8 },
      { package: 'Finishes', overrun: 3 },
    ],
    cashFlow: [
      { month: 'Jan', inflow: 14, outflow: 13 },
      { month: 'Feb', inflow: 16, outflow: 17 },
      { month: 'Mar', inflow: 13, outflow: 16 },
      { month: 'Apr', inflow: 18, outflow: 20 },
      { month: 'May', inflow: 19, outflow: 21 },
      { month: 'Jun', inflow: 20, outflow: 22 },
    ],
    laborData: [
      { week: 'W1', productivity: 66 },
      { week: 'W2', productivity: 64 },
      { week: 'W3', productivity: 62 },
      { week: 'W4', productivity: 65 },
      { week: 'W5', productivity: 67 },
      { week: 'W6', productivity: 69 },
    ],
    resourceUsage: [
      { name: 'Materials', value: 45 },
      { name: 'Labor', value: 28 },
      { name: 'Equipment', value: 19 },
      { name: 'Admin', value: 8 },
    ],
  },
  'Kisumu Innovation Campus': {
    costOverruns: [
      { package: 'Foundation', overrun: -2 },
      { package: 'Structure', overrun: 1 },
      { package: 'MEP', overrun: 0 },
      { package: 'Finishes', overrun: -1 },
    ],
    cashFlow: [
      { month: 'Jan', inflow: 16, outflow: 11 },
      { month: 'Feb', inflow: 19, outflow: 14 },
      { month: 'Mar', inflow: 18, outflow: 13 },
      { month: 'Apr', inflow: 24, outflow: 17 },
      { month: 'May', inflow: 23, outflow: 18 },
      { month: 'Jun', inflow: 26, outflow: 19 },
    ],
    laborData: [
      { week: 'W1', productivity: 80 },
      { week: 'W2', productivity: 84 },
      { week: 'W3', productivity: 86 },
      { week: 'W4', productivity: 88 },
      { week: 'W5', productivity: 89 },
      { week: 'W6', productivity: 91 },
    ],
    resourceUsage: [
      { name: 'Materials', value: 38 },
      { name: 'Labor', value: 34 },
      { name: 'Equipment', value: 20 },
      { name: 'Admin', value: 8 },
    ],
  },
};

const COLORS = ['hsl(69, 68%, 51%)', 'hsl(217, 91%, 60%)', 'hsl(38, 92%, 50%)', 'hsl(73, 42%, 31%)'];

const Analytics = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedProject = searchParams.get('project');
  const [viewMode, setViewMode] = useState<'q1' | 'q2'>('q1');

  const activeProject: ProjectName = useMemo(() => {
    const matched = projectNames.find((project) => project === selectedProject);
    return matched ?? projectNames[0];
  }, [selectedProject]);

  const projectAnalytics = analyticsByProject[activeProject];

  const filteredCashFlow = useMemo(() => {
    if (viewMode === 'q1') return projectAnalytics.cashFlow.slice(0, 3);
    return projectAnalytics.cashFlow.slice(3);
  }, [projectAnalytics.cashFlow, viewMode]);

  const handleExport = () => {
    const rows = [['Month', 'Inflow', 'Outflow'], ...filteredCashFlow.map((item) => [item.month, item.inflow.toString(), item.outflow.toString()])];
    const csv = rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `analytics-${activeProject.replace(/\s+/g, '-').toLowerCase()}-${viewMode}.csv`;
    link.click();
    URL.revokeObjectURL(href);
    toast.success('Analytics export downloaded');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-['Space_Grotesk']">{t('sidebar.analytics')}</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setViewMode((prev) => (prev === 'q1' ? 'q2' : 'q1'))}>
            <Filter className="w-4 h-4 mr-1" /> {viewMode === 'q1' ? 'View Q2' : 'View Q1'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}><Download className="w-4 h-4 mr-1" /> Export</Button>
        </div>
      </div>

      <div className="rounded-md border border-border/70 bg-muted/40 px-3 py-2 text-sm">
        Showing analytics context for: <span className="font-semibold">{activeProject}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {projectNames.map((project) => (
          <Button
            key={project}
            size="sm"
            variant={project === activeProject ? 'default' : 'outline'}
            onClick={() => setSearchParams({ project })}
          >
            {project}
          </Button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="card-3d border-0">
          <CardHeader><CardTitle className="text-base font-['Space_Grotesk']">Cost Overruns by Package (%)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={projectAnalytics.costOverruns}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="package" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Bar dataKey="overrun" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="card-3d border-0">
          <CardHeader><CardTitle className="text-base font-['Space_Grotesk']">Cash Flow (KES M)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={filteredCashFlow}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="inflow" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
                <Area type="monotone" dataKey="outflow" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="card-3d border-0">
          <CardHeader><CardTitle className="text-base font-['Space_Grotesk']">Labor Productivity (%)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={projectAnalytics.laborData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="productivity" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="card-3d border-0">
          <CardHeader><CardTitle className="text-base font-['Space_Grotesk']">Resource Allocation</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={projectAnalytics.resourceUsage} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
                  {projectAnalytics.resourceUsage.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
