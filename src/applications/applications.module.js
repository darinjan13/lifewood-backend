import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { AuthModule } from '../auth/auth.module';

const APPLICATIONS_SERVICE = 'APPLICATIONS_SERVICE';

@Module({
  imports: [AuthModule],
  controllers: [ApplicationsController],
  providers: [
    {
      provide: APPLICATIONS_SERVICE,
      useFactory: (configService) => new ApplicationsService(configService),
      inject: [ConfigService],
    },
  ],
  exports: [APPLICATIONS_SERVICE],
})
export class ApplicationsModule {}
