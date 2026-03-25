import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { createSupabaseClient } from '../supabase/supabase-ssr';

@Injectable()
export class AuthGuard {
  async canActivate(context) {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    const supabase = createSupabaseClient(req, res);
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    req.user = user;
    return true;
  }
}
