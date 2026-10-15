/* --------------------------------------------------------- password gen */

export const CHARSETS = {
  lower: 'abcdefghijkmnopqrstuvwxyz',
  upper: 'ABCDEFGHJKLMNPQRSTUVWXYZ',
  digits: '23456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.?',
}

export function generatePassword(options: {
  length: number
  lower: boolean
  upper: boolean
  digits: boolean
  symbols: boolean
  excludeAmbiguous: boolean
}): string {
  let pool = ''
  if (options.lower) pool += CHARSETS.lower
  if (options.upper) pool += CHARSETS.upper
  if (options.digits) pool += CHARSETS.digits
  if (options.symbols) pool += CHARSETS.symbols
  if (options.excludeAmbiguous) pool = pool.replace(/[0O1lI]/g, '')
  if (!pool) return ''
  if (pool.length === 1) return pool.repeat(options.length)

  // Rejection sampling to avoid modulo bias.
  const limit = 256 - (256 % pool.length)
  const bytes = new Uint8Array(options.length * 2)
  const out: string[] = []
  let offset = 0
  while (out.length < options.length) {
    if (offset >= bytes.length) {
      crypto.getRandomValues(bytes)
      offset = 0
    } else if (offset === 0) {
      crypto.getRandomValues(bytes)
    }
    const b = bytes[offset++]
    if (b >= limit) continue
    out.push(pool[b % pool.length])
  }
  return out.join('')
}

export function passwordStrength(pw: string): { score: number; label: string } {
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 14) score++
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  const label = ['太弱', '偏弱', '一般', '较强', '很强', '极强'][Math.min(score, 5)]
  return { score, label }
}

/* -------------------------------------------------------------- uuid gen */

export function generateUuids(count: number): string[] {
  return Array.from({ length: count }, () => crypto.randomUUID())
}

/* ------------------------------------------------------- random numbers */

export function generateRandomNumbers(options: {
  min: number
  max: number
  count: number
  unique: boolean
}): number[] {
  const { min, max, count } = options
  if (!Number.isFinite(min) || !Number.isFinite(max) || max < min) return []
  const span = max - min + 1
  const n = Math.max(0, Math.min(count, 1000))
  if (options.unique && n > span) return []

  const out: number[] = []
  const seen = new Set<number>()
  let guard = 0
  while (out.length < n && guard++ < n * 50 + 1000) {
    const bytes = new Uint32Array(1)
    crypto.getRandomValues(bytes)
    const v = min + (bytes[0] % span)
    if (options.unique) {
      if (seen.has(v)) continue
      seen.add(v)
    }
    out.push(v)
  }
  return out
}

/* ------------------------------------------------------------ lorem text */

const LATIN =
  'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(
    ' ',
  )

const CJK =
  '在这个快速变化的时代 我们需要不断学习 以保持竞争力 技术的演进从未停歇 每一次革新 都带来新的可能 把握当下 才能赢得未来 数据驱动决策 体验塑造品牌 简洁即美 效率即价值'.split(
    ' ',
  )

export function generateLorem(paragraphs: number, lang: 'latin' | 'cjk', sentences = 4): string {
  const pool = lang === 'cjk' ? CJK : LATIN
  const pick = () => pool[Math.floor(Math.random() * pool.length)]
  const joiner = lang === 'cjk' ? '' : ' '

  return Array.from({ length: Math.max(1, paragraphs) }, () => {
    const sents = Array.from({ length: sentences }, () => {
      const len = 6 + Math.floor(Math.random() * 8)
      const words = Array.from({ length: len }, pick)
      const text = words.join(joiner)
      return lang === 'cjk' ? `${text}。` : `${text.charAt(0).toUpperCase()}${text.slice(1)}.`
    })
    return lang === 'cjk' ? sents.join('') : sents.join(' ')
  }).join('\n\n')
}
