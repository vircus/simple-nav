import { ADMIN_BASE, isCredentialConfigured } from '@/lib/auth'
import { LoginForm } from '@/components/admin/login-form'
import { ADMIN_ROBOTS } from '@/components/admin/admin-shell'

export const dynamic = 'force-dynamic'
export const metadata = { title: '登录 · 管理面板', robots: ADMIN_ROBOTS }

export default function AdminLoginPage() {
  // 只暴露「是否已配置」这一布尔状态，不暴露任何凭据本身
  return <LoginForm base={ADMIN_BASE} configured={isCredentialConfigured()} />
}
