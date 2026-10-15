import Link from 'next/link'
import { LayoutGrid, Link2, Wrench, Settings, Info } from 'lucide-react'
import { ADMIN_BASE } from '@/lib/auth'
import { getAdminData } from '@/lib/data'
import { kvBackendName } from '@/lib/kv'
import { AdminShell, ADMIN_ROBOTS } from '@/components/admin/admin-shell'

export const dynamic = 'force-dynamic'
export const metadata = { title: '概览 · 管理面板', robots: ADMIN_ROBOTS }

export default async function AdminHomePage() {
  const base = ADMIN_BASE
  const data = await getAdminData()
  const backend = kvBackendName()

  const cards = [
    { href: `${base}/categories`, label: '分类', value: data.categories.length, Icon: LayoutGrid },
    { href: `${base}/sites`, label: '站点', value: data.sites.length, Icon: Link2 },
    {
      href: `${base}/tools`,
      label: '已启用工具',
      value: data.tools.filter((t) => t.enabled).length,
      Icon: Wrench,
    },
    { href: `${base}/settings`, label: '设置项', value: 3, Icon: Settings },
  ]

  return (
    <AdminShell base={base} title="概览">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ href, label, value, Icon }) => (
          <Link
            key={href}
            href={href}
            className="group card-interactive fx-magnet spotlight p-4 transition"
          >
            <span className="mb-3 grid h-10 w-10 place-items-center rounded-xl grad-fill text-white shadow-glow transition-transform duration-300 ease-spring group-hover:scale-105 group-hover:rotate-3">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <p className="text-2xl font-black tabular-nums tracking-tight">{value}</p>
            <p className="text-xs font-semibold text-muted">{label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-start gap-2.5 rounded-xl border border-flash/30 bg-flash/8 p-3.5">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-flash" aria-hidden />
          <div className="text-xs leading-relaxed text-muted">
            <p className="font-bold text-fg">数据存储：{backend === 'edgeone-kv' ? 'EdgeOne KV' : '内存回退（仅本地开发）'}</p>
            <p className="mt-1">
              EdgeOne KV 为最终一致性模型，保存后全球节点同步最长约 60 秒。界面已做乐观更新，
              无需等待同步完成。
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-surface-2 p-3.5 text-xs leading-relaxed text-muted">
          <p className="font-bold text-fg">登录凭据</p>
          <p className="mt-1">
            管理员账号与密码通过环境变量配置：
            <code className="rounded bg-fg/10 px-1 py-0.5 font-mono">ADMIN_USERNAME</code>（默认 admin）
            与 <code className="rounded bg-fg/10 px-1 py-0.5 font-mono">ADMIN_PASSWORD</code>。
            如需避免明文，可改用{' '}
            <code className="rounded bg-fg/10 px-1 py-0.5 font-mono">ADMIN_PASSWORD_HASH</code>
            （配置后优先于明文）。
          </p>
          <p className="mt-1">
            管理入口位于 <code className="rounded bg-fg/10 px-1 py-0.5 font-mono">/admin</code>
            ，已在 robots.txt 中禁止索引。访问受签名会话保护，未登录会自动跳转登录页。
          </p>
        </div>
      </div>
    </AdminShell>
  )
}
