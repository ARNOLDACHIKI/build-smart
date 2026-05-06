import { useEffect, useState, type FormEvent } from 'react';
import { Loader2, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';

export type BillingCycle = 'monthly' | 'annual';

export type MpesaPlan = {
  key: string;
  name: string;
  description: string;
};

type MpesaCheckoutDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: MpesaPlan | null;
  billingCycle: BillingCycle;
  monthlyAmount: number;
  annualAmount: number;
  userId?: string | null;
  defaultPayerName?: string;
  defaultPayerEmail?: string;
  defaultPhoneNumber?: string;
};

const MpesaCheckoutDialog = ({ open, onOpenChange, plan, billingCycle, monthlyAmount, annualAmount, userId, defaultPayerName, defaultPayerEmail, defaultPhoneNumber }: MpesaCheckoutDialogProps) => {
  const [payerName, setPayerName] = useState(defaultPayerName || '');
  const [payerEmail, setPayerEmail] = useState(defaultPayerEmail || '');
  const [phoneNumber, setPhoneNumber] = useState(defaultPhoneNumber || '');
  const [selectedCycle, setSelectedCycle] = useState<BillingCycle>(billingCycle);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedAmount = selectedCycle === 'monthly' ? monthlyAmount : annualAmount;
  const selectedPriceLabel = selectedAmount.toLocaleString('en-KE');

  useEffect(() => {
    if (open) {
      setPayerName(defaultPayerName || '');
      setPayerEmail(defaultPayerEmail || '');
      setPhoneNumber(defaultPhoneNumber || '');
      setSelectedCycle(billingCycle);
    }
  }, [billingCycle, defaultPayerEmail, defaultPayerName, defaultPhoneNumber, open]);

  const submitPayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!plan) {
      toast.error('Select a plan first.');
      return;
    }

    if (!payerName.trim() || !phoneNumber.trim()) {
      toast.error('Name and phone number are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(apiUrl('/api/payments/mpesa/stk-push'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planKey: plan.key,
            billingCycle: selectedCycle,
          phoneNumber,
          payerName,
          payerEmail: payerEmail.trim() || undefined,
          userId: userId || undefined,
        }),
      });

      const payload = await response.json().catch(() => ({})) as { error?: string; message?: string; mpesa?: { CheckoutRequestID?: string } };

      if (!response.ok) {
        throw new Error(payload.error || 'Failed to initiate M-Pesa checkout.');
      }

      toast.success(payload.message || 'STK push sent. Check your phone to complete the payment.');
      onOpenChange(false);
      setPayerName('');
      setPayerEmail('');
      setPhoneNumber('');

      if (payload.mpesa?.CheckoutRequestID) {
        toast.info(`Checkout request: ${payload.mpesa.CheckoutRequestID}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to start the payment flow.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-['Space_Grotesk']">
            <Smartphone className="h-5 w-5 text-primary" />
            Pay with M-Pesa
          </DialogTitle>
          <DialogDescription>
            {plan ? `${plan.name} plan • KES ${selectedPriceLabel} / ${selectedCycle === 'monthly' ? 'month' : 'year'}` : 'Choose a plan first.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label>Billing cycle</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={selectedCycle === 'monthly' ? 'default' : 'outline'}
              onClick={() => setSelectedCycle('monthly')}
              className="w-full"
            >
              Monthly
            </Button>
            <Button
              type="button"
              variant={selectedCycle === 'annual' ? 'default' : 'outline'}
              onClick={() => setSelectedCycle('annual')}
              className="w-full"
            >
              Annual
            </Button>
          </div>
        </div>

        <form className="space-y-4" onSubmit={submitPayment}>
          <div className="space-y-2">
            <Label htmlFor="payer-name">Full name</Label>
            <Input
              id="payer-name"
              value={payerName}
              onChange={(event) => setPayerName(event.target.value)}
              placeholder="Jane Doe"
              autoComplete="name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payer-email">Email address</Label>
            <Input
              id="payer-email"
              type="email"
              value={payerEmail}
              onChange={(event) => setPayerEmail(event.target.value)}
              placeholder="jane@example.com"
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payer-phone">M-Pesa phone number</Label>
            <Input
              id="payer-phone"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              placeholder="0712 345 678"
              autoComplete="tel"
              required
            />
          </div>

          <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
            <div className="flex items-center justify-between gap-3">
              <span>Amount to pay</span>
              <span className="font-semibold text-foreground">{selectedAmount.toLocaleString('en-KE')} KES</span>
            </div>
            <p className="mt-1">You will receive an STK push prompt on the phone number you enter.</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gradient-primary text-primary-foreground">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send STK Push
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MpesaCheckoutDialog;