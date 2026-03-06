import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import logoDark from '@/assets/logo-dark.png';
import logoLight from '@/assets/logo-light.png';

const Footer = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();

  return (
    <footer className="border-t border-border py-12 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <img src={theme === 'dark' ? logoDark : logoLight} alt="ICDBO" className="h-12 w-auto mb-3" />
            <p className="text-xs font-bold text-primary tracking-widest mb-2">{t('footer.tagline')}</p>
            <p className="text-sm text-muted-foreground">{t('footer.description')}</p>
          </div>
          {[
            { title: t('footer.product'), links: ['Features', 'Pricing', 'Directory', 'API'] },
            { title: t('footer.company'), links: ['About', 'Blog', 'Careers', 'Contact'] },
            { title: t('footer.support'), links: ['Help Center', 'Documentation', 'Status', 'Community'] },
          ].map((col, i) => (
            <div key={i}>
              <h4 className="font-semibold text-sm mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link, j) => (
                  <li key={j}><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          {t('footer.rights')}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
