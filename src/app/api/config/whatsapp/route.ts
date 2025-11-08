import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Prioridad: nueva variable sin prefijo público
  const phone = process.env.WHATSAPP_PHONE
    || process.env.NEXT_PUBLIC_WAPP
    || process.env.NEXT_PUBLIC_WHATSAPP_PHONE
    || ''
  return NextResponse.json({ phone })
}
