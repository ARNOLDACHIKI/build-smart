import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FolderKanban, DollarSign, Activity, TrendingUp, Server } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const userGrowth = [
  { month: 'Oct', users: 420 }, { month: 'Nov', users: 580 }, { month: 'Dec', users: 750 },
  { month: 'Jan', users: 920 }, { month: 'Feb', users: 1100 }, { month: 'Mar', users: 1350 },
];

const revenue = [
  { month: 'Oct', amount: 2.1 }, { month: 'Nov', amount: 2.8 }, { month: 'Dec', amount: 3.5 },
  { month: 'Jan', amount: 4.2 }, { month: 'Feb', amount: 5.1 }, { month: 'Mar', amount: 6.0 },
];

const stats = [
  { label: 'Total Users', value: '1,350', icon: Users, change: '+22%' },
  { label: 'Active Users', value: '892', icon: Activity, change: '+15%' },
  { label: 'Revenue (KES M)', value: '6.0', icon: DollarSign, change: '+18%' },
  { label: 'Projects', value: '234', icon: FolderKanban, change: '+12%' },
  { label: 'System Uptime', value: '99.9%', icon: Server, change: '' },
  { label: 'Growth Rate', value: '22%', icon: TrendingUp, change: '+3%' },
];

const AdminOverview = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold font-['Space_Grotesk']">Admin Overview</h1>

    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((s, i) => (
        <Card key={i} className="card-3d border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><s.icon className="w-5 h-5 text-primary" /></div>
              {s.change && <span className="text-xs text-primary font-medium">{s.change}</span>}
            </div>
            <div className="text-2xl font-bold font-['Space_Grotesk']">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>

    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="glass-card border-0">
        <CardHeader><CardTitle className="text-base font-['Space_Grotesk']">User Growth</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="glass-card border-0">
        <CardHeader><CardTitle className="text-base font-['Space_Grotesk']">Revenue (KES M)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
              <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default AdminOverview;
