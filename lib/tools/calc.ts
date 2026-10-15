/**
 * Tiny safe expression evaluator — no `eval` on raw input.
 * Strategy: whitelist function/constant names, replace them with `Math.*`,
 * then verify the rewritten string contains nothing but approved tokens.
 */

const FUNCS = [
  'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
  'sqrt', 'cbrt', 'abs', 'exp', 'log', 'log2', 'log10',
  'floor', 'ceil', 'round', 'sign',
] as const

function normalize(expr: string): string {
  let s = expr.replace(/\s+/g, '').toLowerCase()
  s = s.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-')
  s = s.replace(/π/g, 'pi').replace(/\bln\(/g, 'log(')

  for (const f of FUNCS) {
    s = s.replace(new RegExp(`\\b${f}\\(`, 'g'), `Math.${f}(`)
  }
  s = s.replace(/\bpow\(/g, 'Math.pow(')
  s = s.replace(/\bpi\b/g, 'Math.PI')
  s = s.replace(/\be\b/g, 'Math.E')
  // factorial: 5! → fact(5)
  s = s.replace(/(\d+(?:\.\d+)?)!/g, 'fact($1)')
  s = s.replace(/\^/g, '**')
  return s
}

function fact(n: number): number {
  if (n < 0 || !Number.isInteger(n)) throw new Error('阶乘仅支持非负整数')
  if (n > 170) throw new Error('阶乘数值过大')
  let r = 1
  for (let i = 2; i <= n; i++) r *= i
  return r
}

const ALLOWED = /^(?:Math\.[a-z0-9]+|fact|\d+(?:\.\d+)?|[+\-*/%().,]|\*\*)+$/i

export function evalExpression(expr: string): number {
  const s = normalize(expr)
  if (!s) throw new Error('表达式为空')
  if (!ALLOWED.test(s)) throw new Error('表达式含不支持的字符或函数')

  // eslint-disable-next-line no-new-func
  const fn = new Function('fact', `"use strict"; return (${s});`)
  const value = fn(fact) as unknown
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error('计算结果无效')
  return value
}

export function toBaseString(value: number, base: 2 | 8 | 10 | 16): string {
  const n = Math.trunc(value)
  if (!Number.isFinite(n)) return '-'
  return (n < 0 ? '-' : '') + Math.abs(n).toString(base).toUpperCase()
}

export function parseInBase(text: string, base: number): number {
  const t = text.trim()
  if (!t) return NaN
  const negative = t.startsWith('-')
  const body = negative ? t.slice(1) : t
  const v = parseInt(body, base)
  return Number.isNaN(v) ? NaN : negative ? -v : v
}
