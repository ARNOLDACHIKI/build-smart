import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { calculatePriceWithVAT, formatKES, formatUSD, convertUSDtoKES, formatCurrency } from '@/lib/pricing';
import MpesaCheckoutDialog, { BillingCycle, MpesaPlan } from '@/components/landing/MpesaCheckoutDialog';

const PricingSection: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('annual');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<MpesaPlan | null>(null);

  // Pricing in USD per the screenshot
  const plans = [
    { 
      key: 'student', 
      name: 'Student', 
      yearlyUSD: 5, 
      desc: 'Free package for students for 1 year and pays USD 5 per year in consecutive membership period',
      features: ['Platform access', 'Community access', '1 year free trial for students'],
      cta: 'Get Started',
      featured: false 
    },
    { 
      key: 'basic', 
      name: 'Standard', 
      yearlyUSD: 30, 
      desc: 'Access platform, products, services and the community',
      features: ['Full platform access', 'Products & services access', 'Community messaging', 'Direct contact to community members'],
      cta: 'Get Started',
      featured: false 
    },
    { 
      key: 'professional', 
      name: 'Professional', 
      yearlyUSD: 50, 
      desc: 'Access consultants and team support for your project',
      features: ['Everything in Standard', 'Consultant access', 'Team support', 'Priority support'],
      cta: 'Get Started',
      featured: true 
    },
    { 
      key: 'enterprise', 
      name: 'Enterprise', 
      yearlyUSD: 75, 
      desc: 'Access suppliers, get approved construction products samples, engage contractors, receive specialized data',
      features: ['Everything in Professional', 'Supplier access', 'Product samples', 'Contractor engagement', 'Specialized project data', 'Dedicated account manager'],
      cta: 'Contact Sales',
      featured: false 
    },
  ];

  const getDisplayPrice = (yearlyUSD: number) => {
    // Always calculate KES amounts for M-Pesa (Kenya payment method)
    const yearlyKES = convertUSDtoKES(yearlyUSD);
    const yearlyWithVAT = calculatePriceWithVAT(yearlyKES).totalPrice;
    const monthlyKES = Math.round(yearlyKES / 12);
    const monthlyWithVAT = calculatePriceWithVAT(monthlyKES).totalPrice;

    if (currency === 'USD') {
      // Monthly is 1/12 of yearly
      const monthlyUSD = Math.round(yearlyUSD / 12);
      return {
        monthly: formatUSD(monthlyUSD),
        yearly: formatUSD(yearlyUSD),
        monthlyAmount: monthlyWithVAT, // Always KES for M-Pesa
        yearlyAmount: yearlyWithVAT,   // Always KES for M-Pesa
      };
    } else {
      return {
        monthly: `${formatKES(monthlyWithVAT)} (incl. VAT)`,
        yearly: `${formatKES(yearlyWithVAT)} (incl. VAT)`,
        monthlyAmount: monthlyWithVAT,
        yearlyAmount: yearlyWithVAT,
      };
    }
  };

  const handleSelectPlan = (plan: typeof plans[0]) => {
    const price = getDisplayPrice(plan.yearlyUSD);
    setSelectedPlan({ 
      key: plan.key, 
      name: plan.name, 
      description: plan.desc 
    });
    setPaymentDialogOpen(true);
  };

  return (
    <section id="pricing" className="py-20 bg-gradient-to-b from-transparent to-slate-50 dark:to-slate-900/50">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Choose the perfect plan for your needs. Scale up or down anytime.</p>
        </motion.div>

        <div className="flex flex-col md:flex-row justify-center items-center gap-6 mb-12">
          <Badge className="bg-slate-800 text-white text-sm py-2 px-4">+ 6 months bonus credits included</Badge>
          
          <div className="inline-flex rounded-full border p-1">
            <button 
              onClick={() => setBillingCycle('monthly')} 
              className={`px-4 py-1 rounded transition-all ${billingCycle === 'monthly' ? 'bg-slate-900 text-white' : 'hover:text-slate-900'}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setBillingCycle('annual')} 
              className={`px-4 py-1 rounded transition-all ${billingCycle === 'annual' ? 'bg-slate-900 text-white' : 'hover:text-slate-900'}`}
            >
              Annual
            </button>
          </div>

          <div className="inline-flex rounded-full border p-1 bg-white dark:bg-slate-800">
            <button 
              onClick={() => setCurrency('USD')} 
              className={`px-4 py-1 rounded transition-all font-medium ${currency === 'USD' ? 'bg-blue-500 text-white' : 'hover:text-blue-500'}`}
            >
              USD
            </button>
            <button 
              onClick={() => setCurrency('KES')} 
              className={`px-4 py-1 rounded transition-all font-medium ${currency === 'KES' ? 'bg-green-500 text-white' : 'hover:text-green-500'}`}
            >
              KES
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((p, idx) => {
            const price = getDisplayPrice(p.yearlyUSD);
            const displayPrice = billingCycle === 'monthly' ? price.monthly : price.yearly;
            
            return (
              <motion.div 
                key={p.key} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`relative border rounded-xl p-6 transition-all hover:shadow-lg ${
                  p.featured 
                    ? 'ring-2 ring-primary shadow-lg scale-105 md:scale-100 lg:scale-105' 
                    : 'hover:shadow-md'
                } bg-white dark:bg-slate-800`}
              >
                {p.featured && <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-500 text-white">Most Popular</Badge>}
                
                <h3 className="text-2xl font-bold mt-2">{p.name}</h3>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{p.desc}</p>
                
                <div className="mt-6 mb-6">
                  <div className="text-4xl font-bold">{displayPrice}</div>
                  <div className="text-sm text-muted-foreground mt-1">{billingCycle === 'monthly' ? 'per month' : 'per year'}</div>
                </div>

                <ul className="space-y-3 mb-8">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">{f}</span>
                    </li>
                  ))}
                </ul>
                
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    onClick={() => handleSelectPlan(p)}
                    className={`w-full ${p.featured ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg' : 'bg-slate-200 text-slate-900 hover:bg-slate-300'}`}
                  >
                    {p.cta}
                  </Button>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-16 text-center bg-slate-900 dark:bg-slate-800 rounded-lg p-8 text-white">
          <h4 className="text-2xl font-bold mb-3">Why choose our plans?</h4>
          <p className="text-slate-300 max-w-2xl mx-auto">Predictable pricing, priority support and tools to coordinate suppliers and contractors. All plans include access to our platform and community.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2"><Check className="w-4 h-4" /> Money-back guarantee</div>
            <div className="flex items-center gap-2"><Check className="w-4 h-4" /> 24/7 Support</div>
            <div className="flex items-center gap-2"><Check className="w-4 h-4" /> No hidden fees</div>
          </div>
        </motion.div>

        <MpesaCheckoutDialog 
          open={paymentDialogOpen} 
          onOpenChange={setPaymentDialogOpen} 
          plan={selectedPlan} 
          billingCycle={billingCycle} 
          monthlyAmount={selectedPlan ? getDisplayPrice(plans.find(x => x.key === selectedPlan.key)!.yearlyUSD).monthlyAmount : 0}
          annualAmount={selectedPlan ? getDisplayPrice(plans.find(x => x.key === selectedPlan.key)!.yearlyUSD).yearlyAmount : 0}
          userId={user?.id} 
          defaultPayerName={user?.name || ''} 
          defaultPayerEmail={user?.email || ''} 
        />
      </div>
    </section>
  );
};

export default PricingSection;
