import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { AuthModule } from '../auth/auth.module';

const EMAIL_SERVICE = 'EMAIL_SERVICE';

@Module({
  imports: [AuthModule],
  controllers: [EmailController],
  providers: [
    {
      provide: EMAIL_SERVICE,
      useFactory: (configService) => new EmailService(configService),
      inject: [ConfigService],
    },
  ],
})
export class EmailModule {}
