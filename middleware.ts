import { NextResponse, type NextRequest } from 'next/server'
import { parseSessionCookie, verifySession } from '@/lib/auth'

/**
 * Guards the admin area at its normal, predictable path.
 * The panel is no longer hidden — protection is the signed session.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // API guard (handlers validate again as defence in depth)
  if (pathname.startsWith('/api/admin/') && pathname !== '/api/admin/login') {
    const ok = await verifySession(parseSessionCookie(req.headers.get('cookie')))
    if (!ok) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }
    return NextResponse.next()
  }

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    if (pathname !== '/admin/login') {
      const ok = await verifySession(parseSessionCookie(req.headers.get('cookie')))
      if (!ok) {
        const url = req.nextUrl.clone()
        url.pathname = '/admin/login'
        url.search = ''
        return NextResponse.redirect(url)
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/api/admin/:path*'],
}
