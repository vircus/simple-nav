'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from '@/components/ui/toast'
import type { SiteData } from '@/lib/types'

type Kind = 'categories' | 'sites' | 'tools' | 'settings' | 'customTools'

/**
 * Loads admin data and performs optimistic saves.
 * We never read back right after writing: EdgeOne KV is eventually consistent
 * (up to ~60s), so a read-back would surface stale data.
 */
export function useAdminData() {
  const [data, setData] = useState<SiteData | null>(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const reload = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/data', { cache: 'no-store' })
      if (!res.ok) {
        throw new Error(res.status === 401 ? '登录已过期，请重新登录' : '数据加载失败')
      }
      setData((await res.json()) as SiteData)
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : '数据加载失败')
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const save = useCallback(
    async (kind: Kind, value: unknown) => {
      setSaving(true)
      try {
        const res = await fetch(`/api/admin/${kind}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(value),
        })
        if (!res.ok) {
          const j = (await res.json().catch(() => ({}))) as {
            error?: string
            issues?: { path: string; message: string }[]
          }
          const detail = Array.isArray(j.issues)
            ? j.issues.map((i) => (i.path ? `${i.path}：${i.message}` : i.message)).join('；')
            : ''
          throw new Error([j.error, detail].filter(Boolean).join(' — ') || '保存失败')
        }
        setData((prev) => (prev ? ({ ...prev, [kind]: value } as SiteData) : prev))
        toast('已提交，全球节点同步约需 1 分钟', 'info')
        return true
      } catch (e) {
        toast(e instanceof Error ? e.message : '保存失败', 'err')
        return false
      } finally {
        setSaving(false)
      }
    },
    [],
  )

  return { data, error, saving, reload, save, setData }
}

/** Native HTML5 drag sorting — no extra dependency. */
export function useDragSort<T>(items: T[], onReorder: (next: T[]) => void) {
  const [from, setFrom] = useState<number | null>(null)
  const [over, setOver] = useState<number | null>(null)

  const move = (arr: T[], i: number, j: number): T[] => {
    const next = arr.slice()
    const [item] = next.splice(i, 1)
    next.splice(j, 0, item)
    return next.map((x, idx) => ({ ...x, order: idx }) as T)
  }

  const handleProps = (index: number) => ({
    draggable: true,
    onDragStart: () => setFrom(index),
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault()
      setOver(index)
    },
    onDragLeave: () => setOver((v) => (v === index ? null : v)),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault()
      if (from !== null && from !== index) onReorder(move(items, from, index))
      setFrom(null)
      setOver(null)
    },
    onDragEnd: () => {
      setFrom(null)
      setOver(null)
    },
  })

  const dragging = from !== null
  const isOver = (i: number) => over === i && from !== i

  return { handleProps, dragging, isOver, from }
}
