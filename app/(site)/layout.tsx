import { getPublicData } from '@/lib/data'
import { SiteShell } from '@/components/layout/site-shell'
import type { NavGroup } from '@/components/layout/sidebar'
import { TOOL_CATEGORY_LABEL, TOOL_CATEGORY_ORDER, TOOL_MAP } from '@/lib/registry'

export const dynamic = 'force-dynamic'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const data = await getPublicData()

  const enabled = data.tools.filter((t) => TOOL_MAP.has(t.slug))
  const custom = data.customTools ?? []

  // 工具分类：内置与自定义工具都计入，空分类不展示
  const toolCategories: NavGroup[] = TOOL_CATEGORY_ORDER.filter(
    (cat) =>
      enabled.some((t) => TOOL_MAP.get(t.slug)!.category === cat) ||
      custom.some((c) => c.category === cat),
  ).map((cat) => ({ id: cat, label: TOOL_CATEGORY_LABEL[cat] }))

  return (
    <SiteShell
      categories={data.categories}
      toolCategories={toolCategories}
      settings={data.settings}
    >
      {children}
    </SiteShell>
  )
}
