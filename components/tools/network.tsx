'use client'

import { useEffect, useMemo, useState } from 'react'
import { Globe, Server, Search } from 'lucide-react'
import { Panel, Segmented, CopyButton, OutputBox } from './shared'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  parseUserAgent,
  HTTP_STATUS,
  statusTone,
  summarizeIp,
  summarizeDns,
  type DnsRow,
} from '@/lib/tools/network'
import type { PublicNetworkConfig } from '@/lib/types'

function useNetworkFetch() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [raw, setRaw] = useState<unknown>(null)

  const run = async (
    tool: 'ip-lookup' | 'dns-lookup',
    params: Record<string, string>,
    cfg?: PublicNetworkConfig,
  ) => {
    setError('')
    setRaw(null)
    setLoading(true)
    try {
      const qs = new URLSearchParams({ tool, ...params }).toString()
      // Direct call when the endpoint is public; proxy whenever a secret token is involved.
      const url =
        cfg?.endpoint && !cfg.useProxy
          ? cfg.endpoint.replace(/\{(\w+)\}/g, (_, k: string) => encodeURIComponent(params[k] ?? ''))
          : `/api/tools/proxy?${qs}`
      const res = await fetch(url, { cache: 'no-store' })
      const text = await res.text()
      let payload: unknown
      try {
        payload = JSON.parse(text)
      } catch {
        payload = { raw: text }
      }
      if (!res.ok) {
        const msg = (payload as { error?: string })?.error
        throw new Error(msg || `请求失败（HTTP ${res.status}）`)
      }
      setRaw(payload)
    } catch (e) {
      setError(e instanceof Error ? e.message : '请求失败')
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, raw, run }
}

/* -------------------------------------------------------------- IP lookup */

export function IpLookupTool({ config }: { config?: PublicNetworkConfig }) {
  const [ip, setIp] = useState('')
  const { loading, error, raw, run } = useNetworkFetch()

  const summary = useMemo(() => (raw ? summarizeIp(raw) : null), [raw])

  const rows: [string, string][] = summary
    ? (
        [
          ['IP 地址', summary.ip],
          ['国家 / 地区', summary.country],
          ['省 / 州', summary.region],
          ['城市', summary.city],
          ['运营商 / 组织', summary.isp],
          ['ASN', summary.asn],
          ['坐标', summary.coords],
          ['时区', summary.timezone],
        ] as [string, string][]
      ).filter(([, v]) => v)
    : []

  return (
    <div className="space-y-4">
      <Panel
        title="查询"
        hint={config?.enabled === false ? '该服务已在管理面板中停用' : '留空则查询当前公网 IP'}
      >
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            placeholder="8.8.8.8"
            className="field flex-1 font-mono"
            aria-label="IP 地址"
          />
          <Button
            onClick={() => run('ip-lookup', { ip: ip.trim() }, config)}
            disabled={loading || config?.enabled === false}
          >
            {loading ? '查询中…' : '查询'}
          </Button>
        </div>
        {error && (
          <p className="mt-3 rounded-xl border border-coral/40 bg-coral/10 p-3 text-sm text-coral">
            {error}
          </p>
        )}
      </Panel>

      {summary && (
        <Panel title="结果">
          <div className="grid gap-2 sm:grid-cols-2">
            {rows.map(([k, v]) => (
              <div key={k} className="rounded-xl border border-line bg-surface-2 p-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-muted">{k}</p>
                <p className="mt-0.5 break-all text-sm font-bold">{v}</p>
              </div>
            ))}
          </div>
          {!rows.length && (
            <p className="text-sm text-muted">
              未识别到字段，请查看下方原始响应（可在管理面板调整接口）。
            </p>
          )}
        </Panel>
      )}

      {raw != null && (
        <Panel title="原始响应">
          <OutputBox value={JSON.stringify(raw, null, 2)} />
        </Panel>
      )}
    </div>
  )
}

/* ------------------------------------------------------------- DNS lookup */

const DNS_TYPES = ['A', 'AAAA', 'CNAME', 'MX', 'NS', 'TXT', 'SOA']

export function DnsLookupTool({ config }: { config?: PublicNetworkConfig }) {
  const [domain, setDomain] = useState('')
  const [type, setType] = useState('A')
  const { loading, error, raw, run } = useNetworkFetch()

  const rows: DnsRow[] = useMemo(() => (raw ? summarizeDns(raw) : []), [raw])

  return (
    <div className="space-y-4">
      <Panel
        title="查询"
        hint={config?.enabled === false ? '该服务已在管理面板中停用' : '通过 DNS-over-HTTPS 查询'}
      >
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.com"
            className="field flex-1 font-mono"
            aria-label="域名"
          />
          <Button
            onClick={() => run('dns-lookup', { domain: domain.trim(), type }, config)}
            disabled={loading || !domain.trim() || config?.enabled === false}
          >
            {loading ? '查询中…' : '查询'}
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {DNS_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              aria-pressed={type === t}
              className={cn(
                'rounded-pill border px-3 py-1.5 text-xs font-bold transition duration-200',
                type === t
                  ? 'border-brand bg-brand text-white shadow-glow'
                  : 'border-line bg-surface text-muted hover:-translate-y-0.5 hover:text-fg',
              )}
            >
              {t}
            </button>
          ))}
        </div>
        {error && (
          <p className="mt-3 rounded-xl border border-coral/40 bg-coral/10 p-3 text-sm text-coral">
            {error}
          </p>
        )}
      </Panel>

      {raw != null && (
        <Panel title={`${type} 记录`} hint={`${rows.length} 条`}>
          {rows.length ? (
            <div className="overflow-x-auto rounded-xl border border-line">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-surface-2 text-[11px] uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-3 py-2 font-bold">名称</th>
                    <th className="px-3 py-2 font-bold">类型</th>
                    <th className="px-3 py-2 font-bold">TTL</th>
                    <th className="px-3 py-2 font-bold">值</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className="border-t border-line/60 font-mono">
                      <td className="px-3 py-2">{r.name}</td>
                      <td className="px-3 py-2">{r.type}</td>
                      <td className="px-3 py-2">{r.ttl}</td>
                      <td className="break-all px-3 py-2">{r.data}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted">未返回记录，请查看下方原始响应。</p>
          )}
        </Panel>
      )}

      {raw != null && (
        <Panel title="原始响应">
          <OutputBox value={JSON.stringify(raw, null, 2)} />
        </Panel>
      )}
    </div>
  )
}

/* --------------------------------------------------------- user agent */

export function UserAgentTool() {
  const [ua, setUa] = useState('')
  const [current, setCurrent] = useState('')

  useEffect(() => {
    setCurrent(navigator.userAgent)
    setUa(navigator.userAgent)
  }, [])

  const info = useMemo(() => (ua ? parseUserAgent(ua) : null), [ua])

  const rows: [string, string][] = info
    ? [
        ['浏览器', `${info.browser} ${info.browserVersion}`.trim()],
        ['操作系统', `${info.os} ${info.osVersion}`.trim()],
        ['设备类型', info.device],
        ['渲染引擎', info.engine],
      ]
    : []

  return (
    <div className="space-y-4">
      <Panel
        title="User-Agent"
        action={
          <Button size="sm" variant="ghost" onClick={() => setUa(current)}>
            使用当前浏览器
          </Button>
        }
      >
        <textarea
          value={ua}
          onChange={(e) => setUa(e.target.value)}
          className="field min-h-[100px] resize-y font-mono text-[12.5px]"
          aria-label="User-Agent"
        />
      </Panel>

      {info && (
        <Panel title="解析结果" action={<CopyButton value={rows.map(([, v]) => v).join('\n')} />}>
          <div className="grid gap-2 sm:grid-cols-2">
            {rows.map(([k, v]) => (
              <div key={k} className="rounded-xl border border-line bg-surface-2 p-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-muted">{k}</p>
                <p className="mt-0.5 text-sm font-bold">{v}</p>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  )
}

/* ---------------------------------------------------------- HTTP status */

export function HttpStatusTool() {
  const [q, setQ] = useState('')

  const list = useMemo(() => {
    const s = q.trim()
    if (!s) return HTTP_STATUS
    return HTTP_STATUS.filter(
      (e) => e.code.toString().includes(s) || e.text.toLowerCase().includes(s.toLowerCase()),
    )
  }, [q])

  return (
    <div className="space-y-4">
      <Panel title="搜索">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="输入状态码或关键字，如 404 或 timeout"
            className="field pl-10"
            aria-label="搜索状态码"
          />
        </div>
      </Panel>

      <Panel title="状态码" hint={`${list.length} 条`}>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((e, i) => {
            const tone = statusTone(e.code)
            return (
              <div
                key={e.code}
                className={cn(
                  'rounded-xl border bg-surface-2 p-3 transition duration-200 hover:-translate-y-0.5 animate-pop-in',
                  tone === 'pop' && 'border-pop/25',
                  tone === 'flash' && 'border-flash/25',
                  tone === 'solar' && 'border-solar/30',
                  tone === 'coral' && 'border-coral/25',
                )}
                style={{ animationDelay: `${Math.min(i, 20) * 20}ms` }}
              >
                <div className="flex items-baseline gap-2">
                  <span
                    className={cn(
                      'font-black tabular-nums tracking-tight',
                      tone === 'pop' && 'text-pop',
                      tone === 'flash' && 'text-flash',
                      tone === 'solar' && 'text-solar',
                      tone === 'coral' && 'text-coral',
                    )}
                  >
                    {e.code}
                  </span>
                  <span className="text-xs font-bold text-muted">{e.text}</span>
                </div>
                <p className="mt-1 text-xs text-muted">{e.meaning}</p>
              </div>
            )
          })}
        </div>
      </Panel>
    </div>
  )
}

/* Kept for tree-shaking safety of icon imports used in the registry. */
export const NETWORK_ICONS = { Globe, Server }
