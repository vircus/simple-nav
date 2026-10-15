'use client'

import { useCallback, useState } from 'react'
import { GripVertical, Plus, Trash2, Save } from 'lucide-react'
import { useAdminData, useDragSort } from './api'
import { Button } from '@/components/ui/button'
import { uid, cn } from '@/lib/utils'
import type { Category } from '@/lib/types'

export function CategoriesView() {
  const { data, error, saving, save, setData } = useAdminData()
  const [draft, setDraft] = useState('')

  const categories = data?.categories ?? []

  const update = useCallback(
    (next: Category[]) => setData((p) => (p ? { ...p, categories: next } : p)),
    [setData],
  )

  // Hooks must run unconditionally — every early return comes after them,
  // otherwise the hook count changes between the loading and loaded renders.
  const { handleProps, isOver } = useDragSort(categories, update)

  if (error) return <ErrorBox message={error} />
  if (!data) return <LoadingBox />

  const patch = (id: string, key: keyof Category, value: string) =>
    update(categories.map((c) => (c.id === id ? { ...c, [key]: value } : c)))

  const remove = (id: string) => {
    if (!window.confirm('删除该分类？该分类下的站点将变为未分类。')) return
    update(categories.filter((c) => c.id !== id))
  }

  const add = () => {
    const name = draft.trim()
    if (!name) return
    update([...categories, { id: uid('cat'), name, icon: '', order: categories.length }])
    setDraft('')
  }

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
            placeholder="新分类名称"
            className="field flex-1"
            aria-label="新分类名称"
          />
          <Button onClick={add} disabled={!draft.trim()}>
            <Plus className="h-4 w-4" />
            添加分类
          </Button>
        </div>
      </div>

      {categories.length === 0 ? (
        <Empty text="还没有分类，先添加一个吧。" />
      ) : (
        <ul className="space-y-2">
          {categories.map((c, i) => (
            <li
              key={c.id}
              {...handleProps(i)}
              className={cn(
                'card flex items-center gap-3 p-3 transition duration-150',
                isOver(i) && 'border-brand/60 ring-2 ring-brand/20',
              )}
            >
              <GripVertical
                className="h-4 w-4 shrink-0 cursor-grab text-muted active:cursor-grabbing"
                aria-hidden
              />
              <input
                value={c.name}
                onChange={(e) => patch(c.id, 'name', e.target.value)}
                className="field flex-1"
                aria-label={`分类名称 ${c.name}`}
              />
              <input
                value={c.icon ?? ''}
                onChange={(e) => patch(c.id, 'icon', e.target.value)}
                placeholder="图标名"
                className="field w-28"
                aria-label="图标名"
              />
              <button
                type="button"
                onClick={() => remove(c.id)}
                aria-label={`删除 ${c.name}`}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line text-muted transition hover:border-coral/50 hover:text-coral active:scale-90"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="sticky bottom-4 flex justify-end">
        <Button size="lg" onClick={() => save('categories', categories)} disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? '保存中…' : '保存分类'}
        </Button>
      </div>
    </div>
  )
}

export function LoadingBox() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="skeleton h-16" />
      ))}
    </div>
  )
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="card border-coral/40 bg-coral/10 p-4 text-sm font-semibold text-coral">
      {message}
    </div>
  )
}

export function Empty({ text }: { text: string }) {
  return <div className="card p-8 text-center text-sm text-muted">{text}</div>
}
