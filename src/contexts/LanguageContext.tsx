import React, { createContext, useContext, useState, useCallback } from 'react';

type Language = 'en' | 'sw';

interface Translations {
  [key: string]: { en: string; sw: string };
}

const translations: Translations = {
  // Navbar
  'nav.features': { en: 'Features', sw: 'Vipengele' },
  'nav.pricing': { en: 'Pricing', sw: 'Bei' },
  'nav.about': { en: 'About', sw: 'Kuhusu' },
  'nav.login': { en: 'Login', sw: 'Ingia' },
  'nav.signup': { en: 'Sign Up', sw: 'Jisajili' },
  'nav.bookDemo': { en: 'Book Demo', sw: 'Omba Demo' },

  // Hero
  'hero.title': { en: 'Build Smarter.', sw: 'Jenga kwa Akili.' },
  'hero.titleHighlight': { en: 'Manage Better.', sw: 'Simamia Vizuri.' },
  'hero.subtitle': { en: 'AI-powered construction management platform built for Kenya. Track projects, predict risks, and optimize resources with intelligent insights.', sw: 'Jukwaa la usimamizi wa ujenzi linalotumia AI lililojengwa kwa Kenya. Fuatilia miradi, tabiri hatari, na boresha rasilimali kwa ufahamu wa akili.' },
  'hero.cta': { en: 'Start Free Trial', sw: 'Anza Jaribio Bure' },
  'hero.learnMore': { en: 'Learn More', sw: 'Jifunze Zaidi' },
  'hero.stats.projects': { en: 'Projects Managed', sw: 'Miradi Iliyosimamiwa' },
  'hero.stats.saved': { en: 'Cost Savings', sw: 'Akiba ya Gharama' },
  'hero.stats.users': { en: 'Active Users', sw: 'Watumiaji Hai' },

  // Features
  'features.title': { en: 'Powerful Features', sw: 'Vipengele Vyenye Nguvu' },
  'features.subtitle': { en: 'Everything you need to manage construction projects efficiently', sw: 'Kila kitu unachohitaji kusimamia miradi ya ujenzi kwa ufanisi' },
  'features.projectTracking': { en: 'Project Tracking', sw: 'Ufuatiliaji wa Miradi' },
  'features.projectTrackingDesc': { en: 'Real-time monitoring of all your construction projects with visual progress indicators', sw: 'Ufuatiliaji wa wakati halisi wa miradi yako yote ya ujenzi' },
  'features.aiInsights': { en: 'AI Insights', sw: 'Ufahamu wa AI' },
  'features.aiInsightsDesc': { en: 'Predictive analytics for cost overruns, delays, and risk assessment', sw: 'Uchambuzi wa kitabiri kwa gharama, ucheleweshaji, na tathmini ya hatari' },
  'features.budgetMgmt': { en: 'Budget Management', sw: 'Usimamizi wa Bajeti' },
  'features.budgetMgmtDesc': { en: 'Track budgets, cash flow, and get alerts on cost deviations instantly', sw: 'Fuatilia bajeti, mtiririko wa fedha, na pata tahadhari' },
  'features.teamCollab': { en: 'Team Collaboration', sw: 'Ushirikiano wa Timu' },
  'features.teamCollabDesc': { en: 'Assign tasks, share documents, and communicate across your team', sw: 'Gawa kazi, shiriki hati, na wasiliana na timu yako' },
  'features.docMgmt': { en: 'Document Management', sw: 'Usimamizi wa Hati' },
  'features.docMgmtDesc': { en: 'Centralized file storage with version control and easy sharing', sw: 'Hifadhi ya faili kuu na udhibiti wa toleo' },
  'features.reporting': { en: 'Smart Reports', sw: 'Ripoti za Akili' },
  'features.reportingDesc': { en: 'Generate compliance, financial, and timeline reports automatically', sw: 'Tengeneza ripoti za ufuasi, fedha, na ratiba kiotomatiki' },

  // How it works
  'howItWorks.title': { en: 'How It Works', sw: 'Jinsi Inavyofanya Kazi' },
  'howItWorks.step1Title': { en: 'Create Your Account', sw: 'Fungua Akaunti Yako' },
  'howItWorks.step1Desc': { en: 'Sign up and set up your company profile in minutes', sw: 'Jisajili na weka wasifu wa kampuni yako kwa dakika' },
  'howItWorks.step2Title': { en: 'Add Your Projects', sw: 'Ongeza Miradi Yako' },
  'howItWorks.step2Desc': { en: 'Import or create projects with budgets, timelines and teams', sw: 'Ingiza au tengeneza miradi na bajeti, ratiba na timu' },
  'howItWorks.step3Title': { en: 'Get Smart Insights', sw: 'Pata Ufahamu wa Akili' },
  'howItWorks.step3Desc': { en: 'AI analyzes your data and delivers actionable recommendations', sw: 'AI inachambua data yako na kutoa mapendekezo' },

  // Pricing
  'pricing.title': { en: 'Simple Pricing', sw: 'Bei Rahisi' },
  'pricing.subtitle': { en: 'Choose the plan that fits your needs', sw: 'Chagua mpango unaofaa mahitaji yako' },
  'pricing.free': { en: 'Free', sw: 'Bure' },
  'pricing.pro': { en: 'Pro', sw: 'Pro' },
  'pricing.enterprise': { en: 'Enterprise', sw: 'Biashara' },
  'pricing.month': { en: '/month', sw: '/mwezi' },
  'pricing.getStarted': { en: 'Get Started', sw: 'Anza' },
  'pricing.contactSales': { en: 'Contact Sales', sw: 'Wasiliana na Mauzo' },

  // Testimonials
  'testimonials.title': { en: 'Trusted by Builders', sw: 'Kuaminiwa na Wajenzi' },

  // Footer
  'footer.description': { en: 'AI-powered construction management for the future of building in Kenya.', sw: 'Usimamizi wa ujenzi unaotumia AI kwa mustakabali wa ujenzi nchini Kenya.' },
  'footer.product': { en: 'Product', sw: 'Bidhaa' },
  'footer.company': { en: 'Company', sw: 'Kampuni' },
  'footer.support': { en: 'Support', sw: 'Msaada' },
  'footer.rights': { en: '© 2026 BuildSmart Kenya. All rights reserved.', sw: '© 2026 BuildSmart Kenya. Haki zote zimehifadhiwa.' },

  // Auth
  'auth.email': { en: 'Email', sw: 'Barua pepe' },
  'auth.password': { en: 'Password', sw: 'Nywila' },
  'auth.confirmPassword': { en: 'Confirm Password', sw: 'Thibitisha Nywila' },
  'auth.fullName': { en: 'Full Name', sw: 'Jina Kamili' },
  'auth.companyName': { en: 'Company Name', sw: 'Jina la Kampuni' },
  'auth.role': { en: 'Role', sw: 'Jukumu' },
  'auth.rememberMe': { en: 'Remember me', sw: 'Nikumbuke' },
  'auth.forgotPassword': { en: 'Forgot Password?', sw: 'Umesahau Nywila?' },
  'auth.loginInstead': { en: 'Already have an account? Login', sw: 'Una akaunti tayari? Ingia' },
  'auth.signupInstead': { en: "Don't have an account? Sign Up", sw: 'Huna akaunti? Jisajili' },
  'auth.createAccount': { en: 'Create Account', sw: 'Fungua Akaunti' },
  'auth.loginWithGoogle': { en: 'Continue with Google', sw: 'Endelea na Google' },
  'auth.contractor': { en: 'Contractor', sw: 'Mkandarasi' },
  'auth.engineer': { en: 'Engineer', sw: 'Mhandisi' },
  'auth.architect': { en: 'Architect', sw: 'Mbunifu' },
  'auth.projectManager': { en: 'Project Manager', sw: 'Meneja wa Mradi' },

  // Dashboard sidebar
  'sidebar.dashboard': { en: 'Dashboard', sw: 'Dashibodi' },
  'sidebar.projects': { en: 'Projects', sw: 'Miradi' },
  'sidebar.analytics': { en: 'Analytics', sw: 'Uchambuzi' },
  'sidebar.reports': { en: 'Reports', sw: 'Ripoti' },
  'sidebar.tasks': { en: 'Tasks', sw: 'Kazi' },
  'sidebar.documents': { en: 'Documents', sw: 'Hati' },
  'sidebar.team': { en: 'Team', sw: 'Timu' },
  'sidebar.notifications': { en: 'Notifications', sw: 'Arifa' },
  'sidebar.settings': { en: 'Settings', sw: 'Mipangilio' },
  'sidebar.support': { en: 'Support', sw: 'Msaada' },

  // Dashboard
  'dashboard.welcome': { en: 'Welcome back', sw: 'Karibu tena' },
  'dashboard.activeProjects': { en: 'Active Projects', sw: 'Miradi Hai' },
  'dashboard.budgetUsage': { en: 'Budget Usage', sw: 'Matumizi ya Bajeti' },
  'dashboard.tasksDue': { en: 'Tasks Due', sw: 'Kazi Zinazotarajiwa' },
  'dashboard.riskAlerts': { en: 'Risk Alerts', sw: 'Tahadhari za Hatari' },
  'dashboard.createProject': { en: 'Create Project', sw: 'Tengeneza Mradi' },
  'dashboard.viewAnalytics': { en: 'View Analytics', sw: 'Tazama Uchambuzi' },
  'dashboard.generateReport': { en: 'Generate Report', sw: 'Tengeneza Ripoti' },
  'dashboard.aiInsights': { en: 'AI Insights', sw: 'Ufahamu wa AI' },
  'dashboard.recentActivity': { en: 'Recent Activity', sw: 'Shughuli za Hivi Karibuni' },

  // Projects
  'projects.title': { en: 'Projects', sw: 'Miradi' },
  'projects.newProject': { en: 'New Project', sw: 'Mradi Mpya' },
  'projects.status': { en: 'Status', sw: 'Hali' },
  'projects.budget': { en: 'Budget', sw: 'Bajeti' },
  'projects.deadline': { en: 'Deadline', sw: 'Tarehe ya Mwisho' },
  'projects.progress': { en: 'Progress', sw: 'Maendeleo' },

  // Common
  'common.search': { en: 'Search...', sw: 'Tafuta...' },
  'common.filter': { en: 'Filter', sw: 'Chuja' },
  'common.export': { en: 'Export', sw: 'Hamisha' },
  'common.save': { en: 'Save', sw: 'Hifadhi' },
  'common.cancel': { en: 'Cancel', sw: 'Ghairi' },
  'common.delete': { en: 'Delete', sw: 'Futa' },
  'common.edit': { en: 'Edit', sw: 'Hariri' },
  'common.add': { en: 'Add', sw: 'Ongeza' },
  'common.view': { en: 'View', sw: 'Tazama' },
  'common.back': { en: 'Back', sw: 'Rudi' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = useCallback((key: string): string => {
    const translation = translations[key];
    if (!translation) return key;
    return translation[language] || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
