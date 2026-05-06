import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { apiUrl } from '@/lib/api';
import { calculatePriceWithVAT, formatKES } from '@/lib/pricing';
import { toast } from 'sonner';
import { RefreshCw, ShieldCheck, Smartphone } from 'lucide-react';
import MpesaCheckoutDialog, { BillingCycle, MpesaPlan } from '@/components/landing/MpesaCheckoutDialog';

type PaymentTransaction = {
  id: string;
  planKey: string;
  planName: string;
  billingCycle: BillingCycle;
  amount: number;
  currency: string;
  status: 'PENDING' | 'REQUESTED' | 'COMPLETED' | 'FAILED';
  mpesaReceiptNumber?: string | null;
  resultDescription?: string | null;
  createdAt: string;
  completedAt?: string | null;
};

type BillingPlan = MpesaPlan & {
  monthlyBase: number;
  annualBase: number;
};

const billingPlans: BillingPlan[] = [
  { key: 'student', name: 'Student', description: 'Best for students and first-time users', monthlyBase: 1800, annualBase: 18000 },
  { key: 'basic', name: 'Basic', description: 'For growing teams placing regular requests', monthlyBase: 4200, annualBase: 42000 },
  { key: 'professional', name: 'Professional', description: 'For advanced teams needing stronger AI support', monthlyBase: 7800, annualBase: 78000 },
];

const Billing = () => {
  const { user, token, updateUser } = useAuth();
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<BillingPlan | null>(null);
  const [selectedCycle, setSelectedCycle] = useState<BillingCycle>('annual');

  const currentSubscription = useMemo(() => {
    if (!user?.subscriptionStatus || user.subscriptionStatus === 'INACTIVE') {
      return null;
    }

    return {
      planName: user.subscriptionPlanName || 'Active plan',
      billingCycle: user.subscriptionBillingCycle || 'annual',
      expiresAt: user.subscriptionExpiresAt,
      startedAt: user.subscriptionActivatedAt,
      status: user.subscriptionStatus,
    };
  }, [user]);

  const loadBillingData = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const [paymentsResponse, meResponse] = await Promise.all([
        fetch(apiUrl('/api/payments/mpesa/history'), {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(apiUrl('/api/auth/me'), {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (paymentsResponse.ok) {
        const payload = await paymentsResponse.json() as { payments?: PaymentTransaction[] };
        setPayments(payload.payments || []);
      }

      if (meResponse.ok) {
        const payload = await meResponse.json() as { user?: typeof user };
        if (payload.user) {
          updateUser(payload.user);
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load billing data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBillingData();
  }, [token]);

  const openCheckout = (plan: BillingPlan, cycle: BillingCycle) => {
    setSelectedPlan(plan);
    setSelectedCycle(cycle);
    setCheckoutOpen(true);
  };

  const getPlanPrice = (plan: BillingPlan, cycle: BillingCycle) => {
    const basePrice = cycle === 'monthly' ? plan.monthlyBase : plan.annualBase;
    return calculatePriceWithVAT(basePrice);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold font-['Space_Grotesk']">Billing & Payments</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Review your subscription, see payment history, and trigger a fresh M-Pesa STK Push when needed.
            </p>
          </div>
          <Button variant="outline" onClick={() => void loadBillingData()} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="card-3d border-0 lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-['Space_Grotesk']">Current Subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentSubscription ? (
              <div className="rounded-xl border bg-muted/30 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Plan</p>
                    <p className="text-lg font-semibold">{currentSubscription.planName}</p>
                  </div>
                  <Badge className="gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> Active
                  </Badge>
                </div>
                <Separator className="my-4" />
                <div className="grid gap-3 sm:grid-cols-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Billing cycle</p>
                    <p className="font-medium capitalize">{currentSubscription.billingCycle}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Started</p>
                    <p className="font-medium">{currentSubscription.startedAt ? new Date(currentSubscription.startedAt).toLocaleDateString() : '—'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Expires</p>
                    <p className="font-medium">{currentSubscription.expiresAt ? new Date(currentSubscription.expiresAt).toLocaleDateString() : '—'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                No active subscription yet. Pick a plan and complete the M-Pesa prompt to activate it automatically.
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              {billingPlans.slice(1).map((plan) => (
                <Card key={plan.key} className="border">
                  <CardContent className="space-y-3 p-4">
                    <div>
                      <p className="font-semibold">{plan.name}</p>
                      <p className="text-xs text-muted-foreground">{plan.description}</p>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Monthly</span>
                      <span className="font-medium">{formatKES(calculatePriceWithVAT(plan.monthlyBase).totalPrice)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Annual</span>
                      <span className="font-medium">{formatKES(calculatePriceWithVAT(plan.annualBase).totalPrice)}</span>
                    </div>
                    <Button className="w-full" variant="outline" onClick={() => openCheckout(plan, 'annual')}>
                      <Smartphone className="mr-2 h-4 w-4" /> Pay with M-Pesa
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="card-3d border-0">
          <CardHeader>
            <CardTitle className="font-['Space_Grotesk']">Quick Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span>Total payments</span>
              <span className="font-semibold">{payments.length}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span>Completed</span>
              <span className="font-semibold text-primary">{payments.filter((payment) => payment.status === 'COMPLETED').length}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span>Pending</span>
              <span className="font-semibold">{payments.filter((payment) => payment.status !== 'COMPLETED').length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="card-3d border-0">
        <CardHeader>
          <CardTitle className="font-['Space_Grotesk']">Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-4 text-sm text-muted-foreground">Loading payment history...</div>
          ) : payments.length === 0 ? (
            <div className="py-4 text-sm text-muted-foreground">No payment records yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead>Cycle</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.planName}</TableCell>
                    <TableCell className="capitalize">{payment.billingCycle}</TableCell>
                    <TableCell>{formatKES(payment.amount)}</TableCell>
                    <TableCell>
                      <Badge variant={payment.status === 'COMPLETED' ? 'default' : payment.status === 'FAILED' ? 'destructive' : 'secondary'}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(payment.completedAt || payment.createdAt).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <MpesaCheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        plan={selectedPlan}
        billingCycle={selectedCycle}
        amount={selectedPlan ? getPlanPrice(selectedPlan, selectedCycle).totalPrice : 0}
        priceLabel={selectedPlan ? `${formatKES(getPlanPrice(selectedPlan, selectedCycle).totalPrice)} (incl. VAT)` : ''}
        userId={user?.id}
        defaultPayerName={user?.name || ''}
        defaultPayerEmail={user?.email || ''}
      />
    </div>
  );
};

export default Billing;
