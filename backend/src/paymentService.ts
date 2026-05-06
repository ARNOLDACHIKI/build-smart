export type BillingCycle = 'monthly' | 'annual';

export type PaymentPlanKey = 'student' | 'basic' | 'professional' | 'enterprise';

export type PaymentPlan = {
  name: string;
  monthlyBase: number;
  annualBase: number;
};

export const VAT_RATE = 0.16;

export const PAYMENT_PLANS: Record<PaymentPlanKey, PaymentPlan> = {
  student: { name: 'Student', monthlyBase: 1800, annualBase: 18000 },
  basic: { name: 'Basic', monthlyBase: 4200, annualBase: 42000 },
  professional: { name: 'Professional', monthlyBase: 7800, annualBase: 78000 },
  enterprise: { name: 'Enterprise', monthlyBase: 12000, annualBase: 120000 },
};

export const calculatePriceWithVAT = (basePrice: number) => {
  const vatAmount = Math.round(basePrice * VAT_RATE);
  return {
    basePrice,
    vatAmount,
    totalPrice: basePrice + vatAmount,
  };
};

export const resolvePlanAmount = (planKey: string, billingCycle: string) => {
  const plan = PAYMENT_PLANS[planKey as PaymentPlanKey];
  const cycle = billingCycle === 'monthly' || billingCycle === 'annual' ? billingCycle : null;

  if (!plan || !cycle) {
    return null;
  }

  const basePrice = cycle === 'monthly' ? plan.monthlyBase : plan.annualBase;
  return {
    key: planKey as PaymentPlanKey,
    plan,
    cycle,
    pricing: calculatePriceWithVAT(basePrice),
    durationDays: cycle === 'monthly' ? 30 : 365,
  };
};

export const calculateSubscriptionExpiry = (
  billingCycle: BillingCycle,
  currentEndsAt: Date | null | undefined,
  now = new Date(),
) => {
  const baseDate = currentEndsAt && currentEndsAt.getTime() > now.getTime() ? currentEndsAt : now;
  const expiry = new Date(baseDate);
  expiry.setDate(expiry.getDate() + (billingCycle === 'monthly' ? 30 : 365));
  return expiry;
};

export const buildSubscriptionActivation = (
  payment: {
    id: string;
    planKey: string;
    planName: string;
    billingCycle: string;
    completedAt?: Date | null;
  },
  currentEndsAt: Date | null | undefined,
  now = new Date(),
) => {
  const billingCycle = payment.billingCycle === 'monthly' ? 'monthly' : 'annual';
  const subscriptionActivatedAt = payment.completedAt || now;
  const subscriptionExpiresAt = calculateSubscriptionExpiry(billingCycle, currentEndsAt, subscriptionActivatedAt);

  return {
    subscriptionPlanKey: payment.planKey,
    subscriptionPlanName: payment.planName,
    subscriptionBillingCycle: billingCycle,
    subscriptionStatus: 'ACTIVE' as const,
    subscriptionActivatedAt,
    subscriptionExpiresAt,
    subscriptionLastPaymentId: payment.id,
  };
};