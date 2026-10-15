import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { categorySchema, firstIssues } from '@/lib/schema'
import { writeCategories } from '@/lib/kv'

export const dynamic = 'force-dynamic'

const body = z.array(categorySchema).max(200)

export async function PUT(req: NextRequest) {
  const parsed = body.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: '校验失败', issues: firstIssues(parsed.error) }, { status: 400 })
  }
  await writeCategories(parsed.data)
  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
}
