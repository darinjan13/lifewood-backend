import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr';

export function createSupabaseClient(req, res) {
  const isProduction = process.env.NODE_ENV === 'production';
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    cookies: {
      getAll() {
        return parseCookieHeader(req.headers.cookie ?? '');
      },
      setAll(cookiesToSet) {
        const serialized = cookiesToSet.map(({ name, value, options }) => {
          return serializeCookieHeader(name, value, {
            ...options,
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/',
            maxAge: options.maxAge ?? (7 * 24 * 60 * 60 * 1000),
          });
        });
        res.setHeader('Set-Cookie', serialized);
      },
    },
  });
}
