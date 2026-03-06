import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Sun, Moon, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import logoDark from '@/assets/logo-dark.png';
import logoLight from '@/assets/logo-light.png';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <img src={theme === 'dark' ? logoDark : logoLight} alt="ICDBO" className="h-10 w-auto" />
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">{t('nav.features')}</a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">{t('nav.pricing')}</a>
            <Link to="/search" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">{t('nav.search')}</Link>
            <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">{t('nav.about')}</a>
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
            className="md:hidden glass border-t border-border"
          >
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block text-sm font-medium text-muted-foreground">{t('nav.features')}</a>
              <a href="#pricing" className="block text-sm font-medium text-muted-foreground">{t('nav.pricing')}</a>
              <Link to="/search" className="block text-sm font-medium text-muted-foreground">{t('nav.search')}</Link>
              <a href="#about" className="block text-sm font-medium text-muted-foreground">{t('nav.about')}</a>
              <div className="flex items-center gap-2 pt-2">
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
