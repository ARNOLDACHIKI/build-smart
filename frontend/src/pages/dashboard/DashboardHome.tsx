import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, FileText, FolderKanban, LineChart, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { apiUrl } from '@/lib/api';

const DASHBOARD_PROJECTS_STORAGE_KEY = 'dashboardProjects';

const PROJECT_PREVIEW = [
  {
    id: 1,
    name: 'Nairobi Logistics Hub',
    defaultProgress: 72,
    report: 'Cost variance dropped by 4.1% this week',
    analytics: 'Procurement efficiency up 8%',
  },
  {
    id: 2,
    name: 'Mombasa Waterfront Residences',
    defaultProgress: 48,
    report: 'Concrete delivery delay flagged for Block B',
    analytics: 'Schedule risk on structural package',
  },
  {
    id: 3,
    name: 'Kisumu Innovation Campus',
    defaultProgress: 87,
    report: 'QA pass rate reached 97% this sprint',
    analytics: 'Labor productivity trend remains positive',
  },
] as const;

type StoredProject = {
  id: number;
  progress: number;
};

const getStatusFromProgress = (progress: number) => {
  if (progress < 50) return 'attention needed';
  if (progress >= 85) return 'ahead';
  return 'on track';
};

const getStoredProjectProgressById = (): Record<number, number> => {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem(DASHBOARD_PROJECTS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as StoredProject[];
    if (!Array.isArray(parsed)) return {};

    return Object.fromEntries(
      parsed
        .filter((project) => typeof project?.id === 'number' && typeof project?.progress === 'number')
        .map((project) => [project.id, project.progress])
    );
  } catch {
    return {};
  }
};

const DashboardHome = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const projectsWithLiveProgress = useMemo(() => {
    const progressById = getStoredProjectProgressById();

    return PROJECT_PREVIEW.map((project) => {
      const progress = progressById[project.id] ?? project.defaultProgress;
      return {
        ...project,
        progress,
        status: getStatusFromProgress(progress),
      };
    });
  }, []);

  useEffect(() => {
    if (!token || !user?.id) return;

    const attentionProjects = projectsWithLiveProgress.filter((project) => project.progress < 50 || project.status === 'attention needed');
    if (attentionProjects.length === 0) return;

    const dispatchReminder = async () => {
      try {
        const response = await fetch(apiUrl('/api/notifications/project-reminders/dispatch'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            projects: attentionProjects.map((project) => ({
              id: project.id,
              name: project.name,
              progress: project.progress,
              status: project.status,
            })),
            clientLocalHour: new Date().getHours(),
          }),
        });

        if (!response.ok) return;
      } catch (error) {
        console.error('Failed to dispatch project attention reminder:', error);
      }
    };

    void dispatchReminder();
  }, [projectsWithLiveProgress, token, user?.id]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold font-['Space_Grotesk']">Project Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, {user?.name || user?.email?.split('@')[0] || 'Builder'}. This view is focused on project execution only.
            </p>
          </div>
          <Badge variant="secondary" className="gap-1">
            <TrendingUp className="h-3 w-3" /> Modular overview
          </Badge>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}>
        <Card className="border border-border/70 overflow-hidden">
          <CardContent className="p-0">
            <div className="gradient-primary p-5 text-primary-foreground">
              <p className="text-lg font-semibold">Monitor projects with one modular workspace</p>
              <p className="mt-1.5 max-w-3xl text-sm opacity-90">
                Use project previews to jump directly into detailed reports, analytics, and delivery progress.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button asChild size="sm" variant="secondary">
                  <Link to="/dashboard/projects">Open Projects</Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="border-white/40 bg-black/30 text-white hover:bg-black/45">
                  <Link to="/community">Open Community</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-4 xl:grid-cols-3">
        {projectsWithLiveProgress.map((project, index) => (
          <motion.div
            key={project.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + index * 0.03 }}
          >
            <Card className="h-full">
              <CardHeader className="space-y-2 pb-3">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">{project.name}</CardTitle>
                  <Badge variant={project.status === 'attention needed' ? 'destructive' : 'secondary'}>{project.status}</Badge>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${project.progress}%` }} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <button
                  type="button"
                  onClick={() => navigate(`/dashboard/reports?project=${encodeURIComponent(project.name)}&focus=preview`)}
                  className="block w-full rounded-md border border-border/70 bg-muted/30 p-3 text-left transition hover:border-primary/40 hover:bg-muted/40"
                >
                  <p className="mb-1 flex items-center gap-2 font-medium">
                    <FileText className="h-4 w-4 text-primary" /> Reports preview
                  </p>
                  <p className="text-xs text-muted-foreground">{project.report}</p>
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/dashboard/analytics?project=${encodeURIComponent(project.name)}&focus=preview`)}
                  className="block w-full rounded-md border border-border/70 bg-muted/30 p-3 text-left transition hover:border-primary/40 hover:bg-muted/40"
                >
                  <p className="mb-1 flex items-center gap-2 font-medium">
                    <LineChart className="h-4 w-4 text-primary" /> Analytics preview
                  </p>
                  <p className="text-xs text-muted-foreground">{project.analytics}</p>
                </button>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <Button asChild size="sm" variant="outline" className="justify-start">
                    <Link to={`/dashboard/projects/${project.id}`} className="inline-flex items-center gap-1">
                      <FolderKanban className="h-3.5 w-3.5" /> Project
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="justify-start">
                    <Link to={`/dashboard/reports?project=${encodeURIComponent(project.name)}&focus=report`} className="inline-flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" /> Report
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="justify-start">
                    <Link to={`/dashboard/analytics?project=${encodeURIComponent(project.name)}&focus=analysis`} className="inline-flex items-center gap-1">
                      <BarChart3 className="h-3.5 w-3.5" /> Analysis
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="text-sm font-semibold">Modular structure</p>
              <p className="text-xs text-muted-foreground">
                Keep dashboard focused on execution. Move discussions and market content to Community.
              </p>
            </div>
            <Button asChild>
              <Link to="/community" className="inline-flex items-center gap-1">
                Visit Community <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DashboardHome;
