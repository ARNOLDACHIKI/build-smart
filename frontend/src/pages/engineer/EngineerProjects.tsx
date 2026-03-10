import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CalendarDays, FolderKanban, MapPin, Plus, Search, Sparkles, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';
import { ProjectUpdateChat } from '@/components/ProjectUpdateChat';
import {
  AI_DRAFT_STORAGE_KEY,
  createEmptyProjectDraft,
  defaultMockProjects,
  EngineerProject,
  ProjectCustomField,
  ProjectStatus,
  applyProjectPromptUpdates,
  generateProjectDraftFromInquiry,
  loadProjects,
  nextProjectId,
  saveProjects,
} from '@/lib/engineerProjectAgent';

const statusVariant: Record<ProjectStatus, 'default' | 'secondary' | 'outline'> = {
  PLANNING: 'outline',
  IN_PROGRESS: 'default',
  REVIEW: 'secondary',
  COMPLETED: 'secondary',
};

const EngineerProjects = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<EngineerProject[]>(() => loadProjects() || defaultMockProjects);
  const [query, setQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<EngineerProject | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [aiAssistOpen, setAiAssistOpen] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [aiSenderName, setAiSenderName] = useState('');
  const [aiSenderPhone, setAiSenderPhone] = useState('');
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [isApplyingUpdatePrompt, setIsApplyingUpdatePrompt] = useState(false);
  const [updatePrompt, setUpdatePrompt] = useState('');
  const [draft, setDraft] = useState<Omit<EngineerProject, 'id'>>(createEmptyProjectDraft());

  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  useEffect(() => {
    const wantsAiDraft = searchParams.get('aiDraft') === '1';
    if (!wantsAiDraft) return;

    try {
      const raw = localStorage.getItem(AI_DRAFT_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Omit<EngineerProject, 'id'>;
      setIsEditing(false);
      setDraft({ ...createEmptyProjectDraft(), ...parsed, customFields: parsed.customFields || [] });
      setFormOpen(true);
      toast.success('AI draft loaded. Review and add anything you want.');
      localStorage.removeItem(AI_DRAFT_STORAGE_KEY);
      setSearchParams({});
    } catch {
      localStorage.removeItem(AI_DRAFT_STORAGE_KEY);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return projects.filter((p) =>
      [p.name, p.location, p.client, p.id, p.projectType, p.serviceCategory].some((v) =>
        v.toLowerCase().includes(q)
      )
    );
  }, [query, projects]);

  const resetDraft = () => {
    setDraft(createEmptyProjectDraft());
  };

  const handleOpenProject = (project: EngineerProject) => {
    setSelectedProject(project);
    setViewOpen(true);
  };

  const handleCreateClick = () => {
    setAiAssistOpen(true);
  };

  const handleManualCreate = () => {
    setIsEditing(false);
    setUpdatePrompt('');
    resetDraft();
    setAiAssistOpen(false);
    setFormOpen(true);
  };

  const handleGenerateFromAi = async () => {
    if (!aiMessage.trim()) {
      toast.error('Paste an inquiry message for AI generation.');
      return;
    }

    setIsGeneratingDraft(true);
    try {
      const generated = await generateProjectDraftFromInquiry({
        senderName: aiSenderName || 'New Client',
        senderPhone: aiSenderPhone,
        message: aiMessage,
      });

      setIsEditing(false);
      setDraft(generated);
      setAiAssistOpen(false);
      setFormOpen(true);
      toast.success('AI project draft generated. You can edit anything before saving.');
    } catch {
      toast.error('Failed to generate AI draft.');
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  const handleUpdateClick = (project: EngineerProject) => {
    setIsEditing(true);
    setUpdatePrompt('');
    setSelectedProject(project);
    setDraft({
      name: project.name,
      location: project.location,
      client: project.client,
      teamSize: project.teamSize,
      startDate: project.startDate,
      dueDate: project.dueDate,
      progress: project.progress,
      status: project.status,
      priority: project.priority,
      projectType: project.projectType,
      serviceCategory: project.serviceCategory,
      budgetEstimate: project.budgetEstimate,
      siteAddress: project.siteAddress,
      contactPerson: project.contactPerson,
      contactPhone: project.contactPhone,
      durationWeeks: project.durationWeeks,
      scopeSummary: project.scopeSummary,
      deliverables: project.deliverables,
      risksNotes: project.risksNotes,
      customFields: project.customFields || [],
    });
    setFormOpen(true);
  };

  const addCustomField = () => {
    setDraft((prev) => ({
      ...prev,
      customFields: [
        ...prev.customFields,
        {
          id: `custom-${Date.now()}-${prev.customFields.length + 1}`,
          label: '',
          value: '',
        },
      ],
    }));
  };

  const updateCustomField = (fieldId: string, patch: Partial<ProjectCustomField>) => {
    setDraft((prev) => ({
      ...prev,
      customFields: prev.customFields.map((field) =>
        field.id === fieldId
          ? { ...field, ...patch }
          : field
      ),
    }));
  };

  const removeCustomField = (fieldId: string) => {
    setDraft((prev) => ({
      ...prev,
      customFields: prev.customFields.filter((field) => field.id !== fieldId),
    }));
  };

  const handleApplyUpdatePrompt = async () => {
    if (!isEditing) {
      toast.error('Prompt updates are available in Update Project mode only.');
      return;
    }

    if (!updatePrompt.trim()) {
      toast.error('Describe the updates you want in the prompt field.');
      return;
    }

    setIsApplyingUpdatePrompt(true);
    try {
      const updatedDraft = await applyProjectPromptUpdates({
        project: {
          id: selectedProject?.id || 'draft',
          ...draft,
        },
        prompt: updatePrompt,
      });
      setDraft(updatedDraft);
      toast.success('Prompt updates applied. Review and save.');
    } catch {
      toast.error('Failed to apply prompt updates.');
    } finally {
      setIsApplyingUpdatePrompt(false);
    }
  };

  const handleSaveProject = () => {
    if (!draft.name.trim() || !draft.location.trim() || !draft.client.trim() || !draft.dueDate || !draft.startDate) {
      toast.error('Please complete all required fields.');
      return;
    }

    const normalizedDraft = {
      ...draft,
      customFields: draft.customFields
        .filter((field) => field.label.trim())
        .map((field) => ({ ...field, label: field.label.trim(), value: field.value.trim() })),
    };

    if (isEditing && selectedProject) {
      setProjects((prev) =>
        prev.map((project) =>
          project.id === selectedProject.id ? { ...project, ...normalizedDraft } : project
        )
      );
      toast.success('Project updated successfully.');
    } else {
      const id = nextProjectId(projects);
      setProjects((prev) => [{ id, ...normalizedDraft }, ...prev]);
      toast.success('Project created successfully.');
    }

    setFormOpen(false);
    setUpdatePrompt('');
    resetDraft();
    setAiMessage('');
    setAiSenderName('');
    setAiSenderPhone('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Track your assigned engineering projects.</p>
        </div>
        <Button className="w-full md:w-auto" onClick={handleCreateClick}>Create Project</Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by project, client, location, type, or ID" className="pl-9" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filtered.map((project) => (
          <Card key={project.id}>
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{project.id} • {project.client}</p>
                </div>
                <Badge variant={statusVariant[project.status]}>{project.status.replace('_', ' ')}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3 text-sm text-muted-foreground md:grid-cols-3">
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4" />{project.location}</div>
                <div className="flex items-center gap-2"><Users className="h-4 w-4" />{project.teamSize} team members</div>
                <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />Due {new Date(project.dueDate).toLocaleDateString()}</div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <Progress value={project.progress} />
              </div>

              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleOpenProject(project)}>Open</Button>
                <Button size="sm" variant="outline" onClick={() => handleUpdateClick(project)}>Update</Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filtered.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              <FolderKanban className="mx-auto mb-3 h-8 w-8" />
              No projects match your search.
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[760px]">
          <DialogHeader>
            <DialogTitle>{selectedProject?.name}</DialogTitle>
            <DialogDescription>
              Project details and current progress.
            </DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
                <div>
                  <p className="text-muted-foreground">Project ID</p>
                  <p className="font-medium">{selectedProject.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Client</p>
                  <p className="font-medium">{selectedProject.client}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Project Type</p>
                  <p className="font-medium">{selectedProject.projectType}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Service</p>
                  <p className="font-medium">{selectedProject.serviceCategory}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Location</p>
                  <p className="font-medium">{selectedProject.location}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Priority</p>
                  <p className="font-medium">{selectedProject.priority}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Start Date</p>
                  <p className="font-medium">{new Date(selectedProject.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Due Date</p>
                  <p className="font-medium">{new Date(selectedProject.dueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Budget</p>
                  <p className="font-medium">{selectedProject.budgetEstimate || 'N/A'}</p>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{selectedProject.progress}%</span>
                </div>
                <Progress value={selectedProject.progress} />
              </div>

              <div className="grid gap-3 text-sm md:grid-cols-2">
                <div>
                  <p className="text-muted-foreground mb-1">Scope Summary</p>
                  <p>{selectedProject.scopeSummary || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Deliverables</p>
                  <p>{selectedProject.deliverables || 'N/A'}</p>
                </div>
              </div>

              {selectedProject.customFields?.length > 0 && (
                <div>
                  <p className="text-muted-foreground mb-2 text-sm">Custom Fields</p>
                  <div className="grid gap-2 md:grid-cols-2">
                    {selectedProject.customFields.map((field) => (
                      <div key={field.id} className="rounded-md border p-3 text-sm">
                        <p className="text-muted-foreground">{field.label}</p>
                        <p className="font-medium">{field.value || 'N/A'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={aiAssistOpen} onOpenChange={setAiAssistOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4" />AI Project Agent</DialogTitle>
            <DialogDescription>
              Paste a customer inquiry and let AI generate a project draft. You can edit before creating.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Customer Name</Label>
              <Input value={aiSenderName} onChange={(e) => setAiSenderName(e.target.value)} placeholder="e.g. John Kamau" />
            </div>
            <div className="space-y-2">
              <Label>Customer Phone</Label>
              <Input value={aiSenderPhone} onChange={(e) => setAiSenderPhone(e.target.value)} placeholder="e.g. +2547..." />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Inquiry Message</Label>
              <Textarea rows={6} value={aiMessage} onChange={(e) => setAiMessage(e.target.value)} placeholder="Paste full customer inquiry here..." />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleManualCreate} disabled={isGeneratingDraft}>Skip AI (Manual)</Button>
            <Button onClick={handleGenerateFromAi} disabled={isGeneratingDraft}><Sparkles className="h-4 w-4 mr-2" />{isGeneratingDraft ? 'Generating...' : 'Generate Draft'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-[820px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Update Project' : 'Create Project'}</DialogTitle>
            <DialogDescription>
              Fill the project details below.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 max-h-[70vh] overflow-y-auto pr-1">
            {isEditing && selectedProject && (
              <div className="md:col-span-3">
                <Label className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4" /> AI Assistant - Ask me anything about this project
                </Label>
                <ProjectUpdateChat 
                  project={{ id: selectedProject.id, ...draft }} 
                  onUpdate={(updates) => {
                    setDraft((prev) => ({ ...prev, ...updates }));
                    toast.success('Project updated from chat');
                  }}
                />
              </div>
            )}

            <div className="space-y-2 md:col-span-3">
              <Label htmlFor="project-name">Project Name</Label>
              <Input id="project-name" value={draft.name} onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))} placeholder="Enter project name" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-client">Client</Label>
              <Input id="project-client" value={draft.client} onChange={(e) => setDraft((prev) => ({ ...prev, client: e.target.value }))} placeholder="Client name" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-contact-person">Contact Person</Label>
              <Input id="project-contact-person" value={draft.contactPerson} onChange={(e) => setDraft((prev) => ({ ...prev, contactPerson: e.target.value }))} placeholder="Main contact" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-contact-phone">Contact Phone</Label>
              <Input id="project-contact-phone" value={draft.contactPhone} onChange={(e) => setDraft((prev) => ({ ...prev, contactPhone: e.target.value }))} placeholder="+254..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-location">Location</Label>
              <Input id="project-location" value={draft.location} onChange={(e) => setDraft((prev) => ({ ...prev, location: e.target.value }))} placeholder="City / County" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="project-site-address">Site Address</Label>
              <Input id="project-site-address" value={draft.siteAddress} onChange={(e) => setDraft((prev) => ({ ...prev, siteAddress: e.target.value }))} placeholder="Plot / street / landmark" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-type">Project Type</Label>
              <Input id="project-type" value={draft.projectType} onChange={(e) => setDraft((prev) => ({ ...prev, projectType: e.target.value }))} placeholder="Residential / Commercial / Infra" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-service">Service Category</Label>
              <Input id="project-service" value={draft.serviceCategory} onChange={(e) => setDraft((prev) => ({ ...prev, serviceCategory: e.target.value }))} placeholder="Structural / Civil / MEP" />
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={draft.priority} onValueChange={(value) => setDraft((prev) => ({ ...prev, priority: value as EngineerProject['priority'] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-team">Team Size</Label>
              <Input id="project-team" type="number" min={1} value={draft.teamSize} onChange={(e) => setDraft((prev) => ({ ...prev, teamSize: Math.max(1, Number(e.target.value) || 1) }))} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-duration">Duration (weeks)</Label>
              <Input id="project-duration" type="number" min={1} value={draft.durationWeeks} onChange={(e) => setDraft((prev) => ({ ...prev, durationWeeks: Math.max(1, Number(e.target.value) || 1) }))} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-budget">Budget Estimate</Label>
              <Input id="project-budget" value={draft.budgetEstimate} onChange={(e) => setDraft((prev) => ({ ...prev, budgetEstimate: e.target.value }))} placeholder="KES ..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-start-date">Start Date</Label>
              <Input id="project-start-date" type="date" value={draft.startDate} onChange={(e) => setDraft((prev) => ({ ...prev, startDate: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-date">Due Date</Label>
              <Input id="project-date" type="date" value={draft.dueDate} onChange={(e) => setDraft((prev) => ({ ...prev, dueDate: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-progress">Progress (%)</Label>
              <Input id="project-progress" type="number" min={0} max={100} value={draft.progress} onChange={(e) => {
                const next = Number(e.target.value);
                const safe = Number.isNaN(next) ? 0 : Math.min(100, Math.max(0, next));
                setDraft((prev) => ({ ...prev, progress: safe }));
              }} />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={draft.status} onValueChange={(value) => setDraft((prev) => ({ ...prev, status: value as ProjectStatus }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLANNING">Planning</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="REVIEW">Review</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-3">
              <Label htmlFor="project-scope">Scope Summary</Label>
              <Textarea id="project-scope" rows={3} value={draft.scopeSummary} onChange={(e) => setDraft((prev) => ({ ...prev, scopeSummary: e.target.value }))} placeholder="Describe project scope" />
            </div>

            <div className="space-y-2 md:col-span-3">
              <Label htmlFor="project-deliverables">Deliverables</Label>
              <Textarea id="project-deliverables" rows={3} value={draft.deliverables} onChange={(e) => setDraft((prev) => ({ ...prev, deliverables: e.target.value }))} placeholder="Expected outputs and milestones" />
            </div>

            <div className="space-y-2 md:col-span-3">
              <Label htmlFor="project-risks">Risks / Notes</Label>
              <Textarea id="project-risks" rows={3} value={draft.risksNotes} onChange={(e) => setDraft((prev) => ({ ...prev, risksNotes: e.target.value }))} placeholder="Known risks, assumptions, constraints" />
            </div>

            <div className="space-y-3 md:col-span-3">
              <div className="flex items-center justify-between">
                <Label>Custom Fields</Label>
                <Button type="button" size="sm" variant="outline" onClick={addCustomField}>
                  <Plus className="h-4 w-4 mr-1" /> Add Field
                </Button>
              </div>

              {draft.customFields.length === 0 ? (
                <p className="text-sm text-muted-foreground">No custom fields yet. Use AI prompt or add manually.</p>
              ) : (
                <div className="space-y-2">
                  {draft.customFields.map((field) => (
                    <div key={field.id} className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_auto]">
                      <Input
                        value={field.label}
                        onChange={(e) => updateCustomField(field.id, { label: e.target.value })}
                        placeholder="Field name"
                      />
                      <Input
                        value={field.value}
                        onChange={(e) => updateCustomField(field.id, { value: e.target.value })}
                        placeholder="Field value"
                      />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeCustomField(field.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setFormOpen(false);
              setUpdatePrompt('');
            }}>Cancel</Button>
            <Button onClick={handleSaveProject}>{isEditing ? 'Save Changes' : 'Create Project'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EngineerProjects;
