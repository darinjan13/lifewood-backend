import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr';

export function createSupabaseClient(req, res) {
  return createServerClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(req.headers.cookie ?? '');
        },
        setAll(cookiesToSet) {
          res.setHeader('Set-Cookie', cookiesToSet.map(({ name, value, options }) =>
            serializeCookieHeader(name, value, options)
          ));
        },
      },
    }
  );
}
