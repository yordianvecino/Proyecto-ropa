// Utilidad de servidor para usar Supabase Admin (Service Role)
import { createClient } from '@supabase/supabase-js'

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) return null
  return createClient(url, serviceRoleKey, { auth: { persistSession: false } })
}

// Permite configurar el bucket por variable de entorno y cae en 'products'
export const DEFAULT_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'products'

// Cliente de solo lectura usando la ANON KEY (útil en desarrollo/local o donde no haya Service Role)
export function getSupabaseAnon() {
  const url = process.env.SUPABASE_URL
  const anonKey = process.env.SUPABASE_ANON_KEY
  if (!url || !anonKey) return null
  return createClient(url, anonKey, { auth: { persistSession: false } })
}

// Obtiene un cliente de lectura priorizando Service Role y cayendo en ANON
export function getSupabaseRead() {
  return getSupabaseAdmin() ?? getSupabaseAnon()
}