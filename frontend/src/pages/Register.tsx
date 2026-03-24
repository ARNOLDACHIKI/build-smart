import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';
import logoDark from '@/assets/logo-dark.png';
import logoLight from '@/assets/logo-light.png';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { REGISTERABLE_ROLES, resolveHomeRoute, type AppRole } from '@/lib/roles';

const PENDING_VERIFY_EMAIL_KEY = 'pending_verify_email';

const Register = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const { signup, isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState<AppRole>('USER');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(resolveHomeRoute(user?.role), { replace: true });
    }
  }, [isAuthenticated, navigate, user?.role]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: 'Missing fields',
        description: 'Please fill all required fields.',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Password mismatch',
        description: 'Password and confirm password must match.',
        variant: 'destructive',
      });
      return;
    }

    if (!acceptedTerms) {
      toast({
        title: 'Terms acceptance required',
        description: 'You must accept the Terms and Conditions to create an account.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const data = await signup({
        name,
        email,
        phone,
        company,
        password,
        role,
      });
      if (data.emailVerificationRequired) {
        const verificationEmail = data.verificationEmail || email;
        localStorage.setItem(PENDING_VERIFY_EMAIL_KEY, verificationEmail);
        toast({
          title: 'Check your email',
          description: 'We sent a real verification code to your email. Enter it on the next page.',
        });
        navigate('/verify-email', {
          replace: true,
          state: { email: verificationEmail },
        });
        return;
      }

      toast({ title: 'Account created', description: 'Welcome to Build Buddy AI.' });
      navigate(resolveHomeRoute(role), { replace: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unable to create account.';
      const isEmailExists = errorMessage.includes('Email already exists') || errorMessage.includes('already exists');
      const isPasswordWeak = errorMessage.includes('at least 6 characters');
      
      let title = 'Signup failed';
      let description = errorMessage;
      
      if (isEmailExists) {
        title = 'Email already registered';
        description = 'An account with this email already exists.';
      } else if (isPasswordWeak) {
        title = 'Weak password';
        description = 'Password must be at least 6 characters long.';
      }
      
      toast({
        title,
        description,
        variant: 'destructive',
        action: isEmailExists ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/login')}
            className="bg-background"
          >
            Login Instead
          </Button>
        ) : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      <div className="hidden lg:flex lg:w-1/2 gradient-primary relative items-center justify-center">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center text-primary-foreground relative z-10 p-12">
          <img src={logoDark} alt="ICDBO" className="h-24 w-auto mx-auto mb-6" />
          <h2 className="text-3xl font-bold font-['Space_Grotesk'] mb-4">Join ICDBO Data Analytics</h2>
          <p className="text-lg opacity-90 max-w-md">Start accessing construction sector data and connect with professionals today.</p>
          <p className="text-sm opacity-75 mt-2">ACCESS. INCENTIVISE. ACTION.</p>
        </motion.div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <img src={theme === 'dark' ? logoDark : logoLight} alt="ICDBO" className="h-12 w-auto" />
          </Link>

          <h1 className="text-3xl font-bold font-['Space_Grotesk'] mb-2">{t('auth.createAccount')}</h1>
          <p className="text-muted-foreground mb-8">Fill in your details to get started.</p>

          <form className="space-y-4" onSubmit={handleSubmit}>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('auth.fullName')}</Label>
                <Input placeholder="John Kamau" className="h-11" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
              </div>
              <div className="space-y-2">
                <Label>{t('auth.companyName')}</Label>
                <Input placeholder="Kamau Builders" className="h-11" value={company} onChange={(e) => setCompany(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('auth.role')}</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="h-11"><SelectValue placeholder="Select your role" /></SelectTrigger>
                <SelectContent>
                  {REGISTERABLE_ROLES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {REGISTERABLE_ROLES.find((option) => option.value === role)?.description}
              </p>
            </div>

            <div className="space-y-2">
              <Label>{t('auth.email')}</Label>
              <Input type="email" placeholder="name@company.com" className="h-11" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </div>

            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input type="tel" placeholder="+254 712 345 678" className="h-11" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('auth.password')}</Label>
                <div className="relative">
                  <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="h-11 pr-10" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-11 w-11" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('auth.confirmPassword')}</Label>
                <Input type="password" placeholder="••••••••" className="h-11" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />
              </div>
            </div>

            <Button type="submit" className="w-full h-11 gradient-primary text-primary-foreground glow mt-2" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : t('auth.createAccount')}
            </Button>

            <div className="flex items-start gap-2 pt-1">
              <Checkbox
                id="accept-terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
              />
              <Label htmlFor="accept-terms" className="text-xs font-normal leading-relaxed text-muted-foreground">
                I agree to the{' '}
                <Link to="/terms" className="text-primary hover:underline">
                  Terms and Conditions
                </Link>
                .
              </Label>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link to="/login" className="text-primary hover:underline">{t('auth.loginInstead')}</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
