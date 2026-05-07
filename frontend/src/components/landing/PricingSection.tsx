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
      return (
        <section id="pricing" className="scroll-mt-24 py-24 relative bg-muted/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-4">{t('pricing.title')}</h1>
              <p className="max-w-3xl mx-auto text-lg text-muted-foreground">{t('pricing.subtitle')}</p>
              <div className="mt-6 flex items-center justify-center gap-4">
                <Button
                  onClick={() => window.scrollTo({ top: document.getElementById('plans')?.offsetTop || 0, behavior: 'smooth' })}
                  className="gradient-primary text-primary-foreground"
                >
                  Get started
                </Button>
                <Button variant="ghost" onClick={() => window.scrollTo({ top: document.getElementById('compare')?.offsetTop || 0, behavior: 'smooth' })}>
                  Compare plans
                </Button>
              </div>
            </motion.div>

            <div className="mx-auto max-w-4xl text-center mb-10">
              <Badge className="px-3 py-1">{t('pricing.credits6months')}</Badge>
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
            </div>

            <div id="plans" className="grid gap-6 grid-cols-1 md:grid-cols-3 max-w-6xl mx-auto mb-12">
              {plans.slice(0, 3).map((plan, i) => (
                <motion.div
                  key={plan.key}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className={`rounded-lg border border-border bg-background p-6 flex flex-col shadow-sm ${plan.featured ? 'ring-2 ring-primary' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{plan.desc}</p>
                    </div>
                    {plan.featured && <Badge>Recommended</Badge>}
                  </div>

                  <div className="mt-6">
                    {(() => {
                      const price = getPlanPrice(plan);
                      return (
                        <>
                          <div className="flex items-baseline gap-3">
                            <span className="text-3xl font-bold">{price.totalLabel}</span>
                            <span className="text-sm text-muted-foreground">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Base: {price.baseLabel}</p>
                        </>
                      );
                    })()}
                  </div>

                  <ul className="mt-6 space-y-2 flex-1">
                    {plan.features.slice(0, 5).map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6">
                    {plan.key === 'enterprise' ? (
                      <Link to="/register">
                        <Button className="w-full" variant="outline">
                          {plan.cta}
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        type="button"
                        className="w-full"
                        onClick={() => {
                          setSelectedPlan({ key: plan.key, name: plan.name, description: plan.desc });
                          setPaymentDialogOpen(true);
                        }}
                      >
                        Pay with M-Pesa
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="max-w-4xl mx-auto mb-12 text-center">
              <h3 className="text-2xl font-semibold mb-3">Why choose our plans?</h3>
              <p className="text-muted-foreground">We designed these plans to scale with teams — predictable pricing, priority support, and the data tools you need to coordinate suppliers and contractors effectively.</p>
            </div>

            <div id="compare" className="max-w-6xl mx-auto mb-12">
              <div className="overflow-x-auto rounded-md border border-border bg-background">
                <table className="w-full min-w-[700px] text-sm">
                  <thead>
                    <tr className="text-left">
                      <th className="p-4">Features</th>
                      {plans.slice(0, 3).map((p) => (
                        <th key={p.key} className="p-4">{p.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {['Platform access', 'Community access', 'Consultant access', 'AI insights', 'Priority support'].map((feat, idx) => (
                      <tr key={feat} className={idx % 2 === 0 ? 'bg-muted/10' : ''}>
                        <td className="p-4 font-medium">{feat}</td>
                        {plans.slice(0, 3).map((p) => (
                          <td key={p.key} className="p-4">
                            {p.features.includes(feat) ? <Check className="w-4 h-4 text-primary inline" /> : <span className="text-muted-foreground">—</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="max-w-4xl mx-auto text-center">
              <p className="text-lg font-semibold mb-4">Ready to get started?</p>
              <div className="flex gap-4 items-center justify-center">
                <Button className="gradient-primary text-primary-foreground" onClick={() => window.scrollTo({ top: document.getElementById('plans')?.offsetTop || 0, behavior: 'smooth' })}>
                  Start with a plan
                </Button>
                <Link to="/contact">
                  <Button variant="outline">Contact sales</Button>
                </Link>
              </div>
            </div>

            <MpesaCheckoutDialog
              open={paymentDialogOpen}
              onOpenChange={setPaymentDialogOpen}
              plan={currentPlan ? { key: currentPlan.key, name: currentPlan.name, description: currentPlan.desc } : null}
              billingCycle={billingCycle}
              monthlyAmount={currentPlan ? calculatePriceWithVAT(currentPlan.monthlyBase).totalPrice : 0}
              annualAmount={currentPlan ? calculatePriceWithVAT(currentPlan.annualBase).totalPrice : 0}
              userId={user?.id}
              defaultPayerName={user?.name || ''}
              defaultPayerEmail={user?.email || ''}
            />
          </div>
        </section>
      );
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
          monthlyAmount={currentPlan ? calculatePriceWithVAT(currentPlan.monthlyBase).totalPrice : 0}
          annualAmount={currentPlan ? calculatePriceWithVAT(currentPlan.annualBase).totalPrice : 0}
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
