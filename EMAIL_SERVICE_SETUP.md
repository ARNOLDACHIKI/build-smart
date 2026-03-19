# Email Service Setup Guide

## Overview

The Build Buddy AI platform now has a comprehensive email service that sends:
- **Email verification codes** during user registration
- **Welcome emails** after email verification
- **Password reset emails** for account recovery
- **Inquiry notifications** when users receive inquiries
- **Reply notifications** when inquiries are answered
- **Reminder emails** for various system events

## Features

✅ **Email Verification During Registration**
- Users receive a 6-digit verification code via email
- Verification code expires after 24 hours
- Users can resend verification code if needed
- Email templates with professional HTML design

✅ **Multiple Email Templates**
- Verification email with security code
- Welcome email after email confirmation
- Password reset email
- Inquiry notifications
- Inquiry reply notifications
- Generic reminder emails

✅ **Email Service Integration**
- Uses Nodemailer for reliable email delivery
- Gmail SMTP support configured by default
- Supports other SMTP providers
- Fire-and-forget email sending (non-blocking)

## Configuration

### 1. Gmail Setup (Production)

To use the email service with Gmail, follow these steps:

#### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Factor Authentication if not already enabled
3. Complete the verification process

#### Step 2: Generate App Password
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Scroll down to "App passwords" (only visible if 2FA is enabled)
3. Select "Mail" and "Windows Computer" (or your app type)
4. Google will generate a 16-character password
5. Copy this password

#### Step 3: Update .env File

Add these variables to your `.env` file:

```env
# Email Configuration (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=Icdboanalytics@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx  # Your 16-character app password (without spaces in actual file)
COMPANY_EMAIL=Icdboanalytics@gmail.com
COMPANY_NAME=ICDBO Analytics
APP_URL=https://yourdomain.com  # For production
```

### 2. Alternative SMTP Providers

The email service is configured to work with any SMTP provider:

#### Option A: SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.xxxxxxxxxxxxx
COMPANY_EMAIL=noreply@yourdomain.com
```

#### Option B: AWS SES
```env
SMTP_HOST=email-smtp.region.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASSWORD=your-ses-smtp-password
COMPANY_EMAIL=noreply@yourdomain.com
```

#### Option C: Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@yourdomain.com
SMTP_PASSWORD=your-mailgun-password
COMPANY_EMAIL=noreply@yourdomain.com
```

## API Endpoints

### 1. Register User
**POST** `/api/auth/register`

Request:
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe",
  "phone": "+1234567890",
  "company": "ACME Corp",
  "role": "USER"
}
```

Response:
```json
{
  "user": { /* user object */ },
  "token": "jwt-token",
  "message": "Registration successful! A verification email has been sent.",
  "emailVerificationRequired": true
}
```

**Behavior:**
- User is created but `emailVerified` is `false`
- Verification code (6 digits) is generated and stored
- Email with verification code is sent immediately
- Expiry set to 24 hours from registration

### 2. Verify Email
**POST** `/api/auth/verify-email`

Request:
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

Response:
```json
{
  "message": "Email verified successfully!",
  "user": { /* user object with emailVerified: true */ },
  "token": "jwt-token"
}
```

**Behavior:**
- Validates the verification code
- Checks if code has not expired
- Sets `emailVerified` to `true`
- Sends welcome email
- Returns new JWT token

### 3. Resend Verification Email
**POST** `/api/auth/resend-verification`

Request:
```json
{
  "email": "user@example.com"
}
```

Response:
```json
{
  "message": "Verification email resent successfully. Check your inbox."
}
```

**Behavior:**
- Generates new verification code
- Updates expiry to 24 hours
- Sends new verification email
- Updates `emailVerificationSent` timestamp

## Email Templates

### Verification Email
- Professional gradient header
- Large, easy-to-read 6-digit code
- Explanation of what to do
- Expiry warning (24 hours)
- Security notice
- Company branding

### Welcome Email
- Celebratory message
- List of features user can access
- Call-to-action button to dashboard
- Support contact information

### Password Reset Email
- Warning color scheme for security
- Secure reset link
- 1-hour expiry notice
- Instructions for lost links

### Inquiry Notification
- Sender information
- Message preview
- Direct link to reply
- Call-to-action button

### Inquiry Reply Notification
- Indicates a reply has been received
- Reply preview
- Link to view conversation

## Email Sending

All email sending functions are non-blocking (fire-and-forget):

```typescript
// Example: Custom reminder email
import { sendReminderEmail } from './emailService.js';

await sendReminderEmail(
  'user@example.com',
  'Project Update Reminder',
  'John Doe',
  '<p>Your project update is due today!</p>',
  'https://app.example.com/projects/123'
);
```

## Database Schema

The User model now includes these email verification fields:

```prisma
model User {
  id                       String     @id @default(cuid())
  email                    String     @unique
  emailVerified            Boolean    @default(false)           // Email verification status
  emailVerificationToken   String?                               // Current verification code
  emailVerificationExpiry  DateTime?                             // When code expires
  emailVerificationSent    DateTime?                             // When email was sent
  // ... other fields
}
```

## Frontend Integration

### Example: React Registration Component

```typescript
import { useState } from 'react';

export function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState('register'); // 'register' | 'verify'

  const handleRegister = async () => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (response.ok) {
      setStep('verify');
      // Show message: "Verification email sent to your inbox"
    }
  };

  const handleVerifyEmail = async () => {
    const response = await fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code: verificationCode })
    });
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.token);
      // Redirect to dashboard
    }
  };

  return (
    <div>
      {step === 'register' ? (
        <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }}>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
          <button type="submit">Register</button>
        </form>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); handleVerifyEmail(); }}>
          <p>Enter the 6-digit code sent to your email</p>
          <input 
            value={verificationCode} 
            onChange={(e) => setVerificationCode(e.target.value)} 
            placeholder="000000"
            maxLength="6"
          />
          <button type="submit">Verify Email</button>
          <button type="button" onClick={() => {
            // Call resend endpoint
          }}>Resend Code</button>
        </form>
      )}
    </div>
  );
}
```

## Environment Variables Reference

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `SMTP_HOST` | String | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | Number | SMTP port (usually 587 for TLS) | `587` |
| `SMTP_USER` | String | SMTP authentication username | `Icdboanalytics@gmail.com` |
| `SMTP_PASSWORD` | String | SMTP authentication password (App Password for Gmail) | `xxxx xxxx xxxx xxxx` |
| `COMPANY_EMAIL` | String | From address for emails | `Icdboanalytics@gmail.com` |
| `COMPANY_NAME` | String | Company name in email headers | `ICDBO Analytics` |
| `APP_URL` | String | Frontend URL for verification links | `https://app.example.com` |

## Running the Application

### First Time Setup

```bash
cd backend

# Install dependencies (already done if not present)
pnpm install

# Apply database migrations (when DB is available)
pnpm prisma migrate deploy

# Start the server
pnpm dev
```

### Migration Status

The migration for email verification fields has been created at:
```
backend/prisma/migrations/20260318000000_add_email_verification/migration.sql
```

It will be applied automatically when you run:
```bash
pnpm prisma migrate deploy
```

Or manually if needed:
```bash
pnpm prisma migrate dev
```

## Troubleshooting

### Issue: "Email service connection failed"

**Cause:** SMTP credentials are incorrect or server is unreachable

**Solution:**
1. Verify `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASSWORD` in `.env`
2. For Gmail, ensure you're using an App Password (not your regular password)
3. Check that 2-Factor Authentication is enabled on the Gmail account
4. Ensure firewall allows SMTP connections (port 587 for TLS)

### Issue: "Verification code has expired"

**Cause:** User is trying to verify after 24 hours

**Solution:**
- User should click "Resend Code" to get a new email with a fresh code
- New code will be valid for 24 hours

### Issue: "Invalid verification code"

**Cause:** User entered wrong code or code doesn't match

**Solution:**
1. Check email for correct code
2. Verify no extra spaces were entered
3. If code is lost, use "Resend Code" feature

### Issue: Email not arriving in inbox

**Cause:** Email might be in spam folder or SMTP config is wrong

**Solution:**
1. Check spam/junk folder
2. Verify Gmail allows "Less secure app access" (if applicable)
3. Check server logs for email sending errors
4. Test SMTP connection with telnet or similar tool

## Testing

### Test Email Sending (Manual)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123",
    "name": "Test User"
  }'
```

Expected response:
```json
{
  "user": { /* user data */ },
  "token": "...",
  "emailVerificationRequired": true,
  "message": "Registration successful! A verification email has been sent."
}
```

Check your test email inbox for the verification code.

### Verify Email (Manual)

```bash
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "code": "123456"
  }'
```

## Security Considerations

✅ **Implemented:**
- Verification codes expire after 24 hours
- Codes are random 6-digit numbers (1 in 1,000,000 chance of guessing)
- Email addresses are hashed and stored securely
- HTTPS recommended for all endpoints
- App Passwords used instead of regular Gmail password

⚠️ **Recommendations:**
- Use environment variables for all sensitive credentials
- Implement rate limiting on verification endpoints (prevent brute force)
- Monitor email delivery logs for suspicious patterns
- Regularly rotate App Passwords (monthly)
- Consider adding CAPTCHA to registration form
- Implement email domain verification (SPF, DKIM, DMARC)

## Future Enhancements

Potential features to add:
- SMS verification as alternative to email
- Two-factor authentication (TOTP)
- Email templates customization through admin panel
- Bulk email sending for announcements
- Email delivery tracking and analytics
- Scheduled email reminders
- Email subscription management
- Multi-language email templates
- Email preview in admin panel

## Support

For questions or issues with the email service:
1. Check this guide's troubleshooting section
2. Review server logs for detailed error messages
3. Contact the development team with SMTP configuration details
