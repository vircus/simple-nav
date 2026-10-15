/* ------------------------------------------------------------ UA parsing */

export interface UaInfo {
  browser: string
  browserVersion: string
  os: string
  osVersion: string
  device: string
  engine: string
}

const BROWSERS: [string, RegExp][] = [
  ['Edge', /Edg(?:e|A|iOS)?\/([\d.]+)/],
  ['Opera', /(?:OPR|Opera)\/([\d.]+)/],
  ['Samsung Internet', /SamsungBrowser\/([\d.]+)/],
  ['Chrome', /(?:Chrome|CriOS)\/([\d.]+)/],
  ['Firefox', /(?:Firefox|FxiOS)\/([\d.]+)/],
  ['Safari', /Version\/([\d.]+).*Safari/],
  ['IE', /(?:MSIE |rv:)([\d.]+).*Trident/],
]

const OSES: [string, RegExp][] = [
  ['Windows', /Windows NT ([\d.]+)/],
  ['Android', /Android ([\d.]+)/],
  ['iOS', /(?:iPhone|iPad|iPod).*OS ([\d_]+)/],
  ['macOS', /Mac OS X ([\d_.]+)/],
  ['Linux', /Linux/],
]

const WINDOWS_NT: Record<string, string> = {
  '10.0': '10 / 11',
  '6.3': '8.1',
  '6.2': '8',
  '6.1': '7',
  '6.0': 'Vista',
  '5.1': 'XP',
}

export function parseUserAgent(ua: string): UaInfo {
  let browser = '未知',
    browserVersion = ''
  for (const [name, re] of BROWSERS) {
    const m = re.exec(ua)
    if (m) {
      browser = name
      browserVersion = m[1] ?? ''
      break
    }
  }

  let os = '未知',
    osVersion = ''
  for (const [name, re] of OSES) {
    const m = re.exec(ua)
    if (m) {
      os = name
      const raw = (m[1] ?? '').replace(/_/g, '.')
      osVersion = name === 'Windows' ? (WINDOWS_NT[raw] ?? raw) : raw
      break
    }
  }

  let device = '桌面端'
  if (/iPad|Tablet/i.test(ua)) device = '平板'
  else if (/Mobi|Android|iPhone/i.test(ua)) device = '手机'

  let engine = '未知'
  if (/Gecko\/|Firefox/.test(ua) && !/like Gecko/.test(ua)) engine = 'Gecko'
  if (/AppleWebKit/.test(ua)) engine = 'WebKit'
  if (/(Chrome|Chromium|Edg)\//.test(ua)) engine = 'Blink'
  if (/Trident/.test(ua)) engine = 'Trident'

  return { browser, browserVersion, os, osVersion, device, engine }
}

/* --------------------------------------------------------- HTTP statuses */

export interface StatusEntry {
  code: number
  text: string
  meaning: string
}

export const HTTP_STATUS: StatusEntry[] = [
  { code: 200, text: 'OK', meaning: '请求成功' },
  { code: 201, text: 'Created', meaning: '资源已创建' },
  { code: 204, text: 'No Content', meaning: '成功但无响应体' },
  { code: 206, text: 'Partial Content', meaning: '断点续传 / 分片内容' },
  { code: 301, text: 'Moved Permanently', meaning: '永久重定向' },
  { code: 302, text: 'Found', meaning: '临时重定向' },
  { code: 304, text: 'Not Modified', meaning: '缓存未过期，使用本地副本' },
  { code: 307, text: 'Temporary Redirect', meaning: '临时重定向，方法不变' },
  { code: 308, text: 'Permanent Redirect', meaning: '永久重定向，方法不变' },
  { code: 400, text: 'Bad Request', meaning: '请求参数或格式错误' },
  { code: 401, text: 'Unauthorized', meaning: '未认证' },
  { code: 403, text: 'Forbidden', meaning: '已认证但无权限' },
  { code: 404, text: 'Not Found', meaning: '资源不存在' },
  { code: 405, text: 'Method Not Allowed', meaning: '请求方法不被允许' },
  { code: 408, text: 'Request Timeout', meaning: '请求超时' },
  { code: 409, text: 'Conflict', meaning: '资源状态冲突' },
  { code: 410, text: 'Gone', meaning: '资源已永久删除' },
  { code: 413, text: 'Payload Too Large', meaning: '请求体过大' },
  { code: 415, text: 'Unsupported Media Type', meaning: '不支持的媒体类型' },
  { code: 418, text: "I'm a Teapot", meaning: '彩蛋状态码' },
  { code: 422, text: 'Unprocessable Entity', meaning: '语义正确但无法处理' },
  { code: 429, text: 'Too Many Requests', meaning: '触发限流' },
  { code: 500, text: 'Internal Server Error', meaning: '服务端内部错误' },
  { code: 502, text: 'Bad Gateway', meaning: '网关收到上游无效响应' },
  { code: 503, text: 'Service Unavailable', meaning: '服务不可用 / 过载' },
  { code: 504, text: 'Gateway Timeout', meaning: '网关等待上游超时' },
]

export function statusTone(code: number): string {
  if (code < 300) return 'pop'
  if (code < 400) return 'flash'
  if (code < 500) return 'solar'
  return 'coral'
}

/* ------------------------------------- normalising external API payloads */

/**
 * Providers differ wildly in field naming, so we probe a list of candidates.
 * The raw payload is always kept for the "查看原始响应" toggle.
 */
function pick(obj: unknown, keys: string[]): string {
  if (!obj || typeof obj !== 'object') return ''
  const rec = obj as Record<string, unknown>
  for (const k of keys) {
    if (k.includes('.')) {
      const [a, b] = k.split('.')
      const nested = rec[a]
      if (nested && typeof nested === 'object') {
        const v = (nested as Record<string, unknown>)[b]
        if (v != null && v !== '') return String(v)
      }
    } else {
      const v = rec[k]
      if (v != null && v !== '') return String(v)
    }
  }
  return ''
}

export interface IpSummary {
  ip: string
  country: string
  region: string
  city: string
  isp: string
  asn: string
  coords: string
  timezone: string
}

export function summarizeIp(payload: unknown): IpSummary {
  const lat = pick(payload, ['latitude', 'lat'])
  const lon = pick(payload, ['longitude', 'lon', 'lng'])
  return {
    ip: pick(payload, ['ip', 'query', 'ipAddress']),
    country: pick(payload, ['country', 'country_name', 'countryName', 'country_code', 'countryCode']),
    region: pick(payload, ['region', 'regionName', 'region_name', 'state', 'state_prov']),
    city: pick(payload, ['city', 'town']),
    isp: pick(payload, ['isp', 'org', 'connection.org', 'asn_organization', 'organization']),
    asn: pick(payload, ['asn', 'connection.asn', 'asn_number']),
    coords: lat && lon ? `${lat}, ${lon}` : '',
    timezone: pick(payload, ['timezone', 'time_zone', 'timezone_name']),
  }
}

export interface DnsRow {
  name: string
  type: string
  ttl: string
  data: string
}

export function summarizeDns(payload: unknown): DnsRow[] {
  const rec = (payload ?? {}) as Record<string, unknown>
  const answers = (rec.Answer ?? rec.answers ?? rec.data ?? rec) as unknown
  const list = Array.isArray(answers) ? answers : []
  return list.map((a) => {
    const r = a as Record<string, unknown>
    return {
      name: String(r.name ?? ''),
      type: String(r.type ?? r.record_type ?? ''),
      ttl: String(r.TTL ?? r.ttl ?? ''),
      data: String(r.data ?? r.value ?? r.rdata ?? ''),
    }
  })
}
