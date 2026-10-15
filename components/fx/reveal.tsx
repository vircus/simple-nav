'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

/** MI-9 — reveal on scroll via IntersectionObserver. */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = 'div',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'section' | 'li'
}) {
  const ref = useRef<HTMLElement | null>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true)
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Tag
      ref={ref as never}
      className={cn(shown ? 'animate-fade-up' : 'opacity-0', className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  )
}

/**
 * MI-2 / MI-3 — spotlight that tracks the pointer plus a magnetic micro-shift.
 * Writes CSS variables only, so it composes with the CSS hover lift.
 */
export function usePointerFx<T extends HTMLElement = HTMLElement>(max = 6) {
  const ref = useRef<T | null>(null)

  const onPointerMove = (e: React.PointerEvent) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = e.clientX - r.left
    const py = e.clientY - r.top
    el.style.setProperty('--mx', `${px}px`)
    el.style.setProperty('--my', `${py}px`)
    el.style.setProperty('--tx', `${((px / r.width) * 2 - 1) * max}px`)
    el.style.setProperty('--ty', `${((py / r.height) * 2 - 1) * max}px`)
  }

  const onPointerLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--tx', '0px')
    el.style.setProperty('--ty', '0px')
  }

  return { ref, onPointerMove, onPointerLeave }
}
