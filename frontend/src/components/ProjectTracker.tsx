import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Briefcase, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { apiUrl } from '@/lib/api';

interface Project {
  id: string;
  title: string;
  description?: string;
  status: 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  progress: number;
  budget?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  milestones: Milestone[];
  client?: { id: string; name?: string; email: string };
  professional?: { id: string; name?: string; email: string };
}

interface Milestone {
  id: string;
  title: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  dueDate: string;
  progress: number;
}

const ProjectTracker = () => {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'ACTIVE' | 'COMPLETED' | 'PLANNING'>('all');

  useEffect(() => {
    if (!user || !token) return;

    const fetchProjects = async () => {
      setLoadingProjects(true);
      try {
        const response = await fetch(apiUrl('/api/projects'), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Failed to fetch projects');

        const data = await response.json().catch(() => ({}));
        setProjects(data.projects || []);
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast({
          title: 'Unable to load projects',
          description: error instanceof Error ? error.message : 'Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, [user, token, toast]);

  const filteredProjects = filterStatus === 'all'
    ? projects
    : projects.filter((p) => p.status === filterStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'border-l-4 border-l-blue-500 bg-blue-50';
      case 'COMPLETED':
        return 'border-l-4 border-l-green-500 bg-green-50';
      case 'PLANNING':
        return 'border-l-4 border-l-yellow-500 bg-yellow-50';
      case 'CANCELLED':
        return 'border-l-4 border-l-red-500 bg-red-50';
      default:
        return 'border-l-4 border-l-gray-500 bg-gray-50';
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      ACTIVE: { bg: 'bg-blue-100', text: 'text-blue-800', icon: <TrendingUp className="w-3 h-3" /> },
      COMPLETED: { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="w-3 h-3" /> },
      PLANNING: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <AlertCircle className="w-3 h-3" /> },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', icon: <AlertCircle className="w-3 h-3" /> },
    };

    const badge = badges[status] || badges.PLANNING;

    return (
      <div className={`${badge.bg} ${badge.text} px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1`}>
        {badge.icon}
        {status}
      </div>
    );
  };

  const getNextMilestone = (milestones: Milestone[]) => {
    const pending = milestones.filter((m) => m.status !== 'COMPLETED');
    if (pending.length === 0) return null;
    return pending.reduce((earliest, current) =>
      new Date(current.dueDate) < new Date(earliest.dueDate) ? current : earliest
    );
  };

  if (loadingProjects) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Project Tracker</h2>
          <p className="text-sm text-gray-600 mt-1">
            {filteredProjects.length} {filterStatus === 'all' ? 'projects' : `${filterStatus.toLowerCase()} projects`}
          </p>
        </div>

        <div className="flex gap-2">
          {(['all', 'ACTIVE', 'PLANNING', 'COMPLETED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filterStatus === status
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {status === 'all' ? 'All' : status}
            </button>
          ))}
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">No {filterStatus === 'all' ? '' : filterStatus.toLowerCase()} projects yet</h3>
          <p className="text-gray-600 mt-1">Projects will appear here once created.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredProjects.map((project) => {
            const nextMilestone = getNextMilestone(project.milestones || []);
            const completedMilestones = (project.milestones || []).filter((m) => m.status === 'COMPLETED').length;
            const totalMilestones = project.milestones?.length || 0;

            return (
              <a
                key={project.id}
                href={`/project/${project.id}`}
                className={`p-6 rounded-lg border border-gray-200 hover:shadow-lg transition ${getStatusColor(project.status)}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{project.title}</h3>
                    {project.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{project.description}</p>
                    )}
                  </div>
                  <div className="ml-4">{getStatusBadge(project.status)}</div>
                </div>

                <div className="space-y-3">
                  {/* Progress bar */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-700">Overall Progress</span>
                      <span className="text-xs font-bold text-gray-900">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Milestone info */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Milestones: {completedMilestones}/{totalMilestones}
                    </span>
                    {nextMilestone && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Due: {new Date(nextMilestone.dueDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Project details */}
                  {project.budget || project.location ? (
                    <div className="flex gap-4 text-xs text-gray-600 pt-2 border-t border-gray-300">
                      {project.budget && <span>Budget: {project.budget}</span>}
                      {project.location && <span>Location: {project.location}</span>}
                    </div>
                  ) : null}
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProjectTracker;
