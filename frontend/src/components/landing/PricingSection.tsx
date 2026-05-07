import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { calculatePriceWithVAT, formatKES } from '@/lib/pricing';
import MpesaCheckoutDialog, { BillingCycle, MpesaPlan } from '@/components/landing/MpesaCheckoutDialog';

const PricingSection: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('annual');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<MpesaPlan | null>(null);

  const plans = [
    { key: 'student', name: t('pricing.student'), monthlyBase: 1800, annualBase: 18000, desc: 'Best for students and first-time users', features: ['Platform access', 'Community access'], cta: t('pricing.getStarted'), featured: false },
    { key: 'basic', name: t('pricing.basic'), monthlyBase: 4200, annualBase: 42000, desc: 'For growing teams placing regular requests', features: ['Full platform access', 'Community messaging'], cta: t('pricing.getStarted'), featured: false },
    { key: 'professional', name: t('pricing.professional'), monthlyBase: 7800, annualBase: 78000, desc: 'For advanced teams needing stronger AI support', features: ['Everything in Basic', 'Consultant access'], cta: t('pricing.getStarted'), featured: true },
  ];

  const getPlanPrice = (base: number) => {
    const price = calculatePriceWithVAT(base);
    return { baseLabel: formatKES(price.basePrice), totalLabel: `${formatKES(price.totalPrice)} (incl. VAT)`, totalPrice: price.totalPrice };
  };

  return (
    <section id="pricing" className="py-20">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">{t('pricing.title')}</h2>
          <p className="text-muted-foreground">{t('pricing.subtitle')}</p>
        </motion.div>

        <div className="flex justify-center mb-8">
          <Badge className="bg-slate-800 text-white">{t('pricing.credits6months')}</Badge>
          <div className="ml-4 inline-flex rounded-full border p-1">
            <button onClick={() => setBillingCycle('monthly')} className={billingCycle === 'monthly' ? 'bg-slate-900 text-white px-4 py-1 rounded' : 'px-4 py-1'}>Monthly</button>
            <button onClick={() => setBillingCycle('annual')} className={billingCycle === 'annual' ? 'bg-slate-900 text-white px-4 py-1 rounded' : 'px-4 py-1'}>Annual</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => {
            const price = getPlanPrice(billingCycle === 'monthly' ? p.monthlyBase : p.annualBase);
            return (
              <div key={p.key} className={`border rounded-lg p-6 ${p.featured ? 'ring-2 ring-primary' : ''}`}>
                <h3 className="text-xl font-semibold">{p.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{p.desc}</p>
                <div className="mt-4">
                  <div className="text-2xl font-bold">{price.totalLabel}</div>
                  <div className="text-sm text-muted-foreground">{billingCycle === 'monthly' ? '/month' : '/year'}</div>
                </div>
                <ul className="mt-4 space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-slate-600" />{f}</li>
                  ))}
                </ul>
                <div className="mt-4">
                  <Button onClick={() => { setSelectedPlan({ key: p.key, name: p.name, description: p.desc }); setPaymentDialogOpen(true); }} className="w-full">Pay with M-Pesa</Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <h4 className="text-xl font-semibold mb-2">Why choose our plans?</h4>
          <p className="text-muted-foreground">Predictable pricing, priority support and tools to coordinate suppliers and contractors.</p>
        </div>

        <div className="mt-8 text-center">
          <Button className="bg-slate-900 text-white hover:bg-slate-800" onClick={() => window.scrollTo({ top: document.getElementById('plans')?.offsetTop || 0, behavior: 'smooth' })}>Start with a plan</Button>
        </div>

        <MpesaCheckoutDialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen} plan={selectedPlan} billingCycle={billingCycle} monthlyAmount={selectedPlan ? calculatePriceWithVAT(plans.find(x => x.key === selectedPlan.key)!.monthlyBase).totalPrice : 0} annualAmount={selectedPlan ? calculatePriceWithVAT(plans.find(x => x.key === selectedPlan.key)!.annualBase).totalPrice : 0} userId={user?.id} defaultPayerName={user?.name || ''} defaultPayerEmail={user?.email || ''} />
      </div>
    </section>
  );
};

export default PricingSection;
