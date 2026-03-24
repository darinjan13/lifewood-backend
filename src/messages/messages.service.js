import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const MESSAGES_SERVICE = 'MESSAGES_SERVICE';

function isValidUuid(str) {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

@Injectable()
export class MessagesService {
  constructor(@Inject(MESSAGES_SERVICE) configService) {
    this.configService = configService;
  }

  async findAll() {
    const url = this.configService.get('SUPABASE_URL');
    const serviceKey = this.configService.get('SUPABASE_SERVICE_KEY');
    const headers = {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    };

    const res = await fetch(
      `${url}/rest/v1/contact_messages?select=*&deleted_at=is.null&order=created_at.desc`,
      { headers },
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch messages: ${res.status}`);
    }
    return res.json();
  }

  async create(data) {
    const url = this.configService.get('SUPABASE_URL');
    const serviceKey = this.configService.get('SUPABASE_SERVICE_KEY');
    const headers = {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    };

    const res = await fetch(`${url}/rest/v1/contact_messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Failed to create message: ${body}`);
    }
    return { success: true };
  }

  async update(id, fields) {
    if (!isValidUuid(id)) {
      throw new Error('Invalid ID format');
    }

    const url = this.configService.get('SUPABASE_URL');
    const serviceKey = this.configService.get('SUPABASE_SERVICE_KEY');
    const headers = {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    };

    const res = await fetch(`${url}/rest/v1/contact_messages?id=eq.${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(fields),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Failed to update: ${body}`);
    }
    return { success: true };
  }
}
