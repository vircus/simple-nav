import { ADMIN_BASE } from '@/lib/auth'
import { AdminShell, ADMIN_ROBOTS } from '@/components/admin/admin-shell'
import { SettingsView } from '@/components/admin/settings-view'

export const dynamic = 'force-dynamic'
export const metadata = { title: '站点设置 · 管理面板', robots: ADMIN_ROBOTS }

export default function AdminSettingsPage() {
  return (
    <AdminShell base={ADMIN_BASE} title="站点设置">
      <SettingsView />
    </AdminShell>
  )
}
