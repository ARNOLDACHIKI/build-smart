import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Download, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

const costOverruns = [
  { project: 'Nairobi Tower', overrun: 5 },
  { project: 'Mombasa Rd', overrun: 12 },
  { project: 'Kisumu Bridge', overrun: -3 },
  { project: 'Thika Hwy', overrun: 2 },
  { project: 'Nakuru', overrun: 0 },
  { project: 'Eldoret', overrun: 8 },
];

const cashFlow = [
  { month: 'Jan', inflow: 15, outflow: 12 },
  { month: 'Feb', inflow: 18, outflow: 16 },
  { month: 'Mar', inflow: 12, outflow: 14 },
  { month: 'Apr', inflow: 22, outflow: 18 },
  { month: 'May', inflow: 20, outflow: 19 },
  { month: 'Jun', inflow: 25, outflow: 21 },
];

const laborData = [
  { week: 'W1', productivity: 72 },
  { week: 'W2', productivity: 78 },
  { week: 'W3', productivity: 65 },
  { week: 'W4', productivity: 82 },
  { week: 'W5', productivity: 88 },
  { week: 'W6', productivity: 85 },
];

const resourceUsage = [
  { name: 'Materials', value: 40 },
  { name: 'Labor', value: 30 },
  { name: 'Equipment', value: 20 },
  { name: 'Admin', value: 10 },
];
const COLORS = ['hsl(69, 68%, 51%)', 'hsl(217, 91%, 60%)', 'hsl(38, 92%, 50%)', 'hsl(73, 42%, 31%)'];

const Analytics = () => {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<'q1' | 'q2'>('q1');

  const filteredCashFlow = useMemo(() => {
    if (viewMode === 'q1') return cashFlow.slice(0, 3);
    return cashFlow.slice(3);
  }, [viewMode]);

  const handleExport = () => {
    const rows = [['Month', 'Inflow', 'Outflow'], ...filteredCashFlow.map((item) => [item.month, item.inflow.toString(), item.outflow.toString()])];
    const csv = rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `analytics-${viewMode}.csv`;
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

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="card-3d border-0">
          <CardHeader><CardTitle className="text-base font-['Space_Grotesk']">Cost Overruns by Project (%)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={costOverruns}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="project" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
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
              <LineChart data={laborData}>
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
                <Pie data={resourceUsage} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
                  {resourceUsage.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
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
