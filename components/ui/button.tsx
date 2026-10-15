'use client'

import { useCallback, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'outline' | 'ghost' | 'soft'
type Size = 'sm' | 'md' | 'lg'

const VARIANT: Record<Variant, string> = {
  primary:
    'text-white border-transparent grad-fill bg-[length:200%_100%] bg-left hover:bg-right shadow-glow hover:shadow-lift',
  outline: 'border-line bg-surface text-fg hover:border-brand/50 hover:bg-brand/5',
  ghost: 'border-transparent bg-transparent text-fg hover:bg-fg/5',
  soft: 'border-brand/25 bg-brand/10 text-fg hover:bg-brand/20',
}

const SIZE: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
}

interface Ripple {
  id: number
  x: number
  y: number
}

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  href,
  target,
  rel,
  type = 'button',
  disabled,
  onClick,
  ...rest
}: {
  children: React.ReactNode
  className?: string
  variant?: Variant
  size?: Size
  href?: string
  target?: string
  rel?: string
  type?: 'button' | 'submit'
  disabled?: boolean
  onClick?: React.MouseEventHandler<HTMLElement>
} & Omit<React.HTMLAttributes<HTMLElement>, 'className' | 'children' | 'onClick'>) {
  const [ripples, setRipples] = useState<Ripple[]>([])
  const seq = useRef(0)

  // MI-8 — ripple from the exact click point
  const spawnRipple = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    const id = ++seq.current
    setRipples((prev) => [...prev, { id, x: e.clientX - r.left, y: e.clientY - r.top }])
    window.setTimeout(() => setRipples((prev) => prev.filter((p) => p.id !== id)), 600)
  }, [])

  const base = cn(
    'relative inline-flex select-none items-center justify-center gap-2 overflow-hidden rounded-pill border',
    'font-bold tracking-tight transition-[transform,background-position,box-shadow,border-color,background-color] duration-200 ease-smooth',
    'hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]',
    'disabled:pointer-events-none disabled:opacity-50',
    VARIANT[variant],
    SIZE[size],
    className,
  )

  const inner = (
    <>
      {ripples.map((r) => (
        <span
          key={r.id}
          aria-hidden
          className="pointer-events-none absolute h-16 w-16 rounded-full bg-current opacity-25 animate-ripple"
          style={{ left: r.x - 32, top: r.y - 32 }}
        />
      ))}
      <span className="relative z-[1] inline-flex items-center gap-2">{children}</span>
    </>
  )

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        className={base}
        onPointerDown={spawnRipple}
        onClick={onClick}
        {...rest}
      >
        {inner}
      </a>
    )
  }

  return (
    <button
      type={type}
      disabled={disabled}
      className={base}
      onPointerDown={spawnRipple}
      onClick={onClick}
      {...rest}
    >
      {inner}
    </button>
  )
}
