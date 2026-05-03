import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Link } from 'react-router-dom';
import { useLandingSectionNavigation } from '@/hooks/useLandingSectionNavigation';
import logoDark from '@/assets/logo-dark.png';
import logoLight from '@/assets/logo-light.png';

const Footer = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const { scrollToSection } = useLandingSectionNavigation();

  const footerColumns = [
    {
      title: t('footer.product'),
      links: [
        { label: 'Features', href: '/#features' },
        { label: 'Plans', href: '/#pricing' },
        { label: 'Request Matching', href: '/solutions' },
        { label: 'Smart Insights', href: '/#dashboard' },
      ],
    },
    {
      title: t('footer.company'),
      links: [
        { label: 'About', href: '/#about' },
        { label: 'Updates', href: '/community' },
        { label: 'Partners', href: '/solutions' },
        { label: 'Contact', href: '/support' },
      ],
    },
    {
      title: t('footer.support'),
      links: [
        { label: 'Support Center', href: '/support' },
        { label: 'Documentation', href: '/documentation' },
        { label: 'Service Status', href: '/support' },
        { label: 'Community', href: '/community' },
      ],
    },
  ];

  return (
    <footer className="border-t border-border py-12 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <img src={theme === 'dark' ? logoDark : logoLight} alt="ICDBO" className="h-12 w-auto mb-3" />
            <p className="text-xs font-bold text-primary tracking-widest mb-2">{t('footer.tagline')}</p>
            <p className="text-sm text-muted-foreground">{t('footer.description')}</p>
          </div>
          {footerColumns.map((col, i) => (
            <div key={i}>
              <h4 className="font-semibold text-sm mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link, j) => (
                  <li key={j}>
                    {link.href.startsWith('/#') ? (
                      <button
                        type="button"
                        onClick={() => scrollToSection(link.href.slice(2))}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">{link.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          {t('footer.rights')}
          <span className="mx-2">•</span>
          <Link to="/terms" className="hover:text-primary transition-colors">
            Terms and Conditions
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
