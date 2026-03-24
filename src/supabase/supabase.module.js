import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from './supabase.service';

const SUPABASE_SERVICE = 'SUPABASE_SERVICE';

@Global()
@Module({
  providers: [
    {
      provide: SUPABASE_SERVICE,
      useFactory: (configService) => new SupabaseService(configService),
      inject: [ConfigService],
    },
  ],
  exports: [SUPABASE_SERVICE],
})
export class SupabaseModule {}

export { SUPABASE_SERVICE };
