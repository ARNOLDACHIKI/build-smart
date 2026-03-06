import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Upload, FileText, Image, FileSpreadsheet, File, Grid, List, Download, Trash2, Share2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const files = [
  { name: 'Architectural Plans v3.pdf', type: 'PDF', size: '12.4 MB', category: 'Plans', date: '2026-03-01', icon: FileText },
  { name: 'Site Photos March.zip', type: 'ZIP', size: '245 MB', category: 'Photos', date: '2026-03-02', icon: Image },
  { name: 'Budget Revision.xlsx', type: 'Excel', size: '1.2 MB', category: 'Finance', date: '2026-02-28', icon: FileSpreadsheet },
  { name: 'Soil Analysis Report.pdf', type: 'PDF', size: '5.8 MB', category: 'Reports', date: '2026-02-25', icon: FileText },
  { name: 'Safety Compliance.pdf', type: 'PDF', size: '3.1 MB', category: 'Compliance', date: '2026-02-20', icon: File },
  { name: 'Material Specifications.pdf', type: 'PDF', size: '8.7 MB', category: 'Plans', date: '2026-02-18', icon: FileText },
];

const Documents = () => {
  const { t } = useLanguage();
  const [view, setView] = useState<'grid' | 'list'>('list');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-['Space_Grotesk']">{t('sidebar.documents')}</h1>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => setView('grid')} className={view === 'grid' ? 'bg-muted' : ''}><Grid className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => setView('list')} className={view === 'list' ? 'bg-muted' : ''}><List className="w-4 h-4" /></Button>
          <Button size="sm" className="gradient-primary text-primary-foreground"><Upload className="w-4 h-4 mr-1" /> Upload</Button>
        </div>
      </div>

      {view === 'list' ? (
        <Card className="card-3d border-0">
          <CardContent className="p-4 space-y-2">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <f.icon className="w-5 h-5 text-primary" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{f.name}</div>
                  <div className="text-xs text-muted-foreground">{f.size} · {f.date}</div>
                </div>
                <Badge variant="secondary" className="text-xs">{f.category}</Badge>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Share2 className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((f, i) => (
            <Card key={i} className="card-3d border-0 hover:ring-1 hover:ring-primary/30 transition-all cursor-pointer">
              <CardContent className="p-4">
                <f.icon className="w-10 h-10 text-primary mb-3" />
                <div className="text-sm font-medium truncate">{f.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{f.size} · {f.date}</div>
                <Badge variant="secondary" className="text-xs mt-2">{f.category}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Documents;
