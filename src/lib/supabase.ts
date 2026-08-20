import { createClient } from "@supabase/supabase-js";

export function getSupabaseAdmin(env?: any) {
  const envObj = env || (typeof process !== "undefined" ? process.env : {});
  const url = envObj.SUPABASE_URL as string;
  const key = envObj.SUPABASE_SERVICE_ROLE_KEY as string;
  if (!url || !key) throw new Error("Supabase credentials not configured");
  return createClient(url, key, { auth: { persistSession: false } });
}
