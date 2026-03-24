import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const EMAIL_SERVICE = 'EMAIL_SERVICE';

@Injectable()
export class EmailService {
  constructor(@Inject(EMAIL_SERVICE) configService) {
    this.configService = configService;
  }

  async sendApplicationConfirmation({ email, firstName, position }) {
    const apiKey = this.configService.get('RESEND_API_KEY');
    const templateId = this.configService.get('RESEND_TEMPLATE_ID');
    const fromEmail =
      this.configService.get('RESEND_FROM_EMAIL') ||
      'Lifewood Careers <careers@lifewood.ai>';

    if (!apiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    if (!templateId) {
      throw new Error('RESEND_TEMPLATE_ID not configured');
    }

    if (!email || !firstName || !position) {
      throw new Error('Missing required fields: email, firstName, position');
    }

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: email,
        subject: `Application Received – ${position} at Lifewood`,
        template: {
          id: templateId,
          variables: {
            first_name: firstName,
            position: position,
          },
        },
      }),
    });

    if (!resendRes.ok) {
      const err = await resendRes.json().catch(() => ({}));
      throw new Error(
        `Failed to send email: ${err.message || resendRes.status}`,
      );
    }

    const data = await resendRes.json();
    return { success: true, messageId: data.id };
  }
}
