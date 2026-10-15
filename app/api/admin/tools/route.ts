import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { toolConfigSchema, firstIssues } from '@/lib/schema'
import { writeTools } from '@/lib/kv'

export const dynamic = 'force-dynamic'

const body = z.array(toolConfigSchema).max(500)

export async function PUT(req: NextRequest) {
  const parsed = body.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: '校验失败', issues: firstIssues(parsed.error) }, { status: 400 })
  }
  await writeTools(parsed.data)
  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
}
