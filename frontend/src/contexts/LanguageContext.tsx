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
  'nav.skipLogin': { en: 'Skip Login', sw: 'Ruka Kuingia' },
  'nav.skipLoginHint': { en: 'Skip Login lets you browse as a free user.', sw: 'Ruka Kuingia hukuruhusu kuvinjari kama mtumiaji wa bure.' },
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
  'hero.stats.projects': { en: 'Inquiries placed', sw: 'Maombi yaliyowekwa' },
  'hero.stats.saved': { en: 'Matched inquiries', sw: 'Maombi yaliyolinganishwa' },
  'hero.stats.users': { en: 'Active Users', sw: 'Watumiaji Hai' },
  'hero.searchPlaceholder': { en: 'Initiate your query', sw: 'Anzisha swali lako' },
  'hero.explore': { en: 'Explore the Request Journey', sw: 'Chunguza Safari ya Maombi' },
  'hero.initiateRequest': { en: 'Initiate Request', sw: 'Anzisha Ombi' },
  'hero.step1': { en: 'Explore', sw: 'Chunguza' },
  'hero.step2': { en: 'Place a request', sw: 'Weka ombi' },
  'hero.step3': { en: 'Confirm request matched', sw: 'Thibitisha ombi limelinganishwa' },
  'hero.step4': { en: 'Track smart insights', sw: 'Fuatilia maarifa mahiri' },

  // Features
  'features.title': { en: 'Powerful Features', sw: 'Vipengele Vyenye Nguvu' },
  'features.subtitle': { en: 'Individualised tools to help you plan, deliver, and grow every construction project', sw: 'Zana zilizobinafsishwa kukusaidia kupanga, kutekeleza na kukuza kila mradi wa ujenzi' },
  'features.realTimeInsights': { en: 'Real time insights', sw: 'Maarifa ya wakati halisi' },
  'features.realTimeInsightsDesc': { en: 'Live dashboards and predictive analytics for costs, schedules, and project risks', sw: 'Dashibodi za moja kwa moja na uchambuzi wa kitabiri wa gharama, ratiba na hatari za mradi' },
  'features.projectManagementTools': { en: 'Project management tools', sw: 'Zana za usimamizi wa miradi' },
  'features.projectManagementToolsDesc': { en: 'Plan milestones, assign tasks, and monitor delivery in one centralized workspace', sw: 'Panga hatua muhimu, gawa kazi na fuatilia utekelezaji katika sehemu moja' },
  'features.collaborationNetworking': { en: 'Collaboration and networking', sw: 'Ushirikiano na mtandao wa kitaaluma' },
  'features.collaborationNetworkingDesc': { en: 'Connect teams, consultants, and suppliers with shared communication channels', sw: 'Unganisha timu, washauri na wasambazaji kupitia njia za mawasiliano ya pamoja' },
  'features.aiPoweredSearch': { en: 'AI powered search', sw: 'Utafutaji unaoendeshwa na AI' },
  'features.aiPoweredSearchDesc': { en: 'Get your request matched promptly with our AI assisting search from the curated portfolios', sw: 'Tafuta wataalamu sahihi haraka kwa vichujio mahiri, upangaji wa umuhimu na ulinganishaji wa majukumu' },
  'features.specialisedReminders': { en: 'Specialised reminders', sw: 'Vikumbusho maalum' },
  'features.specialisedRemindersDesc': { en: 'Receive tailored reminders for approvals, deadlines, inspections, and key follow-ups', sw: 'Pokea vikumbusho maalum vya idhini, tarehe za mwisho, ukaguzi na ufuatiliaji muhimu' },
  'features.curatedPortfolios': { en: 'Curated portfolios', sw: 'Wasifu wa kazi ulioratibiwa' },
  'features.curatedPortfoliosDesc': { en: 'Review trusted portfolios with verified experience, ratings, and completed projects', sw: 'Kagua wasifu wa kazi unaoaminika wenye uzoefu uliothibitishwa, tathmini na miradi iliyokamilika' },

  // How it works
  'howItWorks.title': { en: 'How It Works', sw: 'Jinsi Inavyofanya Kazi' },
  'howItWorks.step1Title': { en: 'Create Your Account', sw: 'Fungua Akaunti Yako' },
  'howItWorks.step1Desc': { en: 'Sign up and create your account in minutes.', sw: 'Jisajili na uunde akaunti yako kwa dakika chache.' },
  'howItWorks.step2Title': { en: 'Make Your Inquiry', sw: 'Weka Ombi Lako' },
  'howItWorks.step2Desc': { en: 'Submit your inquiry based on your exact requirement.', sw: 'Wasilisha ombi lako kulingana na hitaji lako halisi.' },
  'howItWorks.step3Title': { en: 'Get Your Request Matched', sw: 'Pata Ombi Lako Lilinganishwe' },
  'howItWorks.step3Desc': { en: 'Receive a confirmed match aligned with your request.', sw: 'Pokea ulinganishaji uliothibitishwa unaoendana na ombi lako.' },
  'howItWorks.step4Title': { en: 'Request Pairing', sw: 'Omba Kuunganishwa' },
  'howItWorks.step4Desc': { en: 'Proceed with pairing and begin collaboration immediately.', sw: 'Endelea na uunganishaji na anza kushirikiana mara moja.' },
  'howItWorks.step5Title': { en: 'Get Smart Insights', sw: 'Pata Maarifa Mahiri' },
  'howItWorks.step5Desc': { en: 'Get AI-powered insights that improve future request matching.', sw: 'Pata maarifa yanayoendeshwa na AI yanayoboresha ulinganishaji wa maombi yajayo.' },

  // Pricing - ICDBO packages
  'pricing.title': { en: 'Flexible Plans', sw: 'Mipango Inayonyumbulika' },
  'pricing.subtitle': { en: 'Choose a plan that fits your team and request volume.', sw: 'Chagua mpango unaolingana na timu yako na idadi ya maombi.' },
  'pricing.student': { en: 'Student', sw: 'Mwanafunzi' },
  'pricing.basic': { en: 'Basic', sw: 'Msingi' },
  'pricing.professional': { en: 'Professional', sw: 'Mtaalamu' },
  'pricing.enterprise': { en: 'Enterprise', sw: 'Biashara' },
  'pricing.year': { en: '/year', sw: '/mwaka' },
  'pricing.getStarted': { en: 'Start Plan', sw: 'Anza Mpango' },
  'pricing.contactSales': { en: 'Talk to Sales', sw: 'Ongea na Mauzo' },
  'pricing.free3months': { en: '3-month free trial included for all annual plans.', sw: 'Jaribio la bure la miezi 3 limejumuishwa kwa mipango yote ya mwaka.' },
  'pricing.credits6months': { en: '+ 6 months bonus credits included', sw: '+ Miezi 6 ya alama za bonasi imejumuishwa' },

  // Testimonials
  'testimonials.title': { en: 'Trusted by Builders', sw: 'Kuaminiwa na Wajenzi' },

  // Footer
  'footer.description': { en: 'Informing the construction market. Shaping the future. User-centric end-to-end solutions for the construction industry.', sw: 'Kufahamisha soko la ujenzi. Kuunda mustakabali. Suluhisho kamili zinazolenga watumiaji kwa sekta ya ujenzi.' },
  'footer.product': { en: 'Product', sw: 'Bidhaa' },
  'footer.company': { en: 'Company', sw: 'Kampuni' },
  'footer.support': { en: 'Support', sw: 'Msaada' },
  'footer.rights': { en: '© 2026 ICDBO Data Analytics. All rights reserved.', sw: '© 2026 ICDBO Data Analytics. Haki zote zimehifadhiwa.' },
  'footer.tagline': { en: 'INCENTIVISE. ENABLE. ACTION.', sw: 'FIKIA. HIMIZA. TENDA.' },

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
  'auth.skipLoginFree': { en: 'Skip Login (Free User)', sw: 'Ruka Kuingia (Mtumiaji Bure)' },
  'auth.loginOrSkipHint': { en: 'Login for full features, or skip login to browse professionals as a free user.', sw: 'Ingia kwa vipengele vyote, au ruka kuingia kuvinjari wataalamu kama mtumiaji wa bure.' },
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
  'sidebar.billing': { en: 'Billing', sw: 'Malipo' },
  'sidebar.community': { en: 'Community', sw: 'Jamii' },
  'sidebar.projects': { en: 'Projects', sw: 'Miradi' },
  'sidebar.analytics': { en: 'Analytics', sw: 'Uchambuzi' },
  'sidebar.reports': { en: 'Reports', sw: 'Ripoti' },
  'sidebar.tasks': { en: 'Tasks', sw: 'Kazi' },
  'sidebar.documents': { en: 'Documents', sw: 'Hati' },
  'sidebar.team': { en: 'Team', sw: 'Timu' },
  'sidebar.notifications': { en: 'Notifications', sw: 'Arifa' },
  'sidebar.messages': { en: 'Messages', sw: 'Ujumbe' },
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
  'search.freeModeBanner': { en: 'You are browsing as a free user. Login to unlock dashboards, saved requests, and team collaboration.', sw: 'Unavinjari kama mtumiaji wa bure. Ingia kufungua dashibodi, maombi yaliyohifadhiwa, na ushirikiano wa timu.' },
  'search.demoContactNotice': { en: 'This is a demo profile. Login to contact verified professionals.', sw: 'Huu ni wasifu wa majaribio. Ingia kuwasiliana na wataalamu waliothibitishwa.' },
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
