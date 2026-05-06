import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { calculatePriceWithVAT, formatKES } from '@/lib/pricing';
import MpesaCheckoutDialog, { BillingCycle, MpesaPlan } from '@/components/landing/MpesaCheckoutDialog';

const PricingSection = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('annual');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<MpesaPlan | null>(null);

  const plans = [
    {
      key: 'student',
      name: t('pricing.student'),
      monthlyBase: 1800,
      annualBase: 18000,
      period: t('pricing.month'),
      desc: 'Best for students and first-time users',
      features: ['Platform access', 'Community access', 'Basic sector data', 'Learning resources', '6-month bonus credits'],
      cta: t('pricing.getStarted'),
      featured: false,
    },
    {
      key: 'basic',
      name: t('pricing.basic'),
      monthlyBase: 4200,
      annualBase: 42000,
      period: t('pricing.month'),
      desc: 'For growing teams placing regular requests',
      features: ['Full platform access', 'Community messaging', 'Product directory', 'Basic analytics', 'Direct contact', '6-month bonus credits'],
      cta: t('pricing.getStarted'),
      featured: false,
    },
    {
      key: 'professional',
      name: t('pricing.professional'),
      monthlyBase: 7800,
      annualBase: 78000,
      period: t('pricing.month'),
      desc: 'For advanced teams needing stronger AI support',
      features: ['Everything in Basic', 'Consultant access', 'Team support', 'AI insights', 'Advanced reports', 'Risk predictions', 'Priority support', '6-month bonus credits'],
      cta: t('pricing.getStarted'),
      featured: true,
    },
    {
      key: 'enterprise',
      name: t('pricing.enterprise'),
      monthlyBase: 12000,
      annualBase: 120000,
      period: t('pricing.month'),
      desc: 'For organizations requiring full-scale coordination',
      features: ['Everything in Pro', 'Supplier access', 'Product samples', 'Contractor network', 'Specialized data', 'Custom integrations', 'Dedicated support', '6-month bonus credits'],
      cta: t('pricing.contactSales'),
      featured: false,
    },
  ];

  const getPlanPrice = (plan: (typeof plans)[number]) => {
    const basePrice = billingCycle === 'monthly' ? plan.monthlyBase : plan.annualBase;
    const price = calculatePriceWithVAT(basePrice);
    return {
      baseLabel: formatKES(price.basePrice),
      totalLabel: `${formatKES(price.totalPrice)} (incl. VAT)`,
      totalPrice: price.totalPrice,
    };
  };

  const currentPlan = selectedPlan ? plans.find((plan) => plan.key === selectedPlan.key) || null : null;
  const currentPlanPrice = currentPlan ? getPlanPrice(currentPlan) : null;

  return (
    <section id="pricing" className="scroll-mt-24 py-24 relative">
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
          <div className="mt-4 inline-flex rounded-full border border-border bg-background p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${billingCycle === 'monthly' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${billingCycle === 'annual' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Annual
            </button>
          </div>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`card-3d p-6 flex flex-col relative ${plan.featured ? 'ring-2 ring-primary glow scale-[1.02]' : ''}`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full gradient-primary text-primary-foreground text-xs font-medium">
                  Recommended
                </div>
              )}
              <h3 className="text-lg font-semibold font-['Space_Grotesk']">{plan.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{plan.desc}</p>
              <div className="mt-4 mb-6">
                {(() => {
                  const price = getPlanPrice(plan);
                  return (
                    <>
                      <p className="text-sm text-muted-foreground">Base: {price.baseLabel}</p>
                      <span className="block text-3xl font-bold font-['Space_Grotesk']">{price.totalLabel}</span>
                      <span className="text-muted-foreground text-sm">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                    </>
                  );
                })()}
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {plan.key === 'enterprise' ? (
                <Link to="/register">
                  <Button className={`w-full ${plan.featured ? 'gradient-primary text-primary-foreground glow' : ''}`} variant={plan.featured ? 'default' : 'outline'}>
                    {plan.cta}
                  </Button>
                </Link>
              ) : (
                <Button
                  type="button"
                  className={`w-full ${plan.featured ? 'gradient-primary text-primary-foreground glow' : ''}`}
                  variant={plan.featured ? 'default' : 'outline'}
                  onClick={() => {
                    setSelectedPlan({ key: plan.key, name: plan.name, description: plan.desc });
                    setPaymentDialogOpen(true);
                  }}
                >
                  Pay with M-Pesa
                </Button>
              )}
            </motion.div>
          ))}
        </div>

        <MpesaCheckoutDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          plan={currentPlan ? { key: currentPlan.key, name: currentPlan.name, description: currentPlan.desc } : null}
          billingCycle={billingCycle}
          amount={currentPlanPrice?.totalPrice || 0}
          priceLabel={currentPlanPrice?.totalLabel || ''}
          userId={user?.id}
          defaultPayerName={user?.name || ''}
          defaultPayerEmail={user?.email || ''}
        />

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
