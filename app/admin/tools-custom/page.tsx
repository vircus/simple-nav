import { ADMIN_BASE } from '@/lib/auth'
import { AdminShell, ADMIN_ROBOTS } from '@/components/admin/admin-shell'
import { CustomToolsView } from '@/components/admin/custom-tools-view'

export const dynamic = 'force-dynamic'
export const metadata = { title: '自定义工具 · 管理面板', robots: ADMIN_ROBOTS }

export default function AdminCustomToolsPage() {
  return (
    <AdminShell base={ADMIN_BASE} title="自定义工具">
      <CustomToolsView />
    </AdminShell>
  )
}
