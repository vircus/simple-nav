'use client'

import { useMemo, useState, type ReactNode } from 'react'
import { Eraser } from 'lucide-react'
import { Panel, Segmented, CopyButton, OutputBox } from './shared'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  countWords,
  convertCase,
  type CaseMode,
  testRegex,
  type RegexMatch,
  diffLines,
  markdownToHtml,
} from '@/lib/tools/text'

/* -------------------------------------------------------------- word count */

export function WordCountTool() {
  const [text, setText] = useState('')

  const stat = useMemo(() => countWords(text), [text])

  const cards: [string, number, string][] = [
    ['字符数', stat.chars, 'brand'],
    ['不含空格', stat.charsNoSpace, 'accent'],
    ['词数', stat.words, 'pop'],
    ['中文字符', stat.cjk, 'flash'],
    ['行数', stat.lines, 'solar'],
    ['段落数', stat.paragraphs, 'flash'],
    ['字节数 (UTF-8)', stat.bytes, 'brand'],
  ]

  return (
    <div className="space-y-4">
      <Panel title="输入文本">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="粘贴或输入需要统计的文本…"
          className="field min-h-[180px] resize-y"
          aria-label="待统计文本"
        />
      </Panel>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map(([label, value, tone]) => (
          <div
            key={label}
            className={cn(
              'card p-3.5 transition duration-200 hover:-translate-y-0.5',
              tone === 'brand' && 'border-brand/25',
              tone === 'accent' && 'border-accent/25',
              tone === 'pop' && 'border-pop/25',
              tone === 'flash' && 'border-flash/25',
              tone === 'solar' && 'border-solar/30',
              tone === 'coral' && 'border-coral/25',
            )}
          >
            <p
              className={cn(
                'text-2xl font-black tabular-nums tracking-tight',
                tone === 'brand' && 'text-brand',
                tone === 'accent' && 'text-accent',
                tone === 'pop' && 'text-pop',
                tone === 'flash' && 'text-flash',
                tone === 'solar' && 'text-solar',
                tone === 'coral' && 'text-coral',
              )}
            >
              {value}
            </p>
            <p className="mt-0.5 text-xs font-semibold text-muted">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------ case convert */

const CASE_OPTIONS: { value: CaseMode; label: string }[] = [
  { value: 'upper', label: '全大写' },
  { value: 'lower', label: '全小写' },
  { value: 'title', label: '首字母大写' },
  { value: 'camel', label: 'camelCase' },
  { value: 'pascal', label: 'PascalCase' },
  { value: 'snake', label: 'snake_case' },
  { value: 'kebab', label: 'kebab-case' },
  { value: 'constant', label: 'CONSTANT' },
]

export function CaseConvertTool() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<CaseMode>('camel')

  const output = useMemo(() => (input ? convertCase(input, mode) : ''), [input, mode])

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="输入">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="hello world / hello_world / HelloWorld"
          className="field min-h-[160px] resize-y font-mono text-[13px]"
          aria-label="待转换文本"
        />
        <div className="mt-3 flex flex-wrap gap-1.5">
          {CASE_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => setMode(o.value)}
              className={cn(
                'rounded-pill border px-3 py-1.5 text-xs font-bold transition duration-200',
                mode === o.value
                  ? 'border-brand bg-brand text-white shadow-glow'
                  : 'border-line bg-surface text-muted hover:-translate-y-0.5 hover:text-fg',
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      </Panel>
      <Panel title="输出" action={<CopyButton value={output} disabled={!output} />}>
        <OutputBox value={output} placeholder="等待输入…" />
      </Panel>
    </div>
  )
}

/* --------------------------------------------------------------- regex */

export function RegexTool() {
  const [pattern, setPattern] = useState('\\d{4}-\\d{2}-\\d{2}')
  const [flags, setFlags] = useState('g')
  const [input, setInput] = useState('今天是 2026-10-15，明天是 2026-10-16。')

  const { matches, error } = useMemo(
    () => testRegex(pattern, flags, input),
    [pattern, flags, input],
  )

  const highlighted = useMemo(() => {
    if (error || !matches.length) return input
    const out: ReactNode[] = []
    let last = 0
    matches.forEach((m, i) => {
      if (m.index > last) out.push(input.slice(last, m.index))
      out.push(
        <mark key={i} className="rounded bg-solar/45 px-0.5 font-semibold text-fg">
          {m.text}
        </mark>,
      )
      last = m.index + m.text.length
    })
    if (last < input.length) out.push(input.slice(last))
    return out
  }, [matches, input, error])

  const flagToggle = (f: string) =>
    setFlags((prev) => (prev.includes(f) ? prev.replace(f, '') : prev + f))

  return (
    <div className="space-y-4">
      <Panel title="正则表达式" hint="使用 JS RegExp 语法">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span className="font-mono text-lg font-bold text-brand">/</span>
          <input
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            className="field flex-1 font-mono"
            aria-label="正则表达式"
          />
          <span className="font-mono text-lg font-bold text-brand">/</span>
          <input
            value={flags}
            onChange={(e) => setFlags(e.target.value.replace(/[^gimsuy]/g, ''))}
            className="field w-20 font-mono"
            aria-label="匹配标志"
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {['g', 'i', 'm', 's'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => flagToggle(f)}
              className={cn(
                'rounded-pill border px-2.5 py-1 text-xs font-bold transition',
                flags.includes(f)
                  ? 'border-brand bg-brand/10 text-brand'
                  : 'border-line text-muted hover:text-fg',
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </Panel>

      <Panel title="测试文本">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="field min-h-[120px] resize-y font-mono text-[13px]"
          aria-label="测试文本"
        />
      </Panel>

      <Panel
        title="匹配结果"
        hint={error ? undefined : `共 ${matches.length} 处匹配`}
        action={
          <CopyButton
            value={matches.map((m: RegexMatch) => m.text).join('\n')}
            label="复制匹配"
            disabled={!matches.length}
          />
        }
      >
        {error ? (
          <p className="rounded-xl border border-coral/40 bg-coral/10 p-3.5 text-sm text-coral">
            {error}
          </p>
        ) : (
          <div className="rounded-xl border border-line bg-surface-2 p-3.5 text-sm leading-relaxed">
            <p className="whitespace-pre-wrap break-words font-mono text-[13px]">{highlighted}</p>
          </div>
        )}
      </Panel>
    </div>
  )
}

/* -------------------------------------------------------------- text diff */

export function TextDiffTool() {
  const [left, setLeft] = useState('')
  const [right, setRight] = useState('')

  const rows = useMemo(() => diffLines(left, right), [left, right])

  const tone = {
    same: '',
    added: 'bg-pop/12 border-l-2 border-pop',
    removed: 'bg-coral/12 border-l-2 border-coral',
    changed: 'bg-solar/12',
  } as const

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="原始文本">
          <textarea
            value={left}
            onChange={(e) => setLeft(e.target.value)}
            className="field min-h-[160px] resize-y font-mono text-[13px]"
            aria-label="原始文本"
          />
        </Panel>
        <Panel title="对比文本">
          <textarea
            value={right}
            onChange={(e) => setRight(e.target.value)}
            className="field min-h-[160px] resize-y font-mono text-[13px]"
            aria-label="对比文本"
          />
        </Panel>
      </div>

      <Panel title="差异" hint={`${rows.filter((r) => r.type !== 'same').length} 处不同`}>
        <div className="max-h-96 overflow-auto rounded-xl border border-line">
          {rows.length === 0 ? (
            <p className="p-4 text-sm text-muted">输入两段文本以查看差异。</p>
          ) : (
            rows.map((r, i) => (
              <div
                key={i}
                className={cn(
                  'grid grid-cols-2 gap-px border-b border-line/60 font-mono text-[12.5px] last:border-0',
                  r.type === 'same' && 'bg-surface-2/40',
                )}
              >
                <div className={cn('px-3 py-1.5', r.type === 'removed' || r.type === 'same' ? tone[r.type] : 'bg-coral/8')}>
                  {r.left ?? ''}
                </div>
                <div className={cn('px-3 py-1.5', r.type === 'added' || r.type === 'same' ? tone[r.type] : 'bg-pop/8')}>
                  {r.right ?? ''}
                </div>
              </div>
            ))
          )}
        </div>
      </Panel>
    </div>
  )
}

/* --------------------------------------------------------------- markdown */

export function MarkdownTool() {
  const [md, setMd] = useState(
    '# 标题\n\n这是一段 **加粗** 与 *斜体* 文本，以及 `行内代码`。\n\n- 列表项一\n- 列表项二\n\n> 引用一句话\n\n[访问示例](https://example.com)',
  )

  const html = useMemo(() => markdownToHtml(md), [md])

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel
        title="Markdown"
        action={
          <Button size="sm" variant="ghost" onClick={() => setMd('')}>
            <Eraser className="h-3.5 w-3.5" />
            清空
          </Button>
        }
      >
        <textarea
          value={md}
          onChange={(e) => setMd(e.target.value)}
          className="field min-h-[320px] resize-y font-mono text-[13px]"
          aria-label="Markdown 输入"
        />
      </Panel>
      <Panel title="预览" hint="支持标题、列表、引用、代码块与链接">
        <div
          className="min-h-[320px] rounded-xl border border-line bg-surface-2 p-4 text-sm"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </Panel>
    </div>
  )
}
