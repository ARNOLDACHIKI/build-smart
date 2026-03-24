import { motion } from 'framer-motion';
import { CheckCheck, Link2, MessageSquarePlus, Sparkles, UserPlus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const HowItWorksSection = () => {
  const { t } = useLanguage();

  const steps = [
    { icon: UserPlus, title: t('howItWorks.step1Title'), desc: t('howItWorks.step1Desc'), step: '01' },
    { icon: MessageSquarePlus, title: t('howItWorks.step2Title'), desc: t('howItWorks.step2Desc'), step: '02' },
    { icon: CheckCheck, title: t('howItWorks.step3Title'), desc: t('howItWorks.step3Desc'), step: '03' },
    { icon: Link2, title: t('howItWorks.step4Title'), desc: t('howItWorks.step4Desc'), step: '04' },
    { icon: Sparkles, title: t('howItWorks.step5Title'), desc: t('howItWorks.step5Desc'), step: '05' },
  ];

  return (
    <section className="relative py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold font-['Space_Grotesk'] mb-4">{t('howItWorks.title')}</h2>
        </motion.div>

        <div className="relative grid gap-5 sm:grid-cols-2 sm:gap-8 xl:grid-cols-5">
          <div className="hidden xl:block absolute top-16 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />

          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="relative rounded-2xl border border-border/60 bg-card/40 p-4 text-center sm:border-0 sm:bg-transparent sm:p-0"
            >
              <div className="relative z-10 mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary glow sm:mb-4 sm:h-16 sm:w-16">
                <s.icon className="h-6 w-6 text-primary-foreground sm:h-7 sm:w-7" />
              </div>
              <div className="text-xs font-bold text-primary mb-2">{s.step}</div>
              <h3 className="mb-2 font-['Space_Grotesk'] text-lg font-semibold sm:text-xl">{s.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
