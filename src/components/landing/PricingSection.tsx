import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';

const PricingSection = () => {
  const { t } = useLanguage();

  const plans = [
    {
      name: t('pricing.free'),
      price: 'KES 0',
      features: ['3 Projects', 'Basic Analytics', '5 Team Members', '1GB Storage', 'Email Support'],
      cta: t('pricing.getStarted'),
      featured: false,
    },
    {
      name: t('pricing.pro'),
      price: 'KES 4,999',
      features: ['Unlimited Projects', 'AI Insights', '25 Team Members', '50GB Storage', 'Priority Support', 'Advanced Reports', 'Risk Predictions'],
      cta: t('pricing.getStarted'),
      featured: true,
    },
    {
      name: t('pricing.enterprise'),
      price: 'Custom',
      features: ['Everything in Pro', 'Unlimited Team', '500GB Storage', 'Dedicated Support', 'Custom Integrations', 'SLA Guarantee', 'On-premise Option'],
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
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold font-['Space_Grotesk'] mb-4">{t('pricing.title')}</h2>
          <p className="text-muted-foreground">{t('pricing.subtitle')}</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className={`glass-card p-6 flex flex-col relative ${plan.featured ? 'ring-2 ring-primary glow scale-[1.02]' : ''}`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full gradient-primary text-primary-foreground text-xs font-medium">
                  Most Popular
                </div>
              )}
              <h3 className="text-lg font-semibold font-['Space_Grotesk']">{plan.name}</h3>
              <div className="mt-4 mb-6">
                <span className="text-3xl font-bold font-['Space_Grotesk']">{plan.price}</span>
                {plan.price !== 'Custom' && <span className="text-muted-foreground text-sm">{t('pricing.month')}</span>}
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
      </div>
    </section>
  );
};

export default PricingSection;
