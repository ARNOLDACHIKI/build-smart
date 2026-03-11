export type AppRole =
  | 'USER'
  | 'ADMIN'
  | 'ENGINEER'
  | 'LABOURER'
  | 'CEMENT_SUPPLIER'
  | 'GENERAL_SUPPLIER'
  | 'DEVELOPER'
  | 'FINANCIER'
  | 'CONTRACTOR'
  | 'REAL_ESTATE'
  | 'CONSULTANT'
  | 'TENANT'
  | 'PROJECT_MANAGER'
  | 'REGULATOR'
  | 'LOCAL_STAKEHOLDER';

export const REGISTERABLE_ROLES: Array<{ value: AppRole; label: string; description: string }> = [
  { value: 'USER', label: 'Normal User', description: 'Track projects, analytics, reports and collaboration.' },
  { value: 'ENGINEER', label: 'Engineer', description: 'Manage technical delivery, inquiries, projects and portfolio.' },
  { value: 'LABOURER', label: 'Labourer', description: 'Track assignments, attendance, safety and site output.' },
  { value: 'CEMENT_SUPPLIER', label: 'Cement Supplier', description: 'Manage orders, deliveries, stock and contractor requests.' },
  { value: 'GENERAL_SUPPLIER', label: 'General Supplier', description: 'Handle samples, procurement requests and supply coordination.' },
  { value: 'DEVELOPER', label: 'Developer', description: 'Coordinate funding, feasibility, delivery teams and ROI tracking.' },
  { value: 'FINANCIER', label: 'Financier', description: 'Review pipeline quality, risk, ROI and financing requests.' },
  { value: 'CONTRACTOR', label: 'Contractor', description: 'Manage crews, procurement, site delivery and milestones.' },
  { value: 'REAL_ESTATE', label: 'Real Estate', description: 'Track demand insights, tenant fit and neighborhood opportunities.' },
  { value: 'CONSULTANT', label: 'Consultant', description: 'Deliver expert reviews, advisory tasks and technical correspondence.' },
  { value: 'TENANT', label: 'Tenant', description: 'Share preferences, monitor delivery quality and occupancy readiness.' },
  { value: 'PROJECT_MANAGER', label: 'Project Manager', description: 'Coordinate schedule, risks, approvals and team performance.' },
  { value: 'REGULATOR', label: 'Regulator', description: 'Monitor compliance, approvals and sector oversight workflows.' },
  { value: 'LOCAL_STAKEHOLDER', label: 'Local Stakeholder', description: 'Surface local feedback, utilities and community impact.' },
];

export const SPECIALIZED_PORTAL_ROLES: AppRole[] = [
  'LABOURER',
  'CEMENT_SUPPLIER',
  'GENERAL_SUPPLIER',
  'DEVELOPER',
  'FINANCIER',
  'CONTRACTOR',
  'REAL_ESTATE',
  'CONSULTANT',
  'TENANT',
  'PROJECT_MANAGER',
  'REGULATOR',
  'LOCAL_STAKEHOLDER',
];

export const isSpecializedPortalRole = (role?: AppRole | null): role is AppRole => {
  return Boolean(role && SPECIALIZED_PORTAL_ROLES.includes(role));
};

export const resolveHomeRoute = (role?: AppRole | null): string => {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'ENGINEER':
      return '/engineer';
    case 'LABOURER':
    case 'CEMENT_SUPPLIER':
    case 'GENERAL_SUPPLIER':
    case 'DEVELOPER':
    case 'FINANCIER':
    case 'CONTRACTOR':
    case 'REAL_ESTATE':
    case 'CONSULTANT':
    case 'TENANT':
    case 'PROJECT_MANAGER':
    case 'REGULATOR':
    case 'LOCAL_STAKEHOLDER':
      return '/portal';
    case 'USER':
    default:
      return '/dashboard';
  }
};

export type RolePortalConfig = {
  title: string;
  subtitle: string;
  primaryMetric: string;
  secondaryMetric: string;
  portfolioTitle: string;
  portfolioItems: string[];
  tasks: string[];
  marketplaceFocus: string[];
  networkFocus: string[];
};

export const ROLE_PORTAL_CONFIG: Record<AppRole, RolePortalConfig> = {
  USER: {
    title: 'User Workspace',
    subtitle: 'General user overview for construction intelligence and collaboration.',
    primaryMetric: '4 active projects',
    secondaryMetric: '12 AI insights this month',
    portfolioTitle: 'Client priorities',
    portfolioItems: ['Project briefs', 'Budget snapshots', 'Stakeholder follow-ups'],
    tasks: ['Review dashboard updates', 'Track project risks', 'Share decisions with team'],
    marketplaceFocus: ['Consultants', 'Contractors', 'Suppliers'],
    networkFocus: ['Project team', 'Service providers', 'Community contacts'],
  },
  ADMIN: {
    title: 'Admin Workspace',
    subtitle: 'Platform operations and governance overview.',
    primaryMetric: 'System oversight',
    secondaryMetric: 'Platform governance',
    portfolioTitle: 'Admin controls',
    portfolioItems: ['User management', 'Audit logs', 'Configuration'],
    tasks: ['Review system activity', 'Moderate content', 'Support operations'],
    marketplaceFocus: ['All platform actors'],
    networkFocus: ['Admins', 'Support', 'Operations'],
  },
  ENGINEER: {
    title: 'Engineer Workspace',
    subtitle: 'Technical project delivery and client inquiry management.',
    primaryMetric: '6 active assignments',
    secondaryMetric: '3 new inquiries',
    portfolioTitle: 'Engineering portfolio',
    portfolioItems: ['Design packages', 'Technical reports', 'Inspection history'],
    tasks: ['Answer inquiries', 'Update project data', 'Review site risks'],
    marketplaceFocus: ['Developers', 'Contractors', 'Suppliers'],
    networkFocus: ['Clients', 'Consultants', 'Site teams'],
  },
  LABOURER: {
    title: 'Labourer Portal',
    subtitle: 'Daily assignments, site attendance and safety-first task tracking.',
    primaryMetric: '5 site tasks today',
    secondaryMetric: '98% attendance compliance',
    portfolioTitle: 'Work history',
    portfolioItems: ['Completed shifts', 'Safety certifications', 'Site skill records'],
    tasks: ['Check in to site', 'Complete assigned shift tasks', 'Report safety concerns'],
    marketplaceFocus: ['Site manpower requests', 'Short-term assignments', 'Safety gear suppliers'],
    networkFocus: ['Site supervisors', 'Contractors', 'Crew leads'],
  },
  CEMENT_SUPPLIER: {
    title: 'Cement Supplier Portal',
    subtitle: 'Manage cement orders, dispatches and demand forecasting.',
    primaryMetric: '18 active orders',
    secondaryMetric: '92% on-time dispatch rate',
    portfolioTitle: 'Supply portfolio',
    portfolioItems: ['Brand catalog', 'Approved sample logs', 'Delivery coverage zones'],
    tasks: ['Confirm bulk orders', 'Track dispatch trucks', 'Share approved sample availability'],
    marketplaceFocus: ['Bulk cement orders', 'Sample approvals', 'Distributor demand'],
    networkFocus: ['Contractors', 'Developers', 'Procurement teams'],
  },
  GENERAL_SUPPLIER: {
    title: 'General Supplier Portal',
    subtitle: 'Coordinate product catalogs, approvals and procurement requests.',
    primaryMetric: '27 live RFQs',
    secondaryMetric: '14 sample approvals',
    portfolioTitle: 'Supply capabilities',
    portfolioItems: ['Product lines', 'Lead-time commitments', 'Past delivery performance'],
    tasks: ['Respond to RFQs', 'Update stock status', 'Coordinate material samples'],
    marketplaceFocus: ['Procurement requests', 'Material catalogs', 'Logistics partners'],
    networkFocus: ['Developers', 'Engineers', 'Contractors'],
  },
  DEVELOPER: {
    title: 'Developer Portal',
    subtitle: 'Drive feasibility, financing readiness and delivery coordination.',
    primaryMetric: 'KES 480M pipeline',
    secondaryMetric: '3 sites under review',
    portfolioTitle: 'Development portfolio',
    portfolioItems: ['Feasibility studies', 'ROI models', 'Active development briefs'],
    tasks: ['Review project viability', 'Coordinate consultants', 'Match product-market demand'],
    marketplaceFocus: ['Financiers', 'Contractors', 'Real estate demand'],
    networkFocus: ['Financiers', 'Consultants', 'Local stakeholders'],
  },
  FINANCIER: {
    title: 'Financier Portal',
    subtitle: 'Assess project bankability, risk exposure and investment readiness.',
    primaryMetric: '12 funding opportunities',
    secondaryMetric: '7 projects in risk review',
    portfolioTitle: 'Funding portfolio',
    portfolioItems: ['Approved deals', 'Risk scoring notes', 'Projected ROI watchlist'],
    tasks: ['Assess credit readiness', 'Review developer submissions', 'Monitor repayment risk'],
    marketplaceFocus: ['Bankable projects', 'Insurance insights', 'Collateral signals'],
    networkFocus: ['Developers', 'Project managers', 'Regulators'],
  },
  CONTRACTOR: {
    title: 'Contractor Portal',
    subtitle: 'Coordinate execution teams, procurement and delivery milestones.',
    primaryMetric: '9 crews assigned',
    secondaryMetric: '4 procurement blockers',
    portfolioTitle: 'Delivery portfolio',
    portfolioItems: ['Completed jobs', 'Crew capacity', 'On-site performance summaries'],
    tasks: ['Track milestones', 'Assign crews', 'Resolve material delays'],
    marketplaceFocus: ['Materials', 'Subcontractors', 'Equipment hire'],
    networkFocus: ['Developers', 'Suppliers', 'Labour teams'],
  },
  REAL_ESTATE: {
    title: 'Real Estate Portal',
    subtitle: 'Understand tenant demand, location insights and property fit.',
    primaryMetric: '22 demand signals',
    secondaryMetric: '6 neighborhoods trending',
    portfolioTitle: 'Market portfolio',
    portfolioItems: ['Tenant personas', 'Neighborhood snapshots', 'Comparable developments'],
    tasks: ['Track tenant preferences', 'Assess location fit', 'Share occupancy insights'],
    marketplaceFocus: ['Demand heatmaps', 'Property opportunities', 'Tenant preference data'],
    networkFocus: ['Tenants', 'Developers', 'Property managers'],
  },
  CONSULTANT: {
    title: 'Consultant Portal',
    subtitle: 'Deliver expert advice, reviews and project support engagements.',
    primaryMetric: '11 advisory requests',
    secondaryMetric: '5 technical reviews due',
    portfolioTitle: 'Consulting portfolio',
    portfolioItems: ['Case studies', 'Professional credentials', 'Advisory specialties'],
    tasks: ['Respond to support requests', 'Issue recommendations', 'Review project submissions'],
    marketplaceFocus: ['Advisory engagements', 'Technical reviews', 'Specialized support'],
    networkFocus: ['Developers', 'Financiers', 'Engineers'],
  },
  TENANT: {
    title: 'Tenant Portal',
    subtitle: 'Voice preferences, occupancy needs and end-user expectations.',
    primaryMetric: '8 preference surveys',
    secondaryMetric: '3 occupancy readiness updates',
    portfolioTitle: 'Tenant preference profile',
    portfolioItems: ['Space requirements', 'Amenity preferences', 'Move-in feedback'],
    tasks: ['Submit space preferences', 'Review design fit', 'Share occupancy feedback'],
    marketplaceFocus: ['Space options', 'Amenity comparison', 'Occupancy readiness'],
    networkFocus: ['Developers', 'Real estate teams', 'Local stakeholders'],
  },
  PROJECT_MANAGER: {
    title: 'Project Manager Portal',
    subtitle: 'Control scope, schedule, approvals and cross-team delivery.',
    primaryMetric: '14 milestones tracked',
    secondaryMetric: '5 active risk flags',
    portfolioTitle: 'Management portfolio',
    portfolioItems: ['Delivery plans', 'Risk registers', 'Stakeholder communication logs'],
    tasks: ['Review critical path', 'Escalate blockers', 'Coordinate stakeholder updates'],
    marketplaceFocus: ['Support consultants', 'Procurement partners', 'Compliance services'],
    networkFocus: ['Developers', 'Contractors', 'Regulators'],
  },
  REGULATOR: {
    title: 'Regulator Portal',
    subtitle: 'Review compliance, monitor approvals and oversee standards adoption.',
    primaryMetric: '19 compliance reviews',
    secondaryMetric: '4 pending approvals',
    portfolioTitle: 'Oversight portfolio',
    portfolioItems: ['Inspection logs', 'Compliance notices', 'Approval workflows'],
    tasks: ['Review submitted compliance docs', 'Track approval timelines', 'Issue oversight notes'],
    marketplaceFocus: ['Compliance filings', 'Inspection requests', 'Policy updates'],
    networkFocus: ['Developers', 'Project managers', 'Local stakeholders'],
  },
  LOCAL_STAKEHOLDER: {
    title: 'Local Stakeholder Portal',
    subtitle: 'Share community impact data, utilities feedback and localized insights.',
    primaryMetric: '16 community insights logged',
    secondaryMetric: '9 utility concerns tracked',
    portfolioTitle: 'Community portfolio',
    portfolioItems: ['Local feedback', 'Utility observations', 'Community engagement notes'],
    tasks: ['Report local concerns', 'Review project impact', 'Suggest mitigation actions'],
    marketplaceFocus: ['Impact discussions', 'Waste reuse opportunities', 'Utility coordination'],
    networkFocus: ['Residents', 'Regulators', 'Developers'],
  },
};

export const getRoleLabel = (role?: AppRole | null): string => {
  if (!role) return 'User';
  const item = REGISTERABLE_ROLES.find((entry) => entry.value === role);
  if (item) return item.label;
  return role.replace(/_/g, ' ');
};
