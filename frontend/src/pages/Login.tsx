import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';
import logoDark from '@/assets/logo-dark.png';
import logoLight from '@/assets/logo-light.png';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { authStorage } from '@/lib/auth';

const Login = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const { login, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const loggedInUser = authStorage.getUser();
      const destination = loggedInUser?.role === 'ENGINEER' ? '/engineer' : loggedInUser?.role === 'ADMIN' ? '/admin' : '/dashboard';
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!email || !password) {
      toast({
        title: 'Missing fields',
        description: 'Please enter your email and password.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await login({ email, password });
      toast({ title: 'Welcome back', description: 'Login successful.' });
      const loggedInUser = authStorage.getUser();
      const destination = loggedInUser?.role === 'ENGINEER' ? '/engineer' : loggedInUser?.role === 'ADMIN' ? '/admin' : '/dashboard';
      navigate(destination, { replace: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unable to login.';
      const isAccountNotFound = errorMessage.includes('Account not found') || errorMessage.includes('No account exists');
      const isWrongPassword = errorMessage.includes('Invalid password') || errorMessage.includes('incorrect');
      
      let title = 'Login failed';
      let description = errorMessage;
      
      if (isAccountNotFound) {
        title = 'Account not found';
        description = 'No account exists with this email.';
      } else if (isWrongPassword) {
        title = 'Incorrect password';
        description = 'The password you entered is incorrect.';
      }
      
      toast({
        title,
        description,
        variant: 'destructive',
        action: isAccountNotFound ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/register')}
            className="bg-background"
          >
            Create Account
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
          <h2 className="text-3xl font-bold font-['Space_Grotesk'] mb-4">ICDBO Data Analytics</h2>
          <p className="text-lg opacity-90 max-w-md">Informing the construction market. Shaping the future.</p>
          <p className="text-sm opacity-75 mt-2">ACCESS. INCENTIVISE. ACTION.</p>
        </motion.div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <img src={theme === 'dark' ? logoDark : logoLight} alt="ICDBO" className="h-12 w-auto" />
          </Link>

          <h1 className="text-3xl font-bold font-['Space_Grotesk'] mb-2">{t('nav.login')}</h1>
          <p className="text-muted-foreground mb-8">Welcome back! Enter your credentials to continue.</p>

          <form className="space-y-4" onSubmit={handleSubmit}>

            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                className="h-11"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="h-11 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-11 w-11" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-sm font-normal">{t('auth.rememberMe')}</Label>
              </div>
              <a href="#" className="text-sm text-primary hover:underline">{t('auth.forgotPassword')}</a>
            </div>

            <Button type="submit" className="w-full h-11 gradient-primary text-primary-foreground glow mt-2" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : t('nav.login')}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link to="/register" className="text-primary hover:underline">{t('auth.signupInstead')}</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
