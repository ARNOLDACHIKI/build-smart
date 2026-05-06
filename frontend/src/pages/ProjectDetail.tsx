import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Calendar, MapPin, DollarSign, CheckCircle, Circle, AlertCircle, Plus } from 'lucide-react';
import ChatPanel from '@/components/chat/ChatPanel';
import { apiUrl } from '@/lib/api';

interface Milestone {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  progress: number;
}

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

const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { toast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!id) return;

    const fetchProject = async () => {
      setLoading(true);
      try {
        const response = await fetch(apiUrl(`/api/projects/${id}`), {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!response.ok) throw new Error('Failed to fetch project');

        const data = await response.json().catch(() => ({}));
        setProject(data.project);
      } catch (error) {
        console.error('Error fetching project:', error);
        toast({
          title: 'Unable to load project',
          description: error instanceof Error ? error.message : 'Please try again.',
          variant: 'destructive',
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, token, navigate, toast]);

  const updateMilestoneStatus = async (milestoneId: string, newStatus: string) => {
    if (!token) return;

    setUpdatingStatus((prev) => ({ ...prev, [milestoneId]: true }));
    try {
      const response = await fetch(apiUrl(`/api/milestones/${milestoneId}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update milestone');

      toast({ title: 'Milestone updated successfully' });

      // Refresh project
      const projectResponse = await fetch(apiUrl(`/api/projects/${id}`), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (projectResponse.ok) {
        const data = await projectResponse.json().catch(() => ({}));
        setProject(data.project);
      }
    } catch (error) {
      toast({
        title: 'Failed to update milestone',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [milestoneId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded w-64" />
          <div className="h-40 bg-gray-200 rounded" />
          <div className="h-96 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">Project not found</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  const statusColors = {
    PENDING: 'text-yellow-600 bg-yellow-50',
    IN_PROGRESS: 'text-blue-600 bg-blue-50',
    COMPLETED: 'text-green-600 bg-green-50',
  };

  const statusIcons = {
    PENDING: <Circle className="w-4 h-4" />,
    IN_PROGRESS: <AlertCircle className="w-4 h-4" />,
    COMPLETED: <CheckCircle className="w-4 h-4" />,
  };

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-l-blue-500">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
            {project.description && (
              <p className="text-gray-600 mt-2">{project.description}</p>
            )}
          </div>
          <div
            className={`px-4 py-2 rounded-full text-sm font-semibold ${
              project.status === 'COMPLETED'
                ? 'bg-green-100 text-green-800'
                : project.status === 'ACTIVE'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {project.status}
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Project Progress</span>
            <span className="text-lg font-bold text-gray-900">{project.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {project.budget && (
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-600">Budget</p>
                <p className="font-semibold text-gray-900">{project.budget}</p>
              </div>
            </div>
          )}
          {project.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-600">Location</p>
                <p className="font-semibold text-gray-900">{project.location}</p>
              </div>
            </div>
          )}
          {project.startDate && (
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-600">Start Date</p>
                <p className="font-semibold text-gray-900">
                  {new Date(project.startDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          )}
          {project.endDate && (
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-600">End Date</p>
                <p className="font-semibold text-gray-900">
                  {new Date(project.endDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Milestones section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Milestones</h2>
          {user?.id === project.professional?.id && (
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              <Plus className="w-4 h-4" />
              Add Milestone
            </button>
          )}
        </div>

        {project.milestones.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No milestones added yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {project.milestones.map((milestone, index) => (
              <div
                key={milestone.id}
                className={`border-l-4 p-4 rounded-lg ${
                  milestone.status === 'COMPLETED'
                    ? 'border-l-green-500 bg-green-50'
                    : milestone.status === 'IN_PROGRESS'
                      ? 'border-l-blue-500 bg-blue-50'
                      : 'border-l-yellow-500 bg-yellow-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className={`${statusColors[milestone.status]} p-1 rounded`}>
                        {statusIcons[milestone.status]}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{milestone.title}</h3>
                    </div>
                    {milestone.description && (
                      <p className="text-sm text-gray-600 mt-2">{milestone.description}</p>
                    )}

                    {/* Progress bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-700">Progress</span>
                        <span className="text-xs font-bold text-gray-900">{milestone.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${milestone.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Due date */}
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Due:{' '}
                        {new Date(milestone.dueDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  {user?.id === project.professional?.id && milestone.status !== 'COMPLETED' && (
                    <div className="ml-4 flex gap-2">
                      {milestone.status === 'PENDING' && (
                        <button
                          onClick={() => updateMilestoneStatus(milestone.id, 'IN_PROGRESS')}
                          disabled={updatingStatus[milestone.id]}
                          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:opacity-50"
                        >
                          Start
                        </button>
                      )}
                      {milestone.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => updateMilestoneStatus(milestone.id, 'COMPLETED')}
                          disabled={updatingStatus[milestone.id]}
                          className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 disabled:opacity-50"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Live Project Chat</h2>
          <p className="text-sm text-gray-600 mt-1">Share updates, upload site files, and keep the client and professional in sync in real time.</p>
        </div>
        <ChatPanel
          projectId={project.id}
          title={project.title}
          participants={[project.client, project.professional].filter(Boolean) as Array<{ id: string; name?: string; email: string }>}
        />
      </div>
    </div>
  );
};

export default ProjectDetailPage;
