'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Lock, User, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'

export function LoginForm({
  base,
  configured = true,
}: {
  base: string
  /** false = 服务端未配置任何管理员凭据 */
  configured?: boolean
}) {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(j.error || '登录失败')
      }
      toast('登录成功', 'ok')
      router.push(base)
      router.refresh()
    } catch (err) {
      const msg = err instanceof Error ? err.message : '登录失败'
      setError(msg)
      toast(msg, 'err')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-12">
      <div className="mb-7 text-center">
        <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl grad-fill text-white shadow-glow animate-float">
          <ShieldCheck className="h-7 w-7" aria-hidden />
        </span>
        <h1 className="text-2xl font-black tracking-tight">管理面板</h1>
        <p className="mt-1.5 text-sm text-muted">请输入管理员账号与密码以继续</p>
      </div>

      <form onSubmit={submit} className="card space-y-3 p-5">
        {!configured && (
          <div className="flex items-start gap-2.5 rounded-xl border border-coral/40 bg-coral/10 p-3.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-coral" aria-hidden />
            <div className="text-xs leading-relaxed">
              <p className="font-bold text-coral">服务端尚未配置管理员凭据</p>
              <p className="mt-1 text-muted">
                在项目根目录创建 <code className="rounded bg-fg/10 px-1 font-mono">.env.local</code>
                ，设置{' '}
                <code className="rounded bg-fg/10 px-1 font-mono">ADMIN_PASSWORD</code> 与{' '}
                <code className="rounded bg-fg/10 px-1 font-mono">SESSION_SECRET</code>，
                然后<b>重启服务</b>。此时无论输入什么都登录不了。
              </p>
            </div>
          </div>
        )}

        <label className="block">
          <span className="mb-1 block text-xs font-bold text-muted">账号</span>
          <div className="relative">
            <User
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden
            />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              autoComplete="username"
              className="field pl-10"
              placeholder="admin"
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-bold text-muted">密码</span>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="field pl-10"
              placeholder="••••••••"
            />
          </div>
        </label>

        {error && (
          <p className="rounded-xl border border-coral/40 bg-coral/10 p-3 text-sm font-semibold text-coral">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={busy || !username || !password}>
          {busy ? '验证中…' : '登录'}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-muted/80">
        连续失败 5 次将锁定 15 分钟
      </p>
    </div>
  )
}
