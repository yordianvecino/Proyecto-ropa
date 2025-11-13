"use client"
import { useEffect, useRef } from 'react'

type Props = {
  className?: string
}

// Parallax inspirado en motivos cristianos: cruz sutil, aves y destellos
// Movimiento muy suave para no distraer; respeta prefers-reduced-motion
export default function FaithParallax({ className = '' }: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const crossRef = useRef<SVGSVGElement | null>(null)
  const star1Ref = useRef<SVGSVGElement | null>(null)
  const star2Ref = useRef<SVGSVGElement | null>(null)
  const sparklesRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    const reduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    let raf = 0
    let px = 0, py = 0 // -1..1 por posición del puntero

    const update = () => {
      const root = rootRef.current
      if (!root) return
      const parent = root.parentElement
      if (!parent) return
      const rect = parent.getBoundingClientRect()
      const vh = window.innerHeight || 1
      const visible = Math.max(0, Math.min(1, 1 - rect.top / vh))
      const baseY = (window.scrollY || 0) * 0.05

      const time = performance.now() / 1000
      const driftX = Math.sin(time * 0.4) * 8
      const driftY = Math.cos(time * 0.28) * 6
      // Responsividad: menos amplitud en móviles, sin efecto mouse en pointer "coarse"
      const isCoarse = window.matchMedia('(pointer: coarse)').matches
      const isSmall = window.matchMedia('(max-width: 640px)').matches
      const amp = isSmall ? 0.5 : 1
      const mouseX = isCoarse ? 0 : px
      const mouseY = isCoarse ? 0 : py
      const dx = mouseX * 40 * amp + driftX * amp
      const dy = mouseY * 24 * amp + driftY * amp

      if (crossRef.current)
        crossRef.current.style.transform = `translateY(${baseY * 0.4 + dy * 0.3}px) translateX(${dx * 0.2}px)`
      if (star1Ref.current)
        star1Ref.current.style.transform = `translateY(${baseY * 1.2 + dy * 0.6}px) translateX(${visible * 12 + dx * 0.6}px)`
      if (star2Ref.current)
        star2Ref.current.style.transform = `translateY(${baseY * 0.8 + dy * 0.4}px) translateX(-${visible * 14 + Math.abs(dx) * 0.5}px)`
      if (sparklesRef.current)
        sparklesRef.current.style.transform = `translateY(${baseY * 0.6 + dy * 0.4}px) translateX(${dx * 0.3}px)`
    }

    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }

    const onPointerMove = (e: PointerEvent) => {
      if (raf) cancelAnimationFrame(raf)
      const w = window.innerWidth || 1
      const h = window.innerHeight || 1
      px = (e.clientX / w - 0.5) * 2 // -1..1
      py = (e.clientY / h - 0.5) * 2
      raf = requestAnimationFrame(update)
    }

    const loop = () => { update(); raf = requestAnimationFrame(loop) }
    loop()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      window.removeEventListener('pointermove', onPointerMove)
    }
  }, [])

  return (
    <div ref={rootRef} className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {/* Resplandor radial suave */}
      <div className="absolute -inset-40 bg-[radial-gradient(ellipse_at_center,theme(colors.brand.rose)/12_0%,transparent_60%)]" />

      {/* Cruz sutil al centro atrás */}
      <svg ref={crossRef} width="240" height="240" viewBox="0 0 240 240" className="absolute left-1/2 top-8 -translate-x-1/2 opacity-10 text-brand-black">
        <rect x="112" y="24" width="16" height="192" fill="currentColor" rx="8" />
        <rect x="64" y="88" width="112" height="16" fill="currentColor" rx="8" />
      </svg>

      {/* Estrella grande (izquierda) */}
      <svg ref={star1Ref} viewBox="0 0 100 100" className="hidden sm:block absolute left-2 top-8 sm:left-8 sm:top-14 opacity-30 text-brand-rose w-20 h-20 sm:w-[140px] sm:h-[140px]">
        <path d="M50 5 L58 36 L90 42 L58 50 L50 92 L42 50 L10 42 L42 36 Z" fill="currentColor" />
      </svg>

      {/* Estrella grande (derecha) */}
      <svg ref={star2Ref} viewBox="0 0 120 120" className="hidden sm:block absolute right-8 bottom-12 opacity-25 text-brand-gold w-24 h-24 sm:w-[160px] sm:h-[160px]">
        <path d="M60 6 L70 40 L114 50 L70 60 L60 114 L50 60 L6 50 L50 40 Z" fill="currentColor" />
      </svg>

      {/* Constelación de estrellas pequeñas + titileo */}
      <svg ref={sparklesRef} viewBox="0 0 360 220" className="absolute right-6 sm:right-1/4 top-6 opacity-40 text-brand-gold w-[240px] h-[160px] sm:w-[360px] sm:h-[220px]">
        <g fill="currentColor">
          <path d="M20 20 L23 33 L36 36 L23 39 L20 52 L17 39 L4 36 L17 33 Z" />
          <path d="M90 12 L92 22 L102 24 L92 26 L90 36 L88 26 L78 24 L88 22 Z" />
          <path d="M150 40 L153 50 L165 53 L153 56 L150 68 L147 56 L135 53 L147 50 Z" />
          <path d="M210 26 L212 34 L220 36 L212 38 L210 46 L208 38 L200 36 L208 34 Z" />
          <path d="M270 70 L273 83 L286 86 L273 89 L270 102 L267 89 L254 86 L267 83 Z" />
          <path d="M120 110 L122 118 L130 120 L122 122 L120 130 L118 122 L110 120 L118 118 Z" />
          <path d="M220 132 L223 145 L236 148 L223 151 L220 164 L217 151 L204 148 L217 145 Z" />
        </g>
      </svg>
    </div>
  )
}
