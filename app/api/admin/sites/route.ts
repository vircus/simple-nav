import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { siteSchema, firstIssues } from '@/lib/schema'
import { writeSites } from '@/lib/kv'

export const dynamic = 'force-dynamic'

const body = z.array(siteSchema).max(3000)

export async function PUT(req: NextRequest) {
  const parsed = body.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: '校验失败', issues: firstIssues(parsed.error) }, { status: 400 })
  }
  await writeSites(parsed.data)
  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
}
