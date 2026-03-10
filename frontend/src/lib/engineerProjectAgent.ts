import { apiUrl } from '@/lib/api';
import { authStorage } from '@/lib/auth';

export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';
export type ProjectPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type ProjectCustomField = {
  id: string;
  label: string;
  value: string;
};

export type EngineerProject = {
  id: string;
  name: string;
  location: string;
  client: string;
  teamSize: number;
  dueDate: string;
  startDate: string;
  progress: number;
  status: ProjectStatus;
  priority: ProjectPriority;
  projectType: string;
  serviceCategory: string;
  budgetEstimate: string;
  siteAddress: string;
  contactPerson: string;
  contactPhone: string;
  durationWeeks: number;
  scopeSummary: string;
  deliverables: string;
  risksNotes: string;
  customFields: ProjectCustomField[];
};

export const PROJECTS_STORAGE_KEY = 'engineer_projects';
export const AI_DRAFT_STORAGE_KEY = 'engineer_ai_project_draft';

export const defaultMockProjects: EngineerProject[] = [
  {
    id: 'P-001',
    name: 'Westlands Office Tower',
    location: 'Nairobi',
    client: 'Apex Properties',
    teamSize: 6,
    startDate: '2026-01-10',
    dueDate: '2026-06-20',
    progress: 72,
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    projectType: 'Commercial Building',
    serviceCategory: 'Structural Engineering',
    budgetEstimate: 'KES 120,000,000',
    siteAddress: 'Westlands, Nairobi',
    contactPerson: 'Grace Wanjiku',
    contactPhone: '+254700111222',
    durationWeeks: 24,
    scopeSummary: 'Structural design and supervision for a 12-floor office tower.',
    deliverables: 'Structural drawings, BOQ support, supervision reports.',
    risksNotes: 'Tight urban site constraints and weather delays.',
    customFields: [],
  },
  {
    id: 'P-002',
    name: 'Kisumu Bypass Expansion',
    location: 'Kisumu',
    client: 'County Gov',
    teamSize: 10,
    startDate: '2026-02-01',
    dueDate: '2026-08-15',
    progress: 34,
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    projectType: 'Road Infrastructure',
    serviceCategory: 'Civil Engineering',
    budgetEstimate: 'KES 340,000,000',
    siteAddress: 'Kisumu Northern Corridor',
    contactPerson: 'County Engineer Office',
    contactPhone: '+254700333444',
    durationWeeks: 28,
    scopeSummary: 'Road widening and drainage upgrades on bypass sections.',
    deliverables: 'Road design updates, site inspection reports, completion handover.',
    risksNotes: 'Traffic management and utility relocation dependencies.',
    customFields: [],
  },
  {
    id: 'P-003',
    name: 'Nakuru Water Plant Upgrade',
    location: 'Nakuru',
    client: 'Nakuru Water',
    teamSize: 5,
    startDate: '2025-11-10',
    dueDate: '2026-04-11',
    progress: 89,
    status: 'REVIEW',
    priority: 'HIGH',
    projectType: 'Water Treatment',
    serviceCategory: 'Water Engineering',
    budgetEstimate: 'KES 95,000,000',
    siteAddress: 'Nakuru Industrial Area',
    contactPerson: 'Operations Director',
    contactPhone: '+254700555666',
    durationWeeks: 22,
    scopeSummary: 'Capacity expansion and process optimization of treatment plant.',
    deliverables: 'Design package, commissioning checklist, O&M manual.',
    risksNotes: 'Procurement lead-times for specialized equipment.',
    customFields: [],
  },
  {
    id: 'P-004',
    name: 'Diani Beach Resort Villas',
    location: 'Mombasa',
    client: 'Blue Coast Ltd',
    teamSize: 8,
    startDate: '2025-08-01',
    dueDate: '2026-03-30',
    progress: 100,
    status: 'COMPLETED',
    priority: 'MEDIUM',
    projectType: 'Hospitality',
    serviceCategory: 'MEP + Structural',
    budgetEstimate: 'KES 210,000,000',
    siteAddress: 'Diani Beach, Kwale',
    contactPerson: 'Project Director',
    contactPhone: '+254700777888',
    durationWeeks: 34,
    scopeSummary: 'Design and delivery of villa blocks and shared facilities.',
    deliverables: 'As-built drawings, completion certificates, defects log.',
    risksNotes: 'Coastal corrosion controls and seasonal weather windows.',
    customFields: [],
  },
];

export const createEmptyProjectDraft = (): Omit<EngineerProject, 'id'> => {
  const startDate = new Date();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 45);

  return {
    name: '',
    location: '',
    client: '',
    teamSize: 1,
    startDate: startDate.toISOString().split('T')[0],
    dueDate: dueDate.toISOString().split('T')[0],
    progress: 0,
    status: 'PLANNING',
    priority: 'MEDIUM',
    projectType: 'Construction',
    serviceCategory: 'General Engineering',
    budgetEstimate: '',
    siteAddress: '',
    contactPerson: '',
    contactPhone: '',
    durationWeeks: 12,
    scopeSummary: '',
    deliverables: '',
    risksNotes: '',
    customFields: [],
  };
};

export const loadProjects = (): EngineerProject[] => {
  try {
    const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (!raw) return defaultMockProjects;
    const parsed = JSON.parse(raw) as EngineerProject[];
    if (!Array.isArray(parsed) || parsed.length === 0) return defaultMockProjects;

    return parsed.map((project) => ({
      id: project.id,
      ...normalizeDraft(project, createEmptyProjectDraft()),
    }));
  } catch {
    return defaultMockProjects;
  }
};

export const saveProjects = (projects: EngineerProject[]) => {
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
};

export const nextProjectId = (projects: EngineerProject[]) => {
  return `P-${String(projects.length + 1).padStart(3, '0')}`;
};

export const appendProjectFromDraft = (draft: Omit<EngineerProject, 'id'>): EngineerProject => {
  const projects = loadProjects();
  const project: EngineerProject = {
    id: nextProjectId(projects),
    ...draft,
  };
  saveProjects([project, ...projects]);
  return project;
};

const normalizeCustomFields = (
  raw: unknown,
  fallback: ProjectCustomField[]
): ProjectCustomField[] => {
  if (!Array.isArray(raw)) return fallback;

  return raw
    .map((field, index) => {
      if (!field || typeof field !== 'object') return null;
      const value = field as { id?: string; label?: string; value?: string };
      const label = (value.label || '').trim();
      const fieldValue = (value.value || '').trim();
      if (!label) return null;

      return {
        id: value.id || `custom-${Date.now()}-${index}`,
        label,
        value: fieldValue,
      };
    })
    .filter((field): field is ProjectCustomField => Boolean(field));
};

const normalizeDraft = (
  raw: Partial<Omit<EngineerProject, 'id'>>,
  fallback: Omit<EngineerProject, 'id'>
): Omit<EngineerProject, 'id'> => {
  const toDate = (value: string | undefined, fallbackValue: string) => {
    if (!value) return fallbackValue;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? fallbackValue : d.toISOString().split('T')[0];
  };

  const status = ['PLANNING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'].includes(String(raw.status))
    ? (raw.status as ProjectStatus)
    : fallback.status;

  const priority = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(String(raw.priority))
    ? (raw.priority as ProjectPriority)
    : fallback.priority;

  return {
    ...fallback,
    ...raw,
    name: (raw.name || fallback.name).trim(),
    location: (raw.location || fallback.location).trim(),
    client: (raw.client || fallback.client).trim(),
    teamSize: Math.max(1, Number(raw.teamSize ?? fallback.teamSize) || fallback.teamSize),
    startDate: toDate(raw.startDate, fallback.startDate),
    dueDate: toDate(raw.dueDate, fallback.dueDate),
    progress: Math.max(0, Math.min(100, Number(raw.progress ?? fallback.progress) || 0)),
    status,
    priority,
    projectType: (raw.projectType || fallback.projectType).trim(),
    serviceCategory: (raw.serviceCategory || fallback.serviceCategory).trim(),
    budgetEstimate: (raw.budgetEstimate || fallback.budgetEstimate).trim(),
    siteAddress: (raw.siteAddress || fallback.siteAddress).trim(),
    contactPerson: (raw.contactPerson || fallback.contactPerson).trim(),
    contactPhone: (raw.contactPhone || fallback.contactPhone).trim(),
    durationWeeks: Math.max(1, Number(raw.durationWeeks ?? fallback.durationWeeks) || fallback.durationWeeks),
    scopeSummary: (raw.scopeSummary || fallback.scopeSummary).trim(),
    deliverables: (raw.deliverables || fallback.deliverables).trim(),
    risksNotes: (raw.risksNotes || fallback.risksNotes).trim(),
    customFields: normalizeCustomFields(raw.customFields, fallback.customFields),
  };
};

const getLocationFromMessage = (text: string) => {
  const cities = ['nairobi', 'mombasa', 'kisumu', 'nakuru', 'eldoret', 'thika', 'nyeri', 'naivasha'];
  const found = cities.find((c) => text.toLowerCase().includes(c));
  return found ? found.charAt(0).toUpperCase() + found.slice(1) : 'Nairobi';
};

const getServiceCategory = (text: string) => {
  const t = text.toLowerCase();
  if (t.includes('road') || t.includes('bridge')) return 'Civil Engineering';
  if (t.includes('water') || t.includes('drainage')) return 'Water Engineering';
  if (t.includes('electrical') || t.includes('solar')) return 'Electrical Engineering';
  if (t.includes('mechanical') || t.includes('hvac')) return 'Mechanical Engineering';
  if (t.includes('structural') || t.includes('building')) return 'Structural Engineering';
  return 'General Engineering';
};

const getProjectType = (text: string) => {
  const t = text.toLowerCase();
  if (t.includes('house') || t.includes('residential')) return 'Residential';
  if (t.includes('office') || t.includes('mall') || t.includes('commercial')) return 'Commercial Building';
  if (t.includes('road') || t.includes('bridge')) return 'Infrastructure';
  if (t.includes('water') || t.includes('plant')) return 'Utility / Plant';
  return 'Construction';
};

const generateProjectDraftHeuristic = (input: {
  senderName: string;
  senderPhone?: string | null;
  message: string;
}): Omit<EngineerProject, 'id'> => {
  const base = createEmptyProjectDraft();
  const message = input.message || '';
  const location = getLocationFromMessage(message);
  const serviceCategory = getServiceCategory(message);
  const projectType = getProjectType(message);

  const budgetMatch = message.match(/(KES|KSH|ksh|kes|\$)\s?[\d,]+(\.\d+)?/);
  const urgent = /urgent|asap|immediately|soon/i.test(message);

  const start = new Date();
  const due = new Date(start);
  due.setDate(due.getDate() + (urgent ? 21 : 45));

  return {
    ...base,
    name: `${projectType} Project - ${input.senderName}`,
    location,
    client: input.senderName,
    teamSize: serviceCategory.includes('General') ? 4 : 6,
    startDate: start.toISOString().split('T')[0],
    dueDate: due.toISOString().split('T')[0],
    priority: urgent ? 'HIGH' : 'MEDIUM',
    projectType,
    serviceCategory,
    budgetEstimate: budgetMatch?.[0] || '',
    siteAddress: location,
    contactPerson: input.senderName,
    contactPhone: input.senderPhone || '',
    durationWeeks: urgent ? 6 : 12,
    scopeSummary: message,
    deliverables: 'Initial assessment report, design package, implementation plan.',
    risksNotes: urgent
      ? 'Compressed timeline and procurement lead-time risk.'
      : 'Site access and approvals may affect timeline.',
  };
};

export const generateProjectDraftFromInquiry = async (input: {
  senderName: string;
  senderPhone?: string | null;
  message: string;
}): Promise<Omit<EngineerProject, 'id'>> => {
  const fallback = generateProjectDraftHeuristic(input);

  try {
    const token = authStorage.getToken();
    const response = await fetch(apiUrl('/api/ai/generate-project-draft'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(`AI endpoint returned ${response.status}`);
    }

    const payload = await response.json() as { draft?: Partial<Omit<EngineerProject, 'id'>> };
    if (!payload?.draft) return fallback;

    return normalizeDraft(payload.draft, fallback);
  } catch (error) {
    console.warn('AI endpoint unavailable, using local heuristic fallback.', error);
    return fallback;
  }
};

const FIELD_STOP_WORDS = new Set([
  'the',
  'a',
  'an',
  'to',
  'of',
  'for',
  'on',
  'in',
  'at',
  'number',
  'count',
  'value',
  'update',
  'change',
  'set',
  'make',
  'put',
  'field',
]);

const normalizeLabel = (value: string) => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/[\s-]+/)
    .filter((token) => token && !FIELD_STOP_WORDS.has(token))
    .join(' ');
};

const findBestMatchingCustomField = (
  fields: ProjectCustomField[],
  label: string
): ProjectCustomField | null => {
  const normalized = normalizeLabel(label);
  if (!normalized) return null;

  let best: { field: ProjectCustomField; score: number } | null = null;
  const requestedTokens = new Set(normalized.split(' '));

  for (const field of fields) {
    const fieldNorm = normalizeLabel(field.label);
    if (!fieldNorm) continue;

    let score = 0;
    if (fieldNorm === normalized) score += 10;
    if (fieldNorm.includes(normalized) || normalized.includes(fieldNorm)) score += 5;

    for (const token of fieldNorm.split(' ')) {
      if (requestedTokens.has(token)) score += 2;
    }

    if (!best || score > best.score) {
      best = { field, score };
    }
  }

  if (!best || best.score < 3) return null;
  return best.field;
};

const upsertCustomField = (
  fields: ProjectCustomField[],
  label: string,
  value: string
): ProjectCustomField[] => {
  const existing = findBestMatchingCustomField(fields, label);
  if (existing) {
    return fields.map((field) =>
      field.id === existing.id
        ? { ...field, value: value.trim() }
        : field
    );
  }

  return [
    ...fields,
    {
      id: `custom-${Date.now()}-${fields.length + 1}`,
      label: label
        .trim()
        .replace(/^(?:update|change|set|make|put)\s+/i, '')
        .replace(/^(?:the\s+)?(?:number\s+of\s+)?/i, '')
        .trim(),
      value: value.trim(),
    },
  ];
};

const parsePromptDate = (value: string): string | null => {
  const iso = value.match(/\b\d{4}-\d{2}-\d{2}\b/);
  if (iso) return iso[0];
  return null;
};

const applyKnownFieldLine = (
  line: string,
  draft: Omit<EngineerProject, 'id'>
): Omit<EngineerProject, 'id'> => {
  const updated = { ...draft };
  const lower = line.toLowerCase();

  const teamSize = line.match(/team\s*size\s*(?:to|=|:)?\s*(\d+)/i);
  if (teamSize) updated.teamSize = Math.max(1, Number(teamSize[1]));

  const duration = line.match(/duration(?:\s*weeks?)?\s*(?:to|=|:)?\s*(\d+)/i);
  if (duration) updated.durationWeeks = Math.max(1, Number(duration[1]));

  const progress = line.match(/progress\s*(?:to|=|:)?\s*(\d{1,3})\%?/i);
  if (progress) updated.progress = Math.max(0, Math.min(100, Number(progress[1])));

  const budget = line.match(/budget(?:\s*estimate)?\s*(?:to|=|:)?\s*(.+)$/i);
  if (budget) updated.budgetEstimate = budget[1].trim();

  const dueDate = line.match(/due\s*date\s*(?:to|=|:)?\s*(.+)$/i);
  if (dueDate) {
    const parsed = parsePromptDate(dueDate[1]);
    if (parsed) updated.dueDate = parsed;
  }

  const startDate = line.match(/start\s*date\s*(?:to|=|:)?\s*(.+)$/i);
  if (startDate) {
    const parsed = parsePromptDate(startDate[1]);
    if (parsed) updated.startDate = parsed;
  }

  const statusMatch = line.match(/status\s*(?:to|=|:)?\s*(planning|in progress|review|completed)/i);
  if (statusMatch) {
    const mapped = statusMatch[1].toUpperCase().replace(/\s+/g, '_');
    if (['PLANNING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'].includes(mapped)) {
      updated.status = mapped as ProjectStatus;
    }
  }

  const priorityMatch = line.match(/priority\s*(?:to|=|:)?\s*(low|medium|high|urgent)/i);
  if (priorityMatch) {
    updated.priority = priorityMatch[1].toUpperCase() as ProjectPriority;
  }

  const mapping: Array<{ pattern: RegExp; key: keyof Omit<EngineerProject, 'id'> }> = [
    { pattern: /project\s*name\s*(?:to|=|:)?\s*(.+)$/i, key: 'name' },
    { pattern: /client\s*(?:to|=|:)?\s*(.+)$/i, key: 'client' },
    { pattern: /location\s*(?:to|=|:)?\s*(.+)$/i, key: 'location' },
    { pattern: /site\s*address\s*(?:to|=|:)?\s*(.+)$/i, key: 'siteAddress' },
    { pattern: /project\s*type\s*(?:to|=|:)?\s*(.+)$/i, key: 'projectType' },
    { pattern: /service\s*category\s*(?:to|=|:)?\s*(.+)$/i, key: 'serviceCategory' },
    { pattern: /contact\s*person\s*(?:to|=|:)?\s*(.+)$/i, key: 'contactPerson' },
    { pattern: /contact\s*phone\s*(?:to|=|:)?\s*(.+)$/i, key: 'contactPhone' },
    { pattern: /scope\s*summary\s*(?:to|=|:)?\s*(.+)$/i, key: 'scopeSummary' },
    { pattern: /deliverables\s*(?:to|=|:)?\s*(.+)$/i, key: 'deliverables' },
    { pattern: /risks?\s*notes?\s*(?:to|=|:)?\s*(.+)$/i, key: 'risksNotes' },
  ];

  for (const item of mapping) {
    const match = line.match(item.pattern);
    if (match?.[1]) {
      (updated[item.key] as string) = match[1].trim();
    }
  }

  if (lower.includes('urgent') && !priorityMatch) {
    updated.priority = 'URGENT';
  }

  return updated;
};

const parseCustomFieldFromLine = (line: string): { label: string; value: string } | null => {
  const explicit = line.match(/(?:add|create)\s+field\s+["']?([^:"']+)["']?\s*[:=]\s*(.+)$/i);
  if (explicit) {
    return { label: explicit[1].trim(), value: explicit[2].trim() };
  }

  // Match "set/change/update X to Y"
  const setPattern = line.match(/(?:set|change|update|make|put)\s+(?:the\s+)?(?:number\s+of\s+)?([a-zA-Z][a-zA-Z\s-]{1,50}?)\s+(?:to|=|as)\s+([^,;\n]+)/i);
  if (setPattern) {
    const label = setPattern[1].trim();
    const value = setPattern[2].trim();
    const known = ['project name', 'client', 'location', 'site address', 'project type', 'service category', 'contact person', 'contact phone', 'team size', 'duration', 'duration weeks', 'progress', 'budget', 'budget estimate', 'start date', 'due date', 'priority', 'status', 'scope summary', 'deliverables', 'risks notes', 'name', 'phone'];
    if (!known.includes(normalizeLabel(label))) {
      return { label, value };
    }
  }

  const kv = line.match(/^([^:]{2,40}):\s*(.+)$/);
  if (kv) {
    const label = kv[1].trim();
    const value = kv[2].trim();
    const known = ['project name', 'client', 'location', 'site address', 'project type', 'service category', 'contact person', 'contact phone', 'team size', 'duration', 'duration weeks', 'progress', 'budget', 'budget estimate', 'start date', 'due date', 'priority', 'status', 'scope summary', 'deliverables', 'risks notes'];
    if (!known.includes(normalizeLabel(label))) {
      return { label, value };
    }
  }

  return null;
};

export const applyProjectPromptUpdates = async (input: {
  project: EngineerProject;
  prompt: string;
}): Promise<Omit<EngineerProject, 'id'>> => {
  const base = normalizeDraft(input.project, createEmptyProjectDraft());
  // Split by newlines, semicolons, commas, and "and"
  const lines = input.prompt
    .split(/[\n;,]|\s+and\s+/)
    .map((line) => line.trim())
    .filter(Boolean);

  let updated = { ...base };
  let customFields = [...base.customFields];

  for (const line of lines) {
    updated = applyKnownFieldLine(line, updated);
    const custom = parseCustomFieldFromLine(line);
    if (custom) {
      customFields = upsertCustomField(customFields, custom.label, custom.value);
    }
  }

  updated.customFields = customFields;
  return normalizeDraft(updated, base);
};
