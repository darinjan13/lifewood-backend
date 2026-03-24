import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupabaseService {
  constructor(configService) {
    this.configService = configService;
  }

  async query(path) {
    const url = this.configService.get('SUPABASE_URL');
    const serviceKey = this.configService.get('SUPABASE_SERVICE_KEY');
    const headers = {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    };
    const res = await fetch(`${url}/rest/v1/${path}`, { headers });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Supabase query failed [${res.status}]: ${body}`);
    }
    return res.json();
  }

  async patch(path, body) {
    const url = this.configService.get('SUPABASE_URL');
    const serviceKey = this.configService.get('SUPABASE_SERVICE_KEY');
    const headers = {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    };
    const res = await fetch(`${url}/rest/v1/${path}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Supabase patch failed [${res.status}]: ${text}`);
    }
    return true;
  }

  async verifyToken(jwt) {
    const url = this.configService.get('SUPABASE_URL');
    const anonKey = this.configService.get('SUPABASE_ANON_KEY');
    const res = await fetch(`${url}/auth/v1/user`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${jwt}`,
      },
    });
    if (!res.ok) return null;
    return res.json();
  }
}
