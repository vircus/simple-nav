import { NextResponse, type NextRequest } from 'next/server'
import { settingsSchema, firstIssues } from '@/lib/schema'
import { writeSettings } from '@/lib/kv'

export const dynamic = 'force-dynamic'

export async function PUT(req: NextRequest) {
  const parsed = settingsSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: '校验失败', issues: firstIssues(parsed.error) }, { status: 400 })
  }
  await writeSettings(parsed.data)
  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
}
