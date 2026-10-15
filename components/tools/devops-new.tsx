'use client'

import { useEffect, useMemo, useState } from 'react'
import { Panel, Segmented, CopyButton, OutputBox, Checkbox } from './shared'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  parseJwt,
  csvToJson,
  jsonToCsv,
  toUnicodeEscape,
  fromUnicodeEscape,
  formatBytes,
  convertFileSize,
  FILE_SIZE_UNITS,
  describeCron,
  nextCronRuns,
  escapeHtml,
  unescapeHtml,
  parseUrlParams,
  buildUrlParams,
  type UrlParam,
  parseCookieString,
  buildCookieString,
  type CookieAttr,
  formatXml,
  formatSql,
  mysqlToGoStruct,
  generateMock,
  MOCK_FIELD_TYPES,
  type MockFieldType,
} from '@/lib/tools/devops'
import { shaDigest } from '@/lib/tools/codec'

const Grid = ({ children }: { children: React.ReactNode }) => (
  <div className="grid gap-4 lg:grid-cols-2">{children}</div>
)

/* ---------------------------------------------------------------- JWT */

export function JwtTool() {
  const [token, setToken] = useState('')
  const parsed = useMemo(() => (token.trim() ? parseJwt(token) : null), [token])

  return (
    <div className="space-y-4">
      <Panel title="Token">
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="eyJhbGciOi..."
          className="field min-h-[120px] resize-y font-mono text-[12.5px]"
          aria-label="JWT Token"
        />
      </Panel>

      {parsed?.error && (
        <p className="rounded-xl border border-coral/40 bg-coral/10 p-3 text-sm text-coral">
          {parsed.error}
        </p>
      )}

      {parsed && !parsed.error && (
        <>
          {parsed.expired !== undefined && (
            <p
              className={cn(
                'rounded-xl border p-3 text-sm font-semibold',
                parsed.expired ? 'border-coral/40 bg-coral/10 text-coral' : 'border-pop/30 bg-pop/10',
              )}
            >
              {parsed.expired ? '该 Token 已过期' : '该 Token 未过期'}
            </p>
          )}
          <Grid>
            <Panel title="Header" action={<CopyButton value={JSON.stringify(parsed.header, null, 2)} label="复制" />}>
              <OutputBox value={JSON.stringify(parsed.header, null, 2)} />
            </Panel>
            <Panel title="Payload" action={<CopyButton value={JSON.stringify(parsed.payload, null, 2)} label="复制" />}>
              <OutputBox value={JSON.stringify(parsed.payload, null, 2)} />
            </Panel>
          </Grid>
          <Panel title="Signature">
            <OutputBox value={parsed.signature} />
          </Panel>
        </>
      )}
    </div>
  )
}

/* ------------------------------------------------------------ CSV / JSON */

export function CsvJsonTool() {
  const [mode, setMode] = useState<'csv2json' | 'json2csv'>('csv2json')
  const [delimiter, setDelimiter] = useState(',')
  const [header, setHeader] = useState(true)
  const [input, setInput] = useState('name,age\n张三,28\n李四,32')
  const [error, setError] = useState('')

  const output = useMemo(() => {
    setError('')
    if (!input.trim()) return ''
    try {
      return mode === 'csv2json' ? csvToJson(input, delimiter, header) : jsonToCsv(input, delimiter)
    } catch (e) {
      setError(e instanceof Error ? e.message : '转换失败')
      return ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, mode, delimiter, header])

  return (
    <div className="space-y-4">
      <Panel
        title="选项"
        action={
          <Segmented
            value={mode}
            onChange={setMode}
            options={[
              { value: 'csv2json', label: 'CSV → JSON' },
              { value: 'json2csv', label: 'JSON → CSV' },
            ]}
          />
        }
      >
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted">分隔符</span>
            <Segmented
              value={delimiter}
              onChange={setDelimiter}
              options={[
                { value: ',', label: '逗号' },
                { value: '\t', label: 'Tab' },
                { value: ';', label: '分号' },
              ]}
            />
          </div>
          <Checkbox checked={header} onChange={setHeader} label="首行为表头" />
        </div>
      </Panel>

      <Grid>
        <Panel title="输入">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="field min-h-[220px] resize-y font-mono text-[12.5px]"
            aria-label="输入"
          />
        </Panel>
        <Panel title="输出" action={<CopyButton value={output} disabled={!output} />}>
          <OutputBox value={output} error={error} />
        </Panel>
      </Grid>
    </div>
  )
}

/* ----------------------------------------------------------- JSON / YAML */

export function JsonYamlTool() {
  const [mode, setMode] = useState<'json2yaml' | 'yaml2json'>('json2yaml')
  const [input, setInput] = useState('{\n  "name": "导航站",\n  "tools": ["base64", "qrcode"]\n}')
  const [error, setError] = useState('')
  const [output, setOutput] = useState('')

  useEffect(() => {
    let alive = true
    if (!input.trim()) {
      setOutput('')
      setError('')
      return
    }
    import('yaml')
      .then((YAML) => {
        const text =
          mode === 'json2yaml'
            ? YAML.stringify(JSON.parse(input))
            : JSON.stringify(YAML.parse(input), null, 2)
        if (alive) {
          setOutput(text)
          setError('')
        }
      })
      .catch((e: unknown) => {
        if (alive) {
          setError(e instanceof Error ? e.message : '解析失败')
          setOutput('')
        }
      })
    return () => {
      alive = false
    }
  }, [input, mode])

  return (
    <div className="space-y-4">
      <Panel
        title="选项"
        action={
          <Segmented
            value={mode}
            onChange={setMode}
            options={[
              { value: 'json2yaml', label: 'JSON → YAML' },
              { value: 'yaml2json', label: 'YAML → JSON' },
            ]}
          />
        }
      >
        <p className="text-xs text-muted">支持嵌套结构与数组，YAML 侧使用标准缩进。</p>
      </Panel>
      <Grid>
        <Panel title="输入">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="field min-h-[240px] resize-y font-mono text-[12.5px]"
            aria-label="输入"
          />
        </Panel>
        <Panel title="输出" action={<CopyButton value={output} disabled={!output} />}>
          <OutputBox value={output} error={error} />
        </Panel>
      </Grid>
    </div>
  )
}

/* -------------------------------------------------------------- Unicode */

export function UnicodeTool() {
  const [mode, setMode] = useState<'to' | 'from'>('to')
  const [input, setInput] = useState('')

  const output = useMemo(
    () => (input ? (mode === 'to' ? toUnicodeEscape(input) : fromUnicodeEscape(input)) : ''),
    [input, mode],
  )

  return (
    <Grid>
      <Panel
        title="输入"
        action={
          <Segmented
            value={mode}
            onChange={setMode}
            options={[
              { value: 'to', label: '转 Unicode' },
              { value: 'from', label: '转中文' },
            ]}
          />
        }
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="中文文本 或 \\u4e2d\\u6587"
          className="field min-h-[180px] resize-y font-mono text-[13px]"
          aria-label="输入"
        />
      </Panel>
      <Panel title="输出" action={<CopyButton value={output} disabled={!output} />}>
        <OutputBox value={output} placeholder="等待输入…" />
      </Panel>
    </Grid>
  )
}

/* ------------------------------------------------------------ file size */

export function FileSizeTool() {
  const [value, setValue] = useState('1')
  const [from, setFrom] = useState(3)
  const [to, setTo] = useState(2)

  const numeric = Number(value)
  const converted = Number.isFinite(numeric) ? convertFileSize(numeric, from, to) : NaN
  const human = Number.isFinite(numeric) ? formatBytes(numeric * 1024 ** from) : ''

  return (
    <Panel title="文件大小转换" hint="1 KB = 1024 B（二进制进制）">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex-1">
          <span className="mb-1 block text-xs font-bold text-muted">数值</span>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            inputMode="decimal"
            className="field font-mono"
          />
        </label>
        <label>
          <span className="mb-1 block text-xs font-bold text-muted">从</span>
          <select
            value={from}
            onChange={(e) => setFrom(Number(e.target.value))}
            className="field w-28"
            aria-label="源单位"
          >
            {FILE_SIZE_UNITS.map((u, i) => (
              <option key={u} value={i}>
                {u}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-1 block text-xs font-bold text-muted">到</span>
          <select
            value={to}
            onChange={(e) => setTo(Number(e.target.value))}
            className="field w-28"
            aria-label="目标单位"
          >
            {FILE_SIZE_UNITS.map((u, i) => (
              <option key={u} value={i}>
                {u}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 rounded-xl border border-line bg-surface-2 p-4">
        <p className="text-2xl font-black tabular-nums tracking-tight text-brand">
          {Number.isFinite(converted) ? converted.toFixed(6).replace(/\.?0+$/, '') : '-'}
          <span className="ml-1 text-base font-bold">{FILE_SIZE_UNITS[to]}</span>
        </p>
        {human && <p className="mt-1 text-xs text-muted">易读格式：{human}</p>}
      </div>
    </Panel>
  )
}

/* ----------------------------------------------------------------- cron */

export function CronTool() {
  const [expr, setExpr] = useState('0 */2 * * *')

  const desc = useMemo(() => describeCron(expr), [expr])
  const runs = useMemo(() => nextCronRuns(expr, 5), [expr])

  return (
    <div className="space-y-4">
      <Panel title="Cron 表达式" hint="分 时 日 月 周（5 段）">
        <input
          value={expr}
          onChange={(e) => setExpr(e.target.value)}
          className="field font-mono"
          aria-label="Cron 表达式"
        />
        <div className="mt-3 flex flex-wrap gap-1.5">
          {['*/5 * * * *', '0 * * * *', '0 9 * * 1-5', '0 0 1 * *', '30 3 * * 0'].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setExpr(p)}
              className="rounded-pill border border-line bg-surface px-3 py-1.5 font-mono text-xs font-bold text-muted transition hover:-translate-y-0.5 hover:text-brand"
            >
              {p}
            </button>
          ))}
        </div>
      </Panel>

      <Panel title="含义">
        <OutputBox value={desc} mono={false} />
      </Panel>

      <Panel title="接下来 5 次执行时间">
        {runs.length ? (
          <ul className="space-y-1.5 font-mono text-[13px]">
            {runs.map((d, i) => (
              <li key={i} className="rounded-lg border border-line bg-surface-2 px-3 py-2">
                {d.toLocaleString('zh-CN', { hour12: false })}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">表达式无效或无法计算。</p>
        )}
      </Panel>
    </div>
  )
}

/* ---------------------------------------------------------- html escape */

export function HtmlEscapeTool() {
  const [mode, setMode] = useState<'escape' | 'unescape'>('escape')
  const [input, setInput] = useState('')

  const output = useMemo(
    () => (input ? (mode === 'escape' ? escapeHtml(input) : unescapeHtml(input)) : ''),
    [input, mode],
  )

  return (
    <Grid>
      <Panel
        title="输入"
        action={
          <Segmented
            value={mode}
            onChange={setMode}
            options={[
              { value: 'escape', label: '转义' },
              { value: 'unescape', label: '反转义' },
            ]}
          />
        }
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="<div class='a'>文本 & 符号</div>"
          className="field min-h-[180px] resize-y font-mono text-[13px]"
          aria-label="输入"
        />
      </Panel>
      <Panel title="输出" action={<CopyButton value={output} disabled={!output} />}>
        <OutputBox value={output} placeholder="等待输入…" />
      </Panel>
    </Grid>
  )
}

/* ----------------------------------------------------------- url params */

export function UrlParamsTool() {
  const [input, setInput] = useState('https://example.com/search?q=导航站&page=1&size=20')
  const parsed = useMemo(() => parseUrlParams(input), [input])
  const [params, setParams] = useState<UrlParam[]>([])

  useEffect(() => {
    setParams(parsed.params)
  }, [parsed])

  const built = useMemo(() => buildUrlParams(parsed.base, params), [parsed.base, params])

  const patch = (i: number, key: 'key' | 'value', v: string) =>
    setParams((prev) => prev.map((p, idx) => (idx === i ? { ...p, [key]: v } : p)))

  return (
    <div className="space-y-4">
      <Panel title="URL">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="field font-mono text-[13px]"
          aria-label="URL"
        />
      </Panel>

      <Panel
        title="参数"
        action={
          <Button size="sm" variant="outline" onClick={() => setParams([...params, { key: '', value: '' }])}>
            添加参数
          </Button>
        }
      >
        <div className="space-y-2">
          {params.map((p, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={p.key}
                onChange={(e) => patch(i, 'key', e.target.value)}
                className="field w-1/3 font-mono text-[13px]"
                placeholder="键"
                aria-label={`参数名 ${i + 1}`}
              />
              <input
                value={p.value}
                onChange={(e) => patch(i, 'value', e.target.value)}
                className="field flex-1 font-mono text-[13px]"
                placeholder="值"
                aria-label={`参数值 ${i + 1}`}
              />
              <button
                type="button"
                onClick={() => setParams((prev) => prev.filter((_, idx) => idx !== i))}
                aria-label={`删除参数 ${i + 1}`}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line text-muted transition hover:border-coral/50 hover:text-coral active:scale-90"
              >
                ×
              </button>
            </div>
          ))}
          {!params.length && <p className="text-sm text-muted">未解析到查询参数。</p>}
        </div>
      </Panel>

      <Panel title="拼接结果" action={<CopyButton value={built} disabled={!built} />}>
        <OutputBox value={built} placeholder="—" />
      </Panel>
    </div>
  )
}

/* --------------------------------------------------------------- cookie */

export function CookieTool() {
  const [input, setInput] = useState('session=abc123; Path=/; HttpOnly; SameSite=Lax')
  const cookie = useMemo(() => parseCookieString(input)[0], [input])
  const [draft, setDraft] = useState<CookieAttr | null>(null)

  useEffect(() => {
    setDraft(cookie ?? null)
  }, [cookie])

  const built = draft ? buildCookieString(draft) : ''

  const toggle = (k: 'secure' | 'httpOnly') => (v: boolean) =>
    setDraft((d) => (d ? { ...d, [k]: v } : d))

  const set = (k: keyof CookieAttr, v: string) => setDraft((d) => (d ? { ...d, [k]: v } : d))

  return (
    <div className="space-y-4">
      <Panel title="Cookie 字符串">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="field min-h-[90px] resize-y font-mono text-[12.5px]"
          aria-label="Cookie 字符串"
        />
      </Panel>

      {draft && (
        <Panel title="属性编辑">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-bold text-muted">
              名称
              <input value={draft.name} onChange={(e) => set('name', e.target.value)} className="field mt-1 font-mono" />
            </label>
            <label className="text-xs font-bold text-muted">
              值
              <input value={draft.value} onChange={(e) => set('value', e.target.value)} className="field mt-1 font-mono" />
            </label>
            <label className="text-xs font-bold text-muted">
              Domain
              <input value={draft.domain ?? ''} onChange={(e) => set('domain', e.target.value)} className="field mt-1 font-mono" />
            </label>
            <label className="text-xs font-bold text-muted">
              Path
              <input value={draft.path ?? ''} onChange={(e) => set('path', e.target.value)} className="field mt-1 font-mono" />
            </label>
            <label className="text-xs font-bold text-muted">
              Expires
              <input value={draft.expires ?? ''} onChange={(e) => set('expires', e.target.value)} className="field mt-1 font-mono" />
            </label>
            <label className="text-xs font-bold text-muted">
              Max-Age
              <input value={draft.maxAge ?? ''} onChange={(e) => set('maxAge', e.target.value)} className="field mt-1 font-mono" />
            </label>
            <label className="text-xs font-bold text-muted">
              SameSite
              <select
                value={draft.sameSite ?? ''}
                onChange={(e) => set('sameSite', e.target.value)}
                className="field mt-1"
              >
                <option value="">(不设置)</option>
                <option value="Lax">Lax</option>
                <option value="Strict">Strict</option>
                <option value="None">None</option>
              </select>
            </label>
          </div>
          <div className="mt-3 flex flex-wrap gap-6">
            <Checkbox checked={draft.secure} onChange={toggle('secure')} label="Secure" />
            <Checkbox checked={draft.httpOnly} onChange={toggle('httpOnly')} label="HttpOnly" />
          </div>
        </Panel>
      )}

      <Panel title="构造结果" action={<CopyButton value={built} disabled={!built} />}>
        <OutputBox value={built} />
      </Panel>
    </div>
  )
}

/* ----------------------------------------------------------- xml format */

export function XmlFormatTool() {
  const [input, setInput] = useState('<root><item id="1">A</item><item id="2">B</item></root>')
  const [indent, setIndent] = useState<'2' | '4'>('2')
  const [minify, setMinify] = useState(false)

  const result = useMemo(() => {
    const r = formatXml(input, Number(indent))
    return minify ? r.text.replace(/>\s+</g, '><') : r.text
  }, [input, indent, minify])

  return (
    <Grid>
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
          className="field min-h-[220px] resize-y font-mono text-[12.5px]"
          aria-label="XML 输入"
        />
        <div className="mt-2">
          <Checkbox checked={minify} onChange={setMinify} label="压缩为单行" />
        </div>
      </Panel>
      <Panel title="输出" action={<CopyButton value={result} disabled={!result} />}>
        <OutputBox value={result} />
      </Panel>
    </Grid>
  )
}

/* ----------------------------------------------------------- sql format */

export function SqlFormatTool() {
  const [input, setInput] = useState('select id,name from users where age > 18 order by id desc limit 10')
  const [upper, setUpper] = useState(true)
  const [minify, setMinify] = useState(false)

  const result = useMemo(() => {
    const r = formatSql(input, upper)
    return minify ? r.replace(/\s+/g, ' ').trim() : r
  }, [input, upper, minify])

  return (
    <Grid>
      <Panel
        title="输入"
        action={
          <Segmented
            value={upper ? 'upper' : 'lower'}
            onChange={(v) => setUpper(v === 'upper')}
            options={[
              { value: 'upper', label: '关键字大写' },
              { value: 'lower', label: '小写' },
            ]}
          />
        }
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="field min-h-[220px] resize-y font-mono text-[12.5px]"
          aria-label="SQL 输入"
        />
        <div className="mt-2">
          <Checkbox checked={minify} onChange={setMinify} label="压缩为单行" />
        </div>
      </Panel>
      <Panel title="输出" action={<CopyButton value={result} disabled={!result} />}>
        <OutputBox value={result} />
      </Panel>
    </Grid>
  )
}

/* -------------------------------------------------------- css gradient */

export function CssGradientTool() {
  const [type, setType] = useState<'linear' | 'radial' | 'conic'>('linear')
  const [angle, setAngle] = useState(120)
  const [stops, setStops] = useState([
    { color: '#15803D', pos: 0 },
    { color: '#059669', pos: 50 },
    { color: '#79B291', pos: 100 },
  ])

  const stopList = stops.map((s) => `${s.color} ${s.pos}%`).join(', ')
  const css =
    type === 'linear'
      ? `linear-gradient(${angle}deg, ${stopList})`
      : type === 'radial'
        ? `radial-gradient(circle, ${stopList})`
        : `conic-gradient(from ${angle}deg, ${stopList})`

  return (
    <div className="space-y-4">
      <Panel
        title="渐变配置"
        action={
          <Segmented
            value={type}
            onChange={setType}
            options={[
              { value: 'linear', label: '线性' },
              { value: 'radial', label: '径向' },
              { value: 'conic', label: '锥形' },
            ]}
          />
        }
      >
        <div className="mb-3">
          <label htmlFor="g-angle" className="mb-1 block text-xs font-bold text-muted">
            角度 / 起始角：{angle}°
          </label>
          <input
            id="g-angle"
            type="range"
            min={0}
            max={360}
            value={angle}
            onChange={(e) => setAngle(Number(e.target.value))}
            className="w-full accent-[rgb(var(--c-brand))]"
          />
        </div>
        <div className="space-y-2">
          {stops.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="color"
                value={s.color}
                onChange={(e) => setStops((prev) => prev.map((x, idx) => (idx === i ? { ...x, color: e.target.value } : x)))}
                className="h-11 w-14 cursor-pointer rounded-xl border border-line bg-surface p-1"
                aria-label={`色标 ${i + 1} 颜色`}
              />
              <input
                type="range"
                min={0}
                max={100}
                value={s.pos}
                onChange={(e) => setStops((prev) => prev.map((x, idx) => (idx === i ? { ...x, pos: Number(e.target.value) } : x)))}
                className="flex-1 accent-[rgb(var(--c-brand))]"
                aria-label={`色标 ${i + 1} 位置`}
              />
              <span className="w-12 text-right font-mono text-xs font-bold">{s.pos}%</span>
              <button
                type="button"
                onClick={() => setStops((prev) => prev.filter((_, idx) => idx !== i))}
                disabled={stops.length <= 2}
                aria-label={`删除色标 ${i + 1}`}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line text-muted transition hover:border-coral/50 hover:text-coral active:scale-90 disabled:opacity-40"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <Button
          size="sm"
          variant="outline"
          className="mt-3"
          onClick={() => setStops((prev) => [...prev, { color: '#64746E', pos: 75 }])}
        >
          添加色标
        </Button>
      </Panel>

      <Panel title="预览">
        <div className="h-40 rounded-xl border border-line" style={{ background: css }} />
      </Panel>

      <Panel title="CSS" action={<CopyButton value={`background: ${css};`} />}>
        <OutputBox value={`background: ${css};`} />
      </Panel>
    </div>
  )
}

/* --------------------------------------------------------- mysql → go */

export function MysqlGoStructTool() {
  const [ddl, setDdl] = useState(
    'CREATE TABLE `user` (\n  `id` bigint NOT NULL AUTO_INCREMENT,\n  `name` varchar(64) NOT NULL COMMENT \'姓名\',\n  `age` int DEFAULT NULL,\n  `created_at` datetime DEFAULT NULL,\n  PRIMARY KEY (`id`)\n);',
  )
  const [name, setName] = useState('User')
  const [tags, setTags] = useState(true)

  const output = useMemo(() => mysqlToGoStruct(ddl, name, tags), [ddl, name, tags])

  return (
    <div className="space-y-4">
      <Panel title="建表语句">
        <textarea
          value={ddl}
          onChange={(e) => setDdl(e.target.value)}
          className="field min-h-[220px] resize-y font-mono text-[12.5px]"
          aria-label="MySQL DDL"
        />
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label>
            <span className="mb-1 block text-xs font-bold text-muted">结构体名</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className="field w-40 font-mono" />
          </label>
          <Checkbox checked={tags} onChange={setTags} label="生成 json / gorm 标签" />
        </div>
      </Panel>
      <Panel title="Go 结构体" action={<CopyButton value={output} disabled={!output} />}>
        <OutputBox value={output} />
      </Panel>
    </div>
  )
}

/* ------------------------------------------------------------ mock data */

export function MockDataTool() {
  const [rows, setRows] = useState(10)
  const [schema, setSchema] = useState([
    { name: 'name', type: 'name' as MockFieldType },
    { name: 'email', type: 'email' as MockFieldType },
    { name: 'age', type: 'int' as MockFieldType },
  ])
  const [data, setData] = useState<unknown[]>([])

  useEffect(() => {
    setData(generateMock(schema, rows))
  }, [schema, rows])

  const text = JSON.stringify(data, null, 2)

  return (
    <div className="space-y-4">
      <Panel
        title="字段定义"
        action={
          <Button size="sm" onClick={() => setData(generateMock(schema, rows))}>
            重新生成
          </Button>
        }
      >
        <div className="space-y-2">
          {schema.map((f, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={f.name}
                onChange={(e) => setSchema((prev) => prev.map((x, idx) => (idx === i ? { ...x, name: e.target.value } : x)))}
                className="field w-1/3 font-mono text-[13px]"
                placeholder="字段名"
                aria-label={`字段名 ${i + 1}`}
              />
              <select
                value={f.type}
                onChange={(e) =>
                  setSchema((prev) => prev.map((x, idx) => (idx === i ? { ...x, type: e.target.value as MockFieldType } : x)))
                }
                className="field flex-1"
                aria-label={`字段类型 ${i + 1}`}
              >
                {MOCK_FIELD_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setSchema((prev) => prev.filter((_, idx) => idx !== i))}
                aria-label={`删除字段 ${i + 1}`}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line text-muted transition hover:border-coral/50 hover:text-coral active:scale-90"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSchema((prev) => [...prev, { name: 'field', type: 'word' }])}
          >
            添加字段
          </Button>
          <label className="flex items-center gap-2 text-xs font-bold text-muted">
            行数
            <input
              type="number"
              min={1}
              max={200}
              value={rows}
              onChange={(e) => setRows(Number(e.target.value))}
              className="field w-24 font-mono"
            />
          </label>
        </div>
      </Panel>

      <Panel title="生成结果" action={<CopyButton value={text} disabled={!text} />}>
        <OutputBox value={text} />
      </Panel>
    </div>
  )
}

/* --------------------------------------------------------------- HMAC */

const HASH_ALGOS = ['SHA-1', 'SHA-256', 'SHA-512'] as const

export function HmacTool() {
  const [input, setInput] = useState('')
  const [keyText, setKeyText] = useState('')
  const [algo, setAlgo] = useState<(typeof HASH_ALGOS)[number]>('SHA-256')
  const [out, setOut] = useState({ digest: '', hmac: '' })

  useEffect(() => {
    let alive = true
    if (!input) {
      setOut({ digest: '', hmac: '' })
      return
    }
    void (async () => {
      const digest = await shaDigest(algo, input)
      let hmac = ''
      if (keyText) {
        const k = await crypto.subtle.importKey(
          'raw',
          new TextEncoder().encode(keyText),
          { name: 'HMAC', hash: algo },
          false,
          ['sign'],
        )
        const sig = await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(input))
        hmac = [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('')
      }
      if (alive) setOut({ digest, hmac })
    })()
    return () => {
      alive = false
    }
  }, [input, keyText, algo])

  return (
    <div className="space-y-4">
      <Panel
        title="输入"
        action={<Segmented value={algo} onChange={setAlgo} options={HASH_ALGOS.map((a) => ({ value: a, label: a }))} />}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="待计算摘要的文本…"
          className="field min-h-[120px] resize-y font-mono text-[13px]"
          aria-label="输入文本"
        />
        <input
          value={keyText}
          onChange={(e) => setKeyText(e.target.value)}
          placeholder="HMAC 密钥（可留空则只算摘要）"
          className="field mt-2 font-mono text-[13px]"
          aria-label="HMAC 密钥"
        />
      </Panel>

      <Panel title="结果">
        <div className="space-y-3">
          <div className="rounded-xl border border-line bg-surface-2 p-3">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs font-black text-brand">{algo}</span>
              <CopyButton value={out.digest} label="复制" disabled={!out.digest} />
            </div>
            <p className="break-all font-mono text-[12.5px]">{out.digest || '—'}</p>
          </div>
          <div className="rounded-xl border border-line bg-surface-2 p-3">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs font-black text-brand">HMAC-{algo}</span>
              <CopyButton value={out.hmac} label="复制" disabled={!out.hmac} />
            </div>
            <p className="break-all font-mono text-[12.5px]">
              {out.hmac || (keyText ? '计算中…' : '填写密钥后计算')}
            </p>
          </div>
        </div>
      </Panel>
    </div>
  )
}
