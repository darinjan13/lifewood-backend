# Lifewood Backend

NestJS API backend for Lifewood - a job application and recruitment management system.

## Features

- **Authentication** - JWT-based auth via Supabase
- **Job Applications** - Submit, track, and manage job applications
- **AI Integration** - AI-powered CV scoring and message replies (Gemini)
- **Email Notifications** - Application confirmations via Resend
- **Interview Scheduling** - Self-service interview confirmation for applicants

## Tech Stack

- NestJS
- Supabase (Auth + Database)
- Gemini AI
- Resend (Email)

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run start:dev

# Build for production
npm run build
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_KEY` - Supabase service role key
- `GEMINI_KEY` - Google Gemini API key
- `RESEND_API_KEY` - Resend API key
- `REDIRECT_URL` - URL for interview confirmation redirects

## API Endpoints

| Endpoint                               | Method   | Description             |
| -------------------------------------- | -------- | ----------------------- |
| `/auth/login`                          | POST     | User login              |
| `/auth/logout`                         | POST     | User logout             |
| `/auth/me`                             | POST     | Get current user        |
| `/applications`                        | GET      | List all applications   |
| `/applications`                        | POST     | Submit new application  |
| `/applications/check-email`            | POST     | Check if email exists   |
| `/applications`                        | PATCH    | Update application      |
| `/ai/generate-reply`                   | POST     | Generate AI reply       |
| `/ai/score-cv`                         | POST     | AI score CV             |
| `/email/send-application-confirmation` | POST     | Send confirmation email |
| `/interview/confirm`                   | GET/POST | Interview confirmation  |

## Deployment

Configured for Vercel deployment (`vercel.json` included).
