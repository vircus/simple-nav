import { NextResponse, type NextRequest } from 'next/server'
import { resolveShortLink } from '@/lib/links'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const link = await resolveShortLink(code)
  if (!link) return NextResponse.redirect(new URL('/', _req.nextUrl.origin))
  return NextResponse.redirect(link.url, 302)
}
