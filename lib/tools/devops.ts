/* ------------------------------------------------------------------- JWT */

export interface JwtParts {
  header: unknown
  payload: unknown
  signature: string
  error?: string
  expired?: boolean
}

function b64UrlDecode(segment: string): string {
  const pad = segment.replace(/-/g, '+').replace(/_/g, '/')
  const bin = atob(pad + '='.repeat((4 - (pad.length % 4)) % 4))
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new TextDecoder().decode(bytes)
}

export function parseJwt(token: string): JwtParts {
  const t = token.trim().replace(/^Bearer\s+/i, '')
  const parts = t.split('.')
  if (parts.length !== 3) return { header: null, payload: null, signature: '', error: 'Token 格式不正确（应为三段）' }
  try {
    const header = JSON.parse(b64UrlDecode(parts[0]))
    const payload = JSON.parse(b64UrlDecode(parts[1])) as { exp?: number }
    const expired = typeof payload.exp === 'number' ? payload.exp * 1000 < Date.now() : undefined
    return { header, payload, signature: parts[2], expired }
  } catch {
    return { header: null, payload: null, signature: parts[2], error: 'Base64 解码失败，请检查 Token' }
  }
}

/* -------------------------------------------------------------- CSV ↔ JSON */

export function csvToJson(input: string, delimiter: string, hasHeader: boolean): string {
  const lines = input.replace(/\r\n/g, '\n').split('\n').filter((l) => l.length > 0)
  if (!lines.length) return '[]'

  const parseRow = (line: string): string[] => {
    const out: string[] = []
    let cur = ''
    let inQuote = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (inQuote) {
        if (ch === '"') {
          if (line[i + 1] === '"') {
            cur += '"'
            i++
          } else inQuote = false
        } else cur += ch
      } else if (ch === '"') inQuote = true
      else if (ch === delimiter) {
        out.push(cur)
        cur = ''
      } else cur += ch
    }
    out.push(cur)
    return out
  }

  const rows = lines.map(parseRow)
  if (hasHeader) {
    const headers = rows[0]
    const body = rows.slice(1).map((r) => {
      const obj: Record<string, string> = {}
      headers.forEach((h, i) => {
        obj[h || `col${i + 1}`] = r[i] ?? ''
      })
      return obj
    })
    return JSON.stringify(body, null, 2)
  }
  return JSON.stringify(rows, null, 2)
}

export function jsonToCsv(input: string, delimiter: string): string {
  const data = JSON.parse(input) as unknown
  const rows = Array.isArray(data) ? data : [data]
  if (!rows.length) return ''

  const flat: Record<string, unknown>[] = rows.map((r) => {
    if (r === null || typeof r !== 'object') return { value: r }
    const o: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(r as Record<string, unknown>)) {
      o[k] = typeof v === 'object' && v !== null ? JSON.stringify(v) : v
    }
    return o
  })

  const headers = Array.from(new Set(flat.flatMap((r) => Object.keys(r))))
  const esc = (v: unknown) => {
    const s = String(v ?? '')
    return /["\n\r]/.test(s) || s.includes(delimiter) ? `"${s.replace(/"/g, '""')}"` : s
  }
  return [headers.join(delimiter), ...flat.map((r) => headers.map((h) => esc(r[h])).join(delimiter))].join('\n')
}

/* --------------------------------------------------------------- Unicode */

export function toUnicodeEscape(input: string): string {
  return [...input]
    .map((ch) => {
      const cp = ch.codePointAt(0) as number
      return cp > 127 ? `\\u${cp.toString(16).padStart(4, '0')}` : ch
    })
    .join('')
}

export function fromUnicodeEscape(input: string): string {
  return input.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
}

/* ------------------------------------------------------------- file size */

const UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']

export function formatBytes(bytes: number, precision = 2): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '-'
  if (bytes === 0) return '0 B'
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), UNITS.length - 1)
  const value = bytes / 1024 ** i
  return `${Number(value.toFixed(i === 0 ? 0 : precision))} ${UNITS[i]}`
}

export function convertFileSize(value: number, fromIdx: number, toIdx: number): number {
  return value * 1024 ** (fromIdx - toIdx)
}

export const FILE_SIZE_UNITS = UNITS

/* ------------------------------------------------------------------- cron */

const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

function parseField(field: string, min: number, max: number): number[] {
  const out = new Set<number>()
  if (field === '*' || field === '?') {
    for (let i = min; i <= max; i++) out.add(i)
    return [...out].sort((a, b) => a - b)
  }
  for (const part of field.split(',')) {
    const [rangeRaw, stepRaw] = part.split('/')
    const step = stepRaw ? Number(stepRaw) : 1
    let lo = min
    let hi = max
    if (rangeRaw !== '*' && rangeRaw !== '') {
      if (rangeRaw.includes('-')) {
        const [a, b] = rangeRaw.split('-')
        lo = Number(a)
        hi = Number(b)
      } else {
        lo = Number(rangeRaw)
        hi = stepRaw ? max : lo
      }
    }
    if (!Number.isFinite(lo) || !Number.isFinite(hi) || step < 1) continue
    for (let i = lo; i <= hi; i += step) if (i >= min && i <= max) out.add(i)
  }
  return [...out].sort((a, b) => a - b)
}

export function describeCron(expr: string): string {
  const f = expr.trim().split(/\s+/)
  if (f.length !== 5) return 'Cron 表达式需包含 5 个字段：分 时 日 月 周'
  const [mi, h, d, mo, wd] = f
  const minutes = parseField(mi, 0, 59)
  const hours = parseField(h, 0, 23)
  const days = parseField(d, 1, 31)
  const months = parseField(mo, 1, 12)
  const weeks = parseField(wd, 0, 6)

  const bits = [
    `分钟：${minutes.length === 60 ? '每分钟' : minutes.join('、')}`,
    `小时：${hours.length === 24 ? '每小时' : hours.join('、')}`,
    `日：${days.length === 31 ? '每日' : days.join('、')}`,
    `月：${months.length === 12 ? '每月' : months.map((m) => MONTHS[m - 1]).join('、')}`,
    wd === '*' ? '周：不限' : `周：${weeks.map((w) => WEEKDAYS[w]).join('、')}`,
  ]
  return bits.join('\n')
}

/** Naive next-run preview: iterate minute by minute (bounded). */
export function nextCronRuns(expr: string, count = 5, from = new Date()): Date[] {
  const f = expr.trim().split(/\s+/)
  if (f.length !== 5) return []
  const minutes = parseField(f[0], 0, 59)
  const hours = parseField(f[1], 0, 23)
  const days = parseField(f[2], 1, 31)
  const months = parseField(f[3], 1, 12)
  const weeks = parseField(f[4], 0, 6)
  if (!minutes.length || !hours.length || !days.length || !months.length) return []

  const out: Date[] = []
  const cursor = new Date(from.getTime())
  cursor.setSeconds(0, 0)
  cursor.setMinutes(cursor.getMinutes() + 1)

  let guard = 0
  while (out.length < count && guard++ < 60 * 24 * 366) {
    if (
      months.includes(cursor.getMonth() + 1) &&
      days.includes(cursor.getDate()) &&
      weeks.includes(cursor.getDay()) &&
      hours.includes(cursor.getHours()) &&
      minutes.includes(cursor.getMinutes())
    ) {
      out.push(new Date(cursor.getTime()))
    }
    cursor.setMinutes(cursor.getMinutes() + 1)
  }
  return out
}

/* ---------------------------------------------------------- html escape */

const HTML_MAP: [RegExp, string][] = [
  [/&/g, '&amp;'],
  [/</g, '&lt;'],
  [/>/g, '&gt;'],
  [/"/g, '&quot;'],
  [/'/g, '&#39;'],
]

export function escapeHtml(input: string): string {
  return HTML_MAP.reduce((acc, [re, rep]) => acc.replace(re, rep), input)
}

export function unescapeHtml(input: string): string {
  return input
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
}

/* ------------------------------------------------------------ url params */

export interface UrlParam {
  key: string
  value: string
}

export function parseUrlParams(input: string): { base: string; params: UrlParam[]; error?: string } {
  const raw = input.trim()
  if (!raw) return { base: '', params: [] }
  const qIndex = raw.indexOf('?')
  const base = qIndex === -1 ? '' : raw.slice(0, qIndex)
  const query = qIndex === -1 ? raw : raw.slice(qIndex + 1)
  const params: UrlParam[] = []
  for (const pair of query.split('&')) {
    if (!pair) continue
    const eq = pair.indexOf('=')
    const k = eq === -1 ? pair : pair.slice(0, eq)
    const v = eq === -1 ? '' : pair.slice(eq + 1)
    params.push({ key: safeDecode(k), value: safeDecode(v) })
  }
  return { base, params }
}

function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s.replace(/\+/g, ' '))
  } catch {
    return s
  }
}

export function buildUrlParams(base: string, params: UrlParam[]): string {
  const qs = params
    .filter((p) => p.key)
    .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
    .join('&')
  if (!qs) return base
  return `${base}${base.includes('?') ? '&' : '?'}${qs}`
}

/* --------------------------------------------------------------- cookies */

export interface CookieAttr {
  name: string
  value: string
  domain?: string
  path?: string
  expires?: string
  maxAge?: string
  secure: boolean
  httpOnly: boolean
  sameSite?: string
}

export function parseCookieString(input: string): CookieAttr[] {
  const attrs = input.split(';').map((s) => s.trim()).filter(Boolean)
  if (!attrs.length) return []
  const [first, ...rest] = attrs
  const eq = first.indexOf('=')
  const cookie: CookieAttr = {
    name: eq === -1 ? first : first.slice(0, eq),
    value: eq === -1 ? '' : first.slice(eq + 1),
    secure: false,
    httpOnly: false,
  }
  for (const a of rest) {
    const i = a.indexOf('=')
    const k = (i === -1 ? a : a.slice(0, i)).toLowerCase()
    const v = i === -1 ? '' : a.slice(i + 1)
    if (k === 'domain') cookie.domain = v
    else if (k === 'path') cookie.path = v
    else if (k === 'expires') cookie.expires = v
    else if (k === 'max-age') cookie.maxAge = v
    else if (k === 'secure') cookie.secure = true
    else if (k === 'httponly') cookie.httpOnly = true
    else if (k === 'samesite') cookie.sameSite = v
  }
  return [cookie]
}

export function buildCookieString(c: CookieAttr): string {
  const parts = [`${c.name}=${c.value}`]
  if (c.domain) parts.push(`Domain=${c.domain}`)
  if (c.path) parts.push(`Path=${c.path}`)
  if (c.expires) parts.push(`Expires=${c.expires}`)
  if (c.maxAge) parts.push(`Max-Age=${c.maxAge}`)
  if (c.secure) parts.push('Secure')
  if (c.httpOnly) parts.push('HttpOnly')
  if (c.sameSite) parts.push(`SameSite=${c.sameSite}`)
  return parts.join('; ')
}

/* ------------------------------------------------------------ xml format */

export function formatXml(input: string, indent = 2): { ok: boolean; text: string } {
  const pad = ' '.repeat(indent)
  try {
    const cleaned = input.replace(/>\s{0,}</g, '><').trim()
    let out = ''
    let depth = 0
    const tokens = cleaned.match(/<[^>]+>|[^<]+/g) ?? []
    for (const token of tokens) {
      if (/^<\//.test(token)) depth = Math.max(0, depth - 1)
      const line = token.trim()
      if (!line) continue
      out += (out ? '\n' : '') + pad.repeat(depth) + line
      if (/^<[^/!?][^>]*[^/]>$/.test(token) && !/^<[^>]+\/>/.test(token)) depth++
    }
    return { ok: true, text: out }
  } catch (e) {
    return { ok: false, text: e instanceof Error ? e.message : 'XML 解析失败' }
  }
}

/* ------------------------------------------------------------ sql format */

const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET',
  'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'CREATE TABLE', 'ALTER TABLE',
  'DROP TABLE', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN', 'OUTER JOIN', 'JOIN',
  'ON', 'AND', 'OR', 'UNION ALL', 'UNION', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'AS', 'DISTINCT',
]

export function formatSql(input: string, upper: boolean, indent = 2): string {
  let sql = input.replace(/\s+/g, ' ').trim()
  if (!sql) return ''
  const pad = ' '.repeat(indent)

  const apply = (s: string) => (upper ? s.toUpperCase() : s.toLowerCase())

  for (const kw of SQL_KEYWORDS) {
    const re = new RegExp(`\\s${kw.replace(/ /g, '\\s+')}\\s`, 'gi')
    sql = sql.replace(re, (m) => `\n${pad}${apply(m.trim())} `)
  }
  sql = sql.replace(/\s*,\s*/g, ', ')

  return sql
    .split('\n')
    .map((l) => l.trimEnd())
    .join('\n')
}

/* --------------------------------------------------------- mysql → go */

const MYSQL_GO_TYPE: [RegExp, string][] = [
  [/^(TINYINT\(1\)|BOOL|BOOLEAN)/i, 'bool'],
  [/^TINYINT/i, 'int8'],
  [/^SMALLINT/i, 'int16'],
  [/^MEDIUMINT|^INT|^INTEGER/i, 'int'],
  [/^BIGINT/i, 'int64'],
  [/^FLOAT/i, 'float32'],
  [/^DOUBLE|^DECIMAL|^NUMERIC/i, 'float64'],
  [/^DATE|^DATETIME|^TIMESTAMP|^TIME/i, 'time.Time'],
  [/^CHAR|^VARCHAR|^TEXT|^TINYTEXT|^MEDIUMTEXT|^LONGTEXT|^ENUM|^SET/i, 'string'],
  [/^BLOB|^BINARY|^VARBINARY/i, '[]byte'],
  [/^JSON/i, 'string'],
]

function toCamel(s: string): string {
  return s
    .replace(/[_-]+([a-zA-Z0-9])/g, (_, c: string) => c.toUpperCase())
    .replace(/^[a-z]/, (c) => c.toUpperCase())
}

export function mysqlToGoStruct(ddl: string, structName = 'Model', withTags = true): string {
  const bodyMatch = /\(([\s\S]*)\)/.exec(ddl)
  if (!bodyMatch) return '// 未找到表字段定义，请粘贴完整的 CREATE TABLE 语句'

  const lines = bodyMatch[1]
    .split('\n')
    .map((l) => l.trim().replace(/,$/, ''))
    .filter(Boolean)

  const fields: string[] = []
  let needsTime = false

  for (const line of lines) {
    if (/^(PRIMARY|UNIQUE|KEY|INDEX|CONSTRAINT|FOREIGN)/i.test(line)) continue
    const m = /^[`'"[]?([A-Za-z_][\w]*)[`'"\]]?\s+([A-Za-z]+(?:\(\d+(?:,\d+)?\))?)/.exec(line)
    if (!m) continue
    const column = m[1]
    const type = m[2]

    let goType = 'string'
    for (const [re, t] of MYSQL_GO_TYPE) {
      if (re.test(type)) {
        goType = t
        break
      }
    }
    if (goType === 'time.Time') needsTime = true

    const name = toCamel(column)
    const tag = withTags ? ` \`json:"${column}" gorm:"column:${column}"\`` : ''
    const comment = /COMMENT\s+'([^']*)'/i.exec(line)?.[1]
    fields.push(`\t${name} ${goType}${tag}${comment ? ` // ${comment}` : ''}`)
  }

  if (!fields.length) return '// 未解析到任何字段'

  const imports = needsTime ? 'import "time"\n\n' : ''
  return `${imports}type ${toCamel(structName)} struct {\n${fields.join('\n')}\n}`
}

/* --------------------------------------------------------------- mock data */

export const MOCK_FIELD_TYPES = [
  'name',
  'email',
  'phone',
  'city',
  'company',
  'url',
  'uuid',
  'int',
  'float',
  'boolean',
  'date',
  'sentence',
  'paragraph',
  'color',
  'ip',
  'word',
] as const

export type MockFieldType = (typeof MOCK_FIELD_TYPES)[number]

const POOL = {
  surname: '赵钱孙李周吴郑王冯陈褚卫蒋沈韩杨朱秦尤许何吕施张孔曹严华金魏陶姜'.split(''),
  given: '伟芳娜秀敏静丽强磊洋勇艳杰娟涛明超霞平刚桂英文军建华志远晓彤思远佳怡梓涵'.split(''),
  city: ['北京', '上海', '广州', '深圳', '杭州', '成都', '南京', '武汉', '西安', '苏州'],
  company: ['晨曦科技', '云图网络', '星海数据', '青柠信息', '北极星软件', '木风智能'],
  word: ['数据', '平台', '服务', '引擎', '组件', '协议', '缓存', '接口', '模型', '任务'],
}

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

export function mockValue(type: MockFieldType): unknown {
  switch (type) {
    case 'name':
      return pick(POOL.surname) + pick(POOL.given) + (Math.random() < 0.4 ? pick(POOL.given) : '')
    case 'email':
      return `${Math.random().toString(36).slice(2, 9)}@example.com`
    case 'phone':
      return `1${pick(['3', '5', '7', '8', '9'])}${String(Math.floor(Math.random() * 1e9)).padStart(9, '0')}`
    case 'city':
      return pick(POOL.city)
    case 'company':
      return pick(POOL.company)
    case 'url':
      return `https://example.com/${Math.random().toString(36).slice(2, 8)}`
    case 'uuid':
      return crypto.randomUUID()
    case 'int':
      return Math.floor(Math.random() * 10000)
    case 'float':
      return Number((Math.random() * 1000).toFixed(2))
    case 'boolean':
      return Math.random() < 0.5
    case 'date':
      return new Date(Date.now() - Math.floor(Math.random() * 3e10)).toISOString().slice(0, 10)
    case 'sentence':
      return `${pick(POOL.word)}${pick(POOL.word)}${pick(POOL.word)}的描述文本。`
    case 'paragraph':
      return Array.from({ length: 3 }, () => `${pick(POOL.word)}${pick(POOL.word)}${pick(POOL.word)}。`).join('')
    case 'color':
      return `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`
    case 'ip':
      return `${Math.floor(Math.random() * 223) + 1}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`
    case 'word':
    default:
      return pick(POOL.word)
  }
}

export function generateMock(schema: { name: string; type: MockFieldType }[], rows: number): unknown[] {
  return Array.from({ length: Math.max(1, rows) }, () => {
    const obj: Record<string, unknown> = {}
    for (const f of schema) obj[f.name || f.type] = mockValue(f.type)
    return obj
  })
}
