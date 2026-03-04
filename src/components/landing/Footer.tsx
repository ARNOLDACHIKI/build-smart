import { Building2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Building2 className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold font-['Space_Grotesk'] gradient-text">BuildSmart</span>
            </div>
            <p className="text-sm text-muted-foreground">{t('footer.description')}</p>
          </div>
          {[
            { title: t('footer.product'), links: ['Features', 'Pricing', 'Integrations', 'API'] },
            { title: t('footer.company'), links: ['About', 'Blog', 'Careers', 'Contact'] },
            { title: t('footer.support'), links: ['Help Center', 'Documentation', 'Status', 'Community'] },
          ].map((col, i) => (
            <div key={i}>
              <h4 className="font-semibold text-sm mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link, j) => (
                  <li key={j}><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{link}</a></li>
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
