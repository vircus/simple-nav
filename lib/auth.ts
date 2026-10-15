/**
 * Auth for the single-admin panel.
 *
 * Password hash lives in the ADMIN_PASSWORD_HASH env var; the session cookie is
 * an HMAC-signed expiry stamp. Everything uses Web Crypto so the same code runs
 * on Node and on the edge runtime.
 */

export const SESSION_COOKIE = 'nav_session'
const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000

/**
 * The admin panel lives at a normal, predictable path.
 * Security comes from the signed session, not from obscurity.
 */
export const ADMIN_BASE = '/admin'

function secret(): string {
  return process.env.SESSION_SECRET || 'dev-only-insecure-secret-change-me-32chars'
}

const enc = new TextEncoder()

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(input))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function hmacHex(key: string, msg: string): Promise<string> {
  const k = await crypto.subtle.importKey(
    'raw',
    enc.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', k, enc.encode(msg))
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** Generate the value expected in ADMIN_PASSWORD_HASH. */
export async function hashPassword(password: string): Promise<string> {
  return sha256Hex(`${password}:${secret()}`)
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export function adminUsername(): string {
  return (process.env.ADMIN_USERNAME || 'admin').trim()
}

/**
 * True when at least one password source is configured.
 * Used to give a clear "server not configured" error instead of a
 * misleading "wrong credentials" message.
 */
export function isCredentialConfigured(): boolean {
  return Boolean(
    (process.env.ADMIN_PASSWORD_HASH ?? '').trim() || (process.env.ADMIN_PASSWORD ?? '').trim(),
  )
}

/**
 * Credentials come from the environment:
 *   ADMIN_USERNAME        — 管理员账号（默认 admin）
 *   ADMIN_PASSWORD        — 明文密码
 *   ADMIN_PASSWORD_HASH   — 可选；配置后优先使用哈希比对
 */
export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  if (!safeEqual(username.trim(), adminUsername())) return false

  const hash = process.env.ADMIN_PASSWORD_HASH?.trim()
  if (hash) {
    return safeEqual(await hashPassword(password), hash.toLowerCase())
  }

  const plain = process.env.ADMIN_PASSWORD
  if (!plain) return false
  return safeEqual(password, plain)
}

export async function signSession(ttlMs = DEFAULT_TTL_MS): Promise<string> {
  const exp = Date.now() + ttlMs
  const payload = `v1.${exp}`
  const sig = await hmacHex(secret(), payload)
  return `${payload}.${sig}`
}

export async function verifySession(token: string | undefined | null): Promise<boolean> {
  if (!token) return false
  const parts = token.split('.')
  if (parts.length !== 3) return false
  const [v, expStr, sig] = parts
  if (v !== 'v1') return false
  const exp = Number(expStr)
  if (!Number.isFinite(exp) || Date.now() > exp) return false
  const expected = await hmacHex(secret(), `${v}.${expStr}`)
  return safeEqual(sig, expected)
}

export function parseSessionCookie(cookieHeader: string | null): string | undefined {
  if (!cookieHeader) return undefined
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=')
    if (idx === -1) continue
    const key = part.slice(0, idx).trim()
    if (key === SESSION_COOKIE) return decodeURIComponent(part.slice(idx + 1).trim())
  }
  return undefined
}

/* ----------------------------- login rate limit ---------------------------- */

declare global {
  // eslint-disable-next-line no-var
  var __NAV_LOGIN_ATTEMPTS__: Map<string, { count: number; until: number }> | undefined
}

const MAX_ATTEMPTS = 5
const LOCK_MS = 15 * 60 * 1000

export function checkRateLimit(ip: string): { ok: boolean; retryAfterSec: number } {
  const store = (globalThis.__NAV_LOGIN_ATTEMPTS__ ??= new Map())
  const hit = store.get(ip)
  if (!hit) return { ok: true, retryAfterSec: 0 }
  if (Date.now() > hit.until) {
    store.delete(ip)
    return { ok: true, retryAfterSec: 0 }
  }
  if (hit.count >= MAX_ATTEMPTS) {
    return { ok: false, retryAfterSec: Math.ceil((hit.until - Date.now()) / 1000) }
  }
  return { ok: true, retryAfterSec: 0 }
}

export function registerFailure(ip: string) {
  const store = (globalThis.__NAV_LOGIN_ATTEMPTS__ ??= new Map())
  const hit = store.get(ip)
  const fresh = !hit || Date.now() > hit.until
  store.set(ip, {
    count: fresh ? 1 : hit!.count + 1,
    until: fresh ? Date.now() + LOCK_MS : hit!.until,
  })
}

export function clearFailures(ip: string) {
  globalThis.__NAV_LOGIN_ATTEMPTS__?.delete(ip)
}
