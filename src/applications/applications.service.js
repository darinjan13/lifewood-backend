import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const APPLICATIONS_SERVICE = 'APPLICATIONS_SERVICE';

function isValidUuid(str) {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

@Injectable()
export class ApplicationsService {
  constructor(@Inject(APPLICATIONS_SERVICE) configService) {
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
      `${url}/rest/v1/job_applications?select=*&deleted_at=is.null&order=created_at.desc`,
      { headers },
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch applications: ${res.status}`);
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

    const res = await fetch(`${url}/rest/v1/job_applications`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      if (res.status === 409 || body.includes('duplicate') || body.includes('unique')) {
        throw new Error('DUPLICATE_EMAIL');
      }
      throw new Error(`Failed to create application: ${body}`);
    }
    return { success: true };
  }

  async findByEmail(email) {
    if (!email || typeof email !== 'string') {
      return { exists: false };
    }

    const url = this.configService.get('SUPABASE_URL');
    const serviceKey = this.configService.get('SUPABASE_SERVICE_KEY');
    const headers = {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    };

    const res = await fetch(
      `${url}/rest/v1/job_applications?email=eq.${encodeURIComponent(email)}&select=id`,
      { headers },
    );

    if (!res.ok) {
      return { exists: false, error: 'Failed to check email' };
    }

    const data = await res.json();
    return { exists: Array.isArray(data) && data.length > 0 };
  }

  async findById(id) {
    if (!isValidUuid(id)) {
      return null;
    }

    const url = this.configService.get('SUPABASE_URL');
    const serviceKey = this.configService.get('SUPABASE_SERVICE_KEY');
    const headers = {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    };

    const res = await fetch(
      `${url}/rest/v1/job_applications?id=eq.${id}&select=first_name,last_name,position,interview_confirmed_date`,
      { headers },
    );

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data[0] || null;
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

    const res = await fetch(`${url}/rest/v1/job_applications?id=eq.${id}`, {
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
