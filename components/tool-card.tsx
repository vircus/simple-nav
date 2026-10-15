'use client'

import Link from 'next/link'
import { iconFor } from '@/lib/tool-icons'
import { usePointerFx } from '@/components/fx/reveal'
import { TOOL_MAP } from '@/lib/registry'
import type { CustomTool } from '@/lib/types'
import { cn, ACCENT_SOFT, accentFor } from '@/lib/utils'

/** Card for an admin-authored custom tool. */
export function CustomToolCard({ tool, index = 0 }: { tool: CustomTool; index?: number }) {
  const Icon = iconFor(tool.icon || 'Binary')
  const { ref, onPointerMove, onPointerLeave } = usePointerFx<HTMLAnchorElement>()
  const key = accentFor(index)

  return (
    <Link
      ref={ref}
      href={`/tools/${tool.slug}`}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="group card-interactive fx-magnet spotlight flex items-start gap-3.5 p-4"
    >
      <span
        className={cn(
          'relative grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-transform duration-300 ease-spring group-hover:scale-105 group-hover:rotate-3',
          ACCENT_SOFT[key],
        )}
      >
        <Icon className="h-5 w-5" aria-hidden />
        <span
          className="absolute -bottom-0.5 -right-0.5 rounded-pill bg-surface px-1 text-[9px] font-black text-muted ring-1 ring-line"
          title={tool.type === 'link' ? '外链工具' : '嵌入工具'}
        >
          {tool.type === 'link' ? '↗' : '</>'}
        </span>
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[15px] font-extrabold tracking-tight">{tool.name}</h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
          {tool.description || (tool.type === 'link' ? '外链工具' : '自定义嵌入工具')}
        </p>
      </div>
    </Link>
  )
}

export function ToolCard({ slug, index = 0 }: { slug: string; index?: number }) {
  const meta = TOOL_MAP.get(slug)
  if (!meta) return null

  const Icon = iconFor(meta.icon)
  const { ref, onPointerMove, onPointerLeave } = usePointerFx<HTMLAnchorElement>()
  const key = accentFor(index)

  return (
    <Link
      ref={ref}
      href={`/tools/${slug}`}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="group card-interactive fx-magnet spotlight flex items-start gap-3.5 p-4"
    >
      <span
        className={cn(
          'grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-transform duration-300 ease-spring group-hover:scale-105 group-hover:rotate-3',
          ACCENT_SOFT[key],
        )}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[15px] font-extrabold tracking-tight">{meta.name}</h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">{meta.description}</p>
      </div>
    </Link>
  )
}
