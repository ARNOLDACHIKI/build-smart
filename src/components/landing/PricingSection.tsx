import { motion } from 'framer-motion';
import { Check, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';

const PricingSection = () => {
  const { t } = useLanguage();

  const plans = [
    {
      name: t('pricing.student'),
      price: 'USD 5',
      period: t('pricing.year'),
      desc: 'Free for 1st year, then USD 5/year',
      features: ['Platform Access', 'Community Access', 'Basic Data', 'Learning Resources', '6-Month Bonus Credits'],
      cta: t('pricing.getStarted'),
      featured: false,
    },
    {
      name: t('pricing.basic'),
      price: 'USD 30',
      period: t('pricing.year'),
      desc: 'Access platform, products & community',
      features: ['Full Platform Access', 'Community Messaging', 'Product Directory', 'Basic Analytics', 'Direct Contact', '6-Month Bonus Credits'],
      cta: t('pricing.getStarted'),
      featured: false,
    },
    {
      name: t('pricing.professional'),
      price: 'USD 50',
      period: t('pricing.year'),
      desc: 'Consultant & team project support',
      features: ['Everything in Basic', 'Consultant Access', 'Team Support', 'AI Insights', 'Advanced Reports', 'Risk Predictions', 'Priority Support', '6-Month Bonus Credits'],
      cta: t('pricing.getStarted'),
      featured: true,
    },
    {
      name: t('pricing.enterprise'),
      price: 'USD 75',
      period: t('pricing.year'),
      desc: 'Full access + suppliers & specialised data',
      features: ['Everything in Pro', 'Supplier Access', 'Product Samples', 'Contractor Network', 'Specialised Data', 'Custom Integrations', 'Dedicated Support', '6-Month Bonus Credits'],
      cta: t('pricing.contactSales'),
      featured: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6"
        >
          <h2 className="text-3xl sm:text-4xl font-bold font-['Space_Grotesk'] mb-4">{t('pricing.title')}</h2>
          <p className="text-muted-foreground">{t('pricing.subtitle')}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="gradient-primary text-primary-foreground px-4 py-1.5 text-sm">
            <Award className="w-4 h-4 mr-1" /> {t('pricing.credits6months')}
          </Badge>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`card-3d p-6 flex flex-col relative ${plan.featured ? 'ring-2 ring-primary glow scale-[1.02]' : ''}`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full gradient-primary text-primary-foreground text-xs font-medium">
                  Most Popular
                </div>
              )}
              <h3 className="text-lg font-semibold font-['Space_Grotesk']">{plan.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{plan.desc}</p>
              <div className="mt-4 mb-6">
                <span className="text-3xl font-bold font-['Space_Grotesk']">{plan.price}</span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/register">
                <Button className={`w-full ${plan.featured ? 'gradient-primary text-primary-foreground glow' : ''}`} variant={plan.featured ? 'default' : 'outline'}>
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm text-muted-foreground mt-8"
        >
          {t('pricing.free3months')}
        </motion.p>
      </div>
    </section>
  );
};

export default PricingSection;
