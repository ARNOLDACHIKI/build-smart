import { useRef, useState, type ChangeEvent } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Upload, FileText, Image, FileSpreadsheet, File, Grid, List, Download, Trash2, Share2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type DocItem = {
  id: string;
  name: string;
  type: string;
  size: string;
  category: string;
  date: string;
  icon: typeof FileText;
};

const initialFiles: DocItem[] = [
  { id: 'doc-1', name: 'Architectural Plans v3.pdf', type: 'PDF', size: '12.4 MB', category: 'Plans', date: '2026-03-01', icon: FileText },
  { id: 'doc-2', name: 'Site Photos March.zip', type: 'ZIP', size: '245 MB', category: 'Photos', date: '2026-03-02', icon: Image },
  { id: 'doc-3', name: 'Budget Revision.xlsx', type: 'Excel', size: '1.2 MB', category: 'Finance', date: '2026-02-28', icon: FileSpreadsheet },
  { id: 'doc-4', name: 'Soil Analysis Report.pdf', type: 'PDF', size: '5.8 MB', category: 'Reports', date: '2026-02-25', icon: FileText },
  { id: 'doc-5', name: 'Safety Compliance.pdf', type: 'PDF', size: '3.1 MB', category: 'Compliance', date: '2026-02-20', icon: File },
  { id: 'doc-6', name: 'Material Specifications.pdf', type: 'PDF', size: '8.7 MB', category: 'Plans', date: '2026-02-18', icon: FileText },
];

const Documents = () => {
  const { t } = useLanguage();
  const [view, setView] = useState<'grid' | 'list'>('list');
  const [files, setFiles] = useState(initialFiles);
  const [pendingDelete, setPendingDelete] = useState<DocItem | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const resolveIcon = (name: string) => {
    const lowered = name.toLowerCase();
    if (lowered.endsWith('.pdf')) return FileText;
    if (lowered.endsWith('.xlsx') || lowered.endsWith('.xls') || lowered.endsWith('.csv')) return FileSpreadsheet;
    if (lowered.endsWith('.png') || lowered.endsWith('.jpg') || lowered.endsWith('.jpeg') || lowered.endsWith('.gif') || lowered.endsWith('.zip')) return Image;
    return File;
  };

  const formatSize = (bytes: number) => {
    if (bytes <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const index = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
    const value = bytes / Math.pow(1024, index);
    return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
  };

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files;
    if (!selected || selected.length === 0) return;

    const today = new Date().toISOString().slice(0, 10);
    const next = Array.from(selected).map((file) => ({
      id: `doc-${Date.now()}-${file.name}`,
      name: file.name,
      type: file.type || 'FILE',
      size: formatSize(file.size),
      category: 'Uploads',
      date: today,
      icon: resolveIcon(file.name),
    }));

    setFiles((prev) => [...next, ...prev]);
    event.target.value = '';
    toast.success(`${next.length} file(s) uploaded`);
  };

  const handleDownload = (file: DocItem) => {
    const blob = new Blob([`Placeholder content for ${file.name}`], { type: 'text/plain;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(href);
    toast.success(`Downloading ${file.name}`);
  };

  const handleShare = async (file: DocItem) => {
    try {
      await navigator.clipboard.writeText(file.name);
      toast.success(`Copied ${file.name} to clipboard`);
    } catch {
      toast.error('Unable to copy to clipboard');
    }
  };

  const requestDelete = (file: DocItem) => {
    setPendingDelete(file);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;

    const target = pendingDelete;
    setPendingDelete(null);

    setFiles((prev) => {
      const removedIndex = prev.findIndex((file) => file.id === target.id);
      if (removedIndex < 0) {
        return prev;
      }

      const next = prev.filter((file) => file.id !== target.id);
      toast('Document removed', {
        action: {
          label: 'Undo',
          onClick: () => {
            setFiles((current) => {
              if (current.some((file) => file.id === target.id)) {
                return current;
              }

              const restored = [...current];
              restored.splice(Math.min(removedIndex, restored.length), 0, target);
              return restored;
            });
          },
        },
      });

      return next;
    });
  };

  return (
    <div className="space-y-6">
      <input ref={inputRef} type="file" multiple className="hidden" onChange={handleUpload} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-['Space_Grotesk']">{t('sidebar.documents')}</h1>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => setView('grid')} className={view === 'grid' ? 'bg-muted' : ''}><Grid className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => setView('list')} className={view === 'list' ? 'bg-muted' : ''}><List className="w-4 h-4" /></Button>
          <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => inputRef.current?.click()}><Upload className="w-4 h-4 mr-1" /> Upload</Button>
        </div>
      </div>

      {view === 'list' ? (
        <Card className="card-3d border-0">
          <CardContent className="p-4 space-y-2">
            {files.map((f) => (
              <div key={f.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <f.icon className="w-5 h-5 text-primary" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{f.name}</div>
                  <div className="text-xs text-muted-foreground">{f.size} · {f.date}</div>
                </div>
                <Badge variant="secondary" className="text-xs">{f.category}</Badge>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownload(f)}><Download className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => void handleShare(f)}><Share2 className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => requestDelete(f)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((f) => (
            <Card key={f.id} className="card-3d border-0 hover:ring-1 hover:ring-primary/30 transition-all cursor-pointer" onClick={() => handleDownload(f)}>
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

      <AlertDialog open={Boolean(pendingDelete)} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete ? `${pendingDelete.name} will be removed.` : 'Confirm this action.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Documents;
