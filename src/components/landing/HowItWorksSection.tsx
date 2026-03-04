import { motion } from 'framer-motion';
import { UserPlus, FolderPlus, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const HowItWorksSection = () => {
  const { t } = useLanguage();

  const steps = [
    { icon: UserPlus, title: t('howItWorks.step1Title'), desc: t('howItWorks.step1Desc'), step: '01' },
    { icon: FolderPlus, title: t('howItWorks.step2Title'), desc: t('howItWorks.step2Desc'), step: '02' },
    { icon: Sparkles, title: t('howItWorks.step3Title'), desc: t('howItWorks.step3Desc'), step: '03' },
  ];

  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold font-['Space_Grotesk'] mb-4">{t('howItWorks.title')}</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />

          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="text-center relative"
            >
              <div className="w-16 h-16 mx-auto rounded-2xl gradient-primary flex items-center justify-center mb-4 glow relative z-10">
                <s.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <div className="text-xs font-bold text-primary mb-2">{s.step}</div>
              <h3 className="text-xl font-semibold font-['Space_Grotesk'] mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
