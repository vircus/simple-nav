import { getPublicData } from '@/lib/data'
import { HomeClient } from '@/components/home-client'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const data = await getPublicData()
  return <HomeClient data={data} />
}
