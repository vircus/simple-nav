import { NextResponse, type NextRequest } from 'next/server'
import { createShortLink } from '@/lib/links'
import { isSafeHttpUrl } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  let payload: { url?: string; custom?: string }
  try {
    payload = (await req.json()) as typeof payload
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 })
  }

  const url = (payload.url || '').trim()
  if (!url || !isSafeHttpUrl(url)) {
    return NextResponse.json({ error: '请填写合法的 http(s) 链接' }, { status: 400 })
  }

  try {
    const link = await createShortLink(url, payload.custom)
    const origin = req.nextUrl.origin
    return NextResponse.json(
      { code: link.code, url: link.url, short: `${origin}/s/${link.code}` },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '生成失败' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
