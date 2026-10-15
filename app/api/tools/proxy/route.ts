import { NextResponse, type NextRequest } from 'next/server'
import { readSiteData } from '@/lib/kv'
import type { NetworkServiceConfig } from '@/lib/types'

export const dynamic = 'force-dynamic'

declare global {
  // eslint-disable-next-line no-var
  var __NAV_PROXY_CACHE__: Map<string, { at: number; data: unknown }> | undefined
}

const cache = (globalThis.__NAV_PROXY_CACHE__ ??= new Map())

type ToolKey = 'ip-lookup' | 'dns-lookup'

function pickTool(tool: string | null): ToolKey | null {
  return tool === 'ip-lookup' || tool === 'dns-lookup' ? tool : null
}

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
}

/**
 * Server-side proxy for network tools.
 *
 * Exists purely so a configured auth token never reaches the browser:
 * the client only sends the tool key + query params, we attach credentials here.
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const toolKey = pickTool(sp.get('tool'))
  if (!toolKey) return json({ error: '未知工具' }, 400)

  const data = await readSiteData()
  const cfg: NetworkServiceConfig | undefined =
    toolKey === 'ip-lookup' ? data.settings.network?.ipLookup : data.settings.network?.dnsLookup

  if (!cfg || !cfg.enabled || !cfg.endpoint) {
    return json({ error: '该网络服务尚未配置' }, 400)
  }

  const vars: Record<string, string> = {}
  for (const [k, v] of sp.entries()) {
    if (k !== 'tool') vars[k] = v
  }

  let endpoint = cfg.endpoint.replace(/\{(\w+)\}/g, (_, key: string) =>
    encodeURIComponent(vars[key] ?? ''),
  )

  const headers: Record<string, string> = {}
  if (cfg.headers) {
    try {
      Object.assign(headers, JSON.parse(cfg.headers) as Record<string, string>)
    } catch {
      /* ignore malformed header JSON */
    }
  }

  const hasToken = Boolean(cfg.token && cfg.tokenPlacement !== 'none')
  if (hasToken) {
    if (cfg.tokenPlacement === 'header') {
      headers[cfg.tokenKey || 'Authorization'] = cfg.token as string
    } else if (cfg.tokenPlacement === 'query') {
      endpoint += `${endpoint.includes('?') ? '&' : '?'}${encodeURIComponent(
        cfg.tokenKey || 'key',
      )}=${encodeURIComponent(cfg.token as string)}`
    }
  }

  const cacheKey = `${toolKey}:${endpoint}`
  const now = Date.now()
  const hit = cache.get(cacheKey)
  if (hit && now - hit.at < cfg.cacheTtlSec * 1000) return json(hit.data)

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), cfg.timeoutMs)
  try {
    const res = await fetch(endpoint, { method: cfg.method, headers, signal: ctrl.signal })
    const text = await res.text()
    let payload: unknown
    try {
      payload = JSON.parse(text)
    } catch {
      payload = { raw: text.slice(0, 4000) }
    }
    cache.set(cacheKey, { at: now, data: payload })
    return json(payload)
  } catch (err) {
    return json({ error: '上游接口请求失败', detail: String(err) }, 502)
  } finally {
    clearTimeout(timer)
  }
}
