import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { customToolSchema, firstIssues } from '@/lib/schema'
import { writeCustomTools } from '@/lib/kv'
import { TOOL_MAP } from '@/lib/registry'

export const dynamic = 'force-dynamic'

const body = z.array(customToolSchema).max(200)

export async function PUT(req: NextRequest) {
  const parsed = body.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: '校验失败', issues: firstIssues(parsed.error) }, { status: 400 })
  }

  // Reject duplicate slugs (and any collision with built-in tools).
  const seen = new Set<string>()
  for (const t of parsed.data) {
    if (seen.has(t.slug) || TOOL_MAP.has(t.slug)) {
      return NextResponse.json(
        { error: `标识 "${t.slug}" 重复或与内置工具冲突` },
        { status: 400 },
      )
    }
    seen.add(t.slug)
  }

  await writeCustomTools(parsed.data)
  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
}
