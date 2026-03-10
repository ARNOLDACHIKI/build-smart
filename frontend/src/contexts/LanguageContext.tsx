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
  'nav.services': { en: 'Services', sw: 'Huduma' },
  'nav.search': { en: 'Find Professionals', sw: 'Tafuta Wataalamu' },

  // Hero / Welcome
  'hero.greeting': { en: 'How may we help you today?', sw: 'Tunaweza kukusaidia vipi leo?' },
  'hero.title': { en: 'Informing the Construction Market.', sw: 'Kufahamisha Soko la Ujenzi.' },
  'hero.titleHighlight': { en: 'Shaping the Future.', sw: 'Kuunda Mustakabali.' },
  'hero.subtitle': { en: 'Access updated construction sector data to enable, incentivise, and take action. End-to-end solutions for transparent, time-saving and valuable construction projects.', sw: 'Pata data ya kisasa ya sekta ya ujenzi ili kuwezesha, kuhimiza, na kuchukua hatua. Suluhisho kamili kwa miradi ya ujenzi yenye uwazi, kuokoa muda na thamani.' },
  'hero.cta': { en: 'Start Free Trial', sw: 'Anza Jaribio Bure' },
  'hero.learnMore': { en: 'Learn More', sw: 'Jifunze Zaidi' },
  'hero.stats.projects': { en: 'Projects Managed', sw: 'Miradi Iliyosimamiwa' },
  'hero.stats.saved': { en: 'Cost Savings', sw: 'Akiba ya Gharama' },
  'hero.stats.users': { en: 'Active Users', sw: 'Watumiaji Hai' },
  'hero.searchPlaceholder': { en: 'Search for engineers, contractors, architects in Kenya...', sw: 'Tafuta wahandisi, wakandarasi, wasanifu majengo nchini Kenya...' },
  'hero.explore': { en: 'Explore Our Platform', sw: 'Chunguza Jukwaa Letu' },
  'hero.step1': { en: 'Search for professionals', sw: 'Tafuta wataalamu' },
  'hero.step2': { en: 'View portfolios & reviews', sw: 'Tazama kazi & maoni' },
  'hero.step3': { en: 'Connect & collaborate', sw: 'Unganisha & shirikiana' },
  'hero.step4': { en: 'Track project progress', sw: 'Fuatilia maendeleo ya mradi' },

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
  'features.professionalDirectory': { en: 'Professional Directory', sw: 'Orodha ya Wataalamu' },
  'features.professionalDirectoryDesc': { en: 'Find engineers, architects, contractors and suppliers across Kenya', sw: 'Tafuta wahandisi, wasanifu, wakandarasi na wasambazaji kote Kenya' },
  'features.creditScore': { en: 'Credit Score System', sw: 'Mfumo wa Alama za Mikopo' },
  'features.creditScoreDesc': { en: 'Earn credits for activity, get 6 months free and unlock premium features', sw: 'Pata alama kwa shughuli, pata miezi 6 bure na fungua vipengele vya ziada' },

  // How it works
  'howItWorks.title': { en: 'How It Works', sw: 'Jinsi Inavyofanya Kazi' },
  'howItWorks.step1Title': { en: 'Create Your Account', sw: 'Fungua Akaunti Yako' },
  'howItWorks.step1Desc': { en: 'Sign up and set up your company profile in minutes', sw: 'Jisajili na weka wasifu wa kampuni yako kwa dakika' },
  'howItWorks.step2Title': { en: 'Add Your Projects', sw: 'Ongeza Miradi Yako' },
  'howItWorks.step2Desc': { en: 'Import or create projects with budgets, timelines and teams', sw: 'Ingiza au tengeneza miradi na bajeti, ratiba na timu' },
  'howItWorks.step3Title': { en: 'Get Smart Insights', sw: 'Pata Ufahamu wa Akili' },
  'howItWorks.step3Desc': { en: 'AI analyzes your data and delivers actionable recommendations', sw: 'AI inachambua data yako na kutoa mapendekezo' },

  // Pricing - ICDBO packages
  'pricing.title': { en: 'Simple Pricing', sw: 'Bei Rahisi' },
  'pricing.subtitle': { en: 'Annual subscription with a 3-month free trial', sw: 'Usajili wa mwaka na jaribio la bure la miezi 3' },
  'pricing.student': { en: 'Student', sw: 'Mwanafunzi' },
  'pricing.basic': { en: 'Basic', sw: 'Msingi' },
  'pricing.professional': { en: 'Professional', sw: 'Mtaalamu' },
  'pricing.enterprise': { en: 'Enterprise', sw: 'Biashara' },
  'pricing.year': { en: '/year', sw: '/mwaka' },
  'pricing.getStarted': { en: 'Get Started', sw: 'Anza' },
  'pricing.contactSales': { en: 'Contact Sales', sw: 'Wasiliana na Mauzo' },
  'pricing.free3months': { en: '3-month free trial included', sw: 'Jaribio la miezi 3 bure limejumuishwa' },
  'pricing.credits6months': { en: '+ 6 months bonus credits', sw: '+ Miezi 6 ya alama za bonasi' },

  // Testimonials
  'testimonials.title': { en: 'Trusted by Builders', sw: 'Kuaminiwa na Wajenzi' },

  // Footer
  'footer.description': { en: 'Informing the construction market. Shaping the future. User-centric end-to-end solutions for the construction industry.', sw: 'Kufahamisha soko la ujenzi. Kuunda mustakabali. Suluhisho kamili zinazolenga watumiaji kwa sekta ya ujenzi.' },
  'footer.product': { en: 'Product', sw: 'Bidhaa' },
  'footer.company': { en: 'Company', sw: 'Kampuni' },
  'footer.support': { en: 'Support', sw: 'Msaada' },
  'footer.rights': { en: '© 2026 ICDBO Data Analytics. All rights reserved.', sw: '© 2026 ICDBO Data Analytics. Haki zote zimehifadhiwa.' },
  'footer.tagline': { en: 'ACCESS. INCENTIVISE. ACTION.', sw: 'FIKIA. HIMIZA. TENDA.' },

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
  'auth.developer': { en: 'Developer', sw: 'Msanidi' },
  'auth.financier': { en: 'Financier', sw: 'Mfadhili' },
  'auth.supplier': { en: 'Supplier', sw: 'Msambazaji' },
  'auth.consultant': { en: 'Consultant', sw: 'Mshauri' },
  'auth.tenant': { en: 'Tenant', sw: 'Mpangaji' },
  'auth.regulator': { en: 'Regulator', sw: 'Mdhibiti' },
  'auth.realEstate': { en: 'Real Estate', sw: 'Mali Isiyohamishika' },

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
  'sidebar.search': { en: 'Find Professionals', sw: 'Tafuta Wataalamu' },
  'sidebar.credits': { en: 'Credits', sw: 'Alama' },
  'sidebar.journey': { en: 'Journey Map', sw: 'Ramani ya Safari' },

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
  'dashboard.creditScore': { en: 'Credit Score', sw: 'Alama za Mikopo' },

  // Projects
  'projects.title': { en: 'Projects', sw: 'Miradi' },
  'projects.newProject': { en: 'New Project', sw: 'Mradi Mpya' },
  'projects.status': { en: 'Status', sw: 'Hali' },
  'projects.budget': { en: 'Budget', sw: 'Bajeti' },
  'projects.deadline': { en: 'Deadline', sw: 'Tarehe ya Mwisho' },
  'projects.progress': { en: 'Progress', sw: 'Maendeleo' },

  // Search
  'search.title': { en: 'Find Construction Professionals', sw: 'Tafuta Wataalamu wa Ujenzi' },
  'search.subtitle': { en: 'Search for engineers, architects, contractors and suppliers across Kenya', sw: 'Tafuta wahandisi, wasanifu, wakandarasi na wasambazaji kote Kenya' },
  'search.results': { en: 'Results', sw: 'Matokeo' },
  'search.viewProfile': { en: 'View Profile', sw: 'Tazama Wasifu' },
  'search.contact': { en: 'Contact', sw: 'Wasiliana' },

  // Credits
  'credits.title': { en: 'Credit Score', sw: 'Alama za Mikopo' },
  'credits.earned': { en: 'Credits Earned', sw: 'Alama Zilizopatikana' },
  'credits.remaining': { en: 'Credits Remaining', sw: 'Alama Zilizobaki' },
  'credits.freeTrial': { en: '6-Month Bonus Active', sw: 'Bonasi ya Miezi 6 Hai' },

  // Customer Journey
  'journey.title': { en: 'Your Journey', sw: 'Safari Yako' },
  'journey.discovery': { en: 'Discovery', sw: 'Ugunduzi' },
  'journey.onboarding': { en: 'Onboarding', sw: 'Kujiandikisha' },
  'journey.engagement': { en: 'Engagement', sw: 'Ushiriki' },
  'journey.retention': { en: 'Retention', sw: 'Uhifadhi' },

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
  'common.language': { en: 'Language', sw: 'Lugha' },
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
