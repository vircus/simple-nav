import { ADMIN_BASE } from '@/lib/auth'
import { AdminShell, ADMIN_ROBOTS } from '@/components/admin/admin-shell'
import { CategoriesView } from '@/components/admin/categories-view'

export const dynamic = 'force-dynamic'
export const metadata = { title: '分类管理 · 管理面板', robots: ADMIN_ROBOTS }

export default function AdminCategoriesPage() {
  return (
    <AdminShell base={ADMIN_BASE} title="分类管理">
      <CategoriesView />
    </AdminShell>
  )
}
