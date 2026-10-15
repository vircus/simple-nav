/* ------------------------------------------------------------ word count */

export interface WordCountResult {
  chars: number
  charsNoSpace: number
  words: number
  lines: number
  paragraphs: number
  bytes: number
  cjk: number
}

export function countWords(input: string): WordCountResult {
  const noSpace = input.replace(/\s/g, '')
  const latinWords = input.match(/[A-Za-z0-9_'-]+/g)?.length ?? 0
  const cjk = (input.match(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g) ?? []).length
  const paragraphs = input.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length
  return {
    chars: [...input].length,
    charsNoSpace: [...noSpace].length,
    words: latinWords + cjk,
    lines: input ? input.split('\n').length : 0,
    paragraphs,
    bytes: new TextEncoder().encode(input).length,
    cjk,
  }
}

/* ---------------------------------------------------------- case convert */

export type CaseMode =
  | 'upper'
  | 'lower'
  | 'title'
  | 'camel'
  | 'pascal'
  | 'snake'
  | 'kebab'
  | 'constant'

function tokenize(input: string): string[] {
  return input
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .split(/[^A-Za-z0-9\u4e00-\u9fff]+/)
    .filter(Boolean)
}

export function convertCase(input: string, mode: CaseMode): string {
  const tokens = tokenize(input)
  switch (mode) {
    case 'upper':
      return input.toUpperCase()
    case 'lower':
      return input.toLowerCase()
    case 'title':
      return input.replace(/\w[^\s]*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    case 'camel':
      return tokens
        .map((t, i) => (i === 0 ? t.toLowerCase() : t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()))
        .join('')
    case 'pascal':
      return tokens.map((t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()).join('')
    case 'snake':
      return tokens.map((t) => t.toLowerCase()).join('_')
    case 'kebab':
      return tokens.map((t) => t.toLowerCase()).join('-')
    case 'constant':
      return tokens.map((t) => t.toUpperCase()).join('_')
  }
}

/* --------------------------------------------------------- regex testing */

export interface RegexMatch {
  text: string
  index: number
  groups: string[]
}

export function testRegex(
  pattern: string,
  flags: string,
  input: string,
): { matches: RegexMatch[]; error?: string } {
  if (!pattern) return { matches: [] as RegexMatch[] }
  let re: RegExp
  try {
    re = new RegExp(pattern, flags.includes('g') ? flags : `${flags}g`)
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err), matches: [] }
  }

  const matches: RegexMatch[] = []
  let m: RegExpExecArray | null
  let guard = 0
  while ((m = re.exec(input)) !== null && guard++ < 5000) {
    matches.push({ text: m[0], index: m.index, groups: m.slice(1) })
    if (m[0] === '') re.lastIndex++
    if (matches.length >= 500) break
  }
  return { matches }
}

/* ------------------------------------------------------------- text diff */

export type DiffRow = {
  left?: string
  right?: string
  type: 'same' | 'added' | 'removed' | 'changed'
}

/** Line diff via LCS — clear and dependency-free. */
export function diffLines(a: string, b: string): DiffRow[] {
  const left = a.split('\n')
  const right = b.split('\n')
  const n = left.length
  const m = right.length

  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = left[i] === right[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }

  const rows: DiffRow[] = []
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (left[i] === right[j]) {
      rows.push({ left: left[i], right: right[j], type: 'same' })
      i++
      j++
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      rows.push({ left: left[i], type: 'removed' })
      i++
    } else {
      rows.push({ right: right[j], type: 'added' })
      j++
    }
  }
  while (i < n) rows.push({ left: left[i++], type: 'removed' })
  while (j < m) rows.push({ right: right[j++], type: 'added' })
  return rows
}

/* ------------------------------------------------------- markdown (light) */

/** Deliberately small Markdown subset — safe, no HTML passthrough. */
export function markdownToHtml(md: string): string {
  const escape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const inline = (s: string) =>
    escape(s)
      .replace(/`([^`]+)`/g, '<code class="rounded bg-fg/10 px-1 py-0.5 font-mono text-[0.9em]">$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
      .replace(/~~([^~]+)~~/g, '<del>$1</del>')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-brand underline">$1</a>')

  const lines = md.replace(/\r\n/g, '\n').split('\n')
  const out: string[] = []
  let inList = false
  let inCode = false

  for (const line of lines) {
    if (line.startsWith('```')) {
      if (inCode) {
        out.push('</code></pre>')
        inCode = false
      } else {
        out.push('<pre class="overflow-x-auto rounded-xl bg-fg/5 p-3 font-mono text-xs"><code>')
        inCode = true
      }
      continue
    }
    if (inCode) {
      out.push(`${escape(line)}\n`)
      continue
    }
    if (/^\s*$/.test(line)) {
      if (inList) {
        out.push('</ul>')
        inList = false
      }
      continue
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(line)
    if (heading) {
      const level = heading[1].length
      const size = ['text-2xl', 'text-xl', 'text-lg', 'text-base', 'text-sm', 'text-sm'][level - 1]
      out.push(`<h${level} class="mt-4 mb-2 font-black tracking-tight ${size}">${inline(heading[2])}</h${level}>`)
      continue
    }

    const li = /^\s*[-*+]\s+(.*)$/.exec(line)
    if (li) {
      if (!inList) {
        out.push('<ul class="my-2 list-disc space-y-1 pl-5">')
        inList = true
      }
      out.push(`<li>${inline(li[1])}</li>`)
      continue
    }

    const quote = /^>\s?(.*)$/.exec(line)
    if (quote) {
      out.push(
        `<blockquote class="my-2 border-l-4 border-brand/50 pl-3 text-muted">${inline(quote[1])}</blockquote>`,
      )
      continue
    }

    if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) {
      out.push('<hr class="my-4 border-line" />')
      continue
    }

    if (inList) {
      out.push('</ul>')
      inList = false
    }
    out.push(`<p class="my-2 leading-relaxed">${inline(line)}</p>`)
  }

  if (inList) out.push('</ul>')
  if (inCode) out.push('</code></pre>')
  return out.join('')
}
