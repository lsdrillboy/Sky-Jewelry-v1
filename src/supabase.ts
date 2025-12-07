import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env, hasSupabase } from './config';

export type DatabaseClient = SupabaseClient;

function getKeyRole(key?: string | null) {
  if (!key) return null;
  const parts = key.split('.');
  if (parts.length < 2) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
    return payload?.role ?? null;
  } catch (_err) {
    return null;
  }
}

const keyRole = getKeyRole(env.SUPABASE_SERVICE_ROLE_KEY);
if (keyRole && keyRole !== 'service_role') {
  console.warn(
    `Supabase key role is "${keyRole}". Use a service_role key in SUPABASE_SERVICE_ROLE_KEY to bypass RLS for inserts.`,
  );
}

export const supabase: DatabaseClient | null = hasSupabase
  ? createClient(env.SUPABASE_URL as string, env.SUPABASE_SERVICE_ROLE_KEY as string)
  : null;
