'use client'

import { useCallback, useState } from 'react'
import {
  Sparkles,
  CloudSun,
  Globe,
  History,
  BookOpen,
  HelpCircle,
  Play,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { UAPI_ENDPOINTS, type UapiKind } from '@/lib/uapi'

/**
 * 默认**不发起请求**：进入页面时各卡片处于空闲态，
 * 只有用户点击后才真正调用接口。
 */
function useUapi(kind: UapiKind, params: Record<string, string> = {}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [loaded, setLoaded] = useState(false)

  const key = JSON.stringify(params)

  const run = useCallback(
    async (override?: Record<string, string>) => {
      const p = override ?? (JSON.parse(key) as Record<string, string>)
      setLoading(true)
      setError('')
      try {
        const qs = new URLSearchParams({ kind })
        for (const [k, v] of Object.entries(p)) if (v) qs.set(k, v)
        const res = await fetch(`/api/uapi?${qs.toString()}`, { cache: 'no-store' })
        const json = (await res.json()) as Record<string, unknown> & { error?: string }
        if (!res.ok) throw new Error(json.error || '请求失败')
        setData(json)
        setLoaded(true)
      } catch (e) {
        setError(e instanceof Error ? e.message : '请求失败')
        setData(null)
      } finally {
        setLoading(false)
      }
    },
    [kind, key],
  )

  return { loading, error, data, loaded, run }
}

/* ------------------------------------------------------------- 卡片壳 */

function Card({
  title,
  desc,
  icon: Icon,
  accent,
  loading,
  error,
  loaded,
  idleLabel,
  onLoad,
  children,
}: {
  title: string
  desc: string
  icon: typeof Sparkles
  accent: string
  loading: boolean
  error: string
  loaded: boolean
  idleLabel: string
  onLoad: () => void
  children: React.ReactNode
}) {
  const idle = !loading && !error && !loaded

  return (
    <section className="card flex flex-col p-4">
      <header className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-sm font-extrabold tracking-tight">
            <span className={cn('grid h-8 w-8 place-items-center rounded-lg', accent)}>
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            {title}
          </h2>
          <p className="mt-1 text-xs text-muted">{desc}</p>
        </div>
        <button
          type="button"
          onClick={onLoad}
          disabled={loading}
          aria-label={idle ? `请求 ${title}` : `刷新 ${title}`}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-pill border border-line bg-surface text-muted transition hover:-translate-y-0.5 hover:text-brand active:scale-90 disabled:opacity-50"
        >
          {loading || !idle ? (
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} aria-hidden />
          ) : (
            <Play className="h-3.5 w-3.5" aria-hidden />
          )}
        </button>
      </header>

      <div className="min-h-[92px] flex-1">
        {loading ? (
          <div className="space-y-2">
            <div className="skeleton h-5 w-3/4" />
            <div className="skeleton h-5 w-1/2" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-start gap-2 text-xs text-coral">
            <span className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              <span>{error}</span>
            </span>
            <button
              type="button"
              onClick={onLoad}
              className="rounded-pill border border-line px-3 py-1 font-bold text-muted transition hover:-translate-y-0.5 hover:text-brand"
            >
              重试
            </button>
          </div>
        ) : !loaded ? (
          <button
            type="button"
            onClick={onLoad}
            className="flex h-full w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-line bg-surface-2/60 p-3 text-xs font-bold text-muted transition duration-200 hover:-translate-y-0.5 hover:border-brand/50 hover:text-brand"
          >
            <Play className="h-4 w-4" aria-hidden />
            {idleLabel}
          </button>
        ) : (
          children
        )}
      </div>
    </section>
  )
}

/* --------------------------------------------------------------- 一言 */

function SayingCard() {
  const { loading, error, data, loaded, run } = useUapi('saying')
  return (
    <Card
      title={UAPI_ENDPOINTS.saying.label}
      desc={UAPI_ENDPOINTS.saying.desc}
      icon={Sparkles}
      accent="bg-pop/15 text-brand"
      loading={loading}
      error={error}
      loaded={loaded}
      idleLabel="点击获取一句"
      onLoad={run}
    >
      <blockquote className="border-l-2 border-brand/40 pl-3 text-[15px] font-semibold leading-relaxed">
        {String(data?.text ?? '—')}
      </blockquote>
    </Card>
  )
}

/* --------------------------------------------------------------- 天气 */

function WeatherCard() {
  const [city, setCity] = useState('北京')
  const { loading, error, data, loaded, run } = useUapi('weather', { city })

  return (
    <Card
      title={UAPI_ENDPOINTS.weather.label}
      desc={UAPI_ENDPOINTS.weather.desc}
      icon={CloudSun}
      accent="bg-flash/15 text-flash"
      loading={loading}
      error={error}
      loaded={loaded}
      idleLabel="输入城市后点击查询"
      onLoad={() => run({ city })}
    >
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && run({ city })}
            className="field h-9 py-0 text-xs"
            placeholder="城市名"
            aria-label="城市名"
          />
          <button
            type="button"
            onClick={() => run({ city })}
            className="h-9 shrink-0 rounded-pill border border-line bg-surface px-3 text-xs font-bold transition hover:-translate-y-0.5 hover:border-brand/50"
          >
            查询
          </button>
        </div>
        {data && (
          <div>
            <p className="text-2xl font-black tracking-tight text-brand">
              {String(data.temperature ?? '-')}°
              <span className="ml-2 text-sm font-bold text-muted">{String(data.weather ?? '')}</span>
            </p>
            <p className="mt-1 text-xs text-muted">
              {String(data.city ?? '')} · {String(data.wind_direction ?? '')}{' '}
              {String(data.wind_power ?? '')} · 湿度 {String(data.humidity ?? '-')}%
            </p>
            {Boolean(data.report_time) && (
              <p className="mt-0.5 text-[11px] text-muted/80">{String(data.report_time)}</p>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}

/* -------------------------------------------------------------- 我的 IP */

function MyIpCard() {
  const { loading, error, data, loaded, run } = useUapi('myip')
  return (
    <Card
      title={UAPI_ENDPOINTS.myip.label}
      desc={UAPI_ENDPOINTS.myip.desc}
      icon={Globe}
      accent="bg-brand/15 text-brand"
      loading={loading}
      error={error}
      loaded={loaded}
      idleLabel="点击查看我的 IP"
      onLoad={run}
    >
      {data && (
        <div className="space-y-1">
          <p className="font-mono text-lg font-black tracking-tight">{String(data.ip ?? '-')}</p>
          <p className="text-xs text-muted">{String(data.region ?? '')}</p>
          <p className="text-xs text-muted">{String(data.isp ?? '')}</p>
        </div>
      )}
    </Card>
  )
}

/* ------------------------------------------------- 程序员历史上的今天 */

interface ProgEvent {
  year: number
  title: string
}

function ProgrammerCard() {
  const { loading, error, data, loaded, run } = useUapi('programmer')
  const events = (data?.events as ProgEvent[] | undefined) ?? []

  return (
    <Card
      title={UAPI_ENDPOINTS.programmer.label}
      desc={UAPI_ENDPOINTS.programmer.desc}
      icon={History}
      accent="bg-solar/25 text-brand"
      loading={loading}
      error={error}
      loaded={loaded}
      idleLabel="点击查看历史事件"
      onLoad={run}
    >
      <ul className="max-h-40 space-y-1.5 overflow-auto pr-1 no-scrollbar">
        {events.map((e, i) => (
          <li key={i} className="flex gap-2 text-xs leading-relaxed">
            <span className="shrink-0 font-mono font-bold text-brand">{e.year}</span>
            <span className="min-w-0 flex-1">{e.title}</span>
          </li>
        ))}
        {!events.length && <li className="text-xs text-muted">暂无数据</li>}
      </ul>
    </Card>
  )
}

/* ------------------------------------------------------------ 每日单词 */

interface WordEntry {
  word: string
  phonetic?: string
  translation?: string
}

function DailyWordCard() {
  const { loading, error, data, loaded, run } = useUapi('dailyword')
  const word = ((data?.words as WordEntry[] | undefined) ?? [])[0]

  return (
    <Card
      title={UAPI_ENDPOINTS.dailyword.label}
      desc={UAPI_ENDPOINTS.dailyword.desc}
      icon={BookOpen}
      accent="bg-accent/15 text-accent"
      loading={loading}
      error={error}
      loaded={loaded}
      idleLabel="点击查看今日单词"
      onLoad={run}
    >
      {word && (
        <div className="space-y-1">
          <p className="text-lg font-black tracking-tight">
            {word.word}
            {word.phonetic && (
              <span className="ml-2 font-mono text-xs font-bold text-muted">{word.phonetic}</span>
            )}
          </p>
          <p className="line-clamp-3 text-xs leading-relaxed text-muted">{word.translation}</p>
        </div>
      )}
    </Card>
  )
}

/* ------------------------------------------------------------ 答案之书 */

function AnswerBookCard() {
  const { loading, error, data, loaded, run } = useUapi('answerbook')

  return (
    <Card
      title={UAPI_ENDPOINTS.answerbook.label}
      desc={UAPI_ENDPOINTS.answerbook.desc}
      icon={HelpCircle}
      accent="bg-pop/15 text-brand"
      loading={loading}
      error={error}
      loaded={loaded}
      idleLabel="点击求问答案之书"
      onLoad={run}
    >
      {data && (
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-muted">
            问题：{String(data.question ?? '随机答案')}
          </p>
          <p className="text-[15px] font-bold leading-relaxed text-brand">{String(data.answer ?? '')}</p>
        </div>
      )}
    </Card>
  )
}

/* --------------------------------------------------------------- 页面 */

export function UapiPanel() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <SayingCard />
      <WeatherCard />
      <MyIpCard />
      <ProgrammerCard />
      <DailyWordCard />
      <AnswerBookCard />
    </div>
  )
}
