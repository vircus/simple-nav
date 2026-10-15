'use client'

import { useEffect, useRef } from 'react'

/**
 * MI-1 — trailing cursor halo.
 * Desktop + fine pointer only; fully disabled under prefers-reduced-motion,
 * and never intercepts pointer events.
 */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    let tx = window.innerWidth / 2
    let ty = window.innerHeight / 2
    let cx = tx
    let cy = ty
    let raf = 0
    let started = false

    const onMove = (e: PointerEvent) => {
      tx = e.clientX
      ty = e.clientY
      if (!started) {
        started = true
        cx = tx
        cy = ty
        el.style.opacity = '0.55'
      }
    }

    const loop = () => {
      cx += (tx - cx) * 0.14
      cy += (ty - cy) * 0.14
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`
      raf = requestAnimationFrame(loop)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    raf = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-0 h-[420px] w-[420px] rounded-full opacity-0 blur-3xl transition-opacity duration-500"
      style={{
        background:
          'radial-gradient(circle, rgb(var(--c-brand) / 0.20) 0%, rgb(var(--c-accent) / 0.10) 45%, transparent 70%)',
      }}
    />
  )
}
