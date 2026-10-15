'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, Info } from 'lucide-react'

type Tone = 'ok' | 'err' | 'info'
type Item = { id: number; message: string; tone: Tone }

let emit: ((message: string, tone?: Tone) => void) | null = null

/** Imperative toast — usable from any client component. */
export function toast(message: string, tone: Tone = 'ok') {
  emit?.(message, tone)
}

const ICON = { ok: CheckCircle2, err: XCircle, info: Info }
const TONE: Record<Tone, string> = {
  ok: 'border-pop/40 bg-pop/15 text-fg',
  err: 'border-coral/45 bg-coral/15 text-fg',
  info: 'border-flash/40 bg-flash/15 text-fg',
}
const ICON_TONE: Record<Tone, string> = {
  ok: 'text-pop',
  err: 'text-coral',
  info: 'text-flash',
}

/** MI-12 — springy top toast. */
export function Toaster() {
  const [items, setItems] = useState<Item[]>([])

  useEffect(() => {
    emit = (message, tone = 'ok') => {
      const id = Date.now() + Math.random()
      setItems((prev) => [...prev.slice(-2), { id, message, tone }])
      window.setTimeout(() => setItems((prev) => prev.filter((i) => i.id !== id)), 2600)
    }
    return () => {
      emit = null
    }
  }, [])

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4">
      {items.map((it) => {
        const Icon = ICON[it.tone]
        return (
          <div
            key={it.id}
            role="status"
            className={`pointer-events-auto flex max-w-[92vw] items-center gap-2.5 rounded-pill border px-4 py-2.5 text-sm font-semibold shadow-lift backdrop-blur-xl animate-toast-in ${TONE[it.tone]}`}
          >
            <Icon className={`h-4 w-4 shrink-0 ${ICON_TONE[it.tone]}`} aria-hidden />
            <span className="truncate">{it.message}</span>
          </div>
        )
      })}
    </div>
  )
}
