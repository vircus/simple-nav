import { NextResponse, type NextRequest } from 'next/server'
import { readSiteData } from '@/lib/kv'
import { fetchSayingCached } from '@/lib/uapi'

export const dynamic = 'force-dynamic'

/**
 * 首页 Hero 一言。凭据与优先级来自管理面板「站点设置 → 一言」。
 * 主源失败自动回落到备用源，全部失败返回 502。
 */
export async function GET() {
  const { settings } = await readSiteData()

  try {
    const result = await fetchSayingCached({
      apiKey: settings.saying?.apiKey,
      preferred: settings.saying?.preferred,
    })
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '一言获取失败' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
