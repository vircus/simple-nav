'use client'

import { useMemo, useState } from 'react'
import { Panel, Segmented, CopyButton, OutputBox } from './shared'
import { Button } from '@/components/ui/button'
import { numberToChineseAmount } from '@/lib/tools/edu'

/* --------------------------------------------------- number → 中文大写 */

export function NumberToCnTool() {
  const [input, setInput] = useState('1234.56')

  const output = useMemo(() => {
    const n = Number(input)
    return Number.isFinite(n) ? numberToChineseAmount(n) : ''
  }, [input])

  return (
    <Panel title="数字转金额大写" hint="用于票据、合同等场景的人民币大写">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        inputMode="decimal"
        className="field font-mono"
        aria-label="数字"
      />
      <div className="mt-4 rounded-xl border border-brand/30 bg-brand/8 p-4">
        <p className="break-all text-xl font-black tracking-tight text-brand">{output || '—'}</p>
      </div>
      <div className="mt-3">
        <CopyButton value={output} disabled={!output} />
      </div>
    </Panel>
  )
}

/* --------------------------------------------------------- color picker */

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  return [
    parseInt(full.slice(0, 2), 16) || 0,
    parseInt(full.slice(2, 4), 16) || 0,
    parseInt(full.slice(4, 6), 16) || 0,
  ]
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')}`
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  let h = 0
  let s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6
    else if (max === gn) h = ((bn - rn) / d + 2) / 6
    else h = ((rn - gn) / d + 4) / 6
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

export function ColorPickerTool() {
  const [hex, setHex] = useState('#15803D')

  const [r, g, b] = hexToRgb(hex)
  const [h, s, l] = rgbToHsl(r, g, b)

  const formats = [
    ['HEX', hex.toUpperCase()],
    ['RGB', `rgb(${r}, ${g}, ${b})`],
    ['HSL', `hsl(${h}, ${s}%, ${l}%)`],
    ['HSB', `hsb(${h}, ${s}%, ${Math.round((Math.max(r, g, b) / 255) * 100)}%)`],
  ]

  const shades = Array.from({ length: 9 }, (_, i) => {
    const f = 0.2 + (i / 8) * 1.3
    return rgbToHex(Math.min(255, r * f), Math.min(255, g * f), Math.min(255, b * f))
  })

  return (
    <div className="space-y-4">
      <Panel title="选择颜色">
        <div className="flex flex-wrap items-center gap-4">
          <input
            type="color"
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            className="h-20 w-28 cursor-pointer rounded-2xl border border-line bg-surface p-1"
            aria-label="颜色"
          />
          <input
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            className="field w-40 font-mono"
            aria-label="HEX 值"
          />
        </div>
        <div className="mt-4 h-20 rounded-xl border border-line" style={{ background: hex }} />
      </Panel>

      <Panel title="各色彩空间">
        <div className="space-y-2">
          {formats.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between rounded-xl border border-line bg-surface-2 px-3 py-2">
              <span className="text-xs font-bold text-muted">{k}</span>
              <span className="font-mono text-[13px] font-bold">{v}</span>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="明暗阶梯" hint="点击复制">
        <div className="grid grid-cols-9 gap-1">
          {shades.map((c, i) => (
            <button
              key={i}
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(c)
              }}
              className="h-14 rounded-lg border border-line transition hover:-translate-y-0.5"
              style={{ background: c }}
              aria-label={`复制 ${c}`}
            />
          ))}
        </div>
      </Panel>
    </div>
  )
}

/* --------------------------------------------------------------- danmaku */

export function DanmakuTool() {
  const [text, setText] = useState('欢迎使用导航站')
  const [running, setRunning] = useState(false)
  const [speed, setSpeed] = useState(8)
  const [size, setSize] = useState(72)

  return (
    <div className="space-y-4">
      <Panel title="弹幕内容">
        <input value={text} onChange={(e) => setText(e.target.value)} className="field" aria-label="弹幕内容" />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-bold text-muted">
            速度：{speed}
            <input
              type="range"
              min={1}
              max={20}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="mt-1 w-full accent-[rgb(var(--c-brand))]"
            />
          </label>
          <label className="text-xs font-bold text-muted">
            字号：{size}px
            <input
              type="range"
              min={24}
              max={160}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="mt-1 w-full accent-[rgb(var(--c-brand))]"
            />
          </label>
        </div>
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={() => setRunning((v) => !v)}>
            {running ? '停止' : '开始滚动'}
          </Button>
        </div>
      </Panel>

      <div className="relative h-40 overflow-hidden rounded-xl border border-line bg-[#0B0F0D]">
        {running && (
          <div
            className="whitespace-nowrap font-black text-white"
            style={{
              fontSize: size,
              lineHeight: '160px',
              animation: `danmaku ${21 - speed}s linear infinite`,
            }}
          >
            {text || ' '}
          </div>
        )}
        {!running && (
          <p className="grid h-full place-items-center text-sm text-white/60">点击「开始滚动」预览</p>
        )}
      </div>
    </div>
  )
}
