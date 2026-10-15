'use client'

import { Save, Quote } from 'lucide-react'
import { useAdminData } from './api'
import { Button } from '@/components/ui/button'
import { Segmented } from '@/components/tools/shared'
import { defaultNetworkConfig } from '@/lib/defaults'
import { ErrorBox, LoadingBox } from './categories-view'
import type { NetworkServiceConfig, SayingProvider, SiteSettings } from '@/lib/types'

export function SettingsView() {
  const { data, error, saving, save, setData } = useAdminData()

  if (error) return <ErrorBox message={error} />
  if (!data) return <LoadingBox />

  const s = data.settings
  const patch = (key: keyof SiteSettings, value: unknown) =>
    setData((p) => (p ? { ...p, settings: { ...p.settings, [key]: value } } : p))

  const patchSeo = (key: string, value: string) =>
    setData((p) =>
      p ? { ...p, settings: { ...p.settings, seo: { ...p.settings.seo, [key]: value } } } : p,
    )

  const patchNetwork = (which: 'ipLookup' | 'dnsLookup', value: Partial<NetworkServiceConfig>) =>
    setData((p) => {
      if (!p) return p
      const prev = p.settings.network?.[which] ?? defaultNetworkConfig()
      return {
        ...p,
        settings: {
          ...p.settings,
          network: {
            ipLookup: p.settings.network?.ipLookup ?? defaultNetworkConfig(),
            dnsLookup: p.settings.network?.dnsLookup ?? defaultNetworkConfig(),
            [which]: { ...prev, ...value },
          },
        },
      }
    })

  const patchSaying = (value: Partial<NonNullable<SiteSettings['saying']>>) =>
    setData((p) =>
      p
        ? {
            ...p,
            settings: {
              ...p.settings,
              saying: {
                apiKey: p.settings.saying?.apiKey ?? '',
                preferred: p.settings.saying?.preferred ?? 'uapis',
                ...value,
              },
            },
          }
        : p,
    )

  return (
    <div className="space-y-4">
      {/* basic */}
      <Section title="站点信息" hint="展示在前台侧边栏与页面标题">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="站点标题">
            <input
              value={s.title}
              onChange={(e) => patch('title', e.target.value)}
              className="field"
            />
          </Field>
          <Field label="副标题">
            <input
              value={s.subtitle ?? ''}
              onChange={(e) => patch('subtitle', e.target.value)}
              className="field"
            />
          </Field>
          <Field label="Logo 地址">
            <input
              value={s.logoUrl ?? ''}
              onChange={(e) => patch('logoUrl', e.target.value)}
              className="field font-mono text-[13px]"
              placeholder="https://…"
            />
          </Field>
          <Field label="Favicon 地址">
            <input
              value={s.faviconUrl ?? ''}
              onChange={(e) => patch('faviconUrl', e.target.value)}
              className="field font-mono text-[13px]"
              placeholder="https://…"
            />
          </Field>
          <Field label="主题色">
            <div className="flex gap-2">
              <input
                type="color"
                value={s.themeColor}
                onChange={(e) => patch('themeColor', e.target.value)}
                className="h-11 w-14 cursor-pointer rounded-xl border border-line bg-surface p-1"
                aria-label="主题色"
              />
              <input
                value={s.themeColor}
                onChange={(e) => patch('themeColor', e.target.value)}
                className="field flex-1 font-mono"
              />
            </div>
          </Field>
          <Field label="默认主题">
            <Segmented
              value={s.defaultTheme}
              onChange={(v) => patch('defaultTheme', v)}
              options={[
                { value: 'system', label: '跟随系统' },
                { value: 'light', label: '浅色' },
                { value: 'dark', label: '深色' },
              ]}
            />
          </Field>
          <Field label="页脚文案" className="sm:col-span-2">
            <input
              value={s.footerText ?? ''}
              onChange={(e) => patch('footerText', e.target.value)}
              className="field"
            />
          </Field>
        </div>
      </Section>

      {/* primary domain */}
      <Section title="主域名" hint="仅用于识别站点链接是否属于本站，据此展示「本站」徽标；不参与任何路由或跳转逻辑">
        <Field label="主域名" hint="形如 example.com，留空则关闭识别">
          <input
            value={s.primaryDomain ?? ''}
            onChange={(e) => patch('primaryDomain', e.target.value)}
            className="field font-mono"
            placeholder="example.com"
          />
        </Field>
      </Section>

      {/* network services */}
      <Section
        title="网络服务"
        hint="IP 归属地与 DNS 查询使用公开免费接口，可在此替换为自己的接口。配置了鉴权 Token 后，请求将改由服务端代理转发，Token 不会下发到浏览器。"
      >
        <div className="space-y-4">
          <NetworkForm
            title="IP 归属地查询"
            placeholders="{ip}"
            value={s.network?.ipLookup ?? defaultNetworkConfig()}
            onChange={(v) => patchNetwork('ipLookup', v)}
          />
          <NetworkForm
            title="DNS 记录查询"
            placeholders="{domain} {type}"
            value={s.network?.dnsLookup ?? defaultNetworkConfig()}
            onChange={(v) => patchNetwork('dnsLookup', v)}
          />
        </div>
      </Section>

      {/* 一言 */}
      <Section
        title="一言（首页主文案）"
        hint="首页大标题的文字来自一言接口。按下方优先级依次尝试，主源失效会自动回落到备用源，全部失败时显示默认文案。"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="优先使用" hint="另一个源自动作为备用">
            <Segmented
              value={s.saying?.preferred ?? 'uapis'}
              onChange={(v) => patchSaying({ preferred: v as SayingProvider })}
              options={[
                { value: 'uapis', label: 'UAPI（uapis.cn）' },
                { value: 'hitokoto', label: 'Hitokoto（备用）' },
              ]}
            />
          </Field>
          <Field label="UAPI API Key" hint="免费接口可不填；配置后以 Authorization: Bearer 携带">
            <input
              type="password"
              value={s.saying?.apiKey ?? ''}
              onChange={(e) => patchSaying({ apiKey: e.target.value })}
              className="field font-mono text-[13px]"
              placeholder="可选"
              autoComplete="off"
            />
          </Field>
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-xl border border-line bg-surface-2 p-3 text-xs text-muted">
          <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" aria-hidden />
          <div className="leading-relaxed">
            <p>
              <b className="text-fg">源 1 · UAPI</b>：<code className="font-mono">GET /api/v1/saying</code>{' '}
              （uapis.cn，免费无需密钥）
            </p>
            <p className="mt-1">
              <b className="text-fg">源 2 · Hitokoto</b>：
              <code className="font-mono">GET https://v1.hitokoto.cn/</code>（独立第三方，作为失效备用）
            </p>
            <p className="mt-1">
              两个源在服务端代理 <code className="font-mono">/api/saying</code> 中串行尝试，任一成功即返回。
            </p>
          </div>
        </div>
      </Section>

      {/* seo */}
      <Section title="SEO" hint="留空则回退使用站点标题与副标题">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="页面 Title">
            <input
              value={s.seo?.title ?? ''}
              onChange={(e) => patchSeo('title', e.target.value)}
              className="field"
            />
          </Field>
          <Field label="Keywords">
            <input
              value={s.seo?.keywords ?? ''}
              onChange={(e) => patchSeo('keywords', e.target.value)}
              className="field"
            />
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <textarea
              value={s.seo?.description ?? ''}
              onChange={(e) => patchSeo('description', e.target.value)}
              className="field min-h-[80px] resize-y"
            />
          </Field>
          <Field label="OG 图片地址" className="sm:col-span-2">
            <input
              value={s.seo?.ogImage ?? ''}
              onChange={(e) => patchSeo('ogImage', e.target.value)}
              className="field font-mono text-[13px]"
              placeholder="https://…"
            />
          </Field>
        </div>
      </Section>

      <div className="sticky bottom-4 flex justify-end">
        <Button size="lg" onClick={() => save('settings', s)} disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? '保存中…' : '保存设置'}
        </Button>
      </div>
    </div>
  )
}

function Section({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <section className="card p-4 sm:p-5">
      <header className="mb-4">
        <h2 className="text-sm font-extrabold tracking-tight">{title}</h2>
        {hint && <p className="mt-1 text-xs leading-relaxed text-muted">{hint}</p>}
      </header>
      {children}
    </section>
  )
}

function Field({
  label,
  hint,
  className,
  children,
}: {
  label: string
  hint?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <label className={className}>
      <span className="mb-1 block text-xs font-bold text-muted">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-muted/80">{hint}</span>}
    </label>
  )
}

function NetworkForm({
  title,
  placeholders,
  value,
  onChange,
}: {
  title: string
  placeholders: string
  value: NetworkServiceConfig
  onChange: (v: Partial<NetworkServiceConfig>) => void
}) {
  return (
    <div className="rounded-xl border border-line bg-surface-2 p-3.5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-extrabold">{title}</p>
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={value.enabled}
            onChange={(e) => onChange({ enabled: e.target.checked })}
            className="h-4 w-4 accent-[rgb(var(--c-brand))]"
          />
          启用
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="接口地址" hint={`支持占位符：${placeholders}`} className="sm:col-span-2">
          <input
            value={value.endpoint}
            onChange={(e) => onChange({ endpoint: e.target.value })}
            className="field font-mono text-[13px]"
            placeholder="https://ipwho.is/{ip}"
          />
        </Field>

        <Field label="请求方法">
          <Segmented
            value={value.method}
            onChange={(v) => onChange({ method: v })}
            options={[
              { value: 'GET', label: 'GET' },
              { value: 'POST', label: 'POST' },
            ]}
          />
        </Field>

        <Field label="Token 位置">
          <Segmented
            value={value.tokenPlacement}
            onChange={(v) => onChange({ tokenPlacement: v })}
            options={[
              { value: 'none', label: '无' },
              { value: 'header', label: 'Header' },
              { value: 'query', label: 'Query' },
            ]}
          />
        </Field>

        <Field label="鉴权 Token" hint="配置后将自动改用服务端代理">
          <input
            type="password"
            value={value.token ?? ''}
            onChange={(e) => onChange({ token: e.target.value })}
            className="field font-mono text-[13px]"
            autoComplete="off"
          />
        </Field>

        <Field label="Token 键名" hint="Header 名或 Query 参数名">
          <input
            value={value.tokenKey ?? ''}
            onChange={(e) => onChange({ tokenKey: e.target.value })}
            className="field font-mono text-[13px]"
            placeholder="Authorization"
          />
        </Field>

        <Field label="自定义请求头（JSON）">
          <input
            value={value.headers ?? ''}
            onChange={(e) => onChange({ headers: e.target.value })}
            className="field font-mono text-[13px]"
            placeholder='{"Accept":"application/json"}'
          />
        </Field>

        <Field label={`超时（毫秒）`}>
          <input
            type="number"
            value={value.timeoutMs}
            onChange={(e) => onChange({ timeoutMs: Number(e.target.value) })}
            className="field font-mono"
          />
        </Field>

        <Field label="缓存（秒）" hint="0 表示不缓存">
          <input
            type="number"
            value={value.cacheTtlSec}
            onChange={(e) => onChange({ cacheTtlSec: Number(e.target.value) })}
            className="field font-mono"
          />
        </Field>
      </div>
    </div>
  )
}
