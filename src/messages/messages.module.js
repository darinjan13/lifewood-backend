import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { AuthModule } from '../auth/auth.module';

const MESSAGES_SERVICE = 'MESSAGES_SERVICE';

@Module({
  imports: [AuthModule],
  controllers: [MessagesController],
  providers: [
    {
      provide: MESSAGES_SERVICE,
      useFactory: (configService) => new MessagesService(configService),
      inject: [ConfigService],
    },
  ],
})
export class MessagesModule {}
