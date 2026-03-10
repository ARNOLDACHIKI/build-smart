import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authStorage } from '@/lib/auth';
import { apiUrl } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      const errorMessages: Record<string, string> = {
        google_auth_failed: 'Google authentication failed',
        no_code: 'No authorization code received',
        oauth_not_configured: 'Google OAuth is not configured on the server',
        token_exchange_failed: 'Failed to exchange authorization code',
        no_email: 'No email address received from Google',
        oauth_failed: 'Authentication failed',
      };

      toast({
        title: 'Login failed',
        description: errorMessages[error] || 'An error occurred during login',
        variant: 'destructive',
      });
      navigate('/login', { replace: true });
      return;
    }

    if (token) {
      authStorage.setToken(token);
      
      // Fetch user data with the token
      fetch(apiUrl('/api/auth/me'), {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            authStorage.setUser(data.user);
            toast({ title: 'Welcome!', description: 'Successfully logged in with Google' });
            navigate('/dashboard', { replace: true });
          } else {
            throw new Error('Invalid user data');
          }
        })
        .catch(() => {
          authStorage.clear();
          toast({ title: 'Error', description: 'Failed to fetch user data', variant: 'destructive' });
          navigate('/login', { replace: true });
        });
    } else {
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen grid place-items-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Completing login...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
