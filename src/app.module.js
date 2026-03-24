import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { SupabaseModule } from './supabase/supabase.module';
import { ApplicationsModule } from './applications/applications.module';
import { MessagesModule } from './messages/messages.module';
import { AiModule } from './ai/ai.module';
import { EmailModule } from './email/email.module';
import { InterviewModule } from './interview/interview.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000,
        limit: 5,
      },
    ]),
    SupabaseModule,
    AuthModule,
    ApplicationsModule,
    MessagesModule,
    AiModule,
    EmailModule,
    InterviewModule,
  ],
  providers: [
    {
      provide: ThrottlerGuard,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
