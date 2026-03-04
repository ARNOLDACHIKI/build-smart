import { motion } from 'framer-motion';
import { FolderKanban, Wallet, CheckSquare, AlertTriangle, Plus, BarChart3, FileText, Brain, TrendingUp, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const budgetData = [
  { month: 'Jan', budget: 4.2, actual: 3.8 },
  { month: 'Feb', budget: 5.1, actual: 5.4 },
  { month: 'Mar', budget: 6.3, actual: 5.9 },
  { month: 'Apr', budget: 4.8, actual: 5.2 },
  { month: 'May', budget: 7.1, actual: 6.8 },
  { month: 'Jun', budget: 5.5, actual: 5.1 },
];

const timelineData = [
  { week: 'W1', progress: 12 },
  { week: 'W2', progress: 28 },
  { week: 'W3', progress: 35 },
  { week: 'W4', progress: 48 },
  { week: 'W5', progress: 55 },
  { week: 'W6', progress: 68 },
  { week: 'W7', progress: 72 },
  { week: 'W8', progress: 85 },
];

const activities = [
  { text: 'Nairobi Tower - Phase 3 milestone completed', time: '2 hours ago', type: 'success' },
  { text: 'Mombasa Road Project - Budget overrun alert (8%)', time: '4 hours ago', type: 'warning' },
  { text: 'Kisumu Bridge - New team member added', time: '6 hours ago', type: 'info' },
  { text: 'Thika Highway - Risk assessment updated', time: '1 day ago', type: 'info' },
  { text: 'Nakuru Complex - Document uploaded: Soil Report', time: '1 day ago', type: 'info' },
];

const insights = [
  { text: 'Mombasa Road project is trending 8% over budget. Consider renegotiating supplier contracts.', priority: 'high' },
  { text: 'Labor productivity on Nairobi Tower improved 15% this month. Current crew composition is optimal.', priority: 'low' },
  { text: 'Weather forecast predicts heavy rainfall next week. Consider adjusting outdoor schedules.', priority: 'medium' },
];

const DashboardHome = () => {
  const { t } = useLanguage();

  const stats = [
    { label: t('dashboard.activeProjects'), value: '12', icon: FolderKanban, change: '+2', up: true },
    { label: t('dashboard.budgetUsage'), value: '73%', icon: Wallet, change: '-5%', up: false },
    { label: t('dashboard.tasksDue'), value: '28', icon: CheckSquare, change: '+8', up: true },
    { label: t('dashboard.riskAlerts'), value: '3', icon: AlertTriangle, change: '-1', up: false },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-['Space_Grotesk']">{t('dashboard.welcome')}, James 👋</h1>
          <p className="text-sm text-muted-foreground">Here's what's happening with your projects today.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="gradient-primary text-primary-foreground"><Plus className="w-4 h-4 mr-1" /> {t('dashboard.createProject')}</Button>
          <Button size="sm" variant="outline"><FileText className="w-4 h-4 mr-1" /> {t('dashboard.generateReport')}</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="glass-card border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className={`flex items-center gap-0.5 text-xs font-medium ${stat.up ? 'text-primary' : 'text-destructive'}`}>
                    {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {stat.change}
                  </div>
                </div>
                <div className="text-2xl font-bold font-['Space_Grotesk']">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass-card border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-['Space_Grotesk']">{t('dashboard.budgetUsage')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={budgetData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Bar dataKey="budget" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} opacity={0.3} />
                <Bar dataKey="actual" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-['Space_Grotesk']">Project Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="progress" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights & Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass-card border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-['Space_Grotesk'] flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" /> {t('dashboard.aiInsights')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.map((insight, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  insight.priority === 'high' ? 'bg-destructive' : insight.priority === 'medium' ? 'bg-warning' : 'bg-primary'
                }`} style={insight.priority === 'medium' ? { background: 'hsl(var(--warning))' } : {}} />
                <p className="text-sm leading-relaxed">{insight.text}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-['Space_Grotesk']">{t('dashboard.recentActivity')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activities.map((activity, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  activity.type === 'success' ? 'bg-primary' : activity.type === 'warning' ? 'bg-destructive' : 'bg-muted-foreground'
                }`} />
                <div className="flex-1">
                  <p>{activity.text}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" /> {activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;
