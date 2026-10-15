'use client'

import { useMemo, useState } from 'react'
import { RefreshCw, Play } from 'lucide-react'
import { Panel, Segmented, CopyButton, OutputBox, Checkbox } from './shared'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/* ------------------------------------------------------------- decide */

export function DecideTool() {
  const [options, setOptions] = useState('吃火锅\n吃日料\n吃沙拉')
  const [result, setResult] = useState('')

  const list = useMemo(() => options.split('\n').map((s) => s.trim()).filter(Boolean), [options])

  return (
    <Panel
      title="帮我决定"
      hint="每行一个选项"
      action={
        <Button size="sm" onClick={() => setResult(list.length ? pick(list) : '')} disabled={!list.length}>
          <RefreshCw className="h-3.5 w-3.5" />
          帮我选
        </Button>
      }
    >
      <textarea
        value={options}
        onChange={(e) => setOptions(e.target.value)}
        className="field min-h-[140px] resize-y"
        aria-label="选项"
      />
      {result && (
        <div className="mt-4 grid place-items-center rounded-xl border border-brand/30 bg-brand/8 p-6">
          <p className="text-xs font-bold text-muted">就决定是你了</p>
          <p className="mt-1 text-2xl font-black tracking-tight text-brand animate-pop-in">{result}</p>
        </div>
      )}
    </Panel>
  )
}

/* ---------------------------------------------------------------- coin */

export function CoinTool() {
  const [flipping, setFlipping] = useState(false)
  const [result, setResult] = useState<'正面' | '反面' | null>(null)
  const [stats, setStats] = useState({ head: 0, tail: 0 })

  const flip = () => {
    setFlipping(true)
    setResult(null)
    window.setTimeout(() => {
      const r: '正面' | '反面' = Math.random() < 0.5 ? '正面' : '反面'
      setResult(r)
      setFlipping(false)
      setStats((s) => (r === '正面' ? { ...s, head: s.head + 1 } : { ...s, tail: s.tail + 1 }))
    }, 900)
  }

  return (
    <Panel
      title="抛硬币"
      action={
        <Button size="sm" onClick={flip} disabled={flipping}>
          {flipping ? '抛掷中…' : '抛一次'}
        </Button>
      }
    >
      <div className="grid place-items-center py-6">
        <div
          className={cn(
            'grid h-28 w-28 place-items-center rounded-full text-xl font-black text-white grad-fill shadow-glow',
            flipping && 'animate-spin',
          )}
        >
          {result ?? '?'}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-line bg-surface-2 p-3 text-center">
          <p className="text-[11px] font-bold text-muted">正面</p>
          <p className="text-lg font-black tabular-nums text-brand">{stats.head}</p>
        </div>
        <div className="rounded-xl border border-line bg-surface-2 p-3 text-center">
          <p className="text-[11px] font-bold text-muted">反面</p>
          <p className="text-lg font-black tabular-nums text-brand">{stats.tail}</p>
        </div>
      </div>
    </Panel>
  )
}

/* ---------------------------------------------------------------- dice */

export function DiceTool() {
  const [count, setCount] = useState(2)
  const [sides, setSides] = useState(6)
  const [values, setValues] = useState<number[]>([])

  const roll = () => {
    setValues(Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1))
  }

  return (
    <Panel
      title="投骰子"
      action={
        <Button size="sm" onClick={roll}>
          <Play className="h-3.5 w-3.5" />
          投掷
        </Button>
      }
    >
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-xs font-bold text-muted">
          数量
          <input
            type="number"
            min={1}
            max={10}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="field mt-1 w-24 font-mono"
          />
        </label>
        <label className="text-xs font-bold text-muted">
          面数
          <input
            type="number"
            min={2}
            max={100}
            value={sides}
            onChange={(e) => setSides(Number(e.target.value))}
            className="field mt-1 w-24 font-mono"
          />
        </label>
      </div>

      {values.length > 0 && (
        <>
          <div className="mt-4 flex flex-wrap gap-2">
            {values.map((v, i) => (
              <span
                key={i}
                className="grid h-14 w-14 place-items-center rounded-xl border border-line bg-surface-2 text-xl font-black tabular-nums animate-pop-in"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {v}
              </span>
            ))}
          </div>
          <p className="mt-3 text-sm font-bold text-muted">
            合计：<b className="text-brand">{values.reduce((a, b) => a + b, 0)}</b>
          </p>
        </>
      )}
    </Panel>
  )
}

/* --------------------------------------------------------- random name */

const SURNAMES = '赵钱孙李周吴郑王冯陈褚卫蒋沈韩杨朱秦尤许何吕施张孔曹严华金魏陶姜戚谢邹喻柏水窦章'.split('')
const MALE = ['浩然', '子轩', '俊杰', '宇航', '嘉豪', '志强', '文博', '思远', '梓睿', '明轩']
const FEMALE = ['雨欣', '思涵', '梓涵', '欣怡', '诗琪', '嘉怡', '静怡', '若曦', '婉清', '子萱']

export function RandomNameTool() {
  const [gender, setGender] = useState<'any' | 'male' | 'female'>('any')
  const [count, setCount] = useState(5)
  const [names, setNames] = useState<string[]>([])

  const gen = () => {
    const out: string[] = []
    for (let i = 0; i < count; i++) {
      const pool = gender === 'male' ? MALE : gender === 'female' ? FEMALE : [...MALE, ...FEMALE]
      out.push(pick(SURNAMES) + pick(pool))
    }
    setNames(out)
  }

  return (
    <Panel
      title="随机中文人名"
      action={
        <Button size="sm" onClick={gen}>
          <RefreshCw className="h-3.5 w-3.5" />
          生成
        </Button>
      }
    >
      <div className="flex flex-wrap items-end gap-3">
        <Segmented
          value={gender}
          onChange={setGender}
          options={[
            { value: 'any', label: '不限' },
            { value: 'male', label: '偏男' },
            { value: 'female', label: '偏女' },
          ]}
        />
        <label className="text-xs font-bold text-muted">
          数量
          <input
            type="number"
            min={1}
            max={50}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="field mt-1 w-24 font-mono"
          />
        </label>
        {names.length > 0 && <CopyButton value={names.join('\n')} />}
      </div>

      {names.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {names.map((n, i) => (
            <span
              key={i}
              className="rounded-pill border border-line bg-surface-2 px-4 py-2 text-sm font-bold animate-pop-in"
              style={{ animationDelay: `${Math.min(i, 20) * 40}ms` }}
            >
              {n}
            </span>
          ))}
        </div>
      )}
    </Panel>
  )
}

/* --------------------------------------------------------------- wheel */

const WHEEL_COLORS = ['#15803D', '#059669', '#79B291', '#107A57', '#64746E', '#16A34A', '#0F766E', '#4A9B6E']

export function WheelTool() {
  const [options, setOptions] = useState('一等奖\n二等奖\n三等奖\n谢谢参与')
  const [angle, setAngle] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [removeOnWin, setRemoveOnWin] = useState(false)

  const list = useMemo(() => options.split('\n').map((s) => s.trim()).filter(Boolean), [options])

  const spin = () => {
    if (!list.length || spinning) return
    setSpinning(true)
    const idx = Math.floor(Math.random() * list.length)
    const slice = 360 / list.length
    const target = 360 * 5 + (360 - idx * slice - slice / 2)
    setAngle((a) => a + target)
    window.setTimeout(() => {
      setResult(list[idx])
      setHistory((h) => [list[idx], ...h].slice(0, 20))
      setSpinning(false)
      if (removeOnWin) {
        setOptions((prev) => prev.split('\n').filter((l) => l.trim() !== list[idx]).join('\n'))
      }
    }, 3200)
  }

  return (
    <div className="space-y-4">
      <Panel
        title="转盘"
        action={
          <Button size="sm" onClick={spin} disabled={!list.length || spinning}>
            {spinning ? '旋转中…' : '开始旋转'}
          </Button>
        }
      >
        <div className="grid place-items-center py-4">
          <div className="relative h-64 w-64">
            <div
              className="h-full w-full rounded-full border-4 border-line transition-transform duration-[3000ms] ease-[cubic-bezier(0.15,0.9,0.15,1)]"
              style={{
                transform: `rotate(${angle}deg)`,
                background: `conic-gradient(${list
                  .map((_, i) => `${WHEEL_COLORS[i % WHEEL_COLORS.length]} ${(i * 360) / list.length}deg ${((i + 1) * 360) / list.length}deg`)
                  .join(', ')})`,
              }}
            />
            <div className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1 rotate-180 text-brand">
              ▼
            </div>
          </div>
        </div>

        {result && (
          <div className="grid place-items-center rounded-xl border border-brand/30 bg-brand/8 p-4">
            <p className="text-xs font-bold text-muted">结果</p>
            <p className="text-xl font-black text-brand animate-pop-in">{result}</p>
          </div>
        )}
      </Panel>

      <Panel title="选项" hint="每行一个">
        <textarea
          value={options}
          onChange={(e) => setOptions(e.target.value)}
          className="field min-h-[120px] resize-y"
          aria-label="转盘选项"
        />
        <div className="mt-2">
          <Checkbox checked={removeOnWin} onChange={setRemoveOnWin} label="中奖后自动移除" />
        </div>
      </Panel>

      {history.length > 0 && (
        <Panel title="历史记录">
          <div className="flex flex-wrap gap-2">
            {history.map((h, i) => (
              <span key={i} className="rounded-pill border border-line bg-surface-2 px-3 py-1 text-xs font-bold">
                {h}
              </span>
            ))}
          </div>
        </Panel>
      )}
    </div>
  )
}

/* ----------------------------------------------------------- roll call */

export function RollCallTool() {
  const [roster, setRoster] = useState('张三\n李四\n王五\n赵六')
  const [count, setCount] = useState(1)
  const [picked, setPicked] = useState<string[]>([])
  const [used, setUsed] = useState<string[]>([])

  const remaining = useMemo(
    () => roster.split('\n').map((s) => s.trim()).filter(Boolean).filter((n) => !used.includes(n)),
    [roster, used],
  )

  const roll = () => {
    const n = Math.min(count, remaining.length)
    const pool = remaining.slice()
    const out: string[] = []
    for (let i = 0; i < n; i++) {
      const idx = Math.floor(Math.random() * pool.length)
      out.push(pool.splice(idx, 1)[0])
    }
    setPicked(out)
    setUsed((u) => [...u, ...out])
  }

  const resetUsed = () => {
    setUsed([])
    setPicked([])
  }

  return (
    <div className="space-y-4">
      <Panel
        title="名单"
        action={
          <Button size="sm" onClick={roll} disabled={!remaining.length}>
            随机点名
          </Button>
        }
      >
        <textarea
          value={roster}
          onChange={(e) => setRoster(e.target.value)}
          className="field min-h-[160px] resize-y"
          aria-label="名单"
        />
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="text-xs font-bold text-muted">
            抽取人数
            <input
              type="number"
              min={1}
              max={20}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="field mt-1 w-24 font-mono"
            />
          </label>
          <Button size="sm" variant="ghost" onClick={resetUsed}>
            重置已抽
          </Button>
          <span className="text-xs font-semibold text-muted">剩余 {remaining.length} 人</span>
        </div>
      </Panel>

      {picked.length > 0 && (
        <Panel title="本次结果">
          <div className="flex flex-wrap gap-2">
            {picked.map((p, i) => (
              <span
                key={i}
                className="rounded-pill border border-brand/30 bg-brand/10 px-4 py-2 text-sm font-black text-brand animate-pop-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {p}
              </span>
            ))}
          </div>
        </Panel>
      )}

      {used.length > 0 && (
        <Panel title="已点过">
          <div className="flex flex-wrap gap-2">
            {used.map((u, i) => (
              <span key={i} className="rounded-pill border border-line bg-surface-2 px-3 py-1 text-xs font-bold text-muted">
                {u}
              </span>
            ))}
          </div>
        </Panel>
      )}
    </div>
  )
}
