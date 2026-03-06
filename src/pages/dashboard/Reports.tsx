import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Download, FileText, Calendar, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const reports = [
  { name: 'Q1 Financial Report', type: 'Financial', date: '2026-03-01', status: 'ready' },
  { name: 'February Timeline Report', type: 'Timeline', date: '2026-02-28', status: 'ready' },
  { name: 'Risk Assessment - All Projects', type: 'Risk', date: '2026-02-25', status: 'ready' },
  { name: 'Compliance Report - Nairobi Tower', type: 'Compliance', date: '2026-02-20', status: 'ready' },
  { name: 'March Forecast Report', type: 'Financial', date: '2026-03-15', status: 'scheduled' },
];

const Reports = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-['Space_Grotesk']">{t('sidebar.reports')}</h1>
        <div className="flex gap-2">
          <Button size="sm" className="gradient-primary text-primary-foreground">{t('dashboard.generateReport')}</Button>
          <Button size="sm" variant="outline"><Clock className="w-4 h-4 mr-1" /> Schedule</Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {['Financial', 'Timeline', 'Risk', 'Compliance'].map((type) => (
          <Card key={type} className="card-3d border-0 cursor-pointer hover:ring-1 hover:ring-primary/30 transition-all">
            <CardContent className="p-4 text-center">
              <FileText className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-sm font-medium">{type} Report</div>
              <Button size="sm" variant="outline" className="mt-3 w-full">Generate</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card border-0">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-4">Report History</h3>
          <div className="space-y-3">
            {reports.map((r, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <FileText className="w-4 h-4 text-primary" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{r.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2"><Calendar className="w-3 h-3" /> {r.date}</div>
                </div>
                <Badge variant="secondary">{r.type}</Badge>
                {r.status === 'ready' ? (
                  <Button size="sm" variant="outline"><Download className="w-4 h-4 mr-1" /> Download</Button>
                ) : (
                  <Badge variant="secondary" className="bg-accent/10 text-accent">Scheduled</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
