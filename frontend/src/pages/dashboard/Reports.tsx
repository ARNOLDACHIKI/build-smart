import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Download, FileText, Calendar, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';

const projectNames = [
  'Nairobi Logistics Hub',
  'Mombasa Waterfront Residences',
  'Kisumu Innovation Campus',
] as const;

type ProjectName = (typeof projectNames)[number];

const initialReports = [
  { name: 'Q1 Financial Snapshot', type: 'Financial', date: '2026-03-01', status: 'ready', project: 'Nairobi Logistics Hub' },
  { name: 'Concrete Procurement Variance', type: 'Financial', date: '2026-03-08', status: 'ready', project: 'Nairobi Logistics Hub' },
  { name: 'Structural Package Risk Memo', type: 'Risk', date: '2026-03-15', status: 'ready', project: 'Mombasa Waterfront Residences' },
  { name: 'Block B Delay Recovery Plan', type: 'Timeline', date: '2026-03-20', status: 'ready', project: 'Mombasa Waterfront Residences' },
  { name: 'QA Certification Sprint Report', type: 'Compliance', date: '2026-03-22', status: 'ready', project: 'Kisumu Innovation Campus' },
  { name: 'Labor Optimization Forecast', type: 'Timeline', date: '2026-03-25', status: 'scheduled', project: 'Kisumu Innovation Campus' },
];

const Reports = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedProject = searchParams.get('project');

  const activeProject: ProjectName = useMemo(() => {
    const matched = projectNames.find((project) => project === selectedProject);
    return matched ?? projectNames[0];
  }, [selectedProject]);

  const [reports, setReports] = useState(initialReports);
  const [selectedType, setSelectedType] = useState('Risk');

  const scopedReports = useMemo(() => reports.filter((report) => report.project === activeProject), [reports, activeProject]);

  const generateReport = (type: string) => {
    const today = new Date().toISOString().slice(0, 10);
    const entry = {
      name: `${today.replace(/-/g, '/')} ${type} Report - ${activeProject}`,
      type,
      date: today,
      status: 'ready' as const,
      project: activeProject,
    };
    setReports((prev) => [entry, ...prev]);
    setSelectedType(type);
    toast.success(`${type} report generated`);
  };

  const handleDownload = (name: string) => {
    const content = `Generated report: ${name}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `${name.replace(/\s+/g, '-').toLowerCase()}.txt`;
    link.click();
    URL.revokeObjectURL(href);
    toast.success('Report download started');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-['Space_Grotesk']">{t('sidebar.reports')}</h1>
        <div className="flex gap-2">
          <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => generateReport(selectedType)}>{t('dashboard.generateReport')}</Button>
          <Button size="sm" variant="outline" onClick={() => toast.success(`Scheduled ${selectedType} report for ${activeProject}`)}><Clock className="w-4 h-4 mr-1" /> Schedule</Button>
        </div>
      </div>

      <div className="rounded-md border border-border/70 bg-muted/40 px-3 py-2 text-sm">
        Showing report context for: <span className="font-semibold">{activeProject}</span>
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

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {['Financial', 'Timeline', 'Risk', 'Compliance'].map((type) => (
          <Card key={type} className={`card-3d border-0 cursor-pointer hover:ring-1 hover:ring-primary/30 transition-all ${selectedType === type ? 'ring-1 ring-primary/40' : ''}`} onClick={() => setSelectedType(type)}>
            <CardContent className="p-4 text-center">
              <FileText className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-sm font-medium">{type} Report</div>
              <Button size="sm" variant="outline" className="mt-3 w-full" onClick={(event) => { event.stopPropagation(); generateReport(type); }}>Generate</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="card-3d border-0">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-4">Report History</h3>
          <div className="space-y-3">
            {scopedReports.map((r, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <FileText className="w-4 h-4 text-primary" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{r.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2"><Calendar className="w-3 h-3" /> {r.date}</div>
                </div>
                <Badge variant="secondary">{r.type}</Badge>
                {r.status === 'ready' ? (
                  <Button size="sm" variant="outline" onClick={() => handleDownload(r.name)}><Download className="w-4 h-4 mr-1" /> Download</Button>
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
