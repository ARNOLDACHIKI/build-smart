import { motion } from 'framer-motion';
import { BarChart3, ClipboardList, Users, Search, BellRing, FolderKanban } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const FeaturesSection = () => {
  const { t } = useLanguage();

  const features = [
    { icon: BarChart3, title: t('features.realTimeInsights'), desc: t('features.realTimeInsightsDesc') },
    { icon: ClipboardList, title: t('features.projectManagementTools'), desc: t('features.projectManagementToolsDesc') },
    { icon: Users, title: t('features.collaborationNetworking'), desc: t('features.collaborationNetworkingDesc') },
    { icon: Search, title: t('features.aiPoweredSearch'), desc: t('features.aiPoweredSearchDesc') },
    { icon: BellRing, title: t('features.specialisedReminders'), desc: t('features.specialisedRemindersDesc') },
    { icon: FolderKanban, title: t('features.curatedPortfolios'), desc: t('features.curatedPortfoliosDesc') },
  ];

  return (
    <section id="features" className="py-24 relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold font-['Space_Grotesk'] mb-4">{t('features.title')}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t('features.subtitle')}</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card-3d p-6 group hover:glow transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <f.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold font-['Space_Grotesk'] mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
