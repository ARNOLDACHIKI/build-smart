import { motion } from 'framer-motion';
import { ArrowRight, Play, BarChart3, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  const { t } = useLanguage();

  const stats = [
    { value: '2,500+', label: t('hero.stats.projects') },
    { value: '35%', label: t('hero.stats.saved') },
    { value: '10K+', label: t('hero.stats.users') },
  ];

  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-accent/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-xs font-medium text-primary mb-6">
              <Zap className="w-3 h-3" />
              AI-Powered Construction Management
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold font-['Space_Grotesk'] leading-[1.1] mb-6">
              {t('hero.title')}
              <br />
              <span className="gradient-text">{t('hero.titleHighlight')}</span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <Link to="/register">
                <Button size="lg" className="gradient-primary text-primary-foreground glow text-base px-8 h-12">
                  {t('hero.cta')} <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="h-12 text-base">
                <Play className="w-4 h-4 mr-2" /> {t('hero.learnMore')}
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.15 }}
                >
                  <div className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk'] gradient-text">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Dashboard preview mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="hidden lg:block"
          >
            <div className="glass-card p-6 space-y-4 relative">
              <div className="absolute -top-3 -right-3 px-3 py-1 rounded-full gradient-primary text-primary-foreground text-xs font-medium">Live Preview</div>
              
              {/* Mini dashboard mockup */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: BarChart3, label: 'Budget', value: 'KES 45M', color: 'text-primary' },
                  { icon: Shield, label: 'Risk Score', value: 'Low', color: 'text-accent' },
                  { icon: Zap, label: 'On Track', value: '87%', color: 'text-primary' },
                ].map((item, i) => (
                  <div key={i} className="glass-card p-3 text-center">
                    <item.icon className={`w-5 h-5 mx-auto mb-1 ${item.color}`} />
                    <div className="text-xs text-muted-foreground">{item.label}</div>
                    <div className="text-sm font-bold mt-0.5">{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Chart mockup */}
              <div className="glass-card p-4">
                <div className="text-xs font-medium mb-3">Project Progress</div>
                <div className="flex items-end gap-1.5 h-24">
                  {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 50].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: 1 + i * 0.05, duration: 0.5 }}
                      className="flex-1 rounded-t gradient-primary opacity-70"
                    />
                  ))}
                </div>
              </div>

              {/* Activity mockup */}
              <div className="space-y-2">
                {['Nairobi Tower - Phase 3 complete', 'Mombasa Road - Budget updated', 'Kisumu Bridge - Risk alert'].map((text, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.5 + i * 0.15 }}
                    className="flex items-center gap-2 text-xs p-2 rounded-lg bg-muted/50"
                  >
                    <div className="w-1.5 h-1.5 rounded-full gradient-primary flex-shrink-0" />
                    {text}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
