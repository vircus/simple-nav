'use client'

import { useCallback } from 'react'
import { GripVertical, Save } from 'lucide-react'
import { useAdminData, useDragSort } from './api'
import { Button } from '@/components/ui/button'
import { TOOL_CATEGORY_LABEL, TOOL_CATEGORY_ORDER, TOOL_MAP } from '@/lib/registry'
import { iconFor } from '@/lib/tool-icons'
import { cn, ACCENT_SOFT, accentFor } from '@/lib/utils'
import { ErrorBox, LoadingBox } from './categories-view'
import type { ToolCategory, ToolConfig } from '@/lib/types'

export function ToolsView() {
  const { data, error, saving, save, setData } = useAdminData()

  const tools = data?.tools ?? []

  const update = useCallback(
    (next: ToolConfig[]) => setData((p) => (p ? { ...p, tools: next } : p)),
    [setData],
  )

  // Hooks must run unconditionally — early returns come after them.
  const { handleProps, isOver } = useDragSort(tools, update)

  if (error) return <ErrorBox message={error} />
  if (!data) return <LoadingBox />

  const toggle = (slug: string) =>
    update(tools.map((t) => (t.slug === slug ? { ...t, enabled: !t.enabled } : t)))

  const setAll = (value: boolean) => update(tools.map((t) => ({ ...t, enabled: value })))

  const enabledCount = tools.filter((t) => t.enabled).length

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
        <p className="text-sm font-semibold text-muted">
          已启用 <b className="text-brand">{enabledCount}</b> / {tools.length} 个工具
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setAll(true)}>
            全部启用
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setAll(false)}>
            全部停用
          </Button>
        </div>
      </div>

      {TOOL_CATEGORY_ORDER.map((cat) => {
        const items = tools.filter((t) => TOOL_MAP.get(t.slug)?.category === cat)
        if (!items.length) return null
        return (
          <section key={cat}>
            <h2 className="mb-3 text-sm font-black uppercase tracking-wide text-muted">
              {TOOL_CATEGORY_LABEL[cat]}
            </h2>
            <ul className="space-y-2">
              {items.map((t) => {
                const meta = TOOL_MAP.get(t.slug)!
                const Icon = iconFor(meta.icon)
                const idx = tools.findIndex((x) => x.slug === t.slug)
                return (
                  <li
                    key={t.slug}
                    {...handleProps(idx)}
                    className={cn(
                      'card flex items-center gap-3 p-3 transition duration-150',
                      isOver(idx) && 'border-brand/60 ring-2 ring-brand/20',
                      !t.enabled && 'opacity-55',
                    )}
                  >
                    <GripVertical
                      className="h-4 w-4 shrink-0 cursor-grab text-muted active:cursor-grabbing"
                      aria-hidden
                    />
                    <span
                      className={cn(
                        'grid h-9 w-9 shrink-0 place-items-center rounded-lg',
                        ACCENT_SOFT[accentFor(idx)],
                      )}
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-extrabold">{meta.name}</p>
                      <p className="truncate text-xs text-muted">{meta.description}</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={t.enabled}
                      aria-label={`${meta.name} 启用状态`}
                      onClick={() => toggle(t.slug)}
                      className={cn(
                        // overflow-hidden 兜底：即使将来改动尺寸也不会让滑块溢出轨道
                        'relative h-6 w-11 shrink-0 overflow-hidden rounded-pill transition duration-200',
                        t.enabled ? 'bg-brand' : 'bg-fg/15',
                      )}
                    >
                      <span
                        className={cn(
                          // left-0 必须显式声明：<button> 默认 text-align:center，
                          // 只写 absolute 会落在居中后的静态位置，导致偏移错误并溢出。
                          'absolute left-0 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ease-spring',
                          t.enabled ? 'translate-x-[22px]' : 'translate-x-0.5',
                        )}
                      />
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}

      <div className="sticky bottom-4 flex justify-end">
        <Button size="lg" onClick={() => save('tools', tools)} disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? '保存中…' : '保存工具配置'}
        </Button>
      </div>
    </div>
  )
}
