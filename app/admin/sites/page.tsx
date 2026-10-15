import { ADMIN_BASE } from '@/lib/auth'
import { AdminShell, ADMIN_ROBOTS } from '@/components/admin/admin-shell'
import { SitesView } from '@/components/admin/sites-view'

export const dynamic = 'force-dynamic'
export const metadata = { title: '站点管理 · 管理面板', robots: ADMIN_ROBOTS }

export default function AdminSitesPage() {
  return (
    <AdminShell base={ADMIN_BASE} title="站点管理">
      <SitesView />
    </AdminShell>
  )
}
