import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AuthModule } from '../auth/auth.module';

const AI_SERVICE = 'AI_SERVICE';

@Module({
  imports: [AuthModule],
  controllers: [AiController],
  providers: [
    {
      provide: AI_SERVICE,
      useFactory: (configService) => new AiService(configService),
      inject: [ConfigService],
    },
  ],
})
export class AiModule {}
