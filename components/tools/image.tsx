'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Download, Upload } from 'lucide-react'
import { Panel, Segmented, CopyButton, OutputBox, Checkbox } from './shared'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------- helpers */

async function loadImage(file: File): Promise<{ img: HTMLImageElement; dataUrl: string }> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => resolve(fr.result as string)
    fr.onerror = () => reject(new Error('读取文件失败'))
    fr.readAsDataURL(file)
  })
  const img = new Image()
  img.src = dataUrl
  await img.decode()
  return { img, dataUrl }
}

function canvasToDataUrl(c: HTMLCanvasElement, type: string, quality?: number): string {
  return c.toDataURL(type, quality)
}

function download(dataUrl: string, filename: string) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  a.click()
}

function FilePicker({
  onPick,
  label = '选择图片',
}: {
  onPick: (file: File) => void
  label?: string
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 rounded-pill border border-line bg-surface px-4 py-2.5 text-sm font-bold transition duration-200 hover:-translate-y-0.5 hover:border-brand/50">
      <Upload className="h-4 w-4" aria-hidden />
      {label}
      <input
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onPick(f)
        }}
      />
    </label>
  )
}

/* ------------------------------------------------------- image ↔ base64 */

export function ImageBase64Tool() {
  const [dataUrl, setDataUrl] = useState('')
  const [text, setText] = useState('')
  const [error, setError] = useState('')

  const fromText = () => {
    setError('')
    const t = text.trim()
    if (!t) return
    const url = t.startsWith('data:') ? t : `data:image/png;base64,${t}`
    setDataUrl(url)
  }

  return (
    <div className="space-y-4">
      <Panel title="图片 → Base64">
        <FilePicker
          onPick={async (f) => {
            try {
              const { dataUrl: d } = await loadImage(f)
              setDataUrl(d)
              setText(d)
              setError('')
            } catch {
              setError('图片读取失败')
            }
          }}
        />
        {dataUrl && (
          <div className="mt-3 grid place-items-center rounded-xl border border-dashed border-line bg-surface-2 p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={dataUrl} alt="预览" className="max-h-56 rounded-xl object-contain" />
          </div>
        )}
      </Panel>

      <Panel title="Base64 文本" action={<CopyButton value={text} disabled={!text} />}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="粘贴 Base64 或 data URL 后点击「生成图片」"
          className="field min-h-[120px] resize-y font-mono text-[12px]"
          aria-label="Base64 文本"
        />
        <Button className="mt-2" size="sm" onClick={fromText} disabled={!text.trim()}>
          生成图片
        </Button>
        {error && <p className="mt-2 text-sm text-coral">{error}</p>}
      </Panel>
    </div>
  )
}

/* -------------------------------------------------------- image compress */

export function ImageCompressTool() {
  const [src, setSrc] = useState<HTMLImageElement | null>(null)
  const [quality, setQuality] = useState(0.7)
  const [scale, setScale] = useState(100)
  const [out, setOut] = useState('')

  const run = useCallback(() => {
    if (!src) return
    const c = document.createElement('canvas')
    c.width = Math.round(src.width * (scale / 100))
    c.height = Math.round(src.height * (scale / 100))
    const ctx = c.getContext('2d')
    if (!ctx) return
    ctx.drawImage(src, 0, 0, c.width, c.height)
    setOut(canvasToDataUrl(c, 'image/jpeg', quality))
  }, [src, quality, scale])

  useEffect(() => {
    run()
  }, [run])

  return (
    <div className="space-y-4">
      <Panel title="选择图片">
        <FilePicker
          onPick={async (f) => {
            try {
              const { img } = await loadImage(f)
              setSrc(img)
            } catch {
              toast('图片读取失败', 'err')
            }
          }}
        />
      </Panel>

      {src && (
        <>
          <Panel title="参数">
            <div className="space-y-3">
              <label className="block text-xs font-bold text-muted">
                质量：{Math.round(quality * 100)}%
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={quality * 100}
                  onChange={(e) => setQuality(Number(e.target.value) / 100)}
                  className="mt-1 w-full accent-[rgb(var(--c-brand))]"
                />
              </label>
              <label className="block text-xs font-bold text-muted">
                缩放：{scale}%
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="mt-1 w-full accent-[rgb(var(--c-brand))]"
                />
              </label>
            </div>
            <p className="mt-2 text-xs text-muted">
              原图 {src.width}×{src.height} → 输出 {Math.round(src.width * (scale / 100))}×
              {Math.round(src.height * (scale / 100))}
            </p>
          </Panel>

          {out && (
            <Panel
              title="压缩结果"
              action={
                <Button size="sm" variant="outline" onClick={() => download(out, 'compressed.jpg')}>
                  <Download className="h-3.5 w-3.5" />
                  下载
                </Button>
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={out} alt="压缩结果" className="max-h-64 rounded-xl object-contain" />
              <p className="mt-2 text-xs text-muted">
                约 {Math.round((out.length * 0.75) / 1024)} KB（Base64 估算）
              </p>
            </Panel>
          )}
        </>
      )}
    </div>
  )
}

/* --------------------------------------------------------- png / jpg */

export function ImageConvertTool() {
  const [src, setSrc] = useState<HTMLImageElement | null>(null)
  const [type, setType] = useState<'image/png' | 'image/jpeg'>('image/jpeg')
  const [out, setOut] = useState('')

  useEffect(() => {
    if (!src) return
    const c = document.createElement('canvas')
    c.width = src.width
    c.height = src.height
    const ctx = c.getContext('2d')
    if (!ctx) return
    if (type === 'image/jpeg') {
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, c.width, c.height)
    }
    ctx.drawImage(src, 0, 0)
    setOut(canvasToDataUrl(c, type, 0.92))
  }, [src, type])

  return (
    <div className="space-y-4">
      <Panel
        title="选择图片"
        action={
          <Segmented
            value={type}
            onChange={setType}
            options={[
              { value: 'image/jpeg', label: '转 JPG' },
              { value: 'image/png', label: '转 PNG' },
            ]}
          />
        }
      >
        <FilePicker
          onPick={async (f) => {
            try {
              const { img } = await loadImage(f)
              setSrc(img)
            } catch {
              toast('读取失败', 'err')
            }
          }}
        />
      </Panel>

      {out && (
        <Panel
          title="转换结果"
          action={
            <Button size="sm" variant="outline" onClick={() => download(out, type === 'image/png' ? 'converted.png' : 'converted.jpg')}>
              <Download className="h-3.5 w-3.5" />
              下载
            </Button>
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={out} alt="转换结果" className="max-h-64 rounded-xl object-contain" />
        </Panel>
      )}
    </div>
  )
}

/* ---------------------------------------------------------- image split */

export function ImageSplitTool() {
  const [src, setSrc] = useState<HTMLImageElement | null>(null)
  const [rows, setRows] = useState(3)
  const [cols, setCols] = useState(3)
  const [tiles, setTiles] = useState<string[]>([])

  const run = useCallback(() => {
    if (!src) return
    const tw = Math.floor(src.width / cols)
    const th = Math.floor(src.height / rows)
    const out: string[] = []
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const canvas = document.createElement('canvas')
        canvas.width = tw
        canvas.height = th
        const ctx = canvas.getContext('2d')
        if (!ctx) continue
        ctx.drawImage(src, c * tw, r * th, tw, th, 0, 0, tw, th)
        out.push(canvasToDataUrl(canvas, 'image/png'))
      }
    }
    setTiles(out)
  }, [src, rows, cols])

  useEffect(() => {
    run()
  }, [run])

  const downloadAll = () => {
    tiles.forEach((t, i) => download(t, `tile-${i + 1}.png`))
    toast(`已导出 ${tiles.length} 张`, 'ok')
  }

  return (
    <div className="space-y-4">
      <Panel title="选择图片">
        <FilePicker
          onPick={async (f) => {
            try {
              const { img } = await loadImage(f)
              setSrc(img)
            } catch {
              toast('读取失败', 'err')
            }
          }}
        />
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="text-xs font-bold text-muted">
            行
            <input
              type="number"
              min={1}
              max={10}
              value={rows}
              onChange={(e) => setRows(Number(e.target.value))}
              className="field mt-1 w-20 font-mono"
            />
          </label>
          <label className="text-xs font-bold text-muted">
            列
            <input
              type="number"
              min={1}
              max={10}
              value={cols}
              onChange={(e) => setCols(Number(e.target.value))}
              className="field mt-1 w-20 font-mono"
            />
          </label>
          {tiles.length > 0 && (
            <Button size="sm" onClick={downloadAll}>
              <Download className="h-3.5 w-3.5" />
              打包下载
            </Button>
          )}
        </div>
      </Panel>

      {tiles.length > 0 && (
        <Panel title={`分割结果（${tiles.length} 张）`}>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {tiles.map((t, i) => (
              <button
                key={i}
                type="button"
                onClick={() => download(t, `tile-${i + 1}.png`)}
                className="group relative overflow-hidden rounded-xl border border-line transition hover:-translate-y-0.5"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={t} alt={`分片 ${i + 1}`} className="w-full object-cover" />
              </button>
            ))}
          </div>
        </Panel>
      )}
    </div>
  )
}

/* ------------------------------------------------------------ watermark */

export function ImageWatermarkTool() {
  const [src, setSrc] = useState<HTMLImageElement | null>(null)
  const [text, setText] = useState('仅供示例')
  const [opacity, setOpacity] = useState(0.4)
  const [out, setOut] = useState('')

  useEffect(() => {
    if (!src) return
    const c = document.createElement('canvas')
    c.width = src.width
    c.height = src.height
    const ctx = c.getContext('2d')
    if (!ctx) return
    ctx.drawImage(src, 0, 0)
    if (text) {
      ctx.save()
      ctx.globalAlpha = opacity
      ctx.fillStyle = '#FFFFFF'
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = Math.max(1, src.width / 500)
      const size = Math.max(14, Math.round(src.width / 20))
      ctx.font = `bold ${size}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const step = size * 2.4
      for (let y = step; y < c.height; y += step) {
        for (let x = step; x < c.width; x += step * 4) {
          ctx.save()
          ctx.translate(x, y)
          ctx.rotate(-Math.PI / 6)
          ctx.strokeText(text, 0, 0)
          ctx.fillText(text, 0, 0)
          ctx.restore()
        }
      }
      ctx.restore()
    }
    setOut(canvasToDataUrl(c, 'image/png'))
  }, [src, text, opacity])

  return (
    <div className="space-y-4">
      <Panel title="选择图片">
        <FilePicker
          onPick={async (f) => {
            try {
              const { img } = await loadImage(f)
              setSrc(img)
            } catch {
              toast('读取失败', 'err')
            }
          }}
        />
      </Panel>

      {src && (
        <Panel title="水印设置">
          <input value={text} onChange={(e) => setText(e.target.value)} className="field" placeholder="水印文字" aria-label="水印文字" />
          <label className="mt-3 block text-xs font-bold text-muted">
            透明度：{Math.round(opacity * 100)}%
            <input
              type="range"
              min={5}
              max={100}
              value={opacity * 100}
              onChange={(e) => setOpacity(Number(e.target.value) / 100)}
              className="mt-1 w-full accent-[rgb(var(--c-brand))]"
            />
          </label>
        </Panel>
      )}

      {out && (
        <Panel
          title="结果"
          action={
            <Button size="sm" variant="outline" onClick={() => download(out, 'watermarked.png')}>
              <Download className="h-3.5 w-3.5" />
              下载
            </Button>
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={out} alt="水印结果" className="max-h-64 rounded-xl object-contain" />
        </Panel>
      )}
    </div>
  )
}

/* -------------------------------------------------------------- palette */

export function ImagePaletteTool() {
  const [colors, setColors] = useState<{ hex: string; count: number }[]>([])

  const extract = async (file: File) => {
    try {
      const { img } = await loadImage(file)
      const c = document.createElement('canvas')
      const w = 160
      const h = Math.max(1, Math.round((img.height / img.width) * 160))
      c.width = w
      c.height = h
      const ctx = c.getContext('2d')
      if (!ctx) return
      ctx.drawImage(img, 0, 0, w, h)
      const { data } = ctx.getImageData(0, 0, w, h)
      const map = new Map<string, number>()
      for (let i = 0; i < data.length; i += 4) {
        // 量化到 5 bit，减少颜色碎片
        const r = data[i] >> 3
        const g = data[i + 1] >> 3
        const b = data[i + 2] >> 3
        const key = `${r},${g},${b}`
        map.set(key, (map.get(key) ?? 0) + 1)
      }
      const list = [...map.entries()]
        .map(([k, count]) => {
          const [r, g, b] = k.split(',').map(Number)
          const hex = `#${[r << 3, g << 3, b << 3].map((v) => Math.min(255, v).toString(16).padStart(2, '0')).join('')}`
          return { hex, count }
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 24)
      setColors(list)
    } catch {
      toast('读取失败', 'err')
    }
  }

  return (
    <div className="space-y-4">
      <Panel title="选择图片">
        <FilePicker onPick={extract} />
      </Panel>

      {colors.length > 0 && (
        <Panel title="主色调" hint="点击色块复制 HEX">
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {colors.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(c.hex)
                  toast(`已复制 ${c.hex}`, 'ok')
                }}
                className="group overflow-hidden rounded-xl border border-line transition hover:-translate-y-0.5"
              >
                <span className="block h-14 w-full" style={{ background: c.hex }} />
                <span className="block bg-surface px-1 py-1 font-mono text-[10px] font-bold">{c.hex}</span>
              </button>
            ))}
          </div>
        </Panel>
      )}
    </div>
  )
}

/* -------------------------------------------------------- text to image */

export function TextToImageTool() {
  const [text, setText] = useState('把这段文字\n转换成图片')
  const [bg, setBg] = useState('#FFFFFF')
  const [fg, setFg] = useState('#111816')
  const [size, setSize] = useState(28)
  const [out, setOut] = useState('')

  useEffect(() => {
    const lines = text.split('\n')
    const padding = 40
    const lh = Math.round(size * 1.6)
    const c = document.createElement('canvas')
    c.width = 900
    c.height = Math.max(200, padding * 2 + lines.length * lh)
    const ctx = c.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, c.width, c.height)
    ctx.fillStyle = fg
    ctx.font = `${size}px sans-serif`
    ctx.textBaseline = 'top'
    lines.forEach((line, i) => ctx.fillText(line, padding, padding + i * lh))
    setOut(canvasToDataUrl(c, 'image/png'))
  }, [text, bg, fg, size])

  return (
    <div className="space-y-4">
      <Panel title="文本">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="field min-h-[140px] resize-y"
          aria-label="文本"
        />
        <div className="mt-3 flex flex-wrap items-end gap-4">
          <label className="text-xs font-bold text-muted">
            背景
            <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="mt-1 h-11 w-16 cursor-pointer rounded-xl border border-line bg-surface p-1" />
          </label>
          <label className="text-xs font-bold text-muted">
            文字
            <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="mt-1 h-11 w-16 cursor-pointer rounded-xl border border-line bg-surface p-1" />
          </label>
          <label className="text-xs font-bold text-muted">
            字号
            <input type="number" min={12} max={72} value={size} onChange={(e) => setSize(Number(e.target.value))} className="field mt-1 w-24 font-mono" />
          </label>
        </div>
      </Panel>

      {out && (
        <Panel
          title="预览"
          action={
            <Button size="sm" variant="outline" onClick={() => download(out, 'text.png')}>
              <Download className="h-3.5 w-3.5" />
              下载
            </Button>
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={out} alt="生成的图片" className="w-full rounded-xl" />
        </Panel>
      )}
    </div>
  )
}

/* -------------------------------------------------------------- favicon */

const FAVICON_SIZES = [16, 32, 48, 64, 128, 180, 192, 256, 512]

export function FaviconTool() {
  const [src, setSrc] = useState<HTMLImageElement | null>(null)
  const [icons, setIcons] = useState<{ size: number; url: string }[]>([])

  useEffect(() => {
    if (!src) return
    setIcons(
      FAVICON_SIZES.map((size) => {
        const c = document.createElement('canvas')
        c.width = size
        c.height = size
        const ctx = c.getContext('2d')
        if (!ctx) return { size, url: '' }
        ctx.drawImage(src, 0, 0, size, size)
        return { size, url: canvasToDataUrl(c, 'image/png') }
      }),
    )
  }, [src])

  return (
    <div className="space-y-4">
      <Panel title="选择图片" hint="建议使用正方形原图">
        <FilePicker
          onPick={async (f) => {
            try {
              const { img } = await loadImage(f)
              setSrc(img)
            } catch {
              toast('读取失败', 'err')
            }
          }}
        />
      </Panel>

      {icons.length > 0 && (
        <Panel title="生成的图标" hint="点击下载">
          <div className="flex flex-wrap gap-3">
            {icons.map((i) => (
              <button
                key={i.size}
                type="button"
                onClick={() => download(i.url, `favicon-${i.size}.png`)}
                className="flex flex-col items-center gap-1 rounded-xl border border-line p-2 transition hover:-translate-y-0.5"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={i.url} alt={`${i.size}px`} width={i.size > 64 ? 64 : i.size} height={i.size > 64 ? 64 : i.size} />
                <span className="font-mono text-[10px] font-bold">{i.size}</span>
              </button>
            ))}
          </div>
        </Panel>
      )}
    </div>
  )
}

/* --------------------------------------------------------------- doodle */

export function DoodleTool() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const drawing = useRef(false)
  const [color, setColor] = useState('#15803D')
  const [width, setWidth] = useState(4)
  const [eraser, setEraser] = useState(false)
  const [history, setHistory] = useState<string[]>([])

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    c.width = 900
    c.height = 460
    const ctx = c.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, c.width, c.height)
  }, [])

  const snapshot = () => {
    const c = canvasRef.current
    if (!c) return
    setHistory((h) => [...h.slice(-19), c.toDataURL('image/png')])
  }

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current as HTMLCanvasElement
    const r = c.getBoundingClientRect()
    return { x: ((e.clientX - r.left) / r.width) * c.width, y: ((e.clientY - r.top) / r.height) * c.height }
  }

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    snapshot()
    drawing.current = true
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const { x, y } = pos(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const { x, y } = pos(e)
    ctx.strokeStyle = eraser ? '#FFFFFF' : color
    ctx.lineWidth = eraser ? width * 3 : width
    ctx.lineCap = 'round'
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const end = () => {
    drawing.current = false
  }

  const undo = () => {
    const c = canvasRef.current
    if (!c || !history.length) return
    const prev = history[history.length - 1]
    setHistory((h) => h.slice(0, -1))
    const img = new Image()
    img.onload = () => {
      const ctx = c.getContext('2d')
      ctx?.drawImage(img, 0, 0)
    }
    img.src = prev
  }

  const exportPng = () => {
    const c = canvasRef.current
    if (!c) return
    download(c.toDataURL('image/png'), 'doodle.png')
    toast('已导出 PNG', 'ok')
  }

  return (
    <div className="space-y-4">
      <Panel
        title="画板"
        action={
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={undo} disabled={!history.length}>
              撤销
            </Button>
            <Button size="sm" variant="outline" onClick={exportPng}>
              <Download className="h-3.5 w-3.5" />
              导出
            </Button>
          </div>
        }
      >
        <div className="mb-3 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-xs font-bold text-muted">
            颜色
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-14 cursor-pointer rounded-xl border border-line bg-surface p-1" />
          </label>
          <label className="flex items-center gap-2 text-xs font-bold text-muted">
            粗细
            <input
              type="range"
              min={1}
              max={40}
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              className="w-32 accent-[rgb(var(--c-brand))]"
            />
          </label>
          <Checkbox checked={eraser} onChange={setEraser} label="橡皮擦" />
        </div>

        <canvas
          ref={canvasRef}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          className="w-full touch-none rounded-xl border border-line bg-white"
          aria-label="涂鸦画板"
        />
      </Panel>
    </div>
  )
}
