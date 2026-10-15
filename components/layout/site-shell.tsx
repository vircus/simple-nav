'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Sidebar, MobileHeader, type NavGroup } from './sidebar'
import { BottomNav } from './bottom-nav'
import type { Category, SiteSettings } from '@/lib/types'

/**
 * Responsive shell: fixed sidebar on desktop (≥1024px),
 * header + bottom tab bar on mobile. No admin entry is ever rendered here.
 */
export function SiteShell({
  categories,
  toolCategories,
  settings,
  children,
}: {
  categories: Category[]
  toolCategories: NavGroup[]
  settings: SiteSettings
  children: React.ReactNode
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="relative z-10">
      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-[276px] border-r border-line bg-surface/70 backdrop-blur-xl lg:block">
        <Sidebar
          categories={categories}
          toolCategories={toolCategories}
          settings={settings}
        />
      </aside>

      {/* mobile header */}
      <MobileHeader settings={settings} onOpenMenu={() => setMenuOpen(true)} />

      {/* mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="关闭菜单"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
          />
          <div className="absolute inset-y-0 left-0 w-[84%] max-w-[320px] animate-fade-up border-r border-line bg-surface shadow-lift">
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="关闭菜单"
              className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-pill border border-line bg-surface-2 text-fg transition hover:rotate-90 active:scale-90"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
            <Sidebar
              categories={categories}
              toolCategories={toolCategories}
              settings={settings}
              onNavigate={() => setMenuOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="lg:pl-[276px]">
        <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-5 lg:px-8 lg:pb-16 lg:pt-10">
          {children}
        </main>
      </div>

      <BottomNav />
    </div>
  )
}
