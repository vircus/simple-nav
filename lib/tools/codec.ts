/* ------------------------------------------------------------------ base64 */

export function b64encode(input: string): string {
  const bytes = new TextEncoder().encode(input)
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin)
}

export function b64decode(input: string): string {
  const clean = input.replace(/\s+/g, '')
  const bin = atob(clean)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new TextDecoder().decode(bytes)
}

/* ------------------------------------------------------------------ URL */

export function urlEncode(input: string): string {
  return encodeURIComponent(input)
}

export function urlDecode(input: string): string {
  return decodeURIComponent(input.replace(/\+/g, ' '))
}

/* ------------------------------------------------------------------ JSON */

export type JsonResult =
  | { ok: true; text: string }
  | { ok: false; error: string; line?: number; column?: number }

export function formatJson(input: string, indent = 2): JsonResult {
  if (!input.trim()) return { ok: false, error: '输入为空' }
  try {
    return { ok: true, text: JSON.stringify(JSON.parse(input), null, indent) }
  } catch (err) {
    return { ok: false, error: describeJsonError(err, input) }
  }
}

export function minifyJson(input: string): JsonResult {
  if (!input.trim()) return { ok: false, error: '输入为空' }
  try {
    return { ok: true, text: JSON.stringify(JSON.parse(input)) }
  } catch (err) {
    return { ok: false, error: describeJsonError(err, input) }
  }
}

/** Pull a human-readable position out of the parser error when possible. */
function describeJsonError(err: unknown, input: string): string {
  const raw = err instanceof Error ? err.message : String(err)
  const posMatch = /position (\d+)/i.exec(raw)
  if (posMatch) {
    const pos = Number(posMatch[1])
    const before = input.slice(0, pos)
    const line = before.split('\n').length
    const column = pos - before.lastIndexOf('\n')
    return `${raw}（第 ${line} 行，第 ${column} 列）`
  }
  return raw
}

/* -------------------------------------------------------------- timestamp */

export function timestampToDate(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''
  const num = Number(trimmed)
  if (!Number.isFinite(num)) return '无效的 Unix 时间戳'
  // seconds vs milliseconds
  const ms = Math.abs(num) < 1e11 ? num * 1000 : num
  const d = new Date(ms)
  if (Number.isNaN(d.getTime())) return '无效的 Unix 时间戳'
  return formatDate(d)
}

export function dateToTimestamp(value: string): string {
  if (!value.trim()) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '无效的日期时间'
  return String(Math.floor(d.getTime() / 1000))
}

function pad(n: number, len = 2): string {
  return String(n).padStart(len, '0')
}

export function formatDate(d: Date): string {
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  )
}

/** Local datetime value suitable for <input type="datetime-local"> */
export function toInputDateTime(d: Date): string {
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  )
}

/* ------------------------------------------------------------ base convert */

const DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz'

export function convertBase(value: string, from: number, to: number): string {
  const raw = value.trim().toLowerCase()
  if (!raw) return ''
  let negative = false
  let body = raw
  if (body.startsWith('-')) {
    negative = true
    body = body.slice(1)
  }
  if (!body) return ''

  let acc = 0n
  const base = BigInt(from)
  for (const ch of body) {
    const d = DIGITS.indexOf(ch)
    if (d < 0 || d >= from) throw new Error(`"${ch}" 不是 ${from} 进制的有效字符`)
    acc = acc * base + BigInt(d)
  }
  const out = acc.toString(to)
  return negative ? `-${out}` : out
}

/* ------------------------------------------------------------------- hash */

export function md5(message: string): string {
  const msg = new TextEncoder().encode(message)
  const bitLen = msg.length * 8
  const padTo = (((msg.length + 9) + 63) >> 6) << 6
  const buf = new Uint8Array(padTo)
  buf.set(msg)
  buf[msg.length] = 0x80
  const dv = new DataView(buf.buffer)
  dv.setUint32(padTo - 8, bitLen >>> 0, true)
  dv.setUint32(padTo - 4, Math.floor(bitLen / 4294967296), true)

  const K = md5K()
  const S = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ]

  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476
  const M = new Uint32Array(16)

  for (let off = 0; off < padTo; off += 64) {
    for (let j = 0; j < 16; j++) M[j] = dv.getUint32(off + j * 4, true)
    let A = a0, B = b0, C = c0, D = d0

    for (let i = 0; i < 64; i++) {
      let F: number
      let g: number
      if (i < 16) {
        F = (B & C) | (~B & D)
        g = i
      } else if (i < 32) {
        F = (D & B) | (~D & C)
        g = (5 * i + 1) % 16
      } else if (i < 48) {
        F = B ^ C ^ D
        g = (3 * i + 5) % 16
      } else {
        F = C ^ (B | ~D)
        g = (7 * i) % 16
      }
      const sum = (F + A + K[i] + M[g]) >>> 0
      const rot = ((sum << S[i]) | (sum >>> (32 - S[i]))) >>> 0
      A = D
      D = C
      C = B
      B = (B + rot) >>> 0
    }

    a0 = (a0 + A) >>> 0
    b0 = (b0 + B) >>> 0
    c0 = (c0 + C) >>> 0
    d0 = (d0 + D) >>> 0
  }

  return [a0, b0, c0, d0].map(hexLE).join('')
}

let cachedK: number[] | null = null
function md5K(): number[] {
  if (!cachedK) {
    cachedK = Array.from({ length: 64 }, (_, i) =>
      Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296) >>> 0,
    )
  }
  return cachedK
}

function hexLE(x: number): string {
  const bytes = new Uint8Array(new Uint32Array([x]).buffer)
  let out = ''
  for (let i = 0; i < 4; i++) out += bytes[i].toString(16).padStart(2, '0')
  return out
}

/** SHA-1 / SHA-256 via Web Crypto (async, no extra dependency). */
export async function shaDigest(
  algo: 'SHA-1' | 'SHA-256' | 'SHA-512',
  message: string,
): Promise<string> {
  const buf = await crypto.subtle.digest(algo, new TextEncoder().encode(message))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}
