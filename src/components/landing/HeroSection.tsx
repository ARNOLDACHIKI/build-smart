import { motion } from 'framer-motion';
import { ArrowRight, Play, Search, HardHat, Users, Building, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  const { t } = useLanguage();

  const stats = [
    { value: '2,500+', label: t('hero.stats.projects') },
    { value: '35%', label: t('hero.stats.saved') },
    { value: '10K+', label: t('hero.stats.users') },
  ];

  const journeySteps = [
    { icon: Search, text: t('hero.step1') },
    { icon: Users, text: t('hero.step2') },
    { icon: Building, text: t('hero.step3') },
    { icon: MapPin, text: t('hero.step4') },
  ];

  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-accent/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Construction worker greeting */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl card-3d text-sm font-medium mb-6">
              <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
                <HardHat className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold font-['Space_Grotesk'] text-foreground">{t('hero.greeting')}</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold font-['Space_Grotesk'] leading-[1.1] mb-6">
              {t('hero.title')}
              <br />
              <span className="gradient-text">{t('hero.titleHighlight')}</span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              {t('hero.subtitle')}
            </p>

            {/* Search bar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="max-w-2xl mx-auto mb-8"
            >
              <div className="card-3d p-2 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder={t('hero.searchPlaceholder')}
                    className="pl-10 h-12 border-0 bg-transparent text-base"
                  />
                </div>
                <Link to="/search">
                  <Button size="lg" className="gradient-primary text-primary-foreground glow h-12 px-6">
                    <Search className="w-4 h-4 mr-2" /> Search
                  </Button>
                </Link>
              </div>
            </motion.div>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Link to="/register">
                <Button size="lg" className="gradient-primary text-primary-foreground glow text-base px-8 h-12">
                  {t('hero.cta')} <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="h-12 text-base">
                <Play className="w-4 h-4 mr-2" /> {t('hero.learnMore')}
              </Button>
            </div>
          </motion.div>

          {/* Customer journey steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mb-12"
          >
            <p className="text-sm text-muted-foreground mb-4 font-medium">{t('hero.explore')}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {journeySteps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className="card-3d p-4 text-center group cursor-pointer"
                >
                  <div className="w-10 h-10 mx-auto rounded-xl gradient-primary flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <step.icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">{step.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + i * 0.15 }}
              >
                <div className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk'] gradient-text">{stat.value}</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
