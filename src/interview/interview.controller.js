import {
  Controller,
  Get,
  Post,
  Query,
  Res,
  Body,
  Inject,
} from '@nestjs/common';
import { InterviewService } from './interview.service';

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

@Controller('interview')
export class InterviewController {
  constructor(@Inject(INTERVIEW_SERVICE) interviewService) {
    this.interviewService = interviewService;
  }

  @Get('confirm')
  async showConfirmationPage(@Query('id') id, @Res() res) {
    if (!id) {
      return res.status(400).send(this.errorPage('Missing applicant ID'));
    }

    const applicant = await this.interviewService.findById(id);

    if (!applicant) {
      return res.status(404).send(this.errorPage('Applicant not found.'));
    }

    if (applicant.interview_confirmed_date) {
      return res.send(this.alreadyConfirmedPage(applicant));
    }

    return res.send(this.confirmationPage(id, applicant));
  }

  @Post('confirm')
  async handleConfirmation(@Query('id') id, @Body() body, @Res() res) {
    if (!id) {
      return res.status(400).send(this.errorPage('Missing applicant ID'));
    }

    const { action, preferred_date, preferred_time } = body;

    if (action === 'confirm') {
      const confirmedDate =
        preferred_date && preferred_time
          ? `${preferred_date}T${preferred_time}:00`
          : preferred_date || null;

      try {
        await this.interviewService.confirmInterview(id, confirmedDate);
        return res.send(this.successPage(preferred_date, preferred_time));
      } catch (err) {
        return res
          .status(500)
          .send(this.errorPage('Failed to save your confirmation.'));
      }
    }

    return res.status(400).send(this.errorPage('Invalid action.'));
  }

  errorPage(message) {
    return this.page(
      'Something Went Wrong',
      `
      <div class="icon error">!</div>
      <h1>Something went wrong</h1>
      <p>${escapeHtml(message)}</p>
      <a href="/" class="btn btn-secondary" style="display:inline-block;margin-top:24px;">Go to Homepage</a>
    `,
    );
  }

  alreadyConfirmedPage(applicant) {
    return this.page(
      'Already Confirmed',
      `
      <div class="icon success">✓</div>
      <h1>Already Confirmed!</h1>
      <p>Hi <strong>${escapeHtml(applicant.first_name)}</strong>, you've already confirmed your interview. We'll see you soon!</p>
      <a href="/" class="btn btn-primary" style="display:inline-block;margin-top:24px;">Go to Homepage</a>
    `,
    );
  }

  confirmationPage(id, applicant) {
    const today = new Date().toISOString().split('T')[0];

    return this.page(
      'Confirm Your Interview',
      `
      <div class="icon calendar">📅</div>
      <h1>Interview Invitation</h1>
      <p>Hi <strong>${escapeHtml(applicant.first_name)} ${escapeHtml(applicant.last_name)}</strong>,</p>
      <p style="margin-top:8px;">You have been selected to interview for <strong>${escapeHtml(applicant.position)}</strong> at Lifewood. Please choose your preferred date below.</p>

      <form method="POST" action="/interview/confirm?id=${escapeHtml(id)}">
        <input type="hidden" name="action" value="confirm" />

        <div class="date-section">
          <p class="section-label">📅 Choose your preferred interview date</p>
          <p class="section-hint">Select a date and time that works best for you.</p>
          <div class="date-grid">
            <div class="field">
              <label>Preferred Date</label>
              <input type="date" name="preferred_date" min="${today}" required />
            </div>
            <div class="field">
              <label>Preferred Time</label>
              <input type="time" name="preferred_time" value="10:00" />
            </div>
          </div>
        </div>

        <button type="submit" class="btn btn-primary">📅 Confirm My Date</button>
      </form>
    `,
    );
  }

  successPage(date, time) {
    const redirectUrl = this.interviewService.getRedirectUrl();
    const dateDisplay =
      date && time
        ? `Your preferred date of <strong>${escapeHtml(new Date(`${date}T${time}`).toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }))}</strong> has been noted.`
        : 'Your attendance has been confirmed.';

    return this.page(
      'Confirmed!',
      `
      <div class="icon success">✓</div>
      <h1>You're Confirmed!</h1>
      <p>${dateDisplay}</p>
      <p style="margin-top:8px;color:#555;">Our team will follow up with further details. We look forward to meeting you!</p>
      <p class="countdown">Redirecting in <span id="count">5</span> seconds...</p>
      <script>
        let n = 5;
        const el = document.getElementById('count');
        setInterval(() => { n--; el.textContent = n; if (n <= 0) location.href = "${escapeHtml(redirectUrl)}"; }, 1000);
      </script>
    `,
    );
  }

  page(title, body) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${escapeHtml(title)} — Lifewood</title>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Manrope','Helvetica Neue',Arial,sans-serif;background:linear-gradient(135deg,#133020 0%,#046241 60%,#034E34 100%);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;}
    .card{background:#fff;border-radius:20px;padding:48px 40px;max-width:500px;width:100%;box-shadow:0 30px 60px rgba(0,0,0,0.3);text-align:center;}
    .icon{width:72px;height:72px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;font-size:32px;}
    .icon.success{background:rgba(52,211,153,0.15);}
    .icon.error{background:rgba(248,113,113,0.15);}
    .icon.calendar{background:rgba(255,179,71,0.15);}
    h1{color:#133020;font-size:22px;font-weight:800;margin-bottom:12px;}
    p{color:#555;font-size:15px;line-height:1.7;}
    strong{color:#133020;}
    .date-section{background:#f9f7f7;border-radius:12px;padding:20px;margin:20px 0;text-align:left;}
    .section-label{font-size:13px;font-weight:700;color:#133020;margin-bottom:6px;}
    .section-hint{font-size:12px;color:#888;margin-bottom:16px;line-height:1.5;}
    .date-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
    .field label{display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#666;margin-bottom:6px;}
    .field input{width:100%;padding:10px 12px;border:1px solid #ddd;border-radius:8px;font-size:13px;font-family:inherit;color:#133020;background:#fff;}
    .field input:focus{outline:none;border-color:#046241;}
    .btn{display:block;width:100%;padding:14px;border-radius:12px;font-size:14px;font-weight:800;font-family:inherit;cursor:pointer;border:none;text-decoration:none;margin-top:20px;transition:all 0.2s;}
    .btn-primary{background:#046241;color:#fff;}
    .btn-primary:hover{background:#034E34;}
    .btn-secondary{background:#f0f0f0;color:#133020;}
    .countdown{color:#046241;font-weight:700;margin-top:20px;font-size:14px;}
  </style>
</head>
<body>
  <div class="card">${body}</div>
</body>
</html>`;
  }
}
