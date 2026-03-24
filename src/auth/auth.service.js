import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const AUTH_SERVICE = 'AUTH_SERVICE';

@Injectable()
export class AuthService {
  constructor(@Inject(AUTH_SERVICE) configService) {
    this.configService = configService;
  }

  async login(email, password) {
    const url = this.configService.get('SUPABASE_URL');
    const anonKey = this.configService.get('SUPABASE_ANON_KEY');

    const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        apikey: anonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new UnauthorizedException(
        body?.error_description ?? body?.msg ?? 'Invalid email or password',
      );
    }

    const data = await res.json();
    return {
      id: data.user?.id,
      email: data.user?.email,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    };
  }

  async logout(accessToken) {
    const url = this.configService.get('SUPABASE_URL');
    const anonKey = this.configService.get('SUPABASE_ANON_KEY');

    await fetch(`${url}/auth/v1/logout`, {
      method: 'POST',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
      },
    }).catch(() => {});
  }
}
