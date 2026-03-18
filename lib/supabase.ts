import { createClient, SupabaseClient } from '@supabase/supabase-js';

export type Case = {
  id: string;
  user_id: string | null;
  application_number: string;
  disaster_number: string;
  decision_date: string;
  denial_code: string;
  applicant_name: string;
  property_address: string;
  appeal_letter: string | null;
  created_at: string;
};

let _supabaseAdmin: SupabaseClient | null = null;
let _supabase: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Missing Supabase admin env vars');
    _supabaseAdmin = createClient(url, key);
  }
  return _supabaseAdmin;
}

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error('Missing Supabase env vars');
    _supabase = createClient(url, key);
  }
  return _supabase;
}

// Lazy proxies for backward-compatibility (used in server components and API routes)
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getSupabaseAdmin()[prop as keyof SupabaseClient];
  },
});

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getSupabase()[prop as keyof SupabaseClient];
  },
});
