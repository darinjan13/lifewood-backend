import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InterviewController } from './interview.controller';
import { InterviewService } from './interview.service';

const INTERVIEW_SERVICE = 'INTERVIEW_SERVICE';

@Module({
  controllers: [InterviewController],
  providers: [
    {
      provide: INTERVIEW_SERVICE,
      useFactory: (configService) => new InterviewService(configService),
      inject: [ConfigService],
    },
  ],
})
export class InterviewModule {}
