import { NextResponse, type NextRequest } from 'next/server'
import { isSafeHttpUrl } from '@/lib/utils'

export const dynamic = 'force-dynamic'

/**
 * Dev-oriented HTTP debugging proxy.
 *
 * Needed because browsers cannot read cross-origin responses (CORS).
 * Private / loopback targets are refused to avoid turning this into an
 * SSRF pivot into the deployment's internal network.
 */
function isBlockedHost(hostname: string): boolean {
  const h = hostname.toLowerCase()
  if (h === 'localhost' || h === '::1' || h.endsWith('.localhost')) return true
  if (/^127\./.test(h)) return true
  if (/^10\./.test(h)) return true
  if (/^192\.168\./.test(h)) return true
  if (/^169\.254\./.test(h)) return true
  const m = /^172\.(\d+)\./.exec(h)
  if (m && Number(m[1]) >= 16 && Number(m[1]) <= 31) return true
  if (h === 'metadata.google.internal' || h === 'metadata.goog') return true
  return false
}

export async function POST(req: NextRequest) {
  let payload: { method?: string; url?: string; headers?: string; body?: string; timeoutMs?: number }
  try {
    payload = (await req.json()) as typeof payload
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 })
  }

  const url = (payload.url || '').trim()
  if (!url || !isSafeHttpUrl(url)) {
    return NextResponse.json({ error: '仅支持 http(s) 地址' }, { status: 400 })
  }

  let target: URL
  try {
    target = new URL(url)
  } catch {
    return NextResponse.json({ error: '地址无法解析' }, { status: 400 })
  }
  if (isBlockedHost(target.hostname)) {
    return NextResponse.json(
      { error: '出于安全考虑，不允许请求内网或本机地址' },
      { status: 403, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  const method = (payload.method || 'GET').toUpperCase()
  if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].includes(method)) {
    return NextResponse.json({ error: '不支持的请求方法' }, { status: 400 })
  }

  const headers: Record<string, string> = {}
  try {
    if (payload.headers) Object.assign(headers, JSON.parse(payload.headers) as Record<string, string>)
  } catch {
    return NextResponse.json({ error: '请求头不是合法 JSON' }, { status: 400 })
  }

  const started = Date.now()
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), Math.min(Math.max(payload.timeoutMs || 15000, 1000), 30000))

  try {
    const res = await fetch(target.toString(), {
      method,
      headers,
      body: method === 'GET' || method === 'HEAD' ? undefined : (payload.body ?? ''),
      signal: ctrl.signal,
      redirect: 'follow',
    })
    const text = await res.text()
    const limited = text.length > 200000 ? `${text.slice(0, 200000)}\n…（响应已截断）` : text
    return NextResponse.json(
      {
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        body: limited,
        timeMs: Date.now() - started,
      },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (err) {
    return NextResponse.json(
      { error: '请求失败', detail: err instanceof Error ? err.message : String(err) },
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    )
  } finally {
    clearTimeout(timer)
  }
}
