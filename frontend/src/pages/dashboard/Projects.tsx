import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Copy, Archive } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
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

type Project = {
  id: number;
  name: string;
  status: 'active' | 'at-risk' | 'completed' | 'planning' | 'archived';
  budget: string;
  spent: string;
  deadline: string;
  progress: number;
};

const DASHBOARD_PROJECTS_STORAGE_KEY = 'dashboardProjects';

const initialProjects: Project[] = [
  { id: 1, name: 'Nairobi Logistics Hub', status: 'active', budget: 'KES 120M', spent: 'KES 87M', deadline: '2026-08-15', progress: 72 },
  { id: 2, name: 'Mombasa Waterfront Residences', status: 'at-risk', budget: 'KES 85M', spent: 'KES 41M', deadline: '2026-11-30', progress: 48 },
  { id: 3, name: 'Kisumu Innovation Campus', status: 'active', budget: 'KES 200M', spent: 'KES 173M', deadline: '2026-07-20', progress: 87 },
  { id: 4, name: 'Thika Highway Overpass', status: 'completed', budget: 'KES 65M', spent: 'KES 62M', deadline: '2026-02-01', progress: 100 },
  { id: 5, name: 'Nakuru Residential Complex', status: 'planning', budget: 'KES 150M', spent: 'KES 5M', deadline: '2027-06-30', progress: 8 },
  { id: 6, name: 'Eldoret Industrial Park', status: 'active', budget: 'KES 300M', spent: 'KES 120M', deadline: '2027-12-15', progress: 35 },
];

const getStoredProjects = (): Project[] => {
  if (typeof window === 'undefined') return initialProjects;

  try {
    const raw = window.localStorage.getItem(DASHBOARD_PROJECTS_STORAGE_KEY);
    if (!raw) return initialProjects;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return initialProjects;

    return parsed as Project[];
  } catch {
    return initialProjects;
  }
};

const statusColors: Record<string, string> = {
  active: 'bg-primary/10 text-primary',
  'at-risk': 'bg-destructive/10 text-destructive',
  completed: 'bg-muted text-muted-foreground',
  planning: 'bg-accent/10 text-accent',
  archived: 'bg-slate-200 text-slate-700',
};

const Projects = () => {
  const { t } = useLanguage();
  const [projects, setProjects] = useState<Project[]>(getStoredProjects);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Project['status']>('all');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', budget: '', spent: '', deadline: '', progress: 0, status: 'planning' as Exclude<Project['status'], 'archived'> });
  const [pendingDestructive, setPendingDestructive] = useState<
    | { kind: 'archive' | 'delete'; project: Project }
    | null
  >(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(DASHBOARD_PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch = !search || project.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, search, statusFilter]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: '', budget: 'KES 0', spent: 'KES 0', deadline: '2026-12-31', progress: 0, status: 'planning' });
    setEditorOpen(true);
  };

  const openEdit = (project: Project) => {
    setEditingId(project.id);
    setForm({
      name: project.name,
      budget: project.budget,
      spent: project.spent,
      deadline: project.deadline,
      progress: project.progress,
      status: project.status === 'archived' ? 'planning' : project.status,
    });
    setEditorOpen(true);
  };

  const saveProject = () => {
    if (!form.name.trim()) {
      toast.error('Project name is required');
      return;
    }

    if (editingId === null) {
      const nextId = projects.reduce((max, project) => Math.max(max, project.id), 0) + 1;
      setProjects((prev) => [
        {
          id: nextId,
          name: form.name.trim(),
          budget: form.budget,
          spent: form.spent,
          deadline: form.deadline,
          progress: Math.max(0, Math.min(100, Number(form.progress) || 0)),
          status: form.status,
        },
        ...prev,
      ]);
      toast.success('Project created');
    } else {
      setProjects((prev) => prev.map((project) => (
        project.id === editingId
          ? {
              ...project,
              name: form.name.trim(),
              budget: form.budget,
              spent: form.spent,
              deadline: form.deadline,
              progress: Math.max(0, Math.min(100, Number(form.progress) || 0)),
              status: form.status,
            }
          : project
      )));
      toast.success('Project updated');
    }

    setEditorOpen(false);
  };

  const duplicateProject = (project: Project) => {
    const nextId = projects.reduce((max, p) => Math.max(max, p.id), 0) + 1;
    setProjects((prev) => [{ ...project, id: nextId, name: `${project.name} Copy` }, ...prev]);
    toast.success('Project duplicated');
  };

  const requestArchiveProject = (project: Project) => {
    setPendingDestructive({ kind: 'archive', project });
  };

  const restoreProject = (id: number) => {
    setProjects((prev) => prev.map((project) => (project.id === id ? { ...project, status: 'planning' } : project)));
    toast.success('Project restored to planning');
  };

  const requestDeleteProject = (project: Project) => {
    setPendingDestructive({ kind: 'delete', project });
  };

  const runDestructiveAction = () => {
    if (!pendingDestructive) return;

    const { kind, project } = pendingDestructive;
    setPendingDestructive(null);

    if (kind === 'archive') {
      const previousProject = { ...project };
      setProjects((prev) =>
        prev.map((item) =>
          item.id === previousProject.id ? { ...item, status: 'archived' } : item,
        ),
      );
      toast('Project moved to Archived', {
        action: {
          label: 'Undo',
          onClick: () => {
            setProjects((prev) =>
              prev.map((item) =>
                item.id === previousProject.id ? previousProject : item,
              ),
            );
          },
        },
      });
      return;
    }

    const removedProject = { ...project };
    setProjects((prev) => {
      const removedIndex = prev.findIndex((item) => item.id === removedProject.id);
      if (removedIndex < 0) return prev;

      const next = prev.filter((item) => item.id !== removedProject.id);
      toast('Project deleted', {
        action: {
          label: 'Undo',
          onClick: () => {
            setProjects((current) => {
              if (current.some((item) => item.id === removedProject.id)) {
                return current;
              }

              const restored = [...current];
              restored.splice(Math.min(removedIndex, restored.length), 0, removedProject);
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-['Space_Grotesk']">{t('projects.title')}</h1>
        <Button size="sm" className="gradient-primary text-primary-foreground" onClick={openCreate}><Plus className="w-4 h-4 mr-1" /> {t('projects.newProject')}</Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder={t('common.search')} className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const order: Array<'all' | Project['status']> = ['all', 'active', 'at-risk', 'completed', 'planning', 'archived'];
            const next = order[(order.indexOf(statusFilter) + 1) % order.length];
            setStatusFilter(next);
          }}
        >
          <Filter className="w-4 h-4 mr-1" /> {statusFilter === 'all' ? t('common.filter') : `Filter: ${statusFilter}`}
        </Button>
      </div>

      <Card className="card-3d border-0">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>{t('projects.status')}</TableHead>
                <TableHead>{t('projects.budget')}</TableHead>
                <TableHead>{t('projects.deadline')}</TableHead>
                <TableHead>{t('projects.progress')}</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((p) => (
                <TableRow key={p.id} className="cursor-pointer hover:bg-muted/30">
                  <TableCell>
                    <Link to={`/dashboard/projects/${p.id}`} className="font-medium hover:text-primary transition-colors">
                      {p.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusColors[p.status]}>{p.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{p.budget}</div>
                    <div className="text-xs text-muted-foreground">Spent: {p.spent}</div>
                  </TableCell>
                  <TableCell className="text-sm">{p.deadline}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={p.progress} className="h-2 w-20" />
                      <span className="text-xs font-medium">{p.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(p)}><Edit className="w-4 h-4 mr-2" /> {t('common.edit')}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => duplicateProject(p)}><Copy className="w-4 h-4 mr-2" /> Duplicate</DropdownMenuItem>
                        {p.status === 'archived' ? (
                          <DropdownMenuItem onClick={() => restoreProject(p.id)}><Archive className="w-4 h-4 mr-2" /> Restore</DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => requestArchiveProject(p)}><Archive className="w-4 h-4 mr-2" /> Archive</DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive" onClick={() => requestDeleteProject(p)}><Trash2 className="w-4 h-4 mr-2" /> {t('common.delete')}</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Archived projects stay on this page with status <span className="font-medium">archived</span>. Use Filter to reach archived items and Restore to move them back to planning.
      </p>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId === null ? 'Create project' : 'Edit project'}</DialogTitle>
            <DialogDescription>Update project details and save changes.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input id="project-name" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="project-budget">Budget</Label>
                <Input id="project-budget" value={form.budget} onChange={(event) => setForm((prev) => ({ ...prev, budget: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-spent">Spent</Label>
                <Input id="project-spent" value={form.spent} onChange={(event) => setForm((prev) => ({ ...prev, spent: event.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="project-deadline">Deadline</Label>
                <Input id="project-deadline" type="date" value={form.deadline} onChange={(event) => setForm((prev) => ({ ...prev, deadline: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-progress">Progress %</Label>
                <Input id="project-progress" type="number" min={0} max={100} value={form.progress} onChange={(event) => setForm((prev) => ({ ...prev, progress: Number(event.target.value) }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditorOpen(false)}>Cancel</Button>
            <Button className="gradient-primary text-primary-foreground" onClick={saveProject}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(pendingDestructive)} onOpenChange={(open) => !open && setPendingDestructive(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingDestructive?.kind === 'archive' ? 'Archive project?' : 'Delete project?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDestructive?.project
                ? `${pendingDestructive.project.name} will be ${pendingDestructive.kind === 'archive' ? 'moved to planning' : 'removed'}.`
                : 'Confirm this action.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={runDestructiveAction}>
              {pendingDestructive?.kind === 'archive' ? 'Archive' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Projects;
