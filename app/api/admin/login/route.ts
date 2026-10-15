import { NextResponse, type NextRequest } from 'next/server'
import {
  SESSION_COOKIE,
  signSession,
  verifyCredentials,
  isCredentialConfigured,
  checkRateLimit,
  registerFailure,
  clearFailures,
} from '@/lib/auth'

export const dynamic = 'force-dynamic'

function clientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

export async function POST(req: NextRequest) {
  // 服务端尚未配置任何凭据 —— 明确报错，避免被误判为「密码输错」
  if (!isCredentialConfigured()) {
    return NextResponse.json(
      {
        error:
          '服务端未配置管理员凭据。请在项目根目录创建 .env.local 并设置 ADMIN_PASSWORD（或 ADMIN_PASSWORD_HASH）与 SESSION_SECRET，然后重启服务。',
      },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  const ip = clientIp(req)
  const limit = checkRateLimit(ip)
  if (!limit.ok) {
    return NextResponse.json(
      { error: `尝试次数过多，请 ${Math.ceil(limit.retryAfterSec / 60)} 分钟后再试` },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSec) } },
    )
  }

  let username = ''
  let password = ''
  try {
    const body = (await req.json()) as { username?: string; password?: string }
    username = String(body.username ?? '')
    password = String(body.password ?? '')
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 })
  }

  if (!username || !password || !(await verifyCredentials(username, password))) {
    registerFailure(ip)
    return NextResponse.json({ error: '账号或密码不正确' }, { status: 401 })
  }

  clearFailures(ip)
  const token = await signSession()
  const res = NextResponse.json({ ok: true })
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  })
  return res
}
