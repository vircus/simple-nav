'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun, MonitorSmartphone } from 'lucide-react'
import type { ThemeMode } from '@/lib/types'

const ORDER: ThemeMode[] = ['system', 'light', 'dark']
const LABEL: Record<ThemeMode, string> = { system: '跟随系统', light: '浅色', dark: '深色' }

export function applyTheme(mode: ThemeMode) {
  const dark =
    mode === 'dark' ||
    (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', dark)
}

export function ThemeToggle({ className }: { className?: string }) {
  const [mode, setMode] = useState<ThemeMode>('system')

  useEffect(() => {
    const saved = (localStorage.getItem('nav-theme') as ThemeMode | null) || 'system'
    setMode(saved)
  }, [])

  useEffect(() => {
    if (mode === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const onChange = () => applyTheme('system')
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    }
  }, [mode])

  const cycle = () => {
    const next = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length]
    setMode(next)
    localStorage.setItem('nav-theme', next)
    applyTheme(next)
  }

  const Icon = mode === 'dark' ? Moon : mode === 'light' ? Sun : MonitorSmartphone

  return (
    <button
      type="button"
      onClick={cycle}
      title={`主题：${LABEL[mode]}（点击切换）`}
      aria-label={`主题：${LABEL[mode]}，点击切换`}
      className={
        'inline-flex h-10 w-10 items-center justify-center rounded-pill border border-line bg-surface text-fg transition duration-200 ease-smooth hover:-translate-y-0.5 hover:border-brand/50 hover:text-brand active:scale-95 ' +
        (className ?? '')
      }
    >
      <Icon className="h-[18px] w-[18px]" aria-hidden />
    </button>
  )
}
