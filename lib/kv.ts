import { DEFAULT_DATA } from './defaults'
import type { SiteData } from './types'

/**
 * Minimal KV interface. On EdgeOne Pages the real binding is exposed as the
 * `NAV_KV` global. Locally (and anywhere the binding is absent) we fall back
 * to an in-memory store so `next dev` works without extra setup.
 *
 * NOTE: EdgeOne Pages has no persistent filesystem — never write files here.
 */
export interface KVLike {
  get(key: string): Promise<string | null>
  put(key: string, value: string): Promise<void>
  delete(key: string): Promise<void>
}

declare global {
  // eslint-disable-next-line no-var
  var NAV_KV: KVLike | undefined
  // eslint-disable-next-line no-var
  var __NAV_FALLBACK_KV__: Map<string, string> | undefined
}

function resolveKV(): KVLike {
  const bound = globalThis.NAV_KV
  if (bound && typeof bound.get === 'function') return bound

  const store = (globalThis.__NAV_FALLBACK_KV__ ??= new Map<string, string>())
  return {
    async get(key) {
      return store.has(key) ? (store.get(key) as string) : null
    },
    async put(key, value) {
      store.set(key, value)
    },
    async delete(key) {
      store.delete(key)
    },
  }
}

export const DATA_KEYS = {
  categories: 'nav:categories',
  sites: 'nav:sites',
  tools: 'nav:tools',
  settings: 'nav:settings',
  customTools: 'nav:tools-custom',
} as const

export async function kvGet<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await resolveKV().get(key)
    if (raw == null) return fallback
    return JSON.parse(raw) as T
  } catch {
    // Corrupted payload — degrade to the default rather than crashing the site.
    return fallback
  }
}

export async function kvSet(key: string, value: unknown): Promise<void> {
  await resolveKV().put(key, JSON.stringify(value))
}

/** KV is eventually consistent; callers must not read back immediately. */
export async function readSiteData(): Promise<SiteData> {
  const [categories, sites, tools, settings, customTools] = await Promise.all([
    kvGet(DATA_KEYS.categories, DEFAULT_DATA.categories),
    kvGet(DATA_KEYS.sites, DEFAULT_DATA.sites),
    kvGet(DATA_KEYS.tools, DEFAULT_DATA.tools),
    kvGet(DATA_KEYS.settings, DEFAULT_DATA.settings),
    kvGet(DATA_KEYS.customTools, DEFAULT_DATA.customTools),
  ])
  return { categories, sites, tools, settings, customTools }
}

export async function writeCategories(value: SiteData['categories']) {
  await kvSet(DATA_KEYS.categories, value)
}

export async function writeSites(value: SiteData['sites']) {
  await kvSet(DATA_KEYS.sites, value)
}

export async function writeTools(value: SiteData['tools']) {
  await kvSet(DATA_KEYS.tools, value)
}

export async function writeSettings(value: SiteData['settings']) {
  await kvSet(DATA_KEYS.settings, value)
}

export async function writeCustomTools(value: SiteData['customTools']) {
  await kvSet(DATA_KEYS.customTools, value)
}

export function kvBackendName(): 'edgeone-kv' | 'memory-fallback' {
  return globalThis.NAV_KV ? 'edgeone-kv' : 'memory-fallback'
}
