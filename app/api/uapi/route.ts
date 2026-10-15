import { NextResponse, type NextRequest } from 'next/server'
import { fetchUapi, UAPI_ENDPOINTS, type UapiKind } from '@/lib/uapi'

export const dynamic = 'force-dynamic'

function isKind(v: string): v is UapiKind {
  return Object.prototype.hasOwnProperty.call(UAPI_ENDPOINTS, v)
}

/** uapis.cn 通用代理（同样因为上游无 CORS 头）。 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const kind = (sp.get('kind') || '').trim()

  if (!kind || !isKind(kind)) {
    return NextResponse.json(
      { error: '未知的接口类型', supported: Object.keys(UAPI_ENDPOINTS) },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  const ep = UAPI_ENDPOINTS[kind]
  const params: Record<string, string> = {}
  for (const p of ep.params ?? []) {
    const v = sp.get(p.key)
    if (v !== null) params[p.key] = v
  }

  try {
    const data = await fetchUapi(kind, params)
    return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '接口请求失败' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
