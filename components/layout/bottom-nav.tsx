'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Compass, Wrench, Search, Radio } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Mobile bottom navigation — mirrors the desktop sidebar. */
export function BottomNav() {
  const pathname = usePathname()

  const focusSearch = () => {
    const el = document.getElementById('site-search') as HTMLInputElement | null
    if (el) {
      el.scrollIntoView({ block: 'center', behavior: 'smooth' })
      el.focus({ preventScroll: true })
      return
    }
    window.location.href = '/'
  }

  const base =
    'relative flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-2 text-[11px] font-bold transition duration-200 ease-smooth'

  return (
    <nav
      aria-label="主导航"
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/90 backdrop-blur-xl lg:hidden"
    >
      <div className="flex items-stretch gap-1 px-3 pb-2 pt-1.5">
        <Link
          href="/"
          aria-label="全部站点"
          className={cn(base, pathname === '/' ? 'text-brand' : 'text-muted active:scale-95')}
        >
          <Compass
            className={cn(
              'h-5 w-5 transition-transform duration-200',
              pathname === '/' && 'scale-110',
            )}
            aria-hidden
          />
          站点
          {pathname === '/' && (
            <span className="absolute -top-0.5 h-1 w-8 rounded-full bg-brand animate-pop-in" aria-hidden />
          )}
        </Link>

        <Link
          href="/tools"
          aria-label="工具箱"
          className={cn(
            base,
            pathname.startsWith('/tools') ? 'text-brand' : 'text-muted active:scale-95',
          )}
        >
          <Wrench
            className={cn(
              'h-5 w-5 transition-transform duration-200',
              pathname.startsWith('/tools') && 'scale-110',
            )}
            aria-hidden
          />
          工具
          {pathname.startsWith('/tools') && (
            <span className="absolute -top-0.5 h-1 w-8 rounded-full bg-brand animate-pop-in" aria-hidden />
          )}
        </Link>

        <button
          type="button"
          onClick={focusSearch}
          aria-label="搜索站点"
          className={cn(base, 'text-muted active:scale-95')}
        >
          <Search className="h-5 w-5" aria-hidden />
          搜索
        </button>

        <Link
          href="/uapi"
          aria-label="UAPI 实验室"
          className={cn(base, pathname.startsWith('/uapi') ? 'text-brand' : 'text-muted active:scale-95')}
        >
          <Radio
            className={cn(
              'h-5 w-5 transition-transform duration-200',
              pathname.startsWith('/uapi') && 'scale-110',
            )}
            aria-hidden
          />
          热榜
          {pathname.startsWith('/uapi') && (
            <span className="absolute -top-0.5 h-1 w-8 rounded-full bg-brand animate-pop-in" aria-hidden />
          )}
        </Link>
      </div>
    </nav>
  )
}
