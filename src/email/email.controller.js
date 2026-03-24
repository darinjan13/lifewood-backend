import { Controller, Post, Body, Inject, UseGuards } from '@nestjs/common';
import { EmailService } from './email.service';
import { AuthGuard } from '../auth/auth.guard';

const EMAIL_SERVICE = 'EMAIL_SERVICE';

@Controller('email')
export class EmailController {
  constructor(@Inject(EMAIL_SERVICE) emailService) {
    this.emailService = emailService;
  }

  @Post('send-application-confirmation')
  @UseGuards(AuthGuard)
  async sendConfirmation(@Body() body) {
    return this.emailService.sendApplicationConfirmation(body);
  }
}
