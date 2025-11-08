import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const items = Array.isArray(body?.items) ? body.items : []
    if (!items.length) {
      return NextResponse.json({ error: 'No hay artículos en el carrito' }, { status: 400 })
    }
    const secret = process.env.STRIPE_SECRET_KEY
    if (!secret) {
      return NextResponse.json({ error: 'Stripe no está configurado. Define STRIPE_SECRET_KEY en .env' }, { status: 501 })
    }
    const currency = process.env.STRIPE_CURRENCY || 'USD'

  const { default: Stripe } = await import('stripe')
  const stripe = new Stripe(secret, { apiVersion: '2023-10-16' })

    const origin = new URL(req.url).origin

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
      line_items: items.map((it: any) => ({
        quantity: it.quantity || 1,
        price_data: {
          currency,
          unit_amount: Number(it.price) || 0,
          product_data: {
            name: String(it.name || 'Producto'),
          },
        },
      })),
    })

    return NextResponse.json({ url: session.url })
  } catch (e) {
    console.error('[POST /api/checkout] error', e)
    return NextResponse.json({ error: 'No se pudo crear la sesión de pago' }, { status: 500 })
  }
}
