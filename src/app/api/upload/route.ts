import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { getSupabaseAdmin, DEFAULT_BUCKET } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function requireAdmin(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token || (token as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  return null
}

function safeFileName(name: string) {
  const base = name.split('\\').pop()?.split('/').pop() || 'file'
  return base.replace(/[^a-zA-Z0-9._-]/g, '_')
}

export async function POST(req: NextRequest) {
  const unauthorized = await requireAdmin(req)
  if (unauthorized) return unauthorized

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return NextResponse.json({ error: 'Storage no configurado (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)' }, { status: 501 })
  }

  const form = await req.formData().catch(() => null)
  if (!form) return NextResponse.json({ error: 'FormData inválido' }, { status: 400 })
  const file = form.get('file') as File | null
  const folder = String(form.get('folder') || '')
  const bucket = String(form.get('bucket') || DEFAULT_BUCKET)
  if (!file) return NextResponse.json({ error: 'Archivo requerido (campo "file")' }, { status: 400 })

  const arrayBuffer = await file.arrayBuffer()
  const bytes = new Uint8Array(arrayBuffer)
  const timestamp = Date.now()
  const cleanName = safeFileName(file.name || 'imagen')
  const path = `${folder ? folder.replace(/(^\/|\/$)/g, '') + '/' : ''}${timestamp}-${cleanName}`

  const { data, error } = await supabase.storage.from(bucket).upload(path, bytes, {
    contentType: file.type || 'application/octet-stream',
    upsert: false,
  })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // URL pública (requiere bucket público). Si es privado, se puede firmar.
  const pub = supabase.storage.from(bucket).getPublicUrl(data.path)
  const url = pub?.data?.publicUrl || null
  return NextResponse.json({ path: data.path, url, bucket })
}

export function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 })
}