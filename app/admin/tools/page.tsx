import { ADMIN_BASE } from '@/lib/auth'
import { AdminShell, ADMIN_ROBOTS } from '@/components/admin/admin-shell'
import { ToolsView } from '@/components/admin/tools-view'

export const dynamic = 'force-dynamic'
export const metadata = { title: '工具管理 · 管理面板', robots: ADMIN_ROBOTS }

export default function AdminToolsPage() {
  return (
    <AdminShell base={ADMIN_BASE} title="工具管理">
      <ToolsView />
    </AdminShell>
  )
}
