'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowDownUp, Eraser } from 'lucide-react'
import { Panel, Segmented, CopyButton, OutputBox } from './shared'
import { Button } from '@/components/ui/button'
import {
  b64decode,
  b64encode,
  urlDecode,
  urlEncode,
  formatJson,
  minifyJson,
  timestampToDate,
  dateToTimestamp,
  toInputDateTime,
  convertBase,
  md5,
  shaDigest,
} from '@/lib/tools/codec'

const SAMPLE = {
  base64: 'Hello，导航站 🚀',
  url: 'https://example.com/search?q=导航站&page=1',
  json: '{"name":"导航站","tools":["base64","qrcode"],"ok":true}',
}

/* ------------------------------------------------------------------ base64 */

export function Base64Tool() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  const output = useMemo(() => {
    setError('')
    if (!input) return ''
    try {
      return mode === 'encode' ? b64encode(input) : b64decode(input)
    } catch {
      setError('解码失败：不是合法的 Base64 字符串')
      return ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, mode])

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel
        title="输入"
        action={
          <Segmented
            value={mode}
            onChange={setMode}
            options={[
              { value: 'encode', label: '编码' },
              { value: 'decode', label: '解码' },
            ]}
          />
        }
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={SAMPLE.base64}
          className="field min-h-[180px] resize-y font-mono text-[13px]"
          aria-label="Base64 输入"
        />
        <div className="mt-2 flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => setInput(SAMPLE.base64)}>
            填入示例
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setInput('')}>
            <Eraser className="h-3.5 w-3.5" />
            清空
          </Button>
        </div>
      </Panel>

      <Panel
        title="输出"
        action={<CopyButton value={output} disabled={!output || !!error} />}
      >
        <OutputBox value={output} error={error} placeholder="等待输入…" />
      </Panel>
    </div>
  )
}

/* --------------------------------------------------------------- URL codec */

export function UrlEncodeTool() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  const output = useMemo(() => {
    setError('')
    if (!input) return ''
    try {
      return mode === 'encode' ? urlEncode(input) : urlDecode(input)
    } catch {
      setError('解码失败：不是合法的 URL 编码字符串')
      return ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, mode])

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel
        title="输入"
        action={
          <Segmented
            value={mode}
            onChange={setMode}
            options={[
              { value: 'encode', label: '编码' },
              { value: 'decode', label: '解码' },
            ]}
          />
        }
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={SAMPLE.url}
          className="field min-h-[180px] resize-y font-mono text-[13px]"
          aria-label="URL 输入"
        />
        <div className="mt-2 flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => setInput(SAMPLE.url)}>
            填入示例
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setInput('')}>
            <Eraser className="h-3.5 w-3.5" />
            清空
          </Button>
        </div>
      </Panel>
      <Panel title="输出" action={<CopyButton value={output} disabled={!output} />}>
        <OutputBox value={output} error={error} placeholder="等待输入…" />
      </Panel>
    </div>
  )
}

/* ------------------------------------------------------------------- JSON */

export function JsonTool() {
  const [input, setInput] = useState('')
  const [indent, setIndent] = useState<'2' | '4'>('2')
  const [result, setResult] = useState<{ ok: boolean; text: string }>({ ok: true, text: '' })

  const run = (kind: 'format' | 'minify') => {
    const r = kind === 'format' ? formatJson(input, Number(indent)) : minifyJson(input)
    setResult({ ok: r.ok, text: r.ok ? r.text : r.error })
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel
        title="输入"
        action={
          <Segmented
            value={indent}
            onChange={setIndent}
            options={[
              { value: '2', label: '2 空格' },
              { value: '4', label: '4 空格' },
            ]}
          />
        }
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={SAMPLE.json}
          className="field min-h-[200px] resize-y font-mono text-[13px]"
          aria-label="JSON 输入"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => run('format')}>
            格式化
          </Button>
          <Button size="sm" variant="outline" onClick={() => run('minify')}>
            压缩
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setInput(SAMPLE.json)}>
            填入示例
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { setInput(''); setResult({ ok: true, text: '' }) }}>
            <Eraser className="h-3.5 w-3.5" />
            清空
          </Button>
        </div>
      </Panel>

      <Panel
        title="输出"
        action={<CopyButton value={result.ok ? result.text : ''} disabled={!result.ok || !result.text} />}
      >
        <OutputBox value={result.ok ? result.text : ''} error={result.ok ? '' : result.text} />
      </Panel>
    </div>
  )
}

/* -------------------------------------------------------------- timestamp */

export function TimestampTool() {
  const [ts, setTs] = useState('')
  const [dt, setDt] = useState('')
  const [now, setNow] = useState(0)

  useEffect(() => {
    setNow(Math.floor(Date.now() / 1000))
    const t = window.setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000)
    return () => window.clearInterval(t)
  }, [])

  const dateOut = ts ? timestampToDate(ts) : ''
  const tsOut = dt ? dateToTimestamp(dt) : ''

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="时间戳 → 日期时间" hint="支持秒级与毫秒级时间戳">
        <input
          value={ts}
          onChange={(e) => setTs(e.target.value)}
          placeholder="1700000000"
          inputMode="numeric"
          className="field font-mono"
          aria-label="时间戳"
        />
        <div className="mt-3 flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => setTs(String(now))}>
            使用当前时间
          </Button>
          <span className="text-xs text-muted">当前：{now}</span>
        </div>
        <div className="mt-3">
          <OutputBox value={dateOut} mono={false} placeholder="等待输入…" />
        </div>
      </Panel>

      <Panel title="日期时间 → 时间戳" hint="按浏览器本地时区计算">
        <input
          type="datetime-local"
          value={dt}
          onChange={(e) => setDt(e.target.value)}
          className="field"
          aria-label="日期时间"
        />
        <div className="mt-3">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDt(toInputDateTime(new Date()))}
          >
            使用当前时间
          </Button>
        </div>
        <div className="mt-3">
          <OutputBox value={tsOut} placeholder="等待输入…" />
        </div>
      </Panel>
    </div>
  )
}

/* ---------------------------------------------------------- base convert */

export function BaseConvertTool() {
  const [value, setValue] = useState('255')
  const [from, setFrom] = useState('10')
  const [to, setTo] = useState('16')
  const [error, setError] = useState('')

  const output = useMemo(() => {
    setError('')
    if (!value.trim()) return ''
    try {
      return convertBase(value, Number(from), Number(to))
    } catch (e) {
      setError(e instanceof Error ? e.message : '转换失败')
      return ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, from, to])

  const opts = (n: string) => [
    { value: '2', label: '2' },
    { value: '8', label: '8' },
    { value: '10', label: '10' },
    { value: '16', label: '16' },
  ]

  return (
    <Panel title="进制转换" hint="支持任意长度整数（BigInt 精确计算）">
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="field flex-1 font-mono"
          aria-label="待转换数值"
        />
        <div className="flex items-center gap-2">
          <Segmented value={from} onChange={setFrom} options={opts('from')} />
          <ArrowDownUp className="h-4 w-4 shrink-0 rotate-90 text-muted sm:rotate-0" aria-hidden />
          <Segmented value={to} onChange={setTo} options={opts('to')} />
        </div>
      </div>
      <div className="mt-4">
        <OutputBox value={output} error={error} placeholder="等待输入…" />
      </div>
    </Panel>
  )
}

/* ------------------------------------------------------------------- hash */

export function HashTool() {
  const [input, setInput] = useState('')
  const [hashes, setHashes] = useState({ md5: '', sha1: '', sha256: '' })

  useEffect(() => {
    if (!input) {
      setHashes({ md5: '', sha1: '', sha256: '' })
      return
    }
    let alive = true
    const md5v = md5(input)
    Promise.all([shaDigest('SHA-1', input), shaDigest('SHA-256', input)]).then(([s1, s256]) => {
      if (alive) setHashes({ md5: md5v, sha1: s1, sha256: s256 })
    })
    return () => {
      alive = false
    }
  }, [input])

  const rows: [string, string][] = [
    ['MD5', hashes.md5],
    ['SHA-1', hashes.sha1],
    ['SHA-256', hashes.sha256],
  ]

  return (
    <div className="space-y-4">
      <Panel title="输入">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="在此粘贴需要计算摘要的文本…"
          className="field min-h-[140px] resize-y font-mono text-[13px]"
          aria-label="哈希输入"
        />
      </Panel>
      <Panel title="摘要结果" hint="全部在本地计算，不会上传到任何服务器">
        <div className="space-y-3">
          {rows.map(([label, val]) => (
            <div key={label} className="rounded-xl border border-line bg-surface-2 p-3">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="text-xs font-black tracking-wide text-brand">{label}</span>
                <CopyButton value={val} label="复制" disabled={!val} />
              </div>
              <p className="break-all font-mono text-[12.5px] leading-relaxed">
                {val || <span className="text-muted/70">—</span>}
              </p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}
