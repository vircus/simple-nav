'use client'

import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { usePointerFx } from '@/components/fx/reveal'
import { cn, faviconFor, hostnameOf, ACCENT_SOFT, accentFor } from '@/lib/utils'
import type { Site } from '@/lib/types'

export function SiteCard({ site, accentIndex = 0 }: { site: Site; accentIndex?: number }) {
  const { ref, onPointerMove, onPointerLeave } = usePointerFx<HTMLAnchorElement>()
  const [iconFailed, setIconFailed] = useState(false)

  const iconUrl = site.icon || faviconFor(site.url)
  const key = accentFor(site.isInternal ? 0 : accentIndex + 1)
  const letter = (site.name || '?').slice(0, 1).toUpperCase()

  return (
    <a
      ref={ref}
      href={site.url}
      target={site.openInNewTab ? '_blank' : '_self'}
      rel="noopener noreferrer"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="group card-interactive fx-magnet spotlight flex items-start gap-3.5 p-4"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-surface-2 transition-transform duration-300 ease-spring group-hover:scale-105 group-hover:rotate-3">
        {iconUrl && !iconFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={iconUrl}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-6 w-6 object-contain"
            onError={() => setIconFailed(true)}
          />
        ) : (
          <span
            className={cn(
              'grid h-full w-full place-items-center text-base font-black grad-fill bg-clip-text text-transparent',
            )}
          >
            {letter}
          </span>
        )}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <h3 className="truncate text-[15px] font-extrabold tracking-tight">{site.name}</h3>
          {site.isInternal && (
            <span className={cn('chip shrink-0', ACCENT_SOFT[key])}>本站</span>
          )}
        </div>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
          {site.description || hostnameOf(site.url)}
        </p>
      </div>

      <ArrowUpRight
        className="h-4 w-4 shrink-0 text-muted transition duration-200 ease-smooth group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand"
        aria-hidden
      />
    </a>
  )
}
