import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Lock } from 'lucide-react'
import { getPublicData } from '@/lib/data'
import { TOOL_MAP, TOOL_CATEGORY_LABEL } from '@/lib/registry'
import { ToolRenderer } from '@/components/tools'
import { CustomToolView } from '@/components/tools/custom'
import { ToolIcon } from '@/components/tool-icon'
import { Button } from '@/components/ui/button'
import type { PublicNetworkConfig } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const meta = TOOL_MAP.get(slug)
  if (meta) return { title: `${meta.name} · 工具箱` }

  const { customTools } = await getPublicData()
  const custom = customTools?.find((t) => t.slug === slug)
  return { title: custom ? `${custom.name} · 工具箱` : '工具' }
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getPublicData()

  const meta = TOOL_MAP.get(slug)

  // 自定义工具（管理面板新增）
  if (!meta) {
    const custom = (data.customTools ?? []).find((t) => t.slug === slug)
    if (!custom) notFound()

    return (
      <div>
        <BackLink />
        <header className="mb-6 flex items-start gap-3.5">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl grad-fill text-white shadow-glow">
            <ToolIcon name={custom.icon || 'Binary'} className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted/80">
              {TOOL_CATEGORY_LABEL[custom.category]} · 自定义
            </p>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">{custom.name}</h1>
            <p className="mt-1 text-sm text-muted">{custom.description}</p>
          </div>
        </header>
        <CustomToolView tool={custom} />
      </div>
    )
  }

  const cfg = data.tools.find((t) => t.slug === slug)
  if (!cfg?.enabled) {
    return (
      <div className="card grid place-items-center gap-3 p-12 text-center">
        <Lock className="h-8 w-8 text-muted" aria-hidden />
        <p className="text-base font-extrabold">该工具已停用</p>
        <p className="max-w-sm text-sm text-muted">可在管理面板的「工具管理」中重新启用。</p>
        <Button href="/tools" variant="outline" size="sm">
          返回工具箱
        </Button>
      </div>
    )
  }

  const network = data.networkPublic as
    | { ipLookup: PublicNetworkConfig; dnsLookup: PublicNetworkConfig }
    | undefined

  return (
    <div>
      <BackLink />
      <header className="mb-6 flex items-start gap-3.5">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl grad-fill text-white shadow-glow">
          <ToolIcon name={meta.icon} className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted/80">
            {TOOL_CATEGORY_LABEL[meta.category]}
          </p>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">{meta.name}</h1>
          <p className="mt-1 text-sm text-muted">{meta.description}</p>
        </div>
      </header>

      <ToolRenderer slug={slug} network={network} />
    </div>
  )
}

function BackLink() {
  return (
    <Link
      href="/tools"
      className="mb-5 inline-flex items-center gap-1.5 text-sm font-bold text-muted transition hover:-translate-x-0.5 hover:text-brand"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
      返回工具箱
    </Link>
  )
}
