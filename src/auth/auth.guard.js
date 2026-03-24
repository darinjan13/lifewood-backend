import {
  Injectable,
  Inject,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { SUPABASE_SERVICE } from '../supabase/supabase.module';

@Injectable()
export class AuthGuard {
  constructor(@Inject(SUPABASE_SERVICE) supabaseService) {
    this.supabaseService = supabaseService;
  }

  async canActivate(context) {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'] ?? '';

    if (!authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or malformed Authorization header',
      );
    }

    const token = authHeader.slice(7);
    const user = await this.supabaseService.verifyToken(token);

    if (!user) {
      throw new UnauthorizedException('Invalid or expired session token');
    }

    req.user = user;
    return true;
  }
}
