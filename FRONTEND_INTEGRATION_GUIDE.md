# Email Verification Flow - Visual Guide & Frontend Integration

## 🔄 Complete Email Verification Flow

```
┌────────────────────────────────────────────────────────────────────────────┐
│                         USER REGISTRATION FLOW                              │
└────────────────────────────────────────────────────────────────────────────┘

USER FILLS FORM
          ↓
    ┌─────────────────────┐
    │ Name: John Doe      │
    │ Email: john@...     │   ← User enters details
    │ Password: ****      │
    └─────────────────────┘
          ↓
    POST /api/auth/register
          ↓
BACKEND PROCESSES
    ├─ Validate input
    ├─ Check email exists? → Yes = Error 409
    ├─ Hash password
    ├─ Create user (emailVerified: false)
    ├─ Generate code: "345672"
    ├─ Set expiry: +24 hours
    └─ Send email
          ↓
GMAIL SMTP SERVER sends email
          ↓
USER RECEIVES EMAIL
    ┌─────────────────────────────────────────┐
    │ ✉️ Your Verification Code               │
    │                                         │
    │ Code: 345672                            │
    │                                         │
    │ [VERIFY BUTTON] ← Clickable link        │
    │                                         │
    │ Expires in: 24 hours                    │
    └─────────────────────────────────────────┘
          ↓
FRONTEND SHOWS 'VERIFY EMAIL' SCREEN
    ┌─────────────────────┐
    │ Enter 6-digit code: │
    │ [      ]            │
    │ [VERIFY]            │
    │ [Resend Code]       │
    └─────────────────────┘
          ↓
USER ENTERS CODE
          ↓
    POST /api/auth/verify-email
    { email: "john@...", code: "345672" }
          ↓
BACKEND VALIDATES
    ├─ Code matches? ✓
    ├─ Not expired? ✓
    └─ Not already used? ✓
          ↓
EMAIL VERIFIED ✅
    ├─ Set emailVerified: true
    ├─ Clear verification token
    └─ Send welcome email
          ↓
WELCOME EMAIL SENT
    ┌─────────────────────────────────────────┐
    │ 🎉 Welcome to ICDBO Analytics           │
    │                                         │
    │ Your account is ready!                  │
    │                                         │
    │ [GO TO DASHBOARD] ← Clickable link      │
    └─────────────────────────────────────────┘
          ↓
FRONTEND REDIRECTS TO DASHBOARD
          ↓
    ✅ REGISTRATION COMPLETE ✅
```

---

## 🔄 Error Handling Flow

```
USER ENTERS CODE
        ↓
    [Validate Code]
        ↓
    ┌───────────────────────┐
    │ Code is...?           │
    └───────────────────────┘
    ├─ INVALID
    │     ↓
    │  ❌ "Invalid verification code"
    │     ↓
    │  [Retry] | [Resend Code]
    │
    ├─ EXPIRED
    │     ↓
    │  ⏰ "Code expired. Request new one"
    │     ↓
    │  [Resend Code]
    │
    ├─ VALID ✓
    │     ↓
    │  ✅ "Email verified!"
    │     ↓
    │  [Go to Dashboard]
    │
    └─ User not found
        ↓
     ❌ "User not found" (404)
```

---

## 📱 Frontend Registration Component (React)

### Step 1: Registration Form Component

```typescript
// components/RegistrationForm.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function RegistrationForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState('register'); // 'register' | 'verify'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    company: '',
    role: 'USER'
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // STEP 1: Register user
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Store token temporarily
      localStorage.setItem('tempToken', data.token);
      localStorage.setItem('userEmail', data.user.email);
      
      // Move to verification step
      setStep('verify');
      setMessage('Verification code sent to your email!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration error');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify email
  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          code: verificationCode
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      // Save token and redirect
      localStorage.setItem('token', data.token);
      localStorage.removeItem('tempToken');
      
      setMessage('Email verified successfully! Redirecting...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Verification error';
      setError(errorMsg);
      
      // Show resend option if code expired
      if (errorMsg.includes('expired')) {
        setMessage('');
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend verification code
  const handleResendCode = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend code');
      }

      setVerificationCode('');
      setMessage('New verification code sent to your email!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Resend error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-container">
      {step === 'register' ? (
        // REGISTRATION FORM
        <form onSubmit={handleRegister} className="form">
          <h2>Create Account</h2>
          
          <input
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          
          <input
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
            minLength={6}
          />
          
          <input
            type="tel"
            placeholder="Phone Number (optional)"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
          
          <input
            type="text"
            placeholder="Company (optional)"
            value={formData.company}
            onChange={(e) => setFormData({...formData, company: e.target.value})}
          />

          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}
          
          <button type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
          
          <p className="login-link">
            Already have an account? <a href="/login">Log in</a>
          </p>
        </form>
      ) : (
        // EMAIL VERIFICATION FORM
        <form onSubmit={handleVerifyEmail} className="form">
          <h2>Verify Your Email</h2>
          
          <div className="email-info">
            <p>We sent a 6-digit code to:</p>
            <p className="email-highlight">{formData.email}</p>
          </div>
          
          <input
            type="text"
            placeholder="000000"
            maxLength={6}
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
            className="code-input"
            required
            autoFocus
          />
          
          {error && (
            <div className="error-message">
              {error}
              {error.includes('expired') && (
                <button 
                  type="button" 
                  onClick={handleResendCode}
                  className="link-button"
                >
                  → Get new code
                </button>
              )}
            </div>
          )}
          
          {message && <div className="success-message">{message}</div>}
          
          <button type="submit" disabled={loading || verificationCode.length !== 6}>
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
          
          <div className="divider">or</div>
          
          <button 
            type="button"
            onClick={handleResendCode}
            disabled={loading}
            className="secondary-button"
          >
            Didn't receive code? Resend
          </button>
        </form>
      )}
    </div>
  );
}
```

### Step 2: CSS Styles

```css
/* styles/registration.css */

.registration-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 40px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.1);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form h2 {
  color: #333;
  margin: 0 0 20px 0;
  text-align: center;
}

.form input {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form input.code-input {
  font-size: 24px;
  letter-spacing: 8px;
  text-align: center;
  font-weight: bold;
  font-family: 'Courier New', monospace;
}

button {
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

button:hover:not(:disabled) {
  transform: translateY(-2px);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.secondary-button {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.secondary-button:hover:not(:disabled) {
  background: #f9f9f9;
}

.error-message {
  padding: 12px;
  background-color: #fee;
  border: 1px solid #f33;
  color: #c00;
  border-radius: 6px;
  font-size: 14px;
}

.success-message {
  padding: 12px;
  background-color: #efe;
  border: 1px solid #3f3;
  color: #030;
  border-radius: 6px;
  font-size: 14px;
}

.email-info {
  text-align: center;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 6px;
}

.email-info p {
  margin: 8px 0;
  color: #666;
}

.email-highlight {
  font-weight: 600;
  color: #667eea;
}

.divider {
  text-align: center;
  color: #ccc;
  margin: 12px 0;
}

.login-link {
  text-align: center;
  color: #666;
  font-size: 14px;
}

.login-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.link-button {
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
  margin-top: 8px;
}
```

### Step 3: Usage in Router

```typescript
// App.tsx or Router.tsx
import { RegistrationForm } from './components/RegistrationForm';

<Route path="/register" element={<RegistrationForm />} />
```

---

## 🎨 Email Template Preview

### Verification Email Preview
```
┌─────────────────────────────────────────────┐
│                                             │
│  🔐 EMAIL VERIFICATION                     │
│  Secure Your Account                       │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│ Hi John,                                   │
│                                             │
│ Thank you for registering with ICDBO!      │
│ To complete registration, verify your      │
│ email using the code below.                │
│                                             │
│ ┌────────────────────────────────────────┐ │
│ │  Your verification code is:            │ │
│ │                                        │ │
│ │      3 4 5 6 7 2                       │ │
│ │                                        │ │
│ │  Copy and paste this code into the    │ │
│ │  verification field on our website.   │ │
│ └────────────────────────────────────────┘ │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │    [VERIFY EMAIL BUTTON]             │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ⏱️  This code expires in 24 hours         │
│                                             │
│  ⚠️  Never share this code with anyone     │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│ © 2026 ICDBO Analytics. All rights        │
│ reserved.                                  │
│                                             │
│ support@icdbo.com                         │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🔐 Protected Routes Example

```typescript
// components/ProtectedRoute.tsx
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  // Check if email is verified
  if (user && !user.emailVerified) {
    return <Navigate to="/verify-email" />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}

// Usage in Router
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>
```

---

## 📊 Data Flow Diagram

```
FRONTEND                          BACKEND                    DATABASE & EMAIL
┌──────────┐                      ┌──────────┐               ┌─────────────┐
│Register  │ ────POST /register──→│Validate  │               │             │
│Form      │                      │Input     │               │             │
└──────────┘                      └────┬─────┘               │             │
     ↓                                 │                      │             │
┌──────────┐                      ┌────v─────┐               │             │
│Show      │  ←──Response with── │Create    │───INSERT──→   │ users       │
│Verify    │  emailVerification   │User      │  (emailVerif  │ (emailVeri  │
│Screen    │     Required: true   │Generate  │   ied: false) │  ed: false) │
│(waits    │                      │Code      │               │             │
│for code) │                      └────┬─────┘               │             │
│          │                           │                     │             │
│          │                      ┌────v──────────┐          │             │
│          │                      │Send Email via │──────→   │  SMTP       │
│          │                      │Nodemailer     │  (to)    │  Server     │
│          │                      └────┬──────────┘          │             │
│          │                           │                     │             │
│          │  [USER RECEIVES EMAIL]    │                     │             │
│          │  Contains: 6-digit code   │                     │             │
│          │                           │                     │             │
│          ↓                           │                     │             │
│ User enters code                     │                     │             │
│ POST /verify-email                   │                     │             │
│          │                           │                     │             │
│          ├─── email, code ───→       │                     │             │
│          │                      ┌────v────────┐            │             │
│          │                      │Validate code│            │             │
│          │                      │Check expiry │            │             │
│          │                      │Verify logic │            │             │
│          │                      └────┬────────┘            │             │
│          │                           │                     │             │
│          │ (if valid)            ┌───v─────────┐           │             │
│          │                        │UPDATE User  │──UPDATE──→│emailVerif   │
│          │←──Token + User data───│Set verified │  true     │ied: true,  │
│          │                        │Send welcome │──────→    │token clear  │
│          │                        │email        │           │             │
│          │                        └─────────────┘           │             │
│          │                                                  │             │
│ User redirects to dashboard                                │             │
└──────────────────────────────────────┘                     └─────────────┘
```

---

## 🎯 State Management (Context)

```typescript
// contexts/AuthContext.tsx
import { createContext, useState, useContext } from 'react';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  register: (data: RegisterData) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token')
  );
  const [loading, setLoading] = useState(false);

  const register = async (data: RegisterData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      
      if (!response.ok) throw new Error(result.error);

      setUser(result.user);
      setToken(result.token);
      localStorage.setItem('tempToken', result.token);
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (email: string, code: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });

      const result = await response.json();
      
      if (!response.ok) throw new Error(result.error);

      setUser(result.user);
      setToken(result.token);
      localStorage.setItem('token', result.token);
      localStorage.removeItem('tempToken');
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async (email: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!response.ok) throw new Error('Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('tempToken');
  };

  return (
    <AuthContext.Provider 
      value={{ user, token, loading, register, verifyEmail, resendVerification, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

---

## ✨ Summary

✅ Complete end-to-end registration with email verification  
✅ Professional UI components with React  
✅ Beautiful email templates  
✅ Secure code generation and validation  
✅ Error handling and user feedback  
✅ Context-based state management  
✅ Protected routes for verified users  

All files and examples are ready to integrate!
