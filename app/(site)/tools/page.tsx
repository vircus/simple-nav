import { Wrench } from 'lucide-react'
import { getPublicData } from '@/lib/data'
import { TOOL_CATEGORY_LABEL, TOOL_CATEGORY_ORDER, TOOL_MAP } from '@/lib/registry'
import { ToolCard, CustomToolCard } from '@/components/tool-card'
import { Reveal } from '@/components/fx/reveal'

export const dynamic = 'force-dynamic'

export default async function ToolsPage() {
  const data = await getPublicData()
  const enabled = data.tools.filter((t) => TOOL_MAP.has(t.slug))
  const custom = data.customTools ?? []

  const groups = TOOL_CATEGORY_ORDER.map((cat) => ({
    cat,
    items: enabled.filter((t) => TOOL_MAP.get(t.slug)!.category === cat),
    customs: custom.filter((c) => c.category === cat),
  })).filter((g) => g.items.length > 0 || g.customs.length > 0)

  const total = enabled.length + custom.length

  return (
    <div>
      <header className="mb-7">
        <span className="chip mb-3 bg-accent/12 text-accent animate-pop-in">
          <Wrench className="h-3.5 w-3.5" aria-hidden />
          内置工具
        </span>
        <h1 className="font-black leading-[1.05] tracking-tight text-display-sm sm:text-display-md">
          <span className="grad-text">工具箱</span>
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
          共 {total} 个工具，除网络查询外均在本地浏览器计算，输入内容不会上传。
        </p>
      </header>

      {groups.length === 0 ? (
        <div className="card grid place-items-center gap-3 p-12 text-center">
          <Wrench className="h-8 w-8 text-muted" aria-hidden />
          <p className="text-base font-extrabold">暂无可用工具</p>
          <p className="max-w-sm text-sm text-muted">可在管理面板中启用内置工具，或新增自定义工具。</p>
        </div>
      ) : (
        groups.map(({ cat, items, customs }, gi) => (
          <section key={cat} id={`tool-cat-${cat}`} className="mb-10 scroll-mt-24">
            <h2 className="mb-4 text-lg font-black tracking-tight">{TOOL_CATEGORY_LABEL[cat]}</h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((t, i) => (
                <Reveal key={t.slug} delay={Math.min(i, 8) * 55}>
                  <ToolCard slug={t.slug} index={gi + i} />
                </Reveal>
              ))}
              {customs.map((c, i) => (
                <Reveal key={c.id} delay={Math.min(items.length + i, 8) * 55}>
                  <CustomToolCard tool={c} index={gi + items.length + i} />
                </Reveal>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  )
}
