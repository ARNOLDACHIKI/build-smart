import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, TrendingUp, Users, Clock, Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { trackEvent } from '@/lib/utils';

const MobileAppDashboardSection = () => {
  const { t } = useLanguage();
  const [isPreviewMenuOpen, setIsPreviewMenuOpen] = useState(false);
  const previewMenuRef = useRef<HTMLDivElement | null>(null);

  const trackPreviewClick = (action: string) => {
    trackEvent('iphone_preview_click', {
      action,
      surface: 'landing_mobile_preview',
    });
  };

  const handlePreviewMenuItemClick = (action: string) => {
    trackPreviewClick(action);
    setIsPreviewMenuOpen(false);
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!isPreviewMenuOpen) return;
      const target = event.target as Node | null;
      if (previewMenuRef.current && target && !previewMenuRef.current.contains(target)) {
        setIsPreviewMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsPreviewMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isPreviewMenuOpen]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section id="dashboard" className="py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16"
        >
          <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">App Experience</span>
          </motion.h2>
          <motion.p variants={itemVariants} className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Manage your construction projects with our intuitive mobile dashboard
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Mobile Phone Mockup */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="flex justify-center"
          >
            <div className="relative w-[292px] h-[600px]">
              {/* Ambient glow */}
              <div className="absolute inset-0 rounded-[3.5rem] bg-blue-500/10 blur-2xl scale-105" />

              {/* Titanium-like outer frame */}
              <div className="relative h-full w-full rounded-[3.5rem] bg-gradient-to-b from-slate-300 via-slate-500 to-slate-700 p-[3px] shadow-[0_30px_80px_rgba(2,6,23,0.55)]">
                {/* Side hardware details */}
                <div className="absolute -left-[2px] top-28 h-12 w-[3px] rounded-r bg-slate-300/70" />
                <div className="absolute -left-[2px] top-44 h-16 w-[3px] rounded-r bg-slate-300/70" />
                <div className="absolute -left-[2px] top-64 h-16 w-[3px] rounded-r bg-slate-300/70" />
                <div className="absolute -right-[2px] top-52 h-24 w-[3px] rounded-l bg-slate-300/70" />

                {/* Black bezel shell */}
                <div className="relative h-full w-full rounded-[3.2rem] bg-black p-[7px]">
                  {/* Display */}
                  <div className="relative h-full w-full rounded-[2.8rem] bg-gradient-to-b from-slate-50 to-slate-100 overflow-hidden flex flex-col border border-slate-300/80">
                    {/* Dynamic island */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 w-28 h-7 rounded-full bg-black shadow-inner">
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-600" />
                    </div>

                    {/* Glass reflection */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />

                    {/* Mini mobile website preview (scaled to phone proportions) */}
                    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50 via-white to-slate-100 pt-14 px-2.5 pb-3 space-y-2.5">
                      {/* Mobile navbar */}
                      <div ref={previewMenuRef} className="relative rounded-xl border border-slate-200 bg-white px-2.5 py-2 shadow-[0_2px_8px_rgba(15,23,42,0.05)]">
                        <div className="flex items-center justify-between">
                          <div className="h-2.5 w-16 rounded-full bg-slate-800" />
                          <button
                            type="button"
                            aria-label="Open preview menu"
                            onClick={() => {
                              setIsPreviewMenuOpen((prev) => !prev);
                              trackPreviewClick('hamburger_toggle');
                            }}
                            className="space-y-1 rounded-md p-0.5 hover:bg-slate-100 transition-colors"
                          >
                            <div className="h-1 w-5 rounded-full bg-slate-300" />
                            <div className="h-1 w-5 rounded-full bg-slate-300" />
                            <div className="h-1 w-5 rounded-full bg-slate-300" />
                          </button>
                        </div>

                        {isPreviewMenuOpen && (
                          <div className="absolute right-2 top-9 z-20 w-24 rounded-lg border border-slate-200 bg-white/95 backdrop-blur px-1.5 py-1.5 shadow-md">
                            <div className="flex flex-col text-[7px] text-slate-600">
                              <a href="#features" onClick={() => handlePreviewMenuItemClick('menu_features')} className="rounded px-1.5 py-1 hover:bg-slate-100">Features</a>
                              <Link to="/solutions" onClick={() => handlePreviewMenuItemClick('menu_solutions')} className="rounded px-1.5 py-1 hover:bg-slate-100 block">Solutions</Link>
                              <a href="#pricing" onClick={() => handlePreviewMenuItemClick('menu_plans')} className="rounded px-1.5 py-1 hover:bg-slate-100">Plans</a>
                              <a href="#pricing" onClick={() => handlePreviewMenuItemClick('menu_pricing')} className="rounded px-1.5 py-1 hover:bg-slate-100">Pricing</a>
                              <a href="#about" onClick={() => handlePreviewMenuItemClick('menu_resources')} className="rounded px-1.5 py-1 hover:bg-slate-100">Resources</a>
                            </div>
                          </div>
                        )}

                        <div className="mt-2.5 flex gap-1 text-[7px] text-slate-500 overflow-hidden">
                          <a href="#features" onClick={() => trackPreviewClick('chip_features')} className="rounded-full border border-slate-200 px-1.5 py-0.5 hover:bg-slate-100 transition-colors">Features</a>
                          <Link to="/solutions" onClick={() => trackPreviewClick('chip_solutions')} className="rounded-full border border-slate-200 px-1.5 py-0.5 hover:bg-slate-100 transition-colors">Solutions</Link>
                          <a href="#pricing" onClick={() => trackPreviewClick('chip_plans')} className="rounded-full border border-slate-200 px-1.5 py-0.5 hover:bg-slate-100 transition-colors">Plans</a>
                          <a href="#pricing" onClick={() => trackPreviewClick('chip_pricing')} className="rounded-full border border-slate-200 px-1.5 py-0.5 hover:bg-slate-100 transition-colors">Pricing</a>
                          <a href="#about" onClick={() => trackPreviewClick('chip_resources')} className="rounded-full border border-slate-200 px-1.5 py-0.5 hover:bg-slate-100 transition-colors">Resources</a>
                        </div>
                      </div>

                      {/* Hero section */}
                      <div className="rounded-xl gradient-primary p-2.5 text-white shadow-sm">
                        <p className="text-[9px] font-semibold leading-tight">Build smarter projects with AI</p>
                        <p className="text-[8px] opacity-90 mt-1 leading-tight">Find contractors, compare plans, and manage delivery from one platform.</p>
                        <div className="mt-2 flex gap-1.5">
                          <Link to="/register" onClick={() => trackPreviewClick('hero_get_started')} className="text-[7px] rounded-full bg-white/20 px-2 py-0.5 hover:bg-white/30 transition-colors">Get Started</Link>
                          <a href="#pricing" onClick={() => trackPreviewClick('hero_watch_demo')} className="text-[7px] rounded-full bg-white/10 px-2 py-0.5 hover:bg-white/20 transition-colors">Watch Demo</a>
                        </div>
                      </div>

                      {/* Search strip from landing */}
                      <Link to="/search" onClick={() => trackPreviewClick('search_open')} className="h-6 rounded-lg border border-slate-200 bg-white px-2 flex items-center hover:border-primary/40 transition-colors">
                        <span className="text-[7px] text-slate-400">Search projects, talent, or services...</span>
                      </Link>

                      {/* Features section */}
                      <div className="rounded-xl border border-slate-200 bg-white p-2.5">
                        <p className="text-[9px] font-semibold text-slate-800 mb-2">Core features</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          <div className="rounded-md bg-blue-50 border border-blue-100 px-1.5 py-1.5">
                            <p className="text-[8px] font-medium text-blue-700">AI Search</p>
                            <p className="text-[7px] text-blue-600/80 mt-0.5">Find vetted experts fast</p>
                          </div>
                          <div className="rounded-md bg-emerald-50 border border-emerald-100 px-1.5 py-1.5">
                            <p className="text-[8px] font-medium text-emerald-700">Collaboration</p>
                            <p className="text-[7px] text-emerald-600/80 mt-0.5">Team and client updates</p>
                          </div>
                          <div className="rounded-md bg-amber-50 border border-amber-100 px-1.5 py-1.5">
                            <p className="text-[8px] font-medium text-amber-700">Live Tracking</p>
                            <p className="text-[7px] text-amber-700/80 mt-0.5">Progress in real time</p>
                          </div>
                          <div className="rounded-md bg-violet-50 border border-violet-100 px-1.5 py-1.5">
                            <p className="text-[8px] font-medium text-violet-700">Role Portals</p>
                            <p className="text-[7px] text-violet-700/80 mt-0.5">Engineer, admin, client</p>
                          </div>
                        </div>
                      </div>

                      {/* Pricing section (mobile stacked cards) */}
                      <div className="rounded-xl border border-slate-200 bg-white p-2.5">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[9px] font-semibold text-slate-800">Pricing plans</p>
                          <a href="#pricing" onClick={() => trackPreviewClick('pricing_compare')} className="text-[7px] text-slate-500 hover:text-primary transition-colors">Compare</a>
                        </div>
                        <div className="space-y-1.5">
                          <Link to="/register" onClick={() => trackPreviewClick('plan_free')} className="rounded-md border border-slate-200 px-2 py-1.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <span className="text-[8px] text-slate-700 font-medium">Free</span>
                            <span className="text-[8px] text-slate-500">$0</span>
                          </Link>
                          <Link to="/register" onClick={() => trackPreviewClick('plan_standard')} className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1.5 flex items-center justify-between hover:bg-blue-100 transition-colors">
                            <span className="text-[8px] text-blue-700 font-medium">Standard</span>
                            <span className="text-[8px] text-blue-600">$30</span>
                          </Link>
                          <Link to="/register" onClick={() => trackPreviewClick('plan_premium')} className="rounded-md border border-violet-200 bg-violet-50 px-2 py-1.5 flex items-center justify-between hover:bg-violet-100 transition-colors">
                            <span className="text-[8px] text-violet-700 font-medium">Premium</span>
                            <span className="text-[8px] text-violet-600">$50</span>
                          </Link>
                          <Link to="/register" onClick={() => trackPreviewClick('plan_enterprise')} className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1.5 flex items-center justify-between hover:bg-amber-100 transition-colors">
                            <span className="text-[8px] text-amber-700 font-medium">Enterprise</span>
                            <span className="text-[8px] text-amber-600">$75</span>
                          </Link>
                        </div>
                      </div>

                      {/* Testimonials and CTA */}
                      <div className="rounded-xl border border-slate-200 bg-white p-2.5">
                        <p className="text-[9px] font-semibold text-slate-800">Trusted by builders</p>
                        <p className="text-[8px] text-slate-600 mt-1 leading-tight">"We reduced project delays by 38% in one quarter using Build Smart workflows."</p>
                        <div className="mt-2 flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>

                      <div className="rounded-xl gradient-primary text-white px-2.5 py-2.5 shadow-sm">
                        <p className="text-[9px] font-semibold">Start your next project today</p>
                        <p className="text-[8px] opacity-90 mt-1">Join teams using the mobile-first Build Smart platform.</p>
                        <div className="mt-2">
                          <Link to="/register" onClick={() => trackPreviewClick('cta_start_now')} className="inline-block text-[7px] rounded-full bg-white/20 px-2 py-0.5 hover:bg-white/30 transition-colors">Start now</Link>
                        </div>
                      </div>
                    </div>

                    {/* Bottom app buttons */}
                    <div className="border-t border-slate-200 bg-white px-1.5 py-1.5">
                      <div className="grid grid-cols-5 gap-1">
                        {['Home', 'Search', 'Explore', 'Plans', 'Your Space'].map((item, index) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => trackPreviewClick(`bottom_nav_${item.toLowerCase().replace(/\s+/g, '_')}`)}
                            className={`rounded-md px-1 py-1 text-[6.5px] font-medium transition-colors ${
                              index === 0
                                ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Home indicator */}
                    <div className="pb-2 pt-1 flex justify-center bg-slate-100">
                      <div className="h-1.5 w-24 rounded-full bg-slate-400/70" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Features List */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="space-y-6"
          >
            <motion.div variants={itemVariants} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Real-Time Dashboard</h3>
                <p className="text-muted-foreground">Track all your projects and tasks in one unified view with live updates</p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Team Collaboration</h3>
                <p className="text-muted-foreground">Invite team members, assign tasks, and communicate seamlessly</p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Progress Tracking</h3>
                <p className="text-muted-foreground">Monitor project milestones, completion rates, and team performance</p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                  <Clock className="w-6 h-6 text-amber-500" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Smart Scheduling</h3>
                <p className="text-muted-foreground">Manage timelines, deadlines, and resource allocation efficiently</p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-sm border-2 border-background"
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="font-semibold text-sm">Trusted by 5,000+ teams</p>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default MobileAppDashboardSection;
