# Email Service API Reference

## Quick Start

### 1. User Registration with Email Verification

**Endpoint:** `POST /api/auth/register`

```
Request:
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "name": "John Doe",
  "phone": "+1234567890",
  "company": "ACME Corp",
  "role": "USER"
}

Response (201 Created):
{
  "user": {
    "id": "user-id-123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER",
    "emailVerified": false
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Registration successful! A verification email has been sent.",
  "emailVerificationRequired": true
}
```

**What happens:**
- ✅ User account created
- ✅ 6-digit verification code generated (e.g., 123456)
- ✅ Email sent with verification code and link
- ✅ Code valid for 24 hours
- ⏳ User status: EMAIL_UNVERIFIED

---

### 2. Verify Email Address

**Endpoint:** `POST /api/auth/verify-email`

```
Request:
{
  "email": "user@example.com",
  "code": "123456"
}

Response (200 OK):
{
  "message": "Email verified successfully!",
  "user": {
    "id": "user-id-123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER",
    "emailVerified": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**What happens:**
- ✅ Verification code validated
- ✅ Email marked as verified
- ✅ Welcome email sent
- ✅ User can now fully use the platform
- 📧 User receives welcome message

**Error Responses:**
```javascript
// Code is invalid
{ "error": "Invalid verification code" } // 400

// Code has expired
{ 
  "error": "Verification code has expired. Please request a new one.",
  "expired": true
} // 400

// Email already verified
{ "error": "Email is already verified" } // 400

// User not found
{ "error": "User not found" } // 404
```

---

### 3. Resend Verification Email

**Endpoint:** `POST /api/auth/resend-verification`

```
Request:
{
  "email": "user@example.com"
}

Response (200 OK):
{
  "message": "Verification email resent successfully. Check your inbox."
}
```

**What happens:**
- ✅ New 6-digit code generated
- ✅ Code expires in 24 hours
- ✅ Email resent with new code
- 🔄 Previous code invalidated

**Use cases:**
- User didn't receive first email
- Code expired
- User wants new code

---

## Email Service Functions

These functions can be imported and used throughout the application:

```typescript
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendReminderEmail,
  sendInquiryNotificationEmail,
  sendInquiryReplyNotificationEmail,
  verifyEmailService
} from './emailService.js';
```

### sendVerificationEmail()

```typescript
await sendVerificationEmail(
  email: string,
  verificationCode: string,
  userName: string
): Promise<boolean>
```

**Usage:**
```typescript
const sent = await sendVerificationEmail(
  'user@example.com',
  '123456',
  'John Doe'
);
```

---

### sendWelcomeEmail()

```typescript
await sendWelcomeEmail(
  email: string,
  userName: string
): Promise<boolean>
```

**Usage:**
```typescript
await sendWelcomeEmail('user@example.com', 'John Doe');
```

---

### sendPasswordResetEmail()

```typescript
await sendPasswordResetEmail(
  email: string,
  resetToken: string,
  userName: string
): Promise<boolean>
```

**Usage:**
```typescript
await sendPasswordResetEmail(
  'user@example.com',
  'reset-token-abc123',
  'John Doe'
);
```

---

### sendReminderEmail()

```typescript
await sendReminderEmail(
  email: string,
  subject: string,
  userName: string,
  message: string,
  actionUrl?: string
): Promise<boolean>
```

**Usage:**
```typescript
await sendReminderEmail(
  'user@example.com',
  'Project Update Required',
  'John Doe',
  '<p>Your project update is due today!</p><p>Please log in and update your project status.</p>',
  'https://app.example.com/projects/123'
);
```

---

### sendInquiryNotificationEmail()

```typescript
await sendInquiryNotificationEmail(
  recipientEmail: string,
  recipientName: string,
  senderName: string,
  senderEmail: string,
  message: string,
  inquiryId: string
): Promise<boolean>
```

**Usage:**
```typescript
await sendInquiryNotificationEmail(
  'recipient@example.com',
  'Jane Smith',
  'John Doe',
  'john@example.com',
  'I need help with concrete sourcing',
  'inquiry-123'
);
```

---

### sendInquiryReplyNotificationEmail()

```typescript
await sendInquiryReplyNotificationEmail(
  senderEmail: string,
  senderName: string,
  replierName: string,
  replyMessage: string,
  inquiryId: string
): Promise<boolean>
```

**Usage:**
```typescript
await sendInquiryReplyNotificationEmail(
  'john@example.com',
  'John Doe',
  'Jane Smith',
  'We can supply concrete at $50 per unit',
  'inquiry-123'
);
```

---

### verifyEmailService()

```typescript
await verifyEmailService(): Promise<boolean>
```

**Usage:**
```typescript
const isReady = await verifyEmailService();
if (isReady) {
  console.log('Email service is ready');
} else {
  console.warn('Email service not available');
}
```

---

## Database Schema

### User Model Changes

```prisma
model User {
  // ... existing fields
  
  // Email Verification Fields
  emailVerified            Boolean     @default(false)
  emailVerificationToken   String?
  emailVerificationExpiry  DateTime?
  emailVerificationSent    DateTime?
  
  // ... relationships
}
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `emailVerified` | Boolean | Whether user's email has been verified |
| `emailVerificationToken` | String? | Current 6-digit verification code |
| `emailVerificationExpiry` | DateTime? | When the verification code expires |
| `emailVerificationSent` | DateTime? | Timestamp when verification email was sent |

---

## Environment Configuration

Required environment variables in `.env`:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=Icdboanalytics@gmail.com
SMTP_PASSWORD=your_app_password_here

# Company Information
COMPANY_EMAIL=Icdboanalytics@gmail.com
COMPANY_NAME=ICDBO Analytics

# Frontend URL
APP_URL=https://yourdomain.com
```

---

## Email Flow Diagram

```
User Registration
       |
       v
[Validate Input]
       |
       v
[Create User Account] (emailVerified: false)
       |
       v
[Generate 6-Digit Code] (valid 24 hours)
       |
       v
[Send Verification Email]
       |
       +---> USER RECEIVES EMAIL <---+
       |                              |
       v                              v
   [User enters code] --- [Verify Code] --- VALID?
                              |                    |
                              +----NO----> [Error! Invalid Code]
                                          [User can resend]
                                          |
                                          +---> [New Code] --- [New Email]
                              |
                              YES
                              |
                              v
                         [Update User]
                         (emailVerified: true)
                              |
                              v
                         [Send Welcome Email]
                              |
                              v
                         ✅ EMAIL VERIFIED ✅
                              |
                              v
                         [User can login/use platform]
```

---

## Email Template Types

### 1. Verification Code Email
- **When Sent:** During registration and when resending
- **Contents:** 6-digit code + expiry warning
- **CTAs:** Verify button, manual code entry option

### 2. Welcome Email
- **When Sent:** After successful email verification
- **Contents:** Features overview, dashboard link
- **CTAs:** Go to dashboard button

### 3. Password Reset Email
- **When Sent:** When user requests password reset
- **Contents:** Reset link, expiry (1 hour)
- **CTAs:** Reset password button

### 4. Inquiry Notification Email
- **When Sent:** When user receives an inquiry
- **Contents:** Sender info, message preview
- **CTAs:** View & reply button

### 5. Inquiry Reply Email
- **When Sent:** When inquiry sender gets a reply
- **Contents:** Replier name, message preview
- **CTAs:** View reply button

### 6. Reminder Email
- **When Sent:** For various reminders/announcements
- **Contents:** Custom message
- **CTAs:** Custom action URL (optional)

---

## Testing Checklist

- [ ] Register new user → Email received
- [ ] Verify email with correct code → Success
- [ ] Verify email with wrong code → Error
- [ ] Wait 24+ hours, verify → Code expired error
- [ ] Resend code → New email received
- [ ] Check email templates display correctly
- [ ] Check links in emails work
- [ ] Verify user marked as verified in database
- [ ] Test with multiple email providers (Gmail, Yahoo, Outlook)

---

## Status Codes

| Code | Meaning | When |
|------|---------|------|
| 201 | Created | User registered successfully |
| 200 | OK | Email verified, code resent |
| 400 | Bad Request | Invalid code, expired code, missing fields |
| 404 | Not Found | User email not found |
| 409 | Conflict | Email already exists |
| 500 | Server Error | SMTP failure, database error |

---

## Security Notes

✅ Verification codes:
- 6-digit random numbers (1 in 1,000,000)
- Expire after 24 hours
- Can only be used once
- Cannot be reused after verification

✅ Protection mechanisms:
- HTTPS recommended for all endpoints
- Verify email ownership before account activation
- Hash emails in database
- Rate limiting recommended for verification endpoints
- Use App Passwords for Gmail (not regular passwords)

---

## Rate Limiting (Recommended)

```
Endpoint                    Recommended Limit
/api/auth/register          10 per hour per IP
/api/auth/verify-email      5 per hour per email
/api/auth/resend-verification 3 per hour per email
```

---

## Common Implementation Patterns

### Pattern 1: Automatic Verification Check

```typescript
// Middleware to check if email is verified before accessing features
app.post('/api/profile/update', authenticateToken, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  
  if (!user?.emailVerified) {
    return res.status(403).json({ 
      error: "Please verify your email first",
      requiresEmailVerification: true 
    });
  }
  
  // Continue with profile update
});
```

### Pattern 2: Admin Panel Email Status

```typescript
// Get unverified users (admin view)
const unverifiedUsers = await prisma.user.findMany({
  where: { emailVerified: false },
  select: { email, name, emailVerificationSent }
});
```

### Pattern 3: Sending Bulk Reminders

```typescript
// Send reminder to all verified users about upcoming event
const users = await prisma.user.findMany({
  where: { emailVerified: true },
  select: { email, name }
});

for (const user of users) {
  await sendReminderEmail(
    user.email,
    'Upcoming Event Reminder',
    user.name,
    '<p>Don\'t forget about our webinar tomorrow!</p>',
    'https://app.example.com/events/123'
  );
}
```
