import { kvGet, kvSet } from './kv'
import { uid } from './utils'
import { isSafeHttpUrl } from './utils'

const KEY = (code: string) => `link:${code}`

export interface ShortLink {
  code: string
  url: string
  createdAt: number
}

/** Short links live in the same KV namespace as site data. */
export async function createShortLink(url: string, custom?: string): Promise<ShortLink> {
  if (!isSafeHttpUrl(url)) throw new Error('仅支持 http(s) 链接')
  const code = (custom || '').trim().replace(/[^A-Za-z0-9_-]/g, '') || uid('').slice(0, 8)
  const link: ShortLink = { code, url, createdAt: Date.now() }
  await kvSet(KEY(code), link)
  return link
}

export async function resolveShortLink(code: string): Promise<ShortLink | null> {
  return kvGet<ShortLink | null>(KEY(code), null)
}
