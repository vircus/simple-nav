'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut, LayoutGrid, Link2, Wrench, Settings, ShieldCheck, PlusSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/toast'

export const ADMIN_ROBOTS = { index: false, follow: false } as const

export function AdminShell({
  base,
  title,
  children,
}: {
  base: string
  title: string
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  const items = [
    { href: base, label: '概览', Icon: LayoutGrid },
    { href: `${base}/categories`, label: '分类', Icon: LayoutGrid },
    { href: `${base}/sites`, label: '站点', Icon: Link2 },
    { href: `${base}/tools`, label: '工具', Icon: Wrench },
    { href: `${base}/tools-custom`, label: '自定义', Icon: PlusSquare },
    { href: `${base}/settings`, label: '设置', Icon: Settings },
  ]

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    toast('已退出登录', 'ok')
    router.push(`${base}/login`)
    router.refresh()
  }

  return (
    <div className="relative z-10 mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl grad-fill text-white shadow-glow">
            <ShieldCheck className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted/80">
              管理面板
            </p>
            <h1 className="text-xl font-black tracking-tight">{title}</h1>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          className="inline-flex h-10 items-center gap-2 rounded-pill border border-line bg-surface px-4 text-sm font-bold transition duration-200 hover:-translate-y-0.5 hover:border-coral/50 hover:text-coral active:scale-95"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          退出
        </button>
      </div>

      <nav className="mb-6 flex gap-1 overflow-x-auto rounded-pill border border-line bg-surface p-1 no-scrollbar">
        {items.map(({ href, label, Icon }) => {
          const active = href === base ? pathname === base : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-pill px-4 py-2 text-sm font-bold transition duration-200',
                active ? 'bg-brand text-white shadow-glow' : 'text-muted hover:bg-fg/5 hover:text-fg',
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </Link>
          )
        })}
      </nav>

      {children}
    </div>
  )
}
