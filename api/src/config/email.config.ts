import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
  provider: process.env.EMAIL_PROVIDER || 'resend',
  from: {
    email: process.env.EMAILS_FROM_EMAIL || 'noreply@intellicharts.com',
    name: process.env.EMAILS_FROM_NAME || 'Intellicharts Team',
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY || '',
  },
}));
