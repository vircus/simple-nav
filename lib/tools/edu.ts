/* ------------------------------------------------------------ unit table */

export interface UnitDef {
  id: string
  label: string
  /** to base unit */
  toBase: number
  /** temperature / other offset conversions need a custom fn */
  offset?: number
}

export interface UnitGroup {
  id: string
  label: string
  units: UnitDef[]
}

export const UNIT_GROUPS: UnitGroup[] = [
  {
    id: 'length',
    label: '长度',
    units: [
      { id: 'm', label: '米 (m)', toBase: 1 },
      { id: 'km', label: '千米 (km)', toBase: 1000 },
      { id: 'dm', label: '分米 (dm)', toBase: 0.1 },
      { id: 'cm', label: '厘米 (cm)', toBase: 0.01 },
      { id: 'mm', label: '毫米 (mm)', toBase: 0.001 },
      { id: 'in', label: '英寸 (in)', toBase: 0.0254 },
      { id: 'ft', label: '英尺 (ft)', toBase: 0.3048 },
      { id: 'yd', label: '码 (yd)', toBase: 0.9144 },
      { id: 'mi', label: '英里 (mi)', toBase: 1609.344 },
      { id: 'li', label: '里', toBase: 500 },
      { id: 'chi', label: '尺', toBase: 1 / 3 },
      { id: 'cun', label: '寸', toBase: 1 / 30 },
      { id: 'nm', label: '海里 (nmi)', toBase: 1852 },
    ],
  },
  {
    id: 'area',
    label: '面积',
    units: [
      { id: 'm2', label: '平方米 (m²)', toBase: 1 },
      { id: 'km2', label: '平方千米 (km²)', toBase: 1e6 },
      { id: 'cm2', label: '平方厘米 (cm²)', toBase: 1e-4 },
      { id: 'ha', label: '公顷 (ha)', toBase: 10000 },
      { id: 'mu', label: '亩', toBase: 2000 / 3 },
      { id: 'acre', label: '英亩 (acre)', toBase: 4046.8564224 },
      { id: 'ft2', label: '平方英尺 (ft²)', toBase: 0.09290304 },
    ],
  },
  {
    id: 'weight',
    label: '重量',
    units: [
      { id: 'kg', label: '千克 (kg)', toBase: 1 },
      { id: 'g', label: '克 (g)', toBase: 0.001 },
      { id: 'mg', label: '毫克 (mg)', toBase: 1e-6 },
      { id: 't', label: '吨 (t)', toBase: 1000 },
      { id: 'lb', label: '磅 (lb)', toBase: 0.45359237 },
      { id: 'oz', label: '盎司 (oz)', toBase: 0.028349523125 },
      { id: 'jin', label: '斤', toBase: 0.5 },
      { id: 'liang', label: '两', toBase: 0.05 },
    ],
  },
  {
    id: 'time',
    label: '时间',
    units: [
      { id: 's', label: '秒 (s)', toBase: 1 },
      { id: 'ms', label: '毫秒 (ms)', toBase: 0.001 },
      { id: 'min', label: '分钟 (min)', toBase: 60 },
      { id: 'h', label: '小时 (h)', toBase: 3600 },
      { id: 'd', label: '天 (d)', toBase: 86400 },
      { id: 'wk', label: '周 (wk)', toBase: 604800 },
      { id: 'mo', label: '月（30 天）', toBase: 2592000 },
      { id: 'yr', label: '年（365 天）', toBase: 31536000 },
    ],
  },
  {
    id: 'temp',
    label: '温度',
    units: [
      { id: 'c', label: '摄氏度 (°C)', toBase: 1, offset: 0 },
      { id: 'f', label: '华氏度 (°F)', toBase: 5 / 9, offset: -32 },
      { id: 'k', label: '开尔文 (K)', toBase: 1, offset: -273.15 },
    ],
  },
  {
    id: 'pressure',
    label: '压力',
    units: [
      { id: 'pa', label: '帕 (Pa)', toBase: 1 },
      { id: 'kpa', label: '千帕 (kPa)', toBase: 1000 },
      { id: 'mpa', label: '兆帕 (MPa)', toBase: 1e6 },
      { id: 'bar', label: '巴 (bar)', toBase: 1e5 },
      { id: 'atm', label: '标准大气压 (atm)', toBase: 101325 },
      { id: 'psi', label: 'psi', toBase: 6894.757293168 },
      { id: 'torr', label: '托 (Torr)', toBase: 133.32236842 },
    ],
  },
  {
    id: 'energy',
    label: '热量 / 能量',
    units: [
      { id: 'j', label: '焦耳 (J)', toBase: 1 },
      { id: 'kj', label: '千焦 (kJ)', toBase: 1000 },
      { id: 'cal', label: '卡 (cal)', toBase: 4.184 },
      { id: 'kcal', label: '千卡 (kcal)', toBase: 4184 },
      { id: 'wh', label: '瓦时 (Wh)', toBase: 3600 },
      { id: 'kwh', label: '千瓦时 (kWh)', toBase: 3.6e6 },
    ],
  },
  {
    id: 'power',
    label: '功率',
    units: [
      { id: 'w', label: '瓦 (W)', toBase: 1 },
      { id: 'mw', label: '毫瓦 (mW)', toBase: 0.001 },
      { id: 'kw', label: '千瓦 (kW)', toBase: 1000 },
      { id: 'mw2', label: '兆瓦 (MW)', toBase: 1e6 },
      { id: 'hp', label: '马力 (hp)', toBase: 745.7 },
    ],
  },
  {
    id: 'speed',
    label: '速度',
    units: [
      { id: 'ms', label: '米/秒 (m/s)', toBase: 1 },
      { id: 'kmh', label: '千米/小时 (km/h)', toBase: 1 / 3.6 },
      { id: 'mph', label: '英里/小时 (mph)', toBase: 0.44704 },
      { id: 'kn', label: '节 (kn)', toBase: 0.514444 },
    ],
  },
  {
    id: 'data',
    label: '数据容量',
    units: [
      { id: 'b', label: '字节 (B)', toBase: 1 },
      { id: 'kb', label: 'KB (1024)', toBase: 1024 },
      { id: 'mb', label: 'MB (1024)', toBase: 1024 ** 2 },
      { id: 'gb', label: 'GB (1024)', toBase: 1024 ** 3 },
      { id: 'tb', label: 'TB (1024)', toBase: 1024 ** 4 },
    ],
  },
]

export function convertUnit(value: number, group: UnitGroup, fromId: string, toId: string): number {
  const from = group.units.find((u) => u.id === fromId)
  const to = group.units.find((u) => u.id === toId)
  if (!from || !to) return NaN

  if (group.id === 'temp') {
    // normalize to °C then to target
    const c = (value + (from.offset ?? 0)) * from.toBase
    if (to.id === 'c') return c
    if (to.id === 'f') return c * 1.8 + 32
    if (to.id === 'k') return c + 273.15
    return c
  }
  return (value * from.toBase) / to.toBase
}

/* ---------------------------------------------------------------- morse */

const MORSE: Record<string, string> = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....',
  I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.',
  Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
  Y: '-.--', Z: '--..', 0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-',
  5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
  '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...',
  ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-',
  '"': '.-..-.', '$': '...-..-', '@': '.--.-.',
}

const REVERSE_MORSE: Record<string, string> = Object.fromEntries(
  Object.entries(MORSE).map(([k, v]) => [v, k]),
)

export function toMorse(input: string): string {
  return input
    .toUpperCase()
    .split('')
    .map((ch) => (ch === ' ' ? '/' : MORSE[ch] ?? ''))
    .filter(Boolean)
    .join(' ')
}

export function fromMorse(input: string): string {
  return input
    .trim()
    .split(/\s+/)
    .map((token) => (token === '/' ? ' ' : REVERSE_MORSE[token] ?? ''))
    .join('')
}

/* ------------------------------------------------------------ calculators */

export function calcBmi(heightCm: number, weightKg: number) {
  const m = heightCm / 100
  if (!m || !weightKg) return null
  const bmi = weightKg / (m * m)
  // 中国成人标准
  let label = '正常'
  if (bmi < 18.5) label = '偏瘦'
  else if (bmi < 24) label = '正常'
  else if (bmi < 28) label = '偏胖'
  else label = '肥胖'
  const min = 18.5 * m * m
  const max = 23.9 * m * m
  return { bmi: Number(bmi.toFixed(1)), label, healthyMin: Number(min.toFixed(1)), healthyMax: Number(max.toFixed(1)) }
}

export interface AgeResult {
  years: number
  months: number
  days: number
  totalDays: number
  nominalAge: number
  zodiac: string
  constellation: string
  nextBirthdayDays: number
}

const ZODIACS = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']

export function calcAge(birth: Date, now = new Date()): AgeResult {
  let years = now.getFullYear() - birth.getFullYear()
  let months = now.getMonth() - birth.getMonth()
  let days = now.getDate() - birth.getDate()
  if (days < 0) {
    months -= 1
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate()
    days += prevMonth
  }
  if (months < 0) {
    years -= 1
    months += 12
  }
  const totalDays = Math.floor((now.getTime() - birth.getTime()) / 86400000)

  const next = new Date(now.getFullYear(), birth.getMonth(), birth.getDate())
  if (next < now) next.setFullYear(next.getFullYear() + 1)
  const nextBirthdayDays = Math.ceil((next.getTime() - now.getTime()) / 86400000)

  const y = birth.getFullYear()
  const zodiacIndex = ((y - 1900) % 12 + 12) % 12
  // 虚岁 = 周岁 + 1（按农历近似）
  return {
    years,
    months,
    days,
    totalDays,
    nominalAge: years + 1,
    zodiac: ZODIACS[(zodiacIndex + 8) % 12],
    constellation: constellationOf(birth),
    nextBirthdayDays,
  }
}

export function constellationOf(d: Date): string {
  const md = (d.getMonth() + 1) * 100 + d.getDate()
  const table: [number, string][] = [
    [120, '摩羯座'], [219, '水瓶座'], [321, '双鱼座'], [420, '白羊座'],
    [521, '金牛座'], [622, '双子座'], [723, '巨蟹座'], [823, '狮子座'],
    [923, '处女座'], [1024, '天秤座'], [1123, '天蝎座'], [1222, '射手座'],
  ]
  for (const [end, name] of table) if (md <= end) return name
  return '摩羯座'
}

export interface DateDiff {
  days: number
  years: number
  months: number
  restDays: number
  workdays: number
}

export function diffDates(a: Date, b: Date): DateDiff {
  const start = a < b ? a : b
  const end = a < b ? b : a
  const days = Math.floor((end.getTime() - start.getTime()) / 86400000)

  let years = end.getFullYear() - start.getFullYear()
  let months = end.getMonth() - start.getMonth()
  let restDays = end.getDate() - start.getDate()
  if (restDays < 0) {
    months -= 1
    restDays += new Date(end.getFullYear(), end.getMonth(), 0).getDate()
  }
  if (months < 0) {
    years -= 1
    months += 12
  }

  let workdays = 0
  const cur = new Date(start.getTime())
  while (cur <= end) {
    const wd = cur.getDay()
    if (wd !== 0 && wd !== 6) workdays++
    cur.setDate(cur.getDate() + 1)
  }

  return { days, years, months, restDays, workdays }
}

export function addToDate(base: Date, amount: number, unit: 'day' | 'week' | 'month' | 'year'): Date {
  const d = new Date(base.getTime())
  if (unit === 'day') d.setDate(d.getDate() + amount)
  else if (unit === 'week') d.setDate(d.getDate() + amount * 7)
  else if (unit === 'month') d.setMonth(d.getMonth() + amount)
  else d.setFullYear(d.getFullYear() + amount)
  return d
}

/* ------------------------------------------------------------ loan / tax */

export interface LoanResult {
  monthly: number
  total: number
  interest: number
  schedule: { year: number; payment: number; interest: number; principal: number; balance: number }[]
}

export function calcLoan(principal: number, annualRatePct: number, years: number, mode: 'equal' | 'principal'): LoanResult {
  const months = Math.round(years * 12)
  const r = annualRatePct / 100 / 12
  const schedule: LoanResult['schedule'] = []

  if (mode === 'equal') {
    const monthly = r === 0 ? principal / months : (principal * r) / (1 - Math.pow(1 + r, -months))
    let balance = principal
    const byYear = new Map<number, { payment: number; interest: number; principal: number }>()
    for (let i = 1; i <= months; i++) {
      const interest = balance * r
      const p = monthly - interest
      balance = Math.max(0, balance - p)
      const year = Math.ceil(i / 12)
      const acc = byYear.get(year) ?? { payment: 0, interest: 0, principal: 0 }
      acc.payment += monthly
      acc.interest += interest
      acc.principal += p
      byYear.set(year, acc)
      if (i % 12 === 0 || i === months) schedule.push({ year, ...acc, balance })
    }
    return { monthly, total: monthly * months, interest: monthly * months - principal, schedule }
  }

  const perPrincipal = principal / months
  let balance = principal
  let totalInterest = 0
  let firstMonthly = 0
  const byYear = new Map<number, { payment: number; interest: number; principal: number }>()
  for (let i = 1; i <= months; i++) {
    const interest = balance * r
    totalInterest += interest
    const payment = perPrincipal + interest
    if (i === 1) firstMonthly = payment
    balance = Math.max(0, balance - perPrincipal)
    const year = Math.ceil(i / 12)
    const acc = byYear.get(year) ?? { payment: 0, interest: 0, principal: 0 }
    acc.payment += payment
    acc.interest += interest
    acc.principal += perPrincipal
    byYear.set(year, acc)
    if (i % 12 === 0 || i === months) schedule.push({ year, ...acc, balance })
  }
  return { monthly: firstMonthly, total: principal + totalInterest, interest: totalInterest, schedule }
}

const TAX_BRACKETS: [number, number, number][] = [
  [36000, 0.03, 0],
  [144000, 0.1, 2520],
  [300000, 0.2, 16920],
  [420000, 0.25, 31920],
  [660000, 0.3, 52920],
  [960000, 0.35, 85920],
  [Infinity, 0.45, 181920],
]

/** 累计预扣预缴法：返回第 month 月（1-12）的个税 */
export function monthlyTax(cumulativeIncome: number, cumulativeDeduction: number, cumulativeTaxPaid: number): number {
  const taxable = Math.max(0, cumulativeIncome - cumulativeDeduction)
  let tax = 0
  for (const [cap, rate, quick] of TAX_BRACKETS) {
    if (taxable <= cap) {
      tax = taxable * rate - quick
      break
    }
  }
  return Math.max(0, Number((tax - cumulativeTaxPaid).toFixed(2)))
}

/* --------------------------------------------------------- chinese number */

const CN_DIGITS = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
const CN_UNITS = ['', '拾', '佰', '仟']
const CN_SECTIONS = ['', '万', '亿', '万亿']

export function numberToChineseAmount(input: number): string {
  if (!Number.isFinite(input)) return ''
  if (input === 0) return '零元整'
  const negative = input < 0
  const fixed = Math.round(Math.abs(input) * 100) / 100
  const yuan = Math.floor(fixed)
  const jiao = Math.floor((fixed - yuan) * 10)
  const fen = Math.round(((fixed - yuan) * 100) % 10)

  let intPart = ''
  if (yuan === 0) intPart = ''
  else {
    const sections: number[] = []
    let rest = yuan
    while (rest > 0) {
      sections.push(rest % 10000)
      rest = Math.floor(rest / 10000)
    }
    intPart = sections
      .map((sec, si) => {
        let s = ''
        const digits = String(sec).padStart(4, '0').split('').map(Number)
        let zeroFlag = false
        digits.forEach((d, i) => {
          const unit = CN_UNITS[3 - i]
          if (d === 0) {
            zeroFlag = true
          } else {
            if (zeroFlag && s) s += CN_DIGITS[0]
            zeroFlag = false
            s += CN_DIGITS[d] + unit
          }
        })
        return s ? s + CN_SECTIONS[si] : ''
      })
      .reverse()
      .join('')
      .replace(/零+$/, '')
  }

  let decPart = ''
  if (jiao === 0 && fen === 0) decPart = '整'
  else {
    if (jiao > 0) decPart += `${CN_DIGITS[jiao]}角`
    else if (fen > 0) decPart += '零'
    if (fen > 0) decPart += `${CN_DIGITS[fen]}分`
  }

  return `${negative ? '负' : ''}${intPart || '零'}元${decPart}`
}

/* ------------------------------------------------------------- word freq */

export function wordFrequency(text: string, minLen = 1): { word: string; count: number }[] {
  const map = new Map<string, number>()
  // 中文按 2-4 字滑动窗口取词，英文按单词
  const cjkRuns = text.match(/[\u4e00-\u9fff]+/g) ?? []
  for (const run of cjkRuns) {
    for (let len = 2; len <= 4 && len <= run.length; len++) {
      for (let i = 0; i + len <= run.length; i++) {
        // 仅统计完整切分的窗口，避免重复计数
        if (len === 2 || (i % len === 0 && i + len <= run.length)) {
          const w = run.slice(i, i + len)
          if ([...w].length >= minLen) map.set(w, (map.get(w) ?? 0) + 1)
        }
      }
    }
  }
  const latin = text.match(/[A-Za-z][A-Za-z'-]*/g) ?? []
  for (const w of latin) {
    const key = w.toLowerCase()
    if (key.length >= minLen) map.set(key, (map.get(key) ?? 0) + 1)
  }
  return [...map.entries()]
    .map(([word, count]) => ({ word, count }))
    .filter((x) => x.count > 1)
    .sort((a, b) => b.count - a.count)
}
