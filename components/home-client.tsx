'use client'

import { useEffect, useMemo, useState } from 'react'
import { Sparkles, Compass } from 'lucide-react'
import { SearchBox } from '@/components/search-box'
import { HotBoard } from '@/components/hot-board'
import { SiteCard } from '@/components/site-card'
import { Reveal } from '@/components/fx/reveal'
import { ACCENT_DOT, accentFor, cn, hostnameOf } from '@/lib/utils'
import type { PublicSiteData, Site } from '@/lib/types'

export function HomeClient({ data }: { data: PublicSiteData }) {
  const [q, setQ] = useState('')
  const { categories, sites, settings } = data

  const query = q.trim().toLowerCase()
  const matches = (s: Site) =>
    !query ||
    s.name.toLowerCase().includes(query) ||
    (s.description ?? '').toLowerCase().includes(query) ||
    hostnameOf(s.url).toLowerCase().includes(query)

  const groups = useMemo(
    () =>
      categories
        .map((cat, ci) => ({
          cat,
          ci,
          items: sites.filter((s) => s.categoryId === cat.id && matches(s)),
        }))
        .filter((g) => g.items.length > 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [categories, sites, query],
  )

  const total = groups.reduce((n, g) => n + g.items.length, 0)
  const internalCount = sites.filter((s) => s.isInternal).length

  return (
    <div>
      {/* hero + 热点板块：PC 端左右分栏，热点板块靠右且紧凑 */}
      <div className="mb-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-stretch">
        {/* hero */}
        <section className="flex flex-col">
          <span className="chip mb-3 bg-brand/12 text-brand animate-pop-in">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            一站式入口
          </span>
          <SayingHero fallback={'站点 · 工具\n一处直达'} />
          <div className="mt-5 flex flex-wrap gap-2">
            <Stat label="站点" value={sites.length} accent="brand" />
            <Stat label="分类" value={categories.length} accent="flash" />
            <Stat label="工具" value={data.tools.length} accent="pop" />
            {internalCount > 0 && <Stat label="本站" value={internalCount} accent="accent" />}
          </div>
        </section>

        {/* 热点板块：直接作为栅格项，stretch 使其高度与左侧 Hero 对齐 */}
        <HotBoard compact />
      </div>

      {/* search */}
      <div className="mb-8">
        <SearchBox value={q} onChange={setQ} resultCount={total} />
      </div>

      {/* groups */}
      {groups.length === 0 ? (
        <div className="card grid place-items-center gap-3 p-12 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl grad-fill text-2xl animate-float">
            <Compass className="h-6 w-6 text-white" aria-hidden />
          </span>
          <p className="text-base font-extrabold">没有匹配的站点</p>
          <p className="max-w-sm text-sm text-muted">
            {query ? '换个关键词试试，或清空搜索查看全部。' : '还没有任何站点，前往管理面板添加第一个吧。'}
          </p>
        </div>
      ) : (
        groups.map(({ cat, ci, items }) => {
          const key = accentFor(ci)
          return (
            <section key={cat.id} id={`cat-${cat.id}`} className="mb-10 scroll-mt-24">
              <div className="mb-4 flex items-center gap-2.5">
                <span
                  className={cn('h-2.5 w-2.5 rounded-full', ACCENT_DOT[key])}
                  aria-hidden
                />
                <h2 className="text-lg font-black tracking-tight">{cat.name}</h2>
                <span className="chip bg-surface-2 text-muted">{items.length}</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((s, i) => (
                  <Reveal key={s.id} delay={Math.min(i, 8) * 60}>
                    <SiteCard site={s} accentIndex={i} />
                  </Reveal>
                ))}
              </div>
            </section>
          )
        })
      )}
    </div>
  )
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string
  value: number
  accent: 'brand' | 'flash' | 'pop' | 'accent'
}) {
  const tone = {
    brand: 'border-brand/25 bg-brand/10 text-brand',
    flash: 'border-flash/25 bg-flash/10 text-flash',
    pop: 'border-pop/25 bg-pop/12 text-pop',
    accent: 'border-accent/25 bg-accent/10 text-accent',
  }[accent]
  return (
    <span
      className={cn(
        'chip border px-3 py-1.5 text-[13px] transition duration-200 hover:-translate-y-0.5',
        tone,
      )}
    >
      <b className="font-black tabular-nums">{value}</b>
      <span className="font-semibold opacity-80">{label}</span>
    </span>
  )
}

/**
 * Hero 主文案：来自管理面板配置的一言接口（uapis 为主源，hitokoto 备用）。
 * 接口失败或加载中时回退到固定文案，保证首屏不空白。
 */
function SayingHero({ fallback }: { fallback: string }) {
  const [saying, setSaying] = useState<{ text: string; from: string } | null>(null)

  useEffect(() => {
    let alive = true
    fetch('/api/saying', { cache: 'no-store' })
      .then((r) => r.json())
      .then((j) => {
        if (alive && j?.text) setSaying({ text: String(j.text), from: String(j.from ?? '') })
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  return (
    <div className="mt-1">
      <h1 className="text-balance font-black leading-[1.2] tracking-tight text-2xl sm:text-3xl lg:text-[2.4rem]">
        <span className="grad-text line-clamp-3 whitespace-pre-line">{saying?.text || fallback}</span>
      </h1>
      {saying?.from && (
        <p className="mt-2 text-sm font-semibold text-muted">—— {saying.from}</p>
      )}
    </div>
  )
}
