'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Flame, RefreshCw, CalendarClock, ExternalLink, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { HOTBOARD_TYPES, type HotItem } from '@/lib/uapi'
import type { HotBoardTypeId } from '@/lib/uapi'

type Mode = 'now' | 'yesterday' | 'dayBefore' | 'custom'

const MODE_LABEL: Record<Mode, string> = {
  now: '实时',
  yesterday: '昨天',
  dayBefore: '前天',
  custom: '指定日期',
}

interface BoardData {
  type: string
  update_time?: string
  snapshot_time?: number
  list?: HotItem[]
}

/** 取目标日期当天 12:00（本地时区）的毫秒时间戳 */
function msAtNoon(base: Date): number {
  const d = new Date(base.getTime())
  d.setHours(12, 0, 0, 0)
  return d.getTime()
}

export function HotBoard({ compact = false }: { compact?: boolean }) {
  const [type, setType] = useState<HotBoardTypeId>('weibo')
  const [mode, setMode] = useState<Mode>('now')
  const [customDate, setCustomDate] = useState('')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState<BoardData | null>(null)

  const timeMs = useMemo(() => {
    if (mode === 'now') return undefined
    const d = new Date()
    if (mode === 'yesterday') d.setDate(d.getDate() - 1)
    else if (mode === 'dayBefore') d.setDate(d.getDate() - 2)
    else {
      if (!customDate) return undefined
      const [y, m, day] = customDate.split('-').map(Number)
      if (!y || !m || !day) return undefined
      d.setFullYear(y, m - 1, day)
    }
    return msAtNoon(d)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, customDate])

  const waitingForDate = mode === 'custom' && !customDate

  const load = useCallback(async () => {
    if (waitingForDate) {
      setData(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    try {
      const qs = new URLSearchParams({ type })
      if (timeMs) qs.set('time', String(timeMs))
      const res = await fetch(`/api/hotboard?${qs.toString()}`, { cache: 'no-store' })
      const json = (await res.json()) as BoardData & { error?: string }
      if (!res.ok) throw new Error(json.error || '热榜获取失败')
      setData(json)
    } catch (e) {
      setError(e instanceof Error ? e.message : '热榜获取失败')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [type, timeMs, waitingForDate])

  useEffect(() => {
    void load()
  }, [load])

  const list = data?.list ?? []

  return (
    <section
      className={cn(
        'rounded-card border border-line bg-surface shadow-card',
        // 紧凑模式作为栅格项被 stretch 撑满，高度与左侧 Hero 一致
        compact ? 'flex flex-col p-3' : 'p-4',
      )}
    >
      <div className={cn('mb-2 flex flex-wrap items-center justify-between gap-2', compact && 'gap-1.5')}>
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn('chip', compact ? 'bg-coral/12 text-coral' : 'bg-coral/12 text-coral')}>
            <Flame className="h-3.5 w-3.5" aria-hidden />
            热点板块
          </span>
          {data?.update_time && !compact && (
            <span className="text-xs text-muted">
              更新于 {new Date(data.update_time).toLocaleString('zh-CN', { hour12: false, timeZone: 'Asia/Shanghai' })}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          aria-label="刷新热榜"
          className={cn(
            'inline-flex items-center justify-center rounded-pill border border-line bg-surface text-muted transition hover:-translate-y-0.5 hover:text-brand active:scale-90 disabled:opacity-50',
            compact ? 'h-7 w-7' : 'h-8 w-8',
          )}
        >
          <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} aria-hidden />
        </button>
      </div>

      {/* 平台切换 */}
      <div className={cn('mb-2 flex flex-wrap gap-1.5', compact && 'mb-1.5 gap-1')}>
        {HOTBOARD_TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setType(t.id)}
            aria-pressed={type === t.id}
            className={cn(
              'rounded-pill border font-bold transition duration-200',
              compact ? 'px-2.5 py-1 text-[11px]' : 'px-3.5 py-1.5 text-xs',
              type === t.id
                ? 'border-brand bg-brand text-white shadow-glow'
                : 'border-line bg-surface text-muted hover:-translate-y-0.5 hover:text-fg',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 时光机 */}
      <div className={cn('mb-3 flex flex-wrap items-center gap-2', compact && 'mb-1.5 gap-1')}>
        {!compact && (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-muted">
            <CalendarClock className="h-3.5 w-3.5" aria-hidden />
            时光机
          </span>
        )}
        {(Object.keys(MODE_LABEL) as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            aria-pressed={mode === m}
            className={cn(
              'rounded-pill border font-bold transition duration-200',
              compact ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1.5 text-xs',
              mode === m
                ? 'border-pop bg-pop/15 text-brand'
                : 'border-line bg-surface text-muted hover:-translate-y-0.5 hover:text-fg',
            )}
          >
            {MODE_LABEL[m]}
          </button>
        ))}
        {mode === 'custom' && (
          <input
            type="date"
            value={customDate}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setCustomDate(e.target.value)}
            className="field h-8 w-36 py-0 text-xs"
            aria-label="指定日期"
          />
        )}
      </div>

      {/* 内容 */}
      <div
        className={cn(
          'card flex flex-col',
          // PC：吃掉列内剩余空间，高度与 Hero 对齐；移动端保持固定上限
          compact ? 'min-h-0 p-2 lg:flex-1' : 'p-3',
        )}
      >
        {loading ? (
          <ul className="space-y-2 overflow-hidden">
            {Array.from({ length: compact ? 6 : 8 }).map((_, i) => (
              <li key={i} className="skeleton h-9" />
            ))}
          </ul>
        ) : error ? (
          <div className="flex items-start gap-2 p-3 text-sm text-coral">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>{error}</span>
          </div>
        ) : waitingForDate ? (
          <p className="p-3 text-sm text-muted">请选择一个日期以查看该日附近的历史热榜快照。</p>
        ) : list.length === 0 ? (
          <p className="p-3 text-sm text-muted">该时间点暂无可展示的热榜快照，换个时间试试。</p>
        ) : (
          <ol
            className={cn(
              'space-y-0.5 overflow-auto pr-1 no-scrollbar',
              // 移动端/非紧凑：固定上限；PC 紧凑：填满剩余高度（上限失效）
              compact ? 'max-h-[300px] lg:h-full lg:max-h-none lg:flex-1 lg:min-h-0' : 'max-h-[360px]',
            )}
          >
            {(compact ? list.slice(0, 12) : list).map((item, i) => (
              <li key={`${item.url}-${i}`}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-2 rounded-xl px-2 py-1.5 transition duration-150 hover:bg-fg/5"
                >
                  <span
                    className={cn(
                      'mt-0.5 grid shrink-0 place-items-center rounded-md font-black',
                      compact ? 'h-5 w-5 px-0.5 text-[10px]' : 'h-5 w-5 text-[11px]',
                      i < 3 ? 'bg-coral/15 text-coral' : 'bg-surface-2 text-muted',
                    )}
                    aria-hidden
                  >
                    {item.index ?? i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        'block font-semibold leading-snug group-hover:text-brand',
                        compact ? 'truncate text-[12.5px]' : 'text-[13.5px]',
                      )}
                    >
                      {item.title}
                    </span>
                    {item.hot_value && !compact && (
                      <span className="mt-0.5 block text-[11px] tabular-nums text-muted">
                        热度 {item.hot_value}
                      </span>
                    )}
                  </span>
                  {!compact && (
                    <ExternalLink
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted opacity-0 transition group-hover:opacity-100"
                      aria-hidden
                    />
                  )}
                </a>
              </li>
            ))}
          </ol>
        )}
      </div>

      {!compact && (
        <p className="mt-2 text-[11px] text-muted/80">
          数据来源 uapis.cn 全网热榜聚合 · 时间为北京时间；历史快照为该时间点附近最近一次可展示数据。
        </p>
      )}
    </section>
  )
}
