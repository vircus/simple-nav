import { NextResponse, type NextRequest } from 'next/server'
import { fetchHotBoard, HOTBOARD_TYPES } from '@/lib/uapi'

export const dynamic = 'force-dynamic'

const ALLOWED = new Set<string>(HOTBOARD_TYPES.map((t) => t.id))

/**
 * 热榜聚合代理。uapis.cn 不返回 CORS 头，浏览器无法直连，故经服务端转发。
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const type = (sp.get('type') || '').trim()

  if (!type || !ALLOWED.has(type)) {
    return NextResponse.json(
      { error: '不支持的热榜类型', supported: [...ALLOWED] },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  const raw = sp.get('time')
  const timeMs = raw && /^\d+$/.test(raw.trim()) ? Number(raw.trim()) : undefined

  try {
    const data = await fetchHotBoard(type, timeMs)
    return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '热榜获取失败' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
