import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function uid(prefix = ''): string {
  const raw =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36)
  return prefix ? `${prefix}_${raw}` : raw
}

/**
 * Determine whether a URL belongs to the configured primary domain.
 * Used ONLY to render the "本站" badge — it never affects navigation.
 */
export function isInternalUrl(url: string, primaryDomain?: string): boolean {
  if (!primaryDomain) return false
  const domain = primaryDomain.trim().toLowerCase().replace(/^\*\./, '')
  if (!domain) return false
  try {
    const host = new URL(url).hostname.toLowerCase()
    return host === domain || host.endsWith(`.${domain}`)
  } catch {
    return false
  }
}

/** Guard against javascript:, data:, vbscript: — only http(s) is allowed. */
export function isSafeHttpUrl(url: string): boolean {
  try {
    const { protocol } = new URL(url)
    return protocol === 'http:' || protocol === 'https:'
  } catch {
    return false
  }
}

export function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return ''
  }
}

export function faviconFor(url: string): string {
  try {
    const { origin } = new URL(url)
    return `${origin}/favicon.ico`
  } catch {
    return ''
  }
}

/**
 * Stable rotation across the accent palette.
 * `coral` is intentionally excluded — it is reserved for error states,
 * so decorative rotation stays inside the green / grey ramp.
 */
export const ACCENT_KEYS = ['brand', 'accent', 'solar', 'pop', 'flash'] as const
export type AccentKey = (typeof ACCENT_KEYS)[number]

export function accentFor(index: number): AccentKey {
  return ACCENT_KEYS[index % ACCENT_KEYS.length]
}

export const ACCENT_TEXT: Record<string, string> = {
  brand: 'text-brand',
  accent: 'text-accent',
  solar: 'text-solar',
  pop: 'text-pop',
  flash: 'text-flash',
  coral: 'text-coral',
}

export const ACCENT_SOFT: Record<string, string> = {
  brand: 'bg-brand/12 text-brand',
  accent: 'bg-accent/12 text-accent',
  solar: 'bg-solar/18 text-solar',
  pop: 'bg-pop/16 text-pop',
  flash: 'bg-flash/16 text-flash',
  coral: 'bg-coral/14 text-coral',
}

export const ACCENT_DOT: Record<string, string> = {
  brand: 'bg-brand',
  accent: 'bg-accent',
  solar: 'bg-solar',
  pop: 'bg-pop',
  flash: 'bg-flash',
  coral: 'bg-coral',
}
