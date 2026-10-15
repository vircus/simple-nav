'use client'

import { useMemo, useRef, useState } from 'react'
import { Download } from 'lucide-react'
import { Panel, CopyButton } from './shared'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'

export type ChartType = 'bar' | 'line' | 'pie' | 'scatter'

interface Row {
  label: string
  value: number
}

const SERIES_COLORS = ['#15803D', '#059669', '#79B291', '#107A57', '#64746E', '#16A34A', '#0F766E', '#4A9B6E']

const DEFAULT_ROWS: Row[] = [
  { label: '一月', value: 120 },
  { label: '二月', value: 200 },
  { label: '三月', value: 150 },
  { label: '四月', value: 280 },
  { label: '五月', value: 220 },
]

/**
 * One renderer powers all four chart tools — they only differ by type.
 * Charts are hand-drawn SVG, so there is no charting dependency.
 */
export function ChartTool({ type }: { type: ChartType }) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [rows, setRows] = useState<Row[]>(DEFAULT_ROWS)
  const [title, setTitle] = useState('示例图表')

  const patch = (i: number, key: keyof Row, v: string) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [key]: key === 'value' ? Number(v) || 0 : v } : r)))

  const max = Math.max(1, ...rows.map((r) => r.value))
  const total = rows.reduce((n, r) => n + r.value, 0)

  const W = 720
  const H = 380
  const padL = 56
  const padB = 48
  const padT = 40

  const plotW = W - padL - 24
  const plotH = H - padB - padT

  const xFor = (i: number) => padL + (plotW * (i + 0.5)) / Math.max(1, rows.length)
  const yFor = (v: number) => padT + plotH - (plotH * v) / max

  const pieSlices = useMemo(() => {
    let acc = 0
    return rows.map((r, i) => {
      const frac = total ? r.value / total : 0
      const a0 = acc * 2 * Math.PI - Math.PI / 2
      acc += frac
      const a1 = acc * 2 * Math.PI - Math.PI / 2
      const cx = W / 2
      const cy = H / 2
      const radius = Math.min(W, H) / 2 - 50
      const large = a1 - a0 > Math.PI ? 1 : 0
      const x0 = cx + radius * Math.cos(a0)
      const y0 = cy + radius * Math.sin(a0)
      const x1 = cx + radius * Math.cos(a1)
      const y1 = cy + radius * Math.sin(a1)
      const d =
        frac >= 0.9999
          ? `M ${cx - radius} ${cy} a ${radius} ${radius} 0 1 0 ${radius * 2} 0 a ${radius} ${radius} 0 1 0 ${-radius * 2} 0`
          : `M ${cx} ${cy} L ${x0} ${y0} A ${radius} ${radius} 0 ${large} 1 ${x1} ${y1} Z`
      return { d, color: SERIES_COLORS[i % SERIES_COLORS.length], label: r.label, frac }
    })
  }, [rows, total, W, H])

  const exportSvg = () => {
    const svg = svgRef.current
    if (!svg) return
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title || 'chart'}.svg`
    a.click()
    URL.revokeObjectURL(url)
    toast('已导出 SVG', 'ok')
  }

  return (
    <div className="space-y-4">
      <Panel
        title="数据"
        hint="像填表格一样编辑图表数据"
        action={
          <Button size="sm" variant="outline" onClick={exportSvg}>
            <Download className="h-3.5 w-3.5" />
            导出 SVG
          </Button>
        }
      >
        <label className="mb-3 block text-xs font-bold text-muted">
          图表标题
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="field mt-1" />
        </label>

        <div className="space-y-2">
          {rows.map((r, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={r.label}
                onChange={(e) => patch(i, 'label', e.target.value)}
                className="field flex-1"
                placeholder="名称"
                aria-label={`名称 ${i + 1}`}
              />
              <input
                type="number"
                value={r.value}
                onChange={(e) => patch(i, 'value', e.target.value)}
                className="field w-32 font-mono"
                placeholder="数值"
                aria-label={`数值 ${i + 1}`}
              />
              {type === 'scatter' && (
                <span className="grid w-20 place-items-center rounded-xl border border-line bg-surface-2 font-mono text-xs">
                  x={i + 1}
                </span>
              )}
              <button
                type="button"
                onClick={() => setRows((prev) => prev.filter((_, idx) => idx !== i))}
                aria-label={`删除第 ${i + 1} 行`}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line text-muted transition hover:border-coral/50 hover:text-coral active:scale-90"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="mt-3 flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => setRows((prev) => [...prev, { label: `项${prev.length + 1}`, value: 100 }])}>
            添加一行
          </Button>
          <CopyButton value={rows.map((r) => `${r.label},${r.value}`).join('\n')} label="复制数据" />
        </div>
      </Panel>

      <Panel title="预览">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full rounded-xl border border-line bg-surface"
          role="img"
          aria-label={title || '图表'}
        >
          <text x={W / 2} y={26} textAnchor="middle" fontSize="18" fontWeight="700" fill="currentColor">
            {title}
          </text>

          {type !== 'pie' && (
            <>
              {/* grid + y axis */}
              {[0, 0.25, 0.5, 0.75, 1].map((f) => {
                const y = padT + plotH - plotH * f
                return (
                  <g key={f}>
                    <line x1={padL} y1={y} x2={W - 24} y2={y} stroke="currentColor" strokeOpacity="0.12" />
                    <text x={padL - 8} y={y + 4} textAnchor="end" fontSize="11" fill="currentColor" opacity="0.6">
                      {Math.round(max * f)}
                    </text>
                  </g>
                )
              })}
            </>
          )}

          {type === 'bar' &&
            rows.map((r, i) => {
              const bw = (plotW / Math.max(1, rows.length)) * 0.6
              const h = (plotH * r.value) / max
              return (
                <g key={i}>
                  <rect
                    x={xFor(i) - bw / 2}
                    y={padT + plotH - h}
                    width={bw}
                    height={h}
                    rx={4}
                    fill={SERIES_COLORS[i % SERIES_COLORS.length]}
                  />
                  <text x={xFor(i)} y={H - padB + 20} textAnchor="middle" fontSize="12" fill="currentColor">
                    {r.label}
                  </text>
                </g>
              )
            })}

          {type === 'line' && (
            <>
              <polyline
                points={rows.map((r, i) => `${xFor(i)},${yFor(r.value)}`).join(' ')}
                fill="none"
                stroke={SERIES_COLORS[0]}
                strokeWidth="3"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {rows.map((r, i) => (
                <g key={i}>
                  <circle cx={xFor(i)} cy={yFor(r.value)} r="5" fill={SERIES_COLORS[0]} />
                  <text x={xFor(i)} y={H - padB + 20} textAnchor="middle" fontSize="12" fill="currentColor">
                    {r.label}
                  </text>
                </g>
              ))}
            </>
          )}

          {type === 'scatter' &&
            rows.map((r, i) => (
              <g key={i}>
                <circle cx={xFor(i)} cy={yFor(r.value)} r="7" fill={SERIES_COLORS[i % SERIES_COLORS.length]} />
                <text x={xFor(i)} y={H - padB + 20} textAnchor="middle" fontSize="12" fill="currentColor">
                  {r.label}
                </text>
              </g>
            ))}

          {type === 'pie' &&
            pieSlices.map((s, i) => (
              <g key={i}>
                <path d={s.d} fill={s.color} stroke="var(--c-bg)" strokeWidth="2" />
                <text
                  x={W / 2}
                  y={H - 14 - (i % 3) * 16}
                  textAnchor="middle"
                  fontSize="12"
                  fill="currentColor"
                  opacity="0.75"
                >
                  {s.label} {(s.frac * 100).toFixed(0)}%
                </text>
              </g>
            ))}
        </svg>
      </Panel>
    </div>
  )
}

export const ChartBarTool = () => <ChartTool type="bar" />
export const ChartLineTool = () => <ChartTool type="line" />
export const ChartPieTool = () => <ChartTool type="pie" />
export const ChartScatterTool = () => <ChartTool type="scatter" />
