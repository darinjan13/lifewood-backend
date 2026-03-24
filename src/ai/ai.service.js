import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const AI_SERVICE = 'AI_SERVICE';

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

@Injectable()
export class AiService {
  constructor(@Inject(AI_SERVICE) configService) {
    this.configService = configService;
  }

  async generateReply(message) {
    const geminiKey = this.configService.get('GEMINI_KEY');
    if (!geminiKey) {
      throw new Error('GEMINI_KEY not configured');
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: [
                    'You are a professional customer relations representative for Lifewood, an AI-powered data solutions company.',
                    'Write a warm, professional email reply to the following customer enquiry.',
                    'Keep it concise (2-3 short paragraphs). Do not include subject line, greeting, or sign-off — just the body text.',
                    '',
                    `Enquiry type: ${message.type || 'General'}`,
                    `From: ${message.name}`,
                    message.company ? `Company: ${message.company}` : '',
                    `Message: ${message.message}`,
                    '',
                    'Reply only with the email body text, no markdown, no formatting.',
                  ]
                    .filter(Boolean)
                    .join('\n'),
                },
              ],
            },
          ],
          generationConfig: { temperature: 0.4, maxOutputTokens: 512 },
        }),
      },
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.json().catch(() => ({}));
      throw new Error(
        `Gemini error: ${err?.error?.message || geminiRes.status}`,
      );
    }

    const data = await geminiRes.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!text) {
      throw new Error('Empty Gemini response');
    }

    return { reply: text.trim() };
  }

  async scoreCv(applicant) {
    const geminiKey = this.configService.get('GEMINI_KEY');
    if (!geminiKey) {
      throw new Error('GEMINI_KEY not configured');
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: [
                    'You are an HR recruiter. Score this job applicant from 0 to 100.',
                    '',
                    `Position: ${applicant.position}`,
                    `Name: ${applicant.first_name} ${applicant.last_name}`,
                    `Age: ${applicant.age}`,
                    `Country: ${applicant.country}`,
                    applicant.cv_url ? 'CV: on file' : 'CV: not provided',
                    '',
                    'Respond with only a JSON object: {"score":80,"grade":"B","recommendation":"Hire","strengths":["good exp"],"concerns":["missing skill"],"summary":"Capable candidate."}',
                  ].join('\n'),
                },
              ],
            },
          ],
          generationConfig: { temperature: 0.1, maxOutputTokens: 8192 },
        }),
      },
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.json().catch(() => ({}));
      throw new Error(
        `Gemini error: ${err?.error?.message || geminiRes.status}`,
      );
    }

    const geminiData = await geminiRes.json();
    const raw = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!raw) {
      throw new Error('Empty Gemini response');
    }

    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error('No JSON in Gemini response');
    }

    let score;
    try {
      score = JSON.parse(match[0]);
    } catch {
      throw new Error('Invalid JSON from Gemini');
    }

    // Save to DB
    const url = this.configService.get('SUPABASE_URL');
    const serviceKey = this.configService.get('SUPABASE_SERVICE_KEY');
    const headers = {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    };

    const dbRes = await fetch(
      `${url}/rest/v1/job_applications?id=eq.${applicant.id}`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          cv_score: score.score,
          cv_grade: score.grade,
          cv_recommendation: score.recommendation,
          cv_summary: score.summary,
          cv_strengths: score.strengths,
          cv_concerns: score.concerns,
          cv_scored_at: new Date().toISOString(),
        }),
      },
    );

    if (!dbRes.ok) {
      throw new Error('Failed to save score');
    }

    return score;
  }
}
