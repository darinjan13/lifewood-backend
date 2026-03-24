import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const INTERVIEW_SERVICE = 'INTERVIEW_SERVICE';

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function isValidUuid(str) {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

@Injectable()
export class InterviewService {
  constructor(@Inject(INTERVIEW_SERVICE) configService) {
    this.configService = configService;
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

  async confirmInterview(id, confirmedDate) {
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
      body: JSON.stringify({
        interview_confirmed_date: confirmedDate,
        status: 'interviewing',
      }),
    });

    if (!res.ok) {
      throw new Error('Failed to save confirmation');
    }
    return { success: true };
  }

  getRedirectUrl() {
    return (
      this.configService.get('REDIRECT_URL') ||
      'https://soriano-lifewood.netlify.app/'
    );
  }
}
