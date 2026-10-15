import { NextResponse } from 'next/server'
import { getAdminData } from '@/lib/data'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(await getAdminData(), { headers: { 'Cache-Control': 'no-store' } })
}
