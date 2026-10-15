'use client'

import { useState } from 'react'
import { Check, Copy, Maximize2, Minimize2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'

export function Panel({
  title,
  hint,
  action,
  children,
  className,
}: {
  title?: string
  hint?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('card p-4 sm:p-5', className)}>
      {(title || action) && (
        <header className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title && <h2 className="text-sm font-extrabold tracking-tight">{title}</h2>}
            {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  )
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
}) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-pill border border-line bg-surface-2 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={cn(
            'rounded-pill px-3 py-1.5 text-xs font-bold transition duration-200 ease-smooth',
            value === o.value
              ? 'bg-brand text-white shadow-glow'
              : 'text-muted hover:bg-fg/5 hover:text-fg',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function CopyButton({
  value,
  label = '复制结果',
  disabled,
}: {
  value: string
  label?: string
  disabled?: boolean
}) {
  const [done, setDone] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setDone(true)
      toast('已复制到剪贴板', 'ok')
      window.setTimeout(() => setDone(false), 1400)
    } catch {
      toast('复制失败，请手动选择', 'err')
    }
  }

  return (
    <Button size="sm" variant="soft" onClick={copy} disabled={disabled || !value}>
      {done ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {done ? '已复制' : label}
    </Button>
  )
}

export function OutputBox({
  value,
  placeholder = '结果将显示在这里',
  mono = true,
  error,
}: {
  value: string
  placeholder?: string
  mono?: boolean
  error?: string
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="relative">
      <div
        className={cn(
          'rounded-xl border bg-surface-2 p-3.5 text-sm',
          error ? 'border-coral/40' : 'border-line',
          mono && 'font-mono text-[13px]',
          expanded ? 'max-h-none' : 'max-h-64 overflow-auto',
        )}
      >
        {error ? (
          <p className="whitespace-pre-wrap break-words font-sans text-coral">{error}</p>
        ) : value ? (
          <pre className="whitespace-pre-wrap break-words">{value}</pre>
        ) : (
          <p className="font-sans text-muted/70">{placeholder}</p>
        )}
      </div>
      {value && !error && value.length > 400 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? '收起' : '展开'}
          className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-lg border border-line bg-surface text-muted transition hover:text-brand active:scale-90"
        >
          {expanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
        </button>
      )}
    </div>
  )
}

export function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <label className="inline-flex cursor-pointer select-none items-center gap-2 text-sm font-semibold">
      <span
        className={cn(
          'grid h-5 w-5 shrink-0 place-items-center rounded-md border transition duration-150',
          checked ? 'border-brand bg-brand text-white' : 'border-line bg-surface',
        )}
      >
        {checked && <Check className="h-3 w-3" />}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      {label}
    </label>
  )
}
