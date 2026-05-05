import { motion } from 'framer-motion';
import { ArrowRight, Play, Search, HardHat, Users, Building, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const HeroSection = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

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
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
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

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Construction worker greeting */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 sm:mb-8"
          >
            <div className="mb-5 inline-flex items-center gap-2.5 rounded-2xl px-4 py-2.5 text-sm font-medium card-3d sm:mb-6 sm:gap-3 sm:px-6 sm:py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary sm:h-12 sm:w-12">
                <HardHat className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-['Space_Grotesk'] text-base font-semibold text-foreground sm:text-lg">{t('hero.greeting')}</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <h1 className="mb-5 font-['Space_Grotesk'] text-4xl font-bold leading-[1.08] sm:mb-6 sm:text-6xl lg:text-7xl">
              {t('hero.title')}
              <br />
              <span className="gradient-text">{t('hero.titleHighlight')}</span>
            </h1>

            <p className="mx-auto mb-7 max-w-2xl text-base leading-relaxed text-muted-foreground sm:mb-8 sm:text-lg">
              {t('hero.subtitle')}
            </p>

            {/* Search bar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mx-auto mb-7 max-w-2xl sm:mb-8"
            >
              <form onSubmit={handleSearch} className="card-3d flex flex-col gap-2 p-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder={t('hero.searchPlaceholder')}
                    className="h-12 border-0 bg-transparent pl-10 text-base"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                </div>
                <Button 
                  type="submit" 
                  size="lg" 
                  className="h-12 px-6 gradient-primary text-primary-foreground glow"
                >
                  <Search className="w-4 h-4 mr-2" /> Search
                </Button>
              </form>
            </motion.div>

            <div className="mb-10 grid w-full max-w-xl grid-cols-1 gap-3 sm:mb-12 sm:max-w-none sm:grid-cols-3 sm:gap-4">
              <Link to="/register" className="w-full">
                <Button size="lg" className="tap-feedback focus-ring h-12 w-full px-8 text-base gradient-primary text-primary-foreground glow">
                  {t('hero.cta')} <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link to="/search?intent=initiate-request" className="w-full">
                <Button variant="secondary" size="lg" className="tap-feedback focus-ring h-12 w-full px-8 text-base">
                  {t('hero.initiateRequest')}
                </Button>
              </Link>
              <Link to="/solutions" className="w-full">
                <Button variant="outline" size="lg" className="tap-feedback focus-ring h-12 w-full text-base">
                  <Play className="w-4 h-4 mr-2" /> {t('hero.learnMore')}
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Customer journey steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mb-10 sm:mb-12"
          >
            <p className="text-sm text-muted-foreground mb-4 font-medium">{t('hero.explore')}</p>
            <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {journeySteps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className="group cursor-pointer p-3 text-center card-3d sm:p-4"
                >
                  <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl gradient-primary transition-transform group-hover:scale-110 sm:h-10 sm:w-10">
                    <step.icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <p className="text-[11px] text-muted-foreground sm:text-xs">{step.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Stats */}
          <div className="mx-auto grid max-w-lg grid-cols-3 gap-3 sm:gap-6">
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
