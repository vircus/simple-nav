'use client'

import { useState } from 'react'
import { Send, Link2 } from 'lucide-react'
import { Panel, Segmented, CopyButton, OutputBox } from './shared'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const

/* ------------------------------------------------------- http debugging */

export function HttpRequestTool() {
  const [method, setMethod] = useState<(typeof METHODS)[number]>('GET')
  const [url, setUrl] = useState('https://httpbin.org/get')
  const [headers, setHeaders] = useState('')
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{
    status: number
    statusText: string
    headers: Record<string, string>
    body: string
    timeMs: number
  } | null>(null)
  const [error, setError] = useState('')

  const send = async () => {
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/tools/http', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method, url, headers, body }),
      })
      const json = (await res.json()) as typeof result & { error?: string; detail?: string }
      if (!res.ok) throw new Error(json.error || '请求失败')
      setResult(json)
      toast(`完成 · ${json.status} · ${json.timeMs}ms`, 'ok')
    } catch (e) {
      setError(e instanceof Error ? e.message : '请求失败')
      setResult(null)
    } finally {
      setBusy(false)
    }
  }

  const prettyBody = (() => {
    if (!result) return ''
    try {
      return JSON.stringify(JSON.parse(result.body), null, 2)
    } catch {
      return result.body
    }
  })()

  return (
    <div className="space-y-4">
      <Panel
        title="请求"
        action={
          <Segmented
            value={method}
            onChange={setMethod}
            options={METHODS.map((m) => ({ value: m, label: m }))}
          />
        }
      >
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://api.example.com/path"
            className="field flex-1 font-mono text-[13px]"
            aria-label="请求地址"
          />
          <Button onClick={send} disabled={busy || !url.trim()}>
            <Send className="h-4 w-4" />
            {busy ? '发送中…' : '发送'}
          </Button>
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <label className="text-xs font-bold text-muted">
            请求头（JSON）
            <textarea
              value={headers}
              onChange={(e) => setHeaders(e.target.value)}
              placeholder='{"Accept":"application/json"}'
              className="field mt-1 min-h-[90px] resize-y font-mono text-[12.5px]"
            />
          </label>
          <label className="text-xs font-bold text-muted">
            请求体（GET / HEAD 时忽略）
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="field mt-1 min-h-[90px] resize-y font-mono text-[12.5px]"
            />
          </label>
        </div>

        <p className="mt-2 text-xs text-muted">
          请求经服务端转发以绕过浏览器跨域限制；出于安全考虑禁止访问内网与本机地址。
        </p>
      </Panel>

      {error && (
        <p className="rounded-xl border border-coral/40 bg-coral/10 p-3 text-sm text-coral">{error}</p>
      )}

      {result && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'rounded-pill border px-3 py-1.5 text-sm font-black',
                result.status < 300
                  ? 'border-pop/40 bg-pop/12 text-brand'
                  : result.status < 400
                    ? 'border-flash/40 bg-flash/12'
                    : 'border-coral/40 bg-coral/12 text-coral',
              )}
            >
              {result.status} {result.statusText}
            </span>
            <span className="text-xs font-semibold text-muted">耗时 {result.timeMs} ms</span>
          </div>

          <Panel title="响应体" action={<CopyButton value={prettyBody} disabled={!prettyBody} />}>
            <OutputBox value={prettyBody} />
          </Panel>

          <Panel title="响应头">
            <OutputBox value={JSON.stringify(result.headers, null, 2)} />
          </Panel>
        </>
      )}
    </div>
  )
}

/* ---------------------------------------------------------- short link */

export function ShortLinkTool() {
  const [url, setUrl] = useState('')
  const [custom, setCustom] = useState('')
  const [busy, setBusy] = useState(false)
  const [short, setShort] = useState('')
  const [error, setError] = useState('')

  const create = async () => {
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/tools/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, custom }),
      })
      const json = (await res.json()) as { short?: string; error?: string }
      if (!res.ok) throw new Error(json.error || '生成失败')
      setShort(json.short ?? '')
      toast('短链接已生成', 'ok')
    } catch (e) {
      setError(e instanceof Error ? e.message : '生成失败')
      setShort('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Panel title="短链接生成器" hint="生成的短链保存在站点 KV 中，访问 /s/<code> 即跳转">
      <div className="space-y-3">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/very/long/path?a=1"
          className="field font-mono text-[13px]"
          aria-label="长链接"
        />
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="自定义后缀（可留空）"
            className="field flex-1 font-mono text-[13px]"
            aria-label="自定义后缀"
          />
          <Button onClick={create} disabled={busy || !url.trim()}>
            <Link2 className="h-4 w-4" />
            {busy ? '生成中…' : '生成短链'}
          </Button>
        </div>

        {error && (
          <p className="rounded-xl border border-coral/40 bg-coral/10 p-3 text-sm text-coral">{error}</p>
        )}

        {short && (
          <div className="rounded-xl border border-pop/40 bg-pop/10 p-3.5">
            <div className="flex items-center justify-between gap-2">
              <a
                href={short}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all font-mono text-[13px] font-bold text-brand underline"
              >
                {short}
              </a>
              <CopyButton value={short} label="复制" />
            </div>
          </div>
        )}
      </div>
    </Panel>
  )
}
