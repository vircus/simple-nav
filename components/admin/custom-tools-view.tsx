'use client'

import { useCallback, useState } from 'react'
import { GripVertical, Plus, Trash2, Save } from 'lucide-react'
import { useAdminData, useDragSort } from './api'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/tools/shared'
import { uid, cn } from '@/lib/utils'
import { TOOL_ICON_NAMES } from '@/lib/tool-icons'
import { TOOL_CATEGORY_LABEL, TOOL_CATEGORY_ORDER, TOOL_MAP } from '@/lib/registry'
import type { CustomTool, CustomToolType, ToolCategory } from '@/lib/types'

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,39}$/

export function CustomToolsView() {
  const { data, error, saving, save, setData } = useAdminData()

  const tools = data?.customTools ?? []

  const update = useCallback(
    (next: CustomTool[]) => setData((p) => (p ? { ...p, customTools: next } : p)),
    [setData],
  )

  // Hooks must run unconditionally — early returns come after them.
  const { handleProps, isOver } = useDragSort(tools, update)

  if (error) return <div className="card border-coral/40 bg-coral/10 p-4 text-sm text-coral">{error}</div>
  if (!data) return <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-20" />)}</div>

  const patch = (id: string, key: keyof CustomTool, value: unknown) =>
    update(tools.map((t) => (t.id === id ? { ...t, [key]: value } : t)))

  const remove = (id: string) => {
    if (!window.confirm('删除该自定义工具？')) return
    update(tools.filter((t) => t.id !== id))
  }

  const add = () => {
    const n = tools.length + 1
    update([
      ...tools,
      {
        id: uid('ctool'),
        slug: `custom-tool-${n}`,
        name: `自定义工具 ${n}`,
        description: '',
        category: 'devops' as ToolCategory,
        icon: 'Sparkles',
        type: 'link' as CustomToolType,
        url: 'https://',
        html: '',
        enabled: true,
        order: tools.length,
      },
    ])
  }

  const slugIssue = (t: CustomTool) => {
    if (!SLUG_RE.test(t.slug)) return '标识只能包含小写字母、数字与连字符，且不能以连字符开头'
    if (TOOL_MAP.has(t.slug)) return '标识与内置工具冲突'
    if (tools.filter((x) => x.slug === t.slug).length > 1) return '标识重复'
    return ''
  }

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="text-sm">
          <p className="font-semibold text-muted">
            自定义工具 <b className="text-brand">{tools.filter((t) => t.enabled).length}</b> / {tools.length} 个
          </p>
          <p className="mt-1 text-xs text-muted">
            支持两种类型：<b>外链</b>（跳转到现有工具站）与 <b>嵌入</b>（粘贴 HTML，在沙箱 iframe 中运行）。
          </p>
        </div>
        <Button onClick={add}>
          <Plus className="h-4 w-4" />
          新增工具
        </Button>
      </div>

      {tools.length === 0 ? (
        <div className="card p-8 text-center text-sm text-muted">
          还没有自定义工具。点击「新增工具」创建一个。
        </div>
      ) : (
        <ul className="space-y-3">
          {tools.map((t, idx) => {
            const issue = slugIssue(t)
            const badUrl = t.type === 'link' && t.url !== '' && !/^https?:\/\//.test(t.url)
            return (
              <li
                key={t.id}
                {...handleProps(idx)}
                className={cn(
                  'card space-y-3 p-3.5 transition duration-150',
                  isOver(idx) && 'border-brand/60 ring-2 ring-brand/20',
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <GripVertical
                    className="h-4 w-4 shrink-0 cursor-grab text-muted active:cursor-grabbing"
                    aria-hidden
                  />
                  <input
                    value={t.name}
                    onChange={(e) => patch(t.id, 'name', e.target.value)}
                    className="field w-40 flex-1 font-bold"
                    placeholder="工具名称"
                    aria-label="工具名称"
                  />
                  <select
                    value={t.category}
                    onChange={(e) => patch(t.id, 'category', e.target.value as ToolCategory)}
                    className="field w-32"
                    aria-label="所属分类"
                  >
                    {TOOL_CATEGORY_ORDER.map((c) => (
                      <option key={c} value={c}>
                        {TOOL_CATEGORY_LABEL[c]}
                      </option>
                    ))}
                  </select>
                  <select
                    value={t.icon}
                    onChange={(e) => patch(t.id, 'icon', e.target.value)}
                    className="field w-36"
                    aria-label="图标"
                  >
                    {TOOL_ICON_NAMES.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => remove(t.id)}
                    aria-label={`删除 ${t.name}`}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line text-muted transition hover:border-coral/50 hover:text-coral active:scale-90"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <label className="flex-1 text-xs font-bold text-muted">
                    标识（URL 中的路径）
                    <input
                      value={t.slug}
                      onChange={(e) => patch(t.id, 'slug', e.target.value.trim().toLowerCase())}
                      className={cn('field mt-1 font-mono text-[13px]', issue && 'border-coral/60')}
                      placeholder="my-tool"
                    />
                  </label>
                  <label className="flex-1 text-xs font-bold text-muted">
                    类型
                    <select
                      value={t.type}
                      onChange={(e) => patch(t.id, 'type', e.target.value as CustomToolType)}
                      className="field mt-1"
                    >
                      <option value="link">外链工具</option>
                      <option value="embed">嵌入 HTML（沙箱）</option>
                    </select>
                  </label>
                </div>

                {issue && <p className="text-xs font-semibold text-coral">{issue}</p>}

                {t.type === 'link' ? (
                  <label className="block text-xs font-bold text-muted">
                    目标地址
                    <input
                      value={t.url}
                      onChange={(e) => patch(t.id, 'url', e.target.value)}
                      className={cn('field mt-1 font-mono text-[13px]', badUrl && 'border-coral/60')}
                      placeholder="https://example.com/tool"
                    />
                  </label>
                ) : (
                  <label className="block text-xs font-bold text-muted">
                    HTML 内容（运行在沙箱 iframe 中，无法访问本站页面与 Cookie）
                    <textarea
                      value={t.html}
                      onChange={(e) => patch(t.id, 'html', e.target.value)}
                      className="field mt-1 min-h-[160px] resize-y font-mono text-[12.5px]"
                      placeholder="<div style='padding:16px;font:14px sans-serif'>Hello</div>"
                    />
                  </label>
                )}

                <label className="block text-xs font-bold text-muted">
                  一句话描述
                  <input
                    value={t.description}
                    onChange={(e) => patch(t.id, 'description', e.target.value)}
                    className="field mt-1"
                    placeholder="可留空"
                  />
                </label>

                <Checkbox
                  checked={t.enabled}
                  onChange={(v) => patch(t.id, 'enabled', v)}
                  label="启用该工具"
                />
              </li>
            )
          })}
        </ul>
      )}

      <div className="sticky bottom-4 flex justify-end">
        <Button
          size="lg"
          onClick={() => save('customTools', tools)}
          disabled={saving || tools.some((t) => slugIssue(t) !== '')}
        >
          <Save className="h-4 w-4" />
          {saving ? '保存中…' : `保存自定义工具（${tools.length}）`}
        </Button>
      </div>
    </div>
  )
}
