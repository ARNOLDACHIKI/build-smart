import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Sun, Moon, Globe, ChevronDown, BarChart3, Users, FolderKanban, Zap, BookOpen, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLandingSectionNavigation } from '@/hooks/useLandingSectionNavigation';
import { motion, AnimatePresence } from 'framer-motion';
import { trackEvent } from '@/lib/utils';
import logoDark from '@/assets/logo-dark.png';
import logoLight from '@/assets/logo-light.png';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileFeatures, setMobileFeatures] = useState(false);
  const [mobilePlans, setMobilePlans] = useState(false);
  const [mobileResources, setMobileResources] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { scrollToSection } = useLandingSectionNavigation();

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  const featuresMenu = [
    { icon: BarChart3, label: 'Real-Time Analytics', href: '#dashboard' },
    { icon: FolderKanban, label: 'Project Management', href: '#dashboard' },
    { icon: Users, label: 'Team Collaboration', href: '#features' },
    { icon: Zap, label: 'AI-Powered Insights', href: '#features' },
  ];

  const plansMenu = [
    { label: 'Free Plan', href: '#pricing' },
    { label: 'Standard', href: '#pricing' },
    { label: 'Premium', href: '#pricing' },
    { label: 'Enterprise', href: '#pricing' },
  ];

  const resourcesMenu = [
    { icon: BookOpen, label: 'Documentation', href: '/documentation' },
    { icon: Mail, label: 'Support', href: '/support' },
    { icon: Zap, label: 'API Docs', href: '/api-docs' },
    { icon: Users, label: 'Community', href: '/community' },
  ];

  const handleSectionNavigation = (sectionId: string, label?: string) => {
    if (label) {
      trackEvent('navbar_feature_click', { feature: label });
    }

    scrollToSection(sectionId);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <img src={theme === 'dark' ? logoDark : logoLight} alt="ICDBO" className="h-10 w-auto" />
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {/* Features Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="tap-feedback focus-ring rounded-lg px-3 text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-primary">
                  Features <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {featuresMenu.map((item, i) => (
                  <DropdownMenuItem key={i} asChild>
                    <button
                      type="button"
                      onClick={() => handleSectionNavigation(item.href, item.label)}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Solutions Link */}
            <Link to="/solutions" className="tap-feedback focus-ring rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-primary">
              Solutions
            </Link>

            {/* Plans Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="tap-feedback focus-ring rounded-lg px-3 text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-primary">
                  Plans <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {plansMenu.map((item, i) => (
                  <DropdownMenuItem key={i} asChild>
                    <button type="button" onClick={() => handleSectionNavigation(item.href)} className="cursor-pointer">
                      {item.label}
                    </button>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <button type="button" onClick={() => handleSectionNavigation('pricing')} className="text-primary font-medium cursor-pointer">
                    Compare All Plans
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Resources Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="tap-feedback focus-ring rounded-lg px-3 text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-primary">
                  Resources <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {resourcesMenu.map((item, i) => (
                  <DropdownMenuItem key={i} asChild>
                    <Link to={item.href} className="flex items-center gap-3 cursor-pointer">
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link to="/search" className="tap-feedback focus-ring rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-primary">
              {t('nav.search')}
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Select value={language} onValueChange={(v) => setLanguage(v as 'en' | 'sw')}>
              <SelectTrigger className="focus-ring h-9 w-[130px] text-xs">
                <Globe className="w-3.5 h-3.5 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="sw">Kiswahili</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" className="tap-feedback focus-ring" onClick={toggleTheme}>
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
            <Link to="/login"><Button size="sm" className="tap-feedback focus-ring gradient-primary text-primary-foreground glow">{t('nav.login')}</Button></Link>
            <Link to="/community"><Button variant="outline" size="sm" className="tap-feedback focus-ring">{t('nav.skipLogin')}</Button></Link>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="tap-feedback focus-ring md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-border bg-background/80 pb-5 backdrop-blur md:hidden"
          >
            <div className="space-y-3 px-4 py-4">
              {/* Features Collapsible */}
              <Collapsible open={mobileFeatures} onOpenChange={setMobileFeatures}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="tap-feedback focus-ring h-11 w-full justify-between rounded-xl px-3 text-left text-sm font-medium text-muted-foreground hover:text-primary">
                    Features <ChevronDown className={`w-4 h-4 transition-transform ${mobileFeatures ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1.5 pl-3 pt-1">
                  {featuresMenu.map((item, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => {
                        handleSectionNavigation(item.href, item.label);
                        setMobileOpen(false);
                      }}
                      className="tap-feedback focus-ring flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm text-muted-foreground transition-colors hover:bg-muted/40 hover:text-primary"
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  ))}
                </CollapsibleContent>
              </Collapsible>

              {/* Solutions Link */}
              <Link to="/solutions" onClick={() => setMobileOpen(false)} className="tap-feedback focus-ring flex min-h-11 items-center rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-primary">
                Solutions
              </Link>

              {/* Plans Collapsible */}
              <Collapsible open={mobilePlans} onOpenChange={setMobilePlans}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="tap-feedback focus-ring h-11 w-full justify-between rounded-xl px-3 text-left text-sm font-medium text-muted-foreground hover:text-primary">
                    Plans <ChevronDown className={`w-4 h-4 transition-transform ${mobilePlans ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1.5 pl-3 pt-1">
                  {plansMenu.map((item, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => {
                        handleSectionNavigation(item.href);
                        setMobileOpen(false);
                      }}
                      className="tap-feedback focus-ring flex min-h-10 items-center rounded-lg px-2 text-sm text-muted-foreground transition-colors hover:bg-muted/40 hover:text-primary"
                    >
                      {item.label}
                    </button>
                  ))}
                  <button type="button" onClick={() => { handleSectionNavigation('pricing'); setMobileOpen(false); }} className="tap-feedback focus-ring flex min-h-10 items-center rounded-lg px-2 text-sm font-medium text-primary transition-colors hover:bg-muted/40">
                    Compare All Plans
                  </button>
                </CollapsibleContent>
              </Collapsible>

              {/* Resources Collapsible */}
              <Collapsible open={mobileResources} onOpenChange={setMobileResources}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="tap-feedback focus-ring h-11 w-full justify-between rounded-xl px-3 text-left text-sm font-medium text-muted-foreground hover:text-primary">
                    Resources <ChevronDown className={`w-4 h-4 transition-transform ${mobileResources ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1.5 pl-3 pt-1">
                  {resourcesMenu.map((item, i) => (
                    <Link
                      key={i}
                      to={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="tap-feedback focus-ring flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm text-muted-foreground transition-colors hover:bg-muted/40 hover:text-primary"
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  ))}
                </CollapsibleContent>
              </Collapsible>

              <Link to="/search" onClick={() => setMobileOpen(false)} className="tap-feedback focus-ring flex min-h-11 items-center rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-primary">
                {t('nav.search')}
              </Link>

              <div className="flex items-center gap-2 border-t border-border pt-3">
                <Select value={language} onValueChange={(v) => setLanguage(v as 'en' | 'sw')}>
                  <SelectTrigger className="focus-ring h-10 w-[130px] text-xs">
                    <Globe className="w-3.5 h-3.5 mr-1" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="sw">Kiswahili</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link to="/login" className="flex-1">
                  <Button className="tap-feedback focus-ring h-11 w-full gradient-primary text-primary-foreground" size="sm">
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link to="/community" className="flex-1">
                  <Button variant="outline" className="tap-feedback focus-ring h-11 w-full" size="sm">
                    {t('nav.skipLogin')}
                  </Button>
                </Link>
              </div>

              <p className="px-1 text-center text-xs text-muted-foreground">
                {t('nav.skipLoginHint')}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
