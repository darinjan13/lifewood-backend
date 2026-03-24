import { Injectable } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';

@Injectable()
export class ThrottlerGuardStrict extends ThrottlerGuard {
  throwThrottlingException() {
    throw new ThrottlerException(
      'Too many login attempts. Please try again later.',
    );
  }
}
