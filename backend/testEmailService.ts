import { sendVerificationEmail, sendWelcomeEmail, verifyEmailService } from './src/emailService.js';

async function testEmailService() {
  console.log('🧪 Testing Email Service...\n');
  
  // Test 1: Verify email service
  console.log('Test 1: Checking email service connection...');
  const isConnected = await verifyEmailService();
  console.log(isConnected ? '✅ Email service connected' : '❌ Email service failed to connect\n');
  
  if (!isConnected) {
    console.log('❌ Cannot continue with email service tests');
    process.exit(1);
  }

  // Test 2: Send verification email
  console.log('\nTest 2: Sending verification email...');
  try {
    const verificationResult = await sendVerificationEmail(
      'testuser2026@gmail.com',
      '123456',
      'Test User 2026'
    );
    console.log(verificationResult ? '✅ Verification email sent successfully' : '❌ Failed to send verification email');
  } catch (error) {
    console.log('❌ Error sending verification email:', error);
  }

  // Test 3: Send welcome email
  console.log('\nTest 3: Sending welcome email...');
  try {
    const welcomeResult = await sendWelcomeEmail(
      'testuser2026@gmail.com',
      'Test User 2026'
    );
    console.log(welcomeResult ? '✅ Welcome email sent successfully' : '❌ Failed to send welcome email');
  } catch (error) {
    console.log('❌ Error sending welcome email:', error);
  }

  // Test 4: Send reminder email
  console.log('\nTest 4: Sending reminder email...');
  try {
    const { sendReminderEmail } = await import('./src/emailService.js');
    const reminderResult = await sendReminderEmail(
      'testuser2026@gmail.com',
      'Test Email Reminder',
      'Test User',
      '<p>This is a test reminder email to verify your app password is working correctly!</p>',
      'http://localhost:5173/dashboard'
    );
    console.log(reminderResult ? '✅ Reminder email sent successfully' : '❌ Failed to send reminder email');
  } catch (error) {
    console.log('❌ Error sending reminder email:', error);
  }

  console.log('\n✅ Email Service Tests Complete!');
  console.log('\n📧 All emails have been sent to: testuser2026@gmail.com');
  console.log('📝 Check your Gmail inbox (including spam folder) for the test emails.\n');
  
  process.exit(0);
}

testEmailService().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
