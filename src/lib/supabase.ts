// Utilidad de servidor para usar Supabase Admin (Service Role)
import { createClient } from '@supabase/supabase-js'

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) return null
  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  })
  return supabase
}

export const DEFAULT_BUCKET = 'products'