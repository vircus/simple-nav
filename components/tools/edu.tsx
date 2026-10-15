'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Panel, Segmented, CopyButton, OutputBox } from './shared'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  UNIT_GROUPS,
  convertUnit,
  toMorse,
  fromMorse,
  calcBmi,
  calcAge,
  diffDates,
  addToDate,
  calcLoan,
  monthlyTax,
} from '@/lib/tools/edu'
import { evalExpression, toBaseString, parseInBase } from '@/lib/tools/calc'

const Grid = ({ children }: { children: React.ReactNode }) => (
  <div className="grid gap-4 lg:grid-cols-2">{children}</div>
)

/* --------------------------------------------------------- unit convert */

export function UnitConvertTool() {
  const [group, setGroup] = useState(UNIT_GROUPS[0])
  const [value, setValue] = useState('1')
  const [from, setFrom] = useState(UNIT_GROUPS[0].units[0].id)
  const [to, setTo] = useState(UNIT_GROUPS[0].units[1].id)

  useEffect(() => {
    setFrom(group.units[0].id)
    setTo(group.units[1]?.id ?? group.units[0].id)
  }, [group])

  const numeric = Number(value)
  const result = Number.isFinite(numeric) ? convertUnit(numeric, group, from, to) : NaN

  const all = Number.isFinite(numeric)
    ? group.units.map((u) => ({ ...u, v: convertUnit(numeric, group, from, u.id) }))
    : []

  return (
    <div className="space-y-4">
      <Panel title="单位类别">
        <div className="flex flex-wrap gap-1.5">
          {UNIT_GROUPS.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setGroup(g)}
              aria-pressed={group.id === g.id}
              className={cn(
                'rounded-pill border px-3 py-1.5 text-xs font-bold transition duration-200',
                group.id === g.id
                  ? 'border-brand bg-brand text-white shadow-glow'
                  : 'border-line bg-surface text-muted hover:-translate-y-0.5 hover:text-fg',
              )}
            >
              {g.label}
            </button>
          ))}
        </div>
      </Panel>

      <Panel title="换算">
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
            <select value={from} onChange={(e) => setFrom(e.target.value)} className="field w-36" aria-label="源单位">
              {group.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1 block text-xs font-bold text-muted">到</span>
            <select value={to} onChange={(e) => setTo(e.target.value)} className="field w-36" aria-label="目标单位">
              {group.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 rounded-xl border border-line bg-surface-2 p-4">
          <p className="text-2xl font-black tabular-nums tracking-tight text-brand">
            {Number.isFinite(result) ? Number(result.toPrecision(10)).toString() : '-'}
          </p>
        </div>
      </Panel>

      {all.length > 0 && (
        <Panel title="全单位对照">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {all.map((u) => (
              <div key={u.id} className="rounded-xl border border-line bg-surface-2 p-2.5">
                <p className="text-[11px] font-bold text-muted">{u.label}</p>
                <p className="mt-0.5 break-all font-mono text-[13px] font-bold tabular-nums">
                  {Number(u.v.toPrecision(8)).toString()}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  )
}

/* ------------------------------------------------------------ calculator */

export function CalculatorTool() {
  const [expr, setExpr] = useState('')
  const [history, setHistory] = useState<{ expr: string; value: string }[]>([])
  const [baseInput, setBaseInput] = useState('255')

  const result = useMemo(() => {
    if (!expr.trim()) return { ok: true, text: '' }
    try {
      return { ok: true, text: String(evalExpression(expr)) }
    } catch (e) {
      return { ok: false, text: e instanceof Error ? e.message : '计算失败' }
    }
  }, [expr])

  const append = (s: string) => setExpr((p) => p + s)
  const commit = () => {
    if (result.ok && result.text) setHistory((h) => [{ expr, value: result.text }, ...h].slice(0, 20))
  }

  const keys = [
    '7', '8', '9', '/', '(',
    '4', '5', '6', '*', ')',
    '1', '2', '3', '-', '^',
    '0', '.', '%', '+', '!',
  ]

  const dec = Number(baseInput)

  return (
    <Grid>
      <Panel title="科学计算">
        <input
          value={expr}
          onChange={(e) => setExpr(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && commit()}
          placeholder="例如 (1+2)*3^2 或 sin(30)+sqrt(16)"
          className="field font-mono"
          aria-label="表达式"
        />

        <div className="mt-3 rounded-xl border border-line bg-surface-2 p-4 text-right">
          <p className={cn('text-2xl font-black tabular-nums tracking-tight', result.ok ? 'text-brand' : 'text-coral')}>
            {result.text || '0'}
          </p>
        </div>

        <div className="mt-3 grid grid-cols-5 gap-1.5">
          {keys.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => append(k)}
              className="rounded-xl border border-line bg-surface py-2 font-mono text-sm font-bold transition duration-150 hover:-translate-y-0.5 hover:border-brand/50 active:scale-95"
            >
              {k}
            </button>
          ))}
        </div>

        <div className="mt-2 flex gap-2">
          <Button size="sm" onClick={commit} disabled={!result.ok || !result.text}>
            记录
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setExpr('')}>
            清空
          </Button>
        </div>

        {history.length > 0 && (
          <ul className="mt-3 max-h-40 space-y-1 overflow-auto">
            {history.map((h, i) => (
              <li
                key={i}
                className="cursor-pointer rounded-lg border border-line bg-surface-2 px-3 py-1.5 font-mono text-xs transition hover:border-brand/40"
                onClick={() => setExpr(h.expr)}
              >
                <span className="text-muted">{h.expr}</span> = <b>{h.value}</b>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <div className="space-y-4">
        <Panel title="进制互转">
          <input
            value={baseInput}
            onChange={(e) => setBaseInput(e.target.value)}
            placeholder="十进制数值"
            className="field font-mono"
            aria-label="十进制数值"
          />
          <div className="mt-3 space-y-2">
            {([2, 8, 10, 16] as const).map((b) => (
              <div key={b} className="flex items-center justify-between rounded-xl border border-line bg-surface-2 px-3 py-2">
                <span className="text-xs font-bold text-muted">{b} 进制</span>
                <span className="break-all font-mono text-[13px] font-bold">
                  {Number.isFinite(dec) ? toBaseString(dec, b) : '-'}
                </span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="支持的函数">
          <p className="text-xs leading-relaxed text-muted">
            sin / cos / tan / asin / acos / atan / sqrt / cbrt / abs / exp / log / log2 / log10 /
            floor / ceil / round / pow / ln，常量 pi、e，运算符 + - * / % ^ 与阶乘 !。
          </p>
        </Panel>
      </div>
    </Grid>
  )
}

/* ----------------------------------------------------------------- morse */

export function MorseTool() {
  const [mode, setMode] = useState<'to' | 'from'>('to')
  const [input, setInput] = useState('')
  const output = useMemo(
    () => (input ? (mode === 'to' ? toMorse(input) : fromMorse(input)) : ''),
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
              { value: 'to', label: '编码' },
              { value: 'from', label: '解码' },
            ]}
          />
        }
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'to' ? 'HELLO WORLD' : '.... . .-.. .-.. ---'}
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

/* ----------------------------------------------------------- ascii table */

export function AsciiTableTool() {
  const [q, setQ] = useState('')
  const rows = useMemo(() => {
    const list = Array.from({ length: 128 }, (_, i) => ({
      dec: i,
      hex: i.toString(16).toUpperCase().padStart(2, '0'),
      oct: i.toString(8).padStart(3, '0'),
      char: i < 32 || i === 127 ? (['NUL','SOH','STX','ETX','EOT','ENQ','ACK','BEL','BS','HT','LF','VT','FF','CR','SO','SI','DLE','DC1','DC2','DC3','DC4','NAK','SYN','ETB','CAN','EM','SUB','ESC','FS','GS','RS','US'][i] ?? 'DEL') : String.fromCharCode(i),
    }))
    const s = q.trim().toLowerCase()
    if (!s) return list
    return list.filter(
      (r) => String(r.dec).includes(s) || r.hex.toLowerCase().includes(s) || r.char.toLowerCase().includes(s),
    )
  }, [q])

  return (
    <div className="space-y-4">
      <Panel title="搜索">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="按十进制、十六进制或字符筛选"
          className="field"
          aria-label="筛选 ASCII"
        />
      </Panel>
      <Panel title="ASCII 码表" hint={`${rows.length} 条`}>
        <div className="max-h-96 overflow-auto rounded-xl border border-line">
          <table className="w-full text-left font-mono text-[12.5px]">
            <thead className="sticky top-0 bg-surface-2 text-[11px] uppercase text-muted">
              <tr>
                <th className="px-3 py-2">十进制</th>
                <th className="px-3 py-2">十六进制</th>
                <th className="px-3 py-2">八进制</th>
                <th className="px-3 py-2">字符</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.dec} className="border-t border-line/60">
                  <td className="px-3 py-1.5">{r.dec}</td>
                  <td className="px-3 py-1.5">{r.hex}</td>
                  <td className="px-3 py-1.5">{r.oct}</td>
                  <td className="px-3 py-1.5 font-bold">{r.char === ' ' ? 'SP' : r.char}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

/* ------------------------------------------------------------ date calc */

export function DateCalcTool() {
  const [a, setA] = useState('2026-01-01')
  const [b, setB] = useState('2026-12-31')
  const [amount, setAmount] = useState(30)
  const [unit, setUnit] = useState<'day' | 'week' | 'month' | 'year'>('day')

  const diff = useMemo(() => {
    const da = new Date(a)
    const db = new Date(b)
    if (Number.isNaN(da.getTime()) || Number.isNaN(db.getTime())) return null
    return diffDates(da, db)
  }, [a, b])

  const shifted = useMemo(() => {
    const base = new Date(a)
    if (Number.isNaN(base.getTime())) return ''
    return addToDate(base, amount, unit).toISOString().slice(0, 10)
  }, [a, amount, unit])

  return (
    <div className="space-y-4">
      <Panel title="日期差值">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-bold text-muted">
            开始日期
            <input type="date" value={a} onChange={(e) => setA(e.target.value)} className="field mt-1" />
          </label>
          <label className="text-xs font-bold text-muted">
            结束日期
            <input type="date" value={b} onChange={(e) => setB(e.target.value)} className="field mt-1" />
          </label>
        </div>
        {diff && (
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              ['总天数', diff.days],
              ['年', diff.years],
              ['月', diff.months],
              ['剩余天', diff.restDays],
            ].map(([k, v]) => (
              <div key={String(k)} className="rounded-xl border border-line bg-surface-2 p-3">
                <p className="text-[11px] font-bold text-muted">{k}</p>
                <p className="text-lg font-black tabular-nums text-brand">{v as number}</p>
              </div>
            ))}
            <div className="col-span-2 rounded-xl border border-line bg-surface-2 p-3 sm:col-span-4">
              <p className="text-[11px] font-bold text-muted">工作日（不含周末）</p>
              <p className="text-lg font-black tabular-nums text-brand">{diff.workdays}</p>
            </div>
          </div>
        )}
      </Panel>

      <Panel title="日期推算">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label>
            <span className="mb-1 block text-xs font-bold text-muted">数量</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="field w-28 font-mono"
            />
          </label>
          <Segmented
            value={unit}
            onChange={setUnit}
            options={[
              { value: 'day', label: '天' },
              { value: 'week', label: '周' },
              { value: 'month', label: '月' },
              { value: 'year', label: '年' },
            ]}
          />
          <div className="rounded-xl border border-line bg-surface-2 px-4 py-2.5 font-mono font-bold">
            {shifted || '-'}
          </div>
        </div>
      </Panel>
    </div>
  )
}

/* ------------------------------------------------------------- age calc */

export function AgeCalcTool() {
  const [birth, setBirth] = useState('1995-06-15')
  const age = useMemo(() => {
    const d = new Date(birth)
    if (Number.isNaN(d.getTime())) return null
    return calcAge(d)
  }, [birth])

  return (
    <Panel title="年龄计算器">
      <label className="text-xs font-bold text-muted">
        出生日期
        <input type="date" value={birth} onChange={(e) => setBirth(e.target.value)} className="field mt-1" />
      </label>
      {age && (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {[
            ['周岁', `${age.years} 岁`],
            ['精确', `${age.years}年${age.months}月${age.days}天`],
            ['虚岁', `${age.nominalAge} 岁`],
            ['已活天数', `${age.totalDays} 天`],
            ['生肖', age.zodiac],
            ['星座', age.constellation],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl border border-line bg-surface-2 p-3">
              <p className="text-[11px] font-bold text-muted">{k}</p>
              <p className="text-base font-black text-brand">{v}</p>
            </div>
          ))}
          <div className="col-span-2 rounded-xl border border-line bg-surface-2 p-3 sm:col-span-3">
            <p className="text-[11px] font-bold text-muted">下次生日</p>
            <p className="text-base font-black text-brand">{age.nextBirthdayDays} 天后</p>
          </div>
        </div>
      )}
    </Panel>
  )
}

/* ------------------------------------------------------------------ bmi */

export function BmiTool() {
  const [height, setHeight] = useState(170)
  const [weight, setWeight] = useState(65)
  const r = useMemo(() => calcBmi(height, weight), [height, weight])

  const tone: Record<string, string> = {
    偏瘦: 'text-flash',
    正常: 'text-brand',
    偏胖: 'text-solar',
    肥胖: 'text-coral',
  }

  return (
    <Panel title="BMI 计算器" hint="按中国成人标准评估">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-bold text-muted">
          身高（cm）
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            className="field mt-1 font-mono"
          />
        </label>
        <label className="text-xs font-bold text-muted">
          体重（kg）
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="field mt-1 font-mono"
          />
        </label>
      </div>

      {r && (
        <div className="mt-4 rounded-xl border border-line bg-surface-2 p-4">
          <p className="text-3xl font-black tabular-nums tracking-tight">
            <span className={tone[r.label]}>{r.bmi}</span>
            <span className="ml-2 text-base font-bold text-muted">{r.label}</span>
          </p>
          <p className="mt-2 text-xs text-muted">
            健康体重范围：{r.healthyMin} ~ {r.healthyMax} kg
          </p>
        </div>
      )}
    </Panel>
  )
}

/* ----------------------------------------------------------------- loan */

export function LoanTool() {
  const [amount, setAmount] = useState(1000000)
  const [rate, setRate] = useState(3.5)
  const [years, setYears] = useState(30)
  const [mode, setMode] = useState<'equal' | 'principal'>('equal')

  const r = useMemo(() => calcLoan(amount, rate, years, mode), [amount, rate, years, mode])

  return (
    <div className="space-y-4">
      <Panel
        title="贷款参数"
        action={
          <Segmented
            value={mode}
            onChange={setMode}
            options={[
              { value: 'equal', label: '等额本息' },
              { value: 'principal', label: '等额本金' },
            ]}
          />
        }
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-xs font-bold text-muted">
            贷款总额（元）
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="field mt-1 font-mono"
            />
          </label>
          <label className="text-xs font-bold text-muted">
            年利率（%）
            <input
              type="number"
              step="0.01"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="field mt-1 font-mono"
            />
          </label>
          <label className="text-xs font-bold text-muted">
            年限
            <input
              type="number"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="field mt-1 font-mono"
            />
          </label>
        </div>
      </Panel>

      <div className="grid gap-2 sm:grid-cols-3">
        {[
          ['月供（首月）', Math.round(r.monthly).toLocaleString('zh-CN')],
          ['还款总额', Math.round(r.total).toLocaleString('zh-CN')],
          ['支付利息', Math.round(r.interest).toLocaleString('zh-CN')],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl border border-line bg-surface-2 p-3">
            <p className="text-[11px] font-bold text-muted">{k}</p>
            <p className="text-lg font-black tabular-nums text-brand">{v} 元</p>
          </div>
        ))}
      </div>

      <Panel title="逐年明细">
        <div className="max-h-72 overflow-auto rounded-xl border border-line">
          <table className="w-full text-left text-[12.5px]">
            <thead className="sticky top-0 bg-surface-2 text-[11px] uppercase text-muted">
              <tr>
                <th className="px-3 py-2">年</th>
                <th className="px-3 py-2">还款</th>
                <th className="px-3 py-2">利息</th>
                <th className="px-3 py-2">本金</th>
                <th className="px-3 py-2">剩余</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {r.schedule.map((s) => (
                <tr key={s.year} className="border-t border-line/60">
                  <td className="px-3 py-1.5">{s.year}</td>
                  <td className="px-3 py-1.5">{Math.round(s.payment).toLocaleString('zh-CN')}</td>
                  <td className="px-3 py-1.5">{Math.round(s.interest).toLocaleString('zh-CN')}</td>
                  <td className="px-3 py-1.5">{Math.round(s.principal).toLocaleString('zh-CN')}</td>
                  <td className="px-3 py-1.5">{Math.round(s.balance).toLocaleString('zh-CN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

/* ------------------------------------------------------------------ tax */

export function TaxTool() {
  const [monthly, setMonthly] = useState(20000)
  const [deduction, setDeduction] = useState(5000)
  const [extra, setExtra] = useState(0)

  const rows = useMemo(() => {
    const out: { month: number; tax: number; after: number }[] = []
    let cumIncome = 0
    let cumDeduction = 0
    let cumTax = 0
    for (let m = 1; m <= 12; m++) {
      cumIncome += monthly
      cumDeduction += deduction + extra
      const tax = monthlyTax(cumIncome, cumDeduction, cumTax)
      cumTax += tax
      out.push({ month: m, tax, after: monthly - tax })
    }
    return out
  }, [monthly, deduction, extra])

  const totalTax = rows.reduce((n, r) => n + r.tax, 0)

  return (
    <div className="space-y-4">
      <Panel title="参数">
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-xs font-bold text-muted">
            月薪（元）
            <input
              type="number"
              value={monthly}
              onChange={(e) => setMonthly(Number(e.target.value))}
              className="field mt-1 font-mono"
            />
          </label>
          <label className="text-xs font-bold text-muted">
            每月减除费用（元）
            <input
              type="number"
              value={deduction}
              onChange={(e) => setDeduction(Number(e.target.value))}
              className="field mt-1 font-mono"
            />
          </label>
          <label className="text-xs font-bold text-muted">
            专项附加扣除（元）
            <input
              type="number"
              value={extra}
              onChange={(e) => setExtra(Number(e.target.value))}
              className="field mt-1 font-mono"
            />
          </label>
        </div>
      </Panel>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface-2 p-3">
          <p className="text-[11px] font-bold text-muted">全年个税</p>
          <p className="text-lg font-black tabular-nums text-brand">{Math.round(totalTax).toLocaleString('zh-CN')} 元</p>
        </div>
        <div className="rounded-xl border border-line bg-surface-2 p-3">
          <p className="text-[11px] font-bold text-muted">全年税后收入</p>
          <p className="text-lg font-black tabular-nums text-brand">
            {Math.round(monthly * 12 - totalTax).toLocaleString('zh-CN')} 元
          </p>
        </div>
      </div>

      <Panel title="逐月明细（累计预扣预缴法）">
        <div className="max-h-72 overflow-auto rounded-xl border border-line">
          <table className="w-full text-left text-[12.5px]">
            <thead className="sticky top-0 bg-surface-2 text-[11px] uppercase text-muted">
              <tr>
                <th className="px-3 py-2">月份</th>
                <th className="px-3 py-2">个税</th>
                <th className="px-3 py-2">税后</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {rows.map((r) => (
                <tr key={r.month} className="border-t border-line/60">
                  <td className="px-3 py-1.5">{r.month} 月</td>
                  <td className="px-3 py-1.5">{Math.round(r.tax).toLocaleString('zh-CN')}</td>
                  <td className="px-3 py-1.5">{Math.round(r.after).toLocaleString('zh-CN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

/* ------------------------------------------------------------- pomodoro */

export function PomodoroTool() {
  const [work, setWork] = useState(25)
  const [short, setShort] = useState(5)
  const [long, setLong] = useState(15)
  const [phase, setPhase] = useState<'work' | 'short' | 'long'>('work')
  const [left, setLeft] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [round, setRound] = useState(1)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    if (!running) return
    timer.current = window.setInterval(() => {
      setLeft((v) => {
        if (v <= 1) {
          const next: typeof phase = phase === 'work' ? (round % 4 === 0 ? 'long' : 'short') : 'work'
          setPhase(next)
          if (phase === 'work') setRound((r) => r + 1)
          return (next === 'work' ? work : next === 'short' ? short : long) * 60
        }
        return v - 1
      })
    }, 1000)
    return () => {
      if (timer.current) window.clearInterval(timer.current)
    }
  }, [running, phase, round, work, short, long])

  const reset = (p: typeof phase) => {
    setRunning(false)
    setPhase(p)
    setLeft((p === 'work' ? work : p === 'short' ? short : long) * 60)
  }

  const mm = String(Math.floor(left / 60)).padStart(2, '0')
  const ss = String(left % 60).padStart(2, '0')

  return (
    <Panel title="番茄工作法">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-wide text-muted">
          第 {round} 轮 · {phase === 'work' ? '专注' : phase === 'short' ? '短休息' : '长休息'}
        </p>
        <p className="mt-2 text-5xl font-black tabular-nums tracking-tight text-brand">
          {mm}:{ss}
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <Button onClick={() => setRunning((v) => !v)}>{running ? '暂停' : '开始'}</Button>
          <Button variant="outline" onClick={() => reset(phase)}>
            重置
          </Button>
        </div>
        <div className="mt-3 flex justify-center gap-2">
          {(['work', 'short', 'long'] as const).map((p) => (
            <Button key={p} size="sm" variant="ghost" onClick={() => reset(p)}>
              {p === 'work' ? '专注' : p === 'short' ? '短休' : '长休'}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="text-xs font-bold text-muted">
          专注（分钟）
          <input type="number" value={work} onChange={(e) => setWork(Number(e.target.value))} className="field mt-1 font-mono" />
        </label>
        <label className="text-xs font-bold text-muted">
          短休（分钟）
          <input type="number" value={short} onChange={(e) => setShort(Number(e.target.value))} className="field mt-1 font-mono" />
        </label>
        <label className="text-xs font-bold text-muted">
          长休（分钟）
          <input type="number" value={long} onChange={(e) => setLong(Number(e.target.value))} className="field mt-1 font-mono" />
        </label>
      </div>
    </Panel>
  )
}

/* ------------------------------------------------------------ countdown */

export function CountdownTool() {
  const [minutes, setMinutes] = useState(5)
  const [left, setLeft] = useState(5 * 60)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!running) return
    const t = window.setInterval(() => {
      setLeft((v) => {
        if (v <= 1) {
          setRunning(false)
          return 0
        }
        return v - 1
      })
    }, 1000)
    return () => window.clearInterval(t)
  }, [running])

  const mm = String(Math.floor(left / 60)).padStart(2, '0')
  const ss = String(left % 60).padStart(2, '0')

  return (
    <Panel title="倒计时">
      <p className="text-center text-5xl font-black tabular-nums tracking-tight text-brand">
        {mm}:{ss}
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {[1, 5, 10, 25, 45].map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setRunning(false)
              setMinutes(m)
              setLeft(m * 60)
            }}
            className={cn(
              'rounded-pill border px-3 py-1.5 text-xs font-bold transition',
              minutes === m ? 'border-brand bg-brand text-white' : 'border-line text-muted hover:text-fg',
            )}
          >
            {m} 分钟
          </button>
        ))}
      </div>
      <div className="mt-4 flex justify-center gap-2">
        <Button onClick={() => setRunning((v) => !v)} disabled={left === 0}>
          {running ? '暂停' : '开始'}
        </Button>
        <Button variant="outline" onClick={() => { setRunning(false); setLeft(minutes * 60) }}>
          重置
        </Button>
      </div>
    </Panel>
  )
}
