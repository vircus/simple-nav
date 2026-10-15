'use client'

import { useCallback, useState } from 'react'
import { GripVertical, Plus, Trash2, Save, Sparkles } from 'lucide-react'
import { useAdminData, useDragSort } from './api'
import { Button } from '@/components/ui/button'
import { uid, cn, isInternalUrl, isSafeHttpUrl, hostnameOf } from '@/lib/utils'
import { Empty, ErrorBox, LoadingBox } from './categories-view'
import type { Site } from '@/lib/types'

export function SitesView() {
  const { data, error, saving, save, setData } = useAdminData()
  const [keyword, setKeyword] = useState('')

  const categories = data?.categories ?? []
  const sites = data?.sites ?? []
  const primaryDomain = data?.settings.primaryDomain ?? ''

  const update = useCallback(
    (next: Site[]) => setData((p) => (p ? { ...p, sites: next } : p)),
    [setData],
  )

  // Hooks must run unconditionally — early returns come after them.
  const { handleProps, isOver } = useDragSort(sites, update)

  if (error) return <ErrorBox message={error} />
  if (!data) return <LoadingBox />

  const patch = (id: string, key: keyof Site, value: string | boolean) =>
    update(sites.map((s) => (s.id === id ? { ...s, [key]: value } : s)))

  const remove = (id: string) => {
    if (!window.confirm('删除该站点？')) return
    update(sites.filter((s) => s.id !== id))
  }

  const add = () => {
    update([
      ...sites,
      {
        id: uid('site'),
        categoryId: categories[0]?.id ?? '',
        name: '新站点',
        url: 'https://',
        icon: '',
        description: '',
        isInternal: false,
        openInNewTab: true,
        order: sites.length,
      },
    ])
  }

  const filtered = keyword.trim()
    ? sites.filter(
        (s) =>
          s.name.toLowerCase().includes(keyword.toLowerCase()) ||
          hostnameOf(s.url).includes(keyword.toLowerCase()),
      )
    : sites

  return (
    <div className="space-y-4">
      <div className="card flex flex-col gap-2 p-4 sm:flex-row sm:items-center">
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="筛选站点…"
          className="field flex-1"
          aria-label="筛选站点"
        />
        <Button onClick={add}>
          <Plus className="h-4 w-4" />
          新增站点
        </Button>
      </div>

      {primaryDomain && (
        <div className="flex items-start gap-2 rounded-xl border border-brand/25 bg-brand/5 p-3 text-xs">
          <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" aria-hidden />
          <p className="text-muted">
            主域名配置为 <b className="text-brand">{primaryDomain}</b>
            ，填写链接后会自动识别「本站」标记（该配置仅用于展示徽标，不影响跳转）。
          </p>
        </div>
      )}

      {filtered.length === 0 ? (
        <Empty text="没有匹配的站点。" />
      ) : (
        <ul className="space-y-3">
          {filtered.map((s) => {
            const idx = sites.findIndex((x) => x.id === s.id)
            const bad = !isSafeHttpUrl(s.url)
            return (
              <li
                key={s.id}
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
                    value={s.name}
                    onChange={(e) => patch(s.id, 'name', e.target.value)}
                    className="field w-40 flex-1 font-bold"
                    placeholder="名称"
                    aria-label="站点名称"
                  />
                  <select
                    value={s.categoryId}
                    onChange={(e) => patch(s.id, 'categoryId', e.target.value)}
                    className="field w-36"
                    aria-label="所属分类"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => remove(s.id)}
                    aria-label={`删除 ${s.name}`}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line text-muted transition hover:border-coral/50 hover:text-coral active:scale-90"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    value={s.url}
                    onChange={(e) => patch(s.id, 'url', e.target.value)}
                    onBlur={(e) => {
                      if (primaryDomain) {
                        patch(s.id, 'isInternal', isInternalUrl(e.target.value, primaryDomain))
                      }
                    }}
                    placeholder="https://example.com"
                    className={cn('field flex-1 font-mono text-[13px]', bad && 'border-coral/60')}
                    aria-label="站点地址"
                  />
                  <input
                    value={s.icon ?? ''}
                    onChange={(e) => patch(s.id, 'icon', e.target.value)}
                    placeholder="图标 URL（可留空）"
                    className="field flex-1 font-mono text-[13px]"
                    aria-label="图标地址"
                  />
                </div>
                {bad && (
                  <p className="text-xs font-semibold text-coral">
                    仅允许 http:// 或 https:// 开头的地址
                  </p>
                )}

                <input
                  value={s.description ?? ''}
                  onChange={(e) => patch(s.id, 'description', e.target.value)}
                  placeholder="一句话描述（可留空）"
                  className="field"
                  aria-label="描述"
                />

                <div className="flex flex-wrap items-center gap-5">
                  <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold">
                    <input
                      type="checkbox"
                      checked={s.isInternal}
                      onChange={(e) => patch(s.id, 'isInternal', e.target.checked)}
                      className="h-4 w-4 accent-[rgb(var(--c-brand))]"
                    />
                    本站链接
                    {s.isInternal && (
                      <span className="chip bg-brand/12 text-brand">本站</span>
                    )}
                  </label>
                  <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold">
                    <input
                      type="checkbox"
                      checked={s.openInNewTab}
                      onChange={(e) => patch(s.id, 'openInNewTab', e.target.checked)}
                      className="h-4 w-4 accent-[rgb(var(--c-brand))]"
                    />
                    新标签页打开
                  </label>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <div className="sticky bottom-4 flex justify-end">
        <Button size="lg" onClick={() => save('sites', sites)} disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? '保存中…' : `保存站点（${sites.length}）`}
        </Button>
      </div>
    </div>
  )
}
