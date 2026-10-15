'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Compass, Wrench, LayoutGrid, Sparkles, Radio } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ACCENT_DOT, accentFor } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme-toggle'
import type { Category, SiteSettings } from '@/lib/types'

export interface NavGroup {
  id: string
  label: string
}

export function Sidebar({
  categories,
  toolCategories,
  settings,
  onNavigate,
}: {
  categories: Category[]
  toolCategories: NavGroup[]
  settings: SiteSettings
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const onTools = pathname.startsWith('/tools')

  const link = (href: string, label: string, Icon: typeof Compass, active: boolean) => (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition duration-200 ease-smooth',
        active
          ? 'bg-brand/12 text-brand'
          : 'text-muted hover:bg-fg/5 hover:text-fg hover:translate-x-0.5',
      )}
    >
      <Icon className="h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110" />
      <span className="truncate">{label}</span>
      {active && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand animate-pop-in" aria-hidden />
      )}
    </Link>
  )

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-5 no-scrollbar">
      {/* brand */}
      <Link
        href="/"
        onClick={onNavigate}
        className="group flex items-center gap-3 rounded-2xl px-1 py-1 transition duration-200 hover:translate-x-0.5"
      >
        <span className="grid h-11 w-11 place-items-center rounded-2xl grad-fill text-lg font-black text-white shadow-glow transition-transform duration-300 ease-spring group-hover:rotate-6 group-hover:scale-105">
          {(settings.title || 'N').slice(0, 1)}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-base font-extrabold tracking-tight grad-text">
            {settings.title}
          </span>
          {settings.subtitle && (
            <span className="block truncate text-xs font-medium text-muted">
              {settings.subtitle}
            </span>
          )}
        </span>
      </Link>

      {/* primary */}
      <nav className="space-y-1">
        <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-muted/80">
          导航
        </p>
        {link('/', '全部站点', Compass, pathname === '/')}
        {link('/tools', '工具箱', Wrench, onTools)}
        {link('/uapi', 'UAPI 实验室', Radio, pathname.startsWith('/uapi'))}
      </nav>

      {/* 分类随当前页面切换：工具箱页显示工具分类，其余显示站点分类 */}
      {onTools ? (
        toolCategories.length > 0 && (
          <nav className="space-y-1">
            <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-muted/80">
              工具分类
            </p>
            {toolCategories.map((g) => (
              <Link
                key={g.id}
                href={`/tools#tool-cat-${g.id}`}
                onClick={onNavigate}
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted transition duration-200 ease-smooth hover:bg-fg/5 hover:text-fg hover:translate-x-0.5"
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full bg-brand transition-transform duration-200 group-hover:scale-150"
                  aria-hidden
                />
                <span className="truncate">{g.label}</span>
              </Link>
            ))}
          </nav>
        )
      ) : (
        categories.length > 0 && (
          <nav className="space-y-1">
            <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-muted/80">
              分类
            </p>
            {categories.map((c, i) => {
              const key = accentFor(i)
              return (
                <a
                  key={c.id}
                  href={`#cat-${c.id}`}
                  onClick={onNavigate}
                  className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted transition duration-200 ease-smooth hover:bg-fg/5 hover:text-fg hover:translate-x-0.5"
                >
                  <span
                    className={cn(
                      'h-2 w-2 shrink-0 rounded-full transition-transform duration-200 group-hover:scale-150',
                      ACCENT_DOT[key],
                    )}
                    aria-hidden
                  />
                  <span className="truncate">{c.name}</span>
                </a>
              )
            })}
          </nav>
        )
      )}

      <div className="mt-auto space-y-4">
        <div className="rounded-2xl border border-dashed border-brand/30 bg-brand/5 p-3.5">
          <p className="flex items-center gap-1.5 text-xs font-bold text-brand">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            快捷操作
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-muted">
            按 <kbd className="rounded bg-fg/10 px-1 py-0.5 font-mono text-[11px]">Ctrl</kbd>
            {' + '}
            <kbd className="rounded bg-fg/10 px-1 py-0.5 font-mono text-[11px]">K</kbd> 快速搜索站点
          </p>
        </div>

        <div className="flex items-center justify-between px-1">
          {settings.footerText && (
            <p className="max-w-[10rem] truncate text-[11px] text-muted/80">{settings.footerText}</p>
          )}
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}

export function MobileBrand({ settings }: { settings: SiteSettings }) {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl grad-fill text-base font-black text-white shadow-glow">
        {(settings.title || 'N').slice(0, 1)}
      </span>
      <span className="truncate text-sm font-extrabold tracking-tight grad-text">
        {settings.title}
      </span>
    </Link>
  )
}

export function MobileHeader({
  settings,
  onOpenMenu,
}: {
  settings: SiteSettings
  onOpenMenu: () => void
}) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-line bg-bg/85 px-4 py-3 backdrop-blur-xl lg:hidden">
      <MobileBrand settings={settings} />
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="打开分类菜单"
          className="inline-flex h-10 w-10 items-center justify-center rounded-pill border border-line bg-surface text-fg transition duration-200 hover:-translate-y-0.5 hover:border-brand/50 active:scale-95"
        >
          <LayoutGrid className="h-[18px] w-[18px]" aria-hidden />
        </button>
      </div>
    </header>
  )
}
