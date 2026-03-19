import { useState } from 'react';
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
import { motion, AnimatePresence } from 'framer-motion';
import logoDark from '@/assets/logo-dark.png';
import logoLight from '@/assets/logo-light.png';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileFeatures, setMobileFeatures] = useState(false);
  const [mobilePlans, setMobilePlans] = useState(false);
  const [mobileResources, setMobileResources] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

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
    { icon: BookOpen, label: 'Documentation', href: '#' },
    { icon: Mail, label: 'Support', href: '#' },
    { icon: Zap, label: 'API Docs', href: '#' },
    { icon: Users, label: 'Community', href: '#' },
  ];

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
                <Button variant="ghost" size="sm" className="text-sm font-medium text-muted-foreground hover:text-primary">
                  Features <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {featuresMenu.map((item, i) => (
                  <DropdownMenuItem key={i} asChild>
                    <a href={item.href} className="flex items-center gap-3 cursor-pointer">
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </a>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Solutions Link */}
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors px-3 py-2">
              Solutions
            </a>

            {/* Plans Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-sm font-medium text-muted-foreground hover:text-primary">
                  Plans <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {plansMenu.map((item, i) => (
                  <DropdownMenuItem key={i} asChild>
                    <a href={item.href} className="cursor-pointer">
                      {item.label}
                    </a>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href="#pricing" className="text-primary font-medium cursor-pointer">
                    Compare All Plans
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Resources Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-sm font-medium text-muted-foreground hover:text-primary">
                  Resources <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {resourcesMenu.map((item, i) => (
                  <DropdownMenuItem key={i} asChild>
                    <a href={item.href} className="flex items-center gap-3 cursor-pointer">
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </a>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link to="/search" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors px-3 py-2">
              {t('nav.search')}
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Select value={language} onValueChange={(v) => setLanguage(v as 'en' | 'sw')}>
              <SelectTrigger className="w-[130px] h-9 text-xs">
                <Globe className="w-3.5 h-3.5 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="sw">Kiswahili</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
            <Link to="/login"><Button variant="ghost" size="sm">{t('nav.login')}</Button></Link>
            <Link to="/register"><Button size="sm" className="gradient-primary text-primary-foreground glow">{t('nav.signup')}</Button></Link>
          </div>

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
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
            className="md:hidden border-t border-border bg-background/50 backdrop-blur"
          >
            <div className="px-4 py-4 space-y-2">
              {/* Features Collapsible */}
              <Collapsible open={mobileFeatures} onOpenChange={setMobileFeatures}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full justify-between text-left text-sm font-medium text-muted-foreground hover:text-primary">
                    Features <ChevronDown className={`w-4 h-4 transition-transform ${mobileFeatures ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 pt-2 space-y-2">
                  {featuresMenu.map((item, i) => (
                    <a
                      key={i}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors py-1"
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </a>
                  ))}
                </CollapsibleContent>
              </Collapsible>

              {/* Solutions Link */}
              <a href="#features" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2">
                Solutions
              </a>

              {/* Plans Collapsible */}
              <Collapsible open={mobilePlans} onOpenChange={setMobilePlans}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full justify-between text-left text-sm font-medium text-muted-foreground hover:text-primary">
                    Plans <ChevronDown className={`w-4 h-4 transition-transform ${mobilePlans ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 pt-2 space-y-2">
                  {plansMenu.map((item, i) => (
                    <a
                      key={i}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="block text-sm text-muted-foreground hover:text-primary transition-colors py-1"
                    >
                      {item.label}
                    </a>
                  ))}
                  <a href="#pricing" onClick={() => setMobileOpen(false)} className="block text-sm text-primary font-medium py-1">
                    Compare All Plans
                  </a>
                </CollapsibleContent>
              </Collapsible>

              {/* Resources Collapsible */}
              <Collapsible open={mobileResources} onOpenChange={setMobileResources}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full justify-between text-left text-sm font-medium text-muted-foreground hover:text-primary">
                    Resources <ChevronDown className={`w-4 h-4 transition-transform ${mobileResources ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 pt-2 space-y-2">
                  {resourcesMenu.map((item, i) => (
                    <a
                      key={i}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors py-1"
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </a>
                  ))}
                </CollapsibleContent>
              </Collapsible>

              <Link to="/search" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2">
                {t('nav.search')}
              </Link>

              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <Select value={language} onValueChange={(v) => setLanguage(v as 'en' | 'sw')}>
                  <SelectTrigger className="w-[130px] h-9 text-xs">
                    <Globe className="w-3.5 h-3.5 mr-1" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="sw">Kiswahili</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-2">
                <Link to="/login" className="flex-1"><Button variant="outline" className="w-full" size="sm">{t('nav.login')}</Button></Link>
                <Link to="/register" className="flex-1"><Button className="w-full gradient-primary text-primary-foreground" size="sm">{t('nav.signup')}</Button></Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
