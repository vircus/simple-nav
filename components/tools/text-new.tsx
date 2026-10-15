'use client'

import { useMemo, useState } from 'react'
import { Panel, Segmented, CopyButton, OutputBox, Checkbox } from './shared'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'
import { wordFrequency } from '@/lib/tools/edu'
import { encryptText, decryptText } from '@/lib/tools/crypto'

const Grid = ({ children }: { children: React.ReactNode }) => (
  <div className="grid gap-4 lg:grid-cols-2">{children}</div>
)

/* --------------------------------------------------------------- dedupe */

export function TextDedupeTool() {
  const [input, setInput] = useState('')
  const [ignoreCase, setIgnoreCase] = useState(false)
  const [trim, setTrim] = useState(true)

  const output = useMemo(() => {
    const lines = input.split('\n')
    const seen = new Set<string>()
    const out: string[] = []
    for (const line of lines) {
      let key = trim ? line.trim() : line
      if (ignoreCase) key = key.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      out.push(trim ? line.trim() : line)
    }
    return out.join('\n')
  }, [input, ignoreCase, trim])

  const removed = input ? input.split('\n').length - output.split('\n').length : 0

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-6">
        <Checkbox checked={ignoreCase} onChange={setIgnoreCase} label="忽略大小写" />
        <Checkbox checked={trim} onChange={setTrim} label="去除首尾空格" />
      </div>
      <Grid>
        <Panel title="输入">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="field min-h-[220px] resize-y font-mono text-[13px]"
            aria-label="输入文本"
          />
        </Panel>
        <Panel title="输出" hint={removed > 0 ? `已移除 ${removed} 行重复` : undefined} action={<CopyButton value={output} disabled={!output} />}>
          <OutputBox value={output} placeholder="等待输入…" />
        </Panel>
      </Grid>
    </div>
  )
}

/* ------------------------------------------------------------ text sort */

type SortMode = 'alpha' | 'numeric' | 'length' | 'shuffle'

export function TextSortTool() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<SortMode>('alpha')
  const [desc, setDesc] = useState(false)
  const [unique, setUnique] = useState(false)
  const [nonce, setNonce] = useState(0)

  const output = useMemo(() => {
    let lines = input.split('\n')
    if (unique) lines = Array.from(new Set(lines))
    const cmp: Record<SortMode, (a: string, b: string) => number> = {
      alpha: (a, b) => a.localeCompare(b, 'zh-CN'),
      numeric: (a, b) => (parseFloat(a) || 0) - (parseFloat(b) || 0),
      length: (a, b) => [...a].length - [...b].length,
      shuffle: () => Math.random() - 0.5,
    }
    const sorted = lines.slice().sort(cmp[mode])
    if (desc && mode !== 'shuffle') sorted.reverse()
    return sorted.join('\n')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, mode, desc, unique, nonce])

  return (
    <div className="space-y-4">
      <Panel
        title="排序方式"
        action={
          <Button size="sm" variant="ghost" onClick={() => setNonce((n) => n + 1)}>
            重新随机
          </Button>
        }
      >
        <Segmented
          value={mode}
          onChange={setMode}
          options={[
            { value: 'alpha', label: '按拼音' },
            { value: 'numeric', label: '按数字' },
            { value: 'length', label: '按长度' },
            { value: 'shuffle', label: '随机打乱' },
          ]}
        />
        <div className="mt-3 flex flex-wrap gap-6">
          <Checkbox checked={desc} onChange={setDesc} label="倒序" />
          <Checkbox checked={unique} onChange={setUnique} label="去重" />
        </div>
      </Panel>
      <Grid>
        <Panel title="输入">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="field min-h-[220px] resize-y font-mono text-[13px]"
            aria-label="输入文本"
          />
        </Panel>
        <Panel title="输出" action={<CopyButton value={output} disabled={!output} />}>
          <OutputBox value={output} placeholder="等待输入…" />
        </Panel>
      </Grid>
    </div>
  )
}

/* ----------------------------------------------------------- trim space */

type TrimMode = 'all' | 'ends' | 'extra' | 'blank'

export function TrimSpaceTool() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<TrimMode>('ends')

  const output = useMemo(() => {
    switch (mode) {
      case 'all':
        return input.replace(/\s/g, '')
      case 'ends':
        return input
          .split('\n')
          .map((l) => l.trim())
          .join('\n')
      case 'extra':
        return input
          .split('\n')
          .map((l) => l.trim().replace(/\s{2,}/g, ' '))
          .join('\n')
      case 'blank':
        return input
          .split('\n')
          .filter((l) => l.trim().length > 0)
          .join('\n')
    }
  }, [input, mode])

  return (
    <Grid>
      <Panel
        title="输入"
        action={
          <Segmented
            value={mode}
            onChange={setMode}
            options={[
              { value: 'ends', label: '首尾空格' },
              { value: 'all', label: '所有空格' },
              { value: 'extra', label: '多余空格' },
              { value: 'blank', label: '空行' },
            ]}
          />
        }
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="field min-h-[220px] resize-y font-mono text-[13px]"
          aria-label="输入文本"
        />
      </Panel>
      <Panel title="输出" action={<CopyButton value={output} disabled={!output} />}>
        <OutputBox value={output} placeholder="等待输入…" />
      </Panel>
    </Grid>
  )
}

/* ------------------------------------------------------------ word freq */

export function WordFreqTool() {
  const [input, setInput] = useState('')
  const [top, setTop] = useState(20)

  const freq = useMemo(() => wordFrequency(input).slice(0, top), [input, top])
  const max = freq[0]?.count ?? 1

  const csv = freq.map((f) => `${f.word},${f.count}`).join('\n')

  return (
    <div className="space-y-4">
      <Panel title="输入文本">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="粘贴需要统计词频的文本…"
          className="field min-h-[180px] resize-y"
          aria-label="输入文本"
        />
        <div className="mt-3 flex items-center gap-3">
          <span className="text-xs font-bold text-muted">显示前</span>
          <Segmented
            value={String(top)}
            onChange={(v) => setTop(Number(v))}
            options={[
              { value: '10', label: '10' },
              { value: '20', label: '20' },
              { value: '50', label: '50' },
            ]}
          />
        </div>
      </Panel>

      <Panel title="词频结果" hint={`共 ${freq.length} 个词（仅显示出现次数大于 1 的词）`} action={<CopyButton value={csv} label="导出 CSV" disabled={!freq.length} />}>
        {freq.length ? (
          <ul className="space-y-1.5">
            {freq.map((f, i) => (
              <li key={f.word} className="flex items-center gap-3">
                <span className="w-24 shrink-0 truncate text-sm font-bold">{f.word}</span>
                <span className="h-4 flex-1 overflow-hidden rounded-pill bg-surface-2">
                  <span
                    className="block h-full rounded-pill bg-brand/70 transition-[width] duration-500 ease-smooth"
                    style={{ width: `${Math.max(4, (f.count / max) * 100)}%` }}
                  />
                </span>
                <span className="w-10 shrink-0 text-right font-mono text-xs font-bold tabular-nums">{f.count}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">输入文本后自动统计。</p>
        )}
      </Panel>
    </div>
  )
}

/* --------------------------------------------------------- text encrypt */

export function TextEncryptTool() {
  const [mode, setMode] = useState<'enc' | 'dec'>('enc')
  const [password, setPassword] = useState('')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const run = async () => {
    setBusy(true)
    setError('')
    try {
      if (!password) throw new Error('请先填写密码')
      const result =
        mode === 'enc' ? await encryptText(password, input) : await decryptText(password, input)
      setOutput(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : '处理失败')
      setOutput('')
      toast('处理失败', 'err')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <Panel
        title={mode === 'enc' ? 'AES-GCM 加密' : 'AES-GCM 解密'}
        action={
          <Segmented
            value={mode}
            onChange={setMode}
            options={[
              { value: 'enc', label: '加密' },
              { value: 'dec', label: '解密' },
            ]}
          />
        }
      >
        <div className="space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="密码（PBKDF2 派生密钥，请妥善保存）"
            className="field"
            aria-label="密码"
          />
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'enc' ? '待加密的文本…' : '待解密的 Base64 密文…'}
            className="field min-h-[140px] resize-y font-mono text-[13px]"
            aria-label="输入"
          />
          <Button onClick={run} disabled={busy || !input || !password}>
            {busy ? '处理中…' : mode === 'enc' ? '加密' : '解密'}
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted">
          全程在浏览器本地完成，密钥与明文都不会上传。盐值与 IV 随机生成并随密文一起存储。
        </p>
      </Panel>

      <Panel title="结果" action={<CopyButton value={output} disabled={!output} />}>
        <OutputBox value={output} error={error} placeholder="—" />
      </Panel>
    </div>
  )
}

/* ------------------------------------------------------------ rich text */

export function RichTextTool() {
  const [html, setHtml] = useState('<p>在这里<strong>编辑</strong>文本</p>')

  return (
    <Grid>
      <Panel title="富文本编辑" hint="使用浏览器的 contentEditable 编辑">
        <div
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-label="富文本编辑区"
          className="field min-h-[240px] resize-y p-3"
          onInput={(e) => setHtml((e.target as HTMLDivElement).innerHTML)}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </Panel>
      <Panel title="HTML" action={<CopyButton value={html} disabled={!html} />}>
        <OutputBox value={html} />
      </Panel>
    </Grid>
  )
}
