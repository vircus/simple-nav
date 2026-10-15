import { NextResponse } from 'next/server'
import { getPublicData } from '@/lib/data'

export const dynamic = 'force-dynamic'

/** Public read endpoint — secrets are stripped server-side. */
export async function GET() {
  const data = await getPublicData()
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'no-store, must-revalidate' },
  })
}
