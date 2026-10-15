/**
 * uapis.cn 上游封装。
 *
 * 该站点**不返回 CORS 头**，浏览器无法直连，因此所有请求都经本站服务端代理，
 * 并在此做内存缓存以降低上游压力（Serverless 下为 best-effort 缓存）。
 */

export const UAPI_BASE = 'https://uapis.cn'

/* ------------------------------------------------------------- 热榜 */

export const HOTBOARD_TYPES = [
  { id: 'weibo', label: '微博热搜' },
  { id: 'zhihu-daily', label: '知乎日报' },
  { id: 'toutiao', label: '今日头条' },
  { id: 'douyin', label: '抖音' },
] as const

export type HotBoardTypeId = (typeof HOTBOARD_TYPES)[number]['id']

export const HOTBOARD_LABEL: Record<string, string> = Object.fromEntries(
  HOTBOARD_TYPES.map((t) => [t.id, t.label]),
)

export interface HotItem {
  index?: number
  title: string
  url: string
  hot_value?: string
  extra?: unknown
  cover?: string
}

/* --------------------------------------------------------- 其他 API */

export type UapiKind = 'saying' | 'weather' | 'myip' | 'programmer' | 'dailyword' | 'answerbook'

export interface UapiEndpoint {
  label: string
  desc: string
  path: string
  /** 需要用户输入的参数 */
  params?: { key: string; label: string; placeholder: string; default?: string }[]
  /** 缓存时间（秒） */
  ttl: number
}

export const UAPI_ENDPOINTS: Record<UapiKind, UapiEndpoint> = {
  saying: {
    label: '一言',
    desc: '随机一句来自网络的句子',
    path: '/api/v1/saying',
    ttl: 30,
  },
  weather: {
    label: '天气查询',
    desc: '按城市名查询实时天气',
    path: '/api/v1/misc/weather',
    params: [{ key: 'city', label: '城市', placeholder: '北京', default: '北京' }],
    ttl: 600,
  },
  myip: {
    label: '我的 IP',
    desc: '查询当前出口 IP 与归属地',
    path: '/api/v1/network/myip',
    ttl: 60,
  },
  programmer: {
    label: '程序员历史上的今天',
    desc: '历史上这一天发生的编程大事',
    path: '/api/v1/history/programmer/today',
    ttl: 3600,
  },
  dailyword: {
    label: '每日单词',
    desc: '每天一个英语单词与释义',
    path: '/api/v1/daily/word',
    ttl: 3600,
  },
  answerbook: {
    label: '答案之书',
    desc: '向答案之书提一个问题',
    path: '/api/v1/answerbook/ask',
    ttl: 15,
  },
}

/* ------------------------------------------------------------- 缓存 */

declare global {
  // eslint-disable-next-line no-var
  var __UAPI_CACHE__: Map<string, { at: number; data: unknown }> | undefined
}

const cache = (globalThis.__UAPI_CACHE__ ??= new Map())

async function fetchWithCache(url: string, ttlSec: number): Promise<unknown> {
  const now = Date.now()
  const hit = cache.get(url)
  if (hit && now - hit.at < ttlSec * 1000) return hit.data

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 15_000)
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { Accept: 'application/json' } })
    const text = await res.text()
    let data: unknown
    try {
      data = JSON.parse(text)
    } catch {
      throw new Error(`上游返回非 JSON（HTTP ${res.status}）`)
    }
    if (!res.ok) {
      const msg =
        (data as { message?: string; error?: string })?.message ||
        (data as { message?: string; error?: string })?.error ||
        `上游返回 HTTP ${res.status}`
      throw new Error(msg)
    }
    cache.set(url, { at: now, data })
    return data
  } finally {
    clearTimeout(timer)
  }
}

/* ------------------------------------------------------------- 一言（含备用源） */

export type SayingProviderId = 'uapis' | 'hitokoto'

export interface SayingResult {
  text: string
  from: string
  provider: string
}

async function fetchJson(url: string, headers: Record<string, string> = {}, timeoutMs = 8000) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { Accept: 'application/json', ...headers } })
    const text = await res.text()
    let data: unknown
    try {
      data = JSON.parse(text)
    } catch {
      throw new Error(`上游返回非 JSON（HTTP ${res.status}）`)
    }
    if (!res.ok) {
      const rec = data as { message?: string; error?: string }
      throw new Error(rec.message || rec.error || `上游返回 HTTP ${res.status}`)
    }
    return data
  } finally {
    clearTimeout(timer)
  }
}

/**
 * 一言：按 preferred 顺序尝试多个源，任一成功即返回，全部失败才抛错。
 * 这是「主源失效有备用」的关键实现点。
 */
export async function fetchSaying(opts: {
  apiKey?: string
  preferred?: SayingProviderId
}): Promise<SayingResult> {
  const preferred: SayingProviderId = opts.preferred ?? 'uapis'
  const order: SayingProviderId[] =
    preferred === 'hitokoto' ? ['hitokoto', 'uapis'] : ['uapis', 'hitokoto']

  const errors: string[] = []

  for (const p of order) {
    try {
      if (p === 'uapis') {
        const headers: Record<string, string> = {}
        if (opts.apiKey?.trim()) headers.Authorization = `Bearer ${opts.apiKey.trim()}`
        const data = (await fetchJson(`${UAPI_BASE}/api/v1/saying`, headers)) as { text?: string }
        const text = String(data.text ?? '').trim()
        if (text) return { text, from: '', provider: 'UAPI · uapis.cn' }
        throw new Error('返回内容为空')
      }

      // hitokoto.cn（独立第三方源，作为备用）
      const data = (await fetchJson(
        'https://v1.hitokoto.cn/?c=a&c=b&c=c&c=d&c=e&c=f&c=g',
      )) as { hitokoto?: string; from?: string; from_who?: string }
      const text = String(data.hitokoto ?? '').trim()
      if (text) {
        const pretty = data.from_who
          ? data.from
            ? `${data.from_who}《${data.from}》`
            : data.from_who
          : (data.from ?? '')
        return { text, from: pretty, provider: 'Hitokoto · v1.hitokoto.cn' }
      }
      throw new Error('返回内容为空')
    } catch (e) {
      errors.push(`${p}: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  throw new Error(`所有一言接口均不可用（${errors.join('；')}）`)
}

/** 一言短缓存：成功才缓存，失败不缓存以便快速重试备用源。 */
export async function fetchSayingCached(opts: {
  apiKey?: string
  preferred?: SayingProviderId
}): Promise<SayingResult> {
  const key = `saying:${opts.preferred ?? 'uapis'}:${opts.apiKey ? 'keyed' : 'free'}`
  const now = Date.now()
  const hit = cache.get(key)
  if (hit && now - hit.at < 60_000) return hit.data as SayingResult

  const result = await fetchSaying(opts)
  cache.set(key, { at: now, data: result })
  return result
}

export function buildUapiUrl(kind: UapiKind, params: Record<string, string>): string {
  const ep = UAPI_ENDPOINTS[kind]
  const qs = new URLSearchParams()
  for (const p of ep.params ?? []) {
    const v = (params[p.key] ?? p.default ?? '').trim()
    if (v) qs.set(p.key, v)
  }
  const query = qs.toString()
  return `${UAPI_BASE}${ep.path}${query ? `?${query}` : ''}`
}

export function fetchUapi(kind: UapiKind, params: Record<string, string>): Promise<unknown> {
  return fetchWithCache(buildUapiUrl(kind, params), UAPI_ENDPOINTS[kind].ttl)
}

export function fetchHotBoard(type: string, timeMs?: number): Promise<unknown> {
  const qs = new URLSearchParams({ type })
  if (timeMs && Number.isFinite(timeMs)) qs.set('time', String(Math.floor(timeMs)))
  return fetchWithCache(`${UAPI_BASE}/api/v1/misc/hotboard?${qs.toString()}`, 120)
}

/** 热榜时间为 UTC ISO；按北京时间展示需 +8 小时。 */
export function formatUpdateTime(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const beijing = new Date(d.getTime() + 8 * 3600 * 1000)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${beijing.getUTCFullYear()}-${p(beijing.getUTCMonth() + 1)}-${p(beijing.getUTCDate())} ${p(
    beijing.getUTCHours(),
  )}:${p(beijing.getUTCMinutes())}`
}
