'use client'

import { useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SearchBox({
  value,
  onChange,
  resultCount,
}: {
  value: string
  onChange: (v: string) => void
  resultCount?: number
}) {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        ref.current?.focus()
        ref.current?.select()
      } else if (e.key === 'Escape' && document.activeElement === ref.current) {
        onChange('')
        ref.current?.blur()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onChange])

  return (
    <div className="relative">
      <div
        className={cn(
          'flex items-center gap-3 rounded-pill border bg-surface px-5 py-3.5 shadow-card transition duration-200 ease-smooth',
          'border-line focus-within:border-brand/60 focus-within:shadow-glow',
        )}
      >
        <Search className="h-[18px] w-[18px] shrink-0 text-brand" aria-hidden />
        <input
          ref={ref}
          id="site-search"
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="搜索站点、域名或描述…"
          aria-label="搜索站点"
          className="min-w-0 flex-1 bg-transparent text-sm font-medium text-fg outline-none placeholder:text-muted/70 [&::-webkit-search-cancel-button]:hidden"
        />
        {value ? (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="清空搜索"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted transition hover:bg-fg/10 hover:text-fg active:scale-90"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        ) : (
          <kbd className="hidden shrink-0 rounded-md border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-muted sm:block">
            Ctrl K
          </kbd>
        )}
      </div>

      {value && resultCount !== undefined && (
        <p className="mt-2 pl-1 text-xs font-semibold text-muted animate-fade-in">
          匹配到 <span className="text-brand">{resultCount}</span> 个站点
        </p>
      )}
    </div>
  )
}
