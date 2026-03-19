import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { resolveHomeRoute } from '@/lib/roles';

const PENDING_TWO_FACTOR_EMAIL_KEY = 'pending_two_factor_email';

type LocationState = {
  email?: string;
};

const VerifyTwoFactor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { verifyTwoFactor, resendTwoFactor, isAuthenticated, user } = useAuth();

  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const locationEmail = (location.state as LocationState | null)?.email;
  const storedEmail = localStorage.getItem(PENDING_TWO_FACTOR_EMAIL_KEY) || '';
  const email = useMemo(() => (locationEmail || storedEmail || '').trim(), [locationEmail, storedEmail]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(resolveHomeRoute(user?.role), { replace: true });
      return;
    }

    if (!email) {
      toast({
        title: 'Missing email',
        description: 'Please sign in again to request a two-factor code.',
        variant: 'destructive',
      });
      navigate('/login', { replace: true });
    }
  }, [email, isAuthenticated, navigate, toast, user?.role]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!email) {
      toast({ title: 'Missing email', description: 'Please sign in again.', variant: 'destructive' });
      return;
    }

    if (!code || code.length !== 6) {
      toast({
        title: 'Invalid code',
        description: 'Please enter the 6-digit code from your email.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await verifyTwoFactor({ email, code });
      localStorage.removeItem(PENDING_TWO_FACTOR_EMAIL_KEY);
      toast({ title: 'Sign in complete', description: 'Two-factor authentication successful.' });
      navigate(resolveHomeRoute(), { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Verification failed';
      toast({
        title: 'Verification failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;

    try {
      setIsResending(true);
      await resendTwoFactor({ email });
      toast({
        title: 'Code resent',
        description: 'A new two-factor code has been sent to your email.',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not resend code';
      toast({
        title: 'Resend failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 py-10">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-foreground">Verify two-factor sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter the 6-digit code sent to <span className="font-medium text-foreground">{email}</span>.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="two-factor-code">Two-factor code</Label>
            <Input
              id="two-factor-code"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="tracking-[0.3em] text-center text-lg"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Verifying...' : 'Verify and Sign In'}
          </Button>
        </form>

        <div className="mt-4 flex items-center justify-between gap-3">
          <Button type="button" variant="outline" onClick={handleResend} disabled={isResending}>
            {isResending ? 'Resending...' : 'Resend Code'}
          </Button>
          <Link to="/login" className="text-sm text-primary hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyTwoFactor;
