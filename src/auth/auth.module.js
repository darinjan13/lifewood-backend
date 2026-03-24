import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { SUPABASE_SERVICE } from '../supabase/supabase.module';

const AUTH_SERVICE = 'AUTH_SERVICE';
const AUTH_GUARD = 'AUTH_GUARD';

@Module({
  controllers: [AuthController],
  providers: [
    {
      provide: AUTH_SERVICE,
      useFactory: (configService) => new AuthService(configService),
      inject: [ConfigService],
    },
    {
      provide: AUTH_GUARD,
      useFactory: (supabaseService) => new AuthGuard(supabaseService),
      inject: [SUPABASE_SERVICE],
    },
  ],
  exports: [AUTH_GUARD],
})
export class AuthModule {}
