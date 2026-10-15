'use client'

import { useEffect, useState } from 'react'
import { RefreshCw, Download, Shuffle } from 'lucide-react'
import { Panel, Segmented, CopyButton, OutputBox, Checkbox } from './shared'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import {
  generatePassword,
  passwordStrength,
  generateUuids,
  generateRandomNumbers,
  generateLorem,
} from '@/lib/tools/generate'

/* ---------------------------------------------------------------- qrcode */

export function QrCodeTool() {
  const [text, setText] = useState('https://example.com')
  const [size, setSize] = useState('256')
  const [dataUrl, setDataUrl] = useState('')

  useEffect(() => {
    let alive = true
    if (!text) {
      setDataUrl('')
      return
    }
    import('qrcode')
      .then(({ default: QRCode }) =>
        QRCode.toDataURL(text, {
          width: Number(size),
          margin: 2,
          color: { dark: '#0B0A12', light: '#FFFFFF' },
        }),
      )
      .then((url) => {
        if (alive) setDataUrl(url)
      })
      .catch(() => alive && setDataUrl(''))
    return () => {
      alive = false
    }
  }, [text, size])

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="内容">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="输入文本或链接…"
          className="field min-h-[140px] resize-y font-mono text-[13px]"
          aria-label="二维码内容"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-muted">尺寸</span>
          <Segmented
            value={size}
            onChange={setSize}
            options={[
              { value: '256', label: '256' },
              { value: '512', label: '512' },
              { value: '1024', label: '1024' },
            ]}
          />
        </div>
      </Panel>

      <Panel
        title="预览"
        action={
          <Button
            size="sm"
            variant="outline"
            disabled={!dataUrl}
            onClick={() => {
              const a = document.createElement('a')
              a.href = dataUrl
              a.download = 'qrcode.png'
              a.click()
              toast('已导出 PNG', 'ok')
            }}
          >
            <Download className="h-3.5 w-3.5" />
            导出 PNG
          </Button>
        }
      >
        <div className="grid place-items-center rounded-xl border border-dashed border-line bg-surface-2 p-6">
          {dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={dataUrl}
              alt="生成的二维码"
              className="h-auto w-full max-w-[280px] rounded-xl bg-white p-2 shadow-card animate-pop-in"
            />
          ) : (
            <p className="text-sm text-muted">输入内容后自动生成</p>
          )}
        </div>
      </Panel>
    </div>
  )
}

/* --------------------------------------------------------------- password */

export function PasswordTool() {
  const [length, setLength] = useState(16)
  const [opts, setOpts] = useState({ lower: true, upper: true, digits: true, symbols: true, excludeAmbiguous: false })
  const [pw, setPw] = useState('')

  const regen = () => {
    const next = generatePassword({ length, ...opts })
    setPw(next)
  }

  useEffect(() => {
    if (!pw) regen()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const strength = pw ? passwordStrength(pw) : null
  const barTone = ['bg-coral', 'bg-coral', 'bg-solar', 'bg-solar', 'bg-pop', 'bg-pop']

  const toggle = (k: keyof typeof opts) => (v: boolean) => setOpts((p) => ({ ...p, [k]: v }))

  return (
    <Panel
      title="随机密码"
      hint="使用 crypto.getRandomValues，无取模偏差"
      action={
        <Button size="sm" onClick={regen}>
          <RefreshCw className="h-3.5 w-3.5" />
          重新生成
        </Button>
      }
    >
      <OutputBox value={pw} placeholder="点击「重新生成」" />

      {strength && (
        <div className="mt-3 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-pill bg-surface-2">
            <div
              className={cn(
                'h-full rounded-pill transition-all duration-300 ease-smooth',
                barTone[Math.min(strength.score, 5)],
              )}
              style={{ width: `${Math.max(8, (strength.score / 5) * 100)}%` }}
            />
          </div>
          <span className="text-xs font-bold text-muted">强度：{strength.label}</span>
        </div>
      )}

      <div className="mt-4 space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="pwlen" className="text-xs font-bold text-muted">
              长度
            </label>
            <span className="text-sm font-black tabular-nums text-brand">{length}</span>
          </div>
          <input
            id="pwlen"
            type="range"
            min={6}
            max={64}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full accent-[rgb(var(--c-brand))]"
          />
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2.5">
          <Checkbox checked={opts.lower} onChange={toggle('lower')} label="小写字母" />
          <Checkbox checked={opts.upper} onChange={toggle('upper')} label="大写字母" />
          <Checkbox checked={opts.digits} onChange={toggle('digits')} label="数字" />
          <Checkbox checked={opts.symbols} onChange={toggle('symbols')} label="符号" />
          <Checkbox
            checked={opts.excludeAmbiguous}
            onChange={toggle('excludeAmbiguous')}
            label="排除易混淆字符"
          />
        </div>
      </div>
    </Panel>
  )
}

/* ------------------------------------------------------------------- uuid */

export function UuidTool() {
  const [count, setCount] = useState(5)
  const [list, setList] = useState<string[]>([])

  useEffect(() => {
    setList(generateUuids(count))
  }, [count])

  return (
    <Panel
      title="UUID v4"
      action={
        <Button size="sm" onClick={() => setList(generateUuids(count))}>
          <Shuffle className="h-3.5 w-3.5" />
          重新生成
        </Button>
      }
    >
      <div className="mb-3 flex items-center gap-3">
        <span className="text-xs font-bold text-muted">数量</span>
        <Segmented
          value={String(count)}
          onChange={(v) => setCount(Number(v))}
          options={[
            { value: '1', label: '1' },
            { value: '5', label: '5' },
            { value: '10', label: '10' },
            { value: '50', label: '50' },
          ]}
        />
        <CopyButton value={list.join('\n')} disabled={!list.length} />
      </div>
      <div className="max-h-72 overflow-auto rounded-xl border border-line bg-surface-2 p-3 font-mono text-[13px]">
        {list.map((u) => (
          <p key={u} className="py-0.5">
            {u}
          </p>
        ))}
      </div>
    </Panel>
  )
}

/* --------------------------------------------------------- random numbers */

export function RandomNumberTool() {
  const [min, setMin] = useState(1)
  const [max, setMax] = useState(100)
  const [count, setCount] = useState(5)
  const [unique, setUnique] = useState(true)
  const [result, setResult] = useState<number[]>([])
  const [error, setError] = useState('')

  const run = () => {
    setError('')
    const out = generateRandomNumbers({ min, max, count, unique })
    if (!out.length) {
      setError(unique && count > max - min + 1 ? '去重模式下数量不能大于可选范围' : '生成失败，请检查参数')
    }
    setResult(out)
  }

  return (
    <Panel
      title="随机数"
      action={
        <Button size="sm" onClick={run}>
          生成
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-xs font-bold text-muted">
          最小值
          <input
            type="number"
            value={min}
            onChange={(e) => setMin(Number(e.target.value))}
            className="field mt-1 font-mono"
          />
        </label>
        <label className="text-xs font-bold text-muted">
          最大值
          <input
            type="number"
            value={max}
            onChange={(e) => setMax(Number(e.target.value))}
            className="field mt-1 font-mono"
          />
        </label>
        <label className="text-xs font-bold text-muted">
          数量
          <input
            type="number"
            value={count}
            min={1}
            max={1000}
            onChange={(e) => setCount(Number(e.target.value))}
            className="field mt-1 font-mono"
          />
        </label>
      </div>

      <div className="mt-3">
        <Checkbox checked={unique} onChange={setUnique} label="结果去重（不重复）" />
      </div>

      <div className="mt-4">
        {error ? (
          <p className="rounded-xl border border-coral/40 bg-coral/10 p-3 text-sm text-coral">{error}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {result.map((n, i) => (
              <span
                key={i}
                className="rounded-lg border border-brand/25 bg-brand/10 px-3 py-1.5 font-mono text-sm font-bold text-brand animate-pop-in"
                style={{ animationDelay: `${Math.min(i, 20) * 25}ms` }}
              >
                {n}
              </span>
            ))}
            {!result.length && <p className="text-sm text-muted">点击「生成」获取随机数</p>}
          </div>
        )}
      </div>
    </Panel>
  )
}

/* ------------------------------------------------------------------ lorem */

export function LoremTool() {
  const [paragraphs, setParagraphs] = useState(3)
  const [lang, setLang] = useState<'latin' | 'cjk'>('cjk')
  const [text, setText] = useState('')

  useEffect(() => {
    setText(generateLorem(paragraphs, lang))
  }, [paragraphs, lang])

  return (
    <Panel
      title="占位文本"
      action={
        <div className="flex items-center gap-2">
          <Segmented
            value={lang}
            onChange={setLang}
            options={[
              { value: 'cjk', label: '中文' },
              { value: 'latin', label: 'Lorem' },
            ]}
          />
          <CopyButton value={text} disabled={!text} />
        </div>
      }
    >
      <div className="mb-3 flex items-center gap-3">
        <span className="text-xs font-bold text-muted">段落数</span>
        <Segmented
          value={String(paragraphs)}
          onChange={(v) => setParagraphs(Number(v))}
          options={[
            { value: '1', label: '1' },
            { value: '3', label: '3' },
            { value: '5', label: '5' },
            { value: '10', label: '10' },
          ]}
        />
      </div>
      <OutputBox value={text} mono={false} />
    </Panel>
  )
}
