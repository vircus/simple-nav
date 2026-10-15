'use client'

import { ExternalLink, Code2, ShieldAlert } from 'lucide-react'
import { Panel } from './shared'
import { Button } from '@/components/ui/button'
import type { CustomTool } from '@/lib/types'
import { iconFor } from '@/lib/tool-icons'

/**
 * Renders an admin-authored tool.
 * `embed` uses a sandboxed iframe WITHOUT allow-same-origin, so the injected
 * HTML cannot touch the parent page, its DOM or its cookies.
 */
export function CustomToolView({ tool }: { tool: CustomTool }) {
  const Icon = iconFor(tool.icon || 'Binary')

  if (tool.type === 'link') {
    return (
      <div className="space-y-4">
        <Panel title={tool.name} hint={tool.description || undefined}>
          <div className="flex flex-col items-start gap-3 rounded-xl border border-line bg-surface-2 p-4">
            <span className="grid h-12 w-12 place-items-center rounded-2xl grad-fill text-white shadow-glow">
              <Icon className="h-6 w-6" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold">{tool.name}</p>
              <p className="mt-0.5 break-all font-mono text-xs text-muted">{tool.url}</p>
            </div>
            <Button href={tool.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              在新标签页打开
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted">
            这是一个外链型自定义工具，点击后将跳转到上方地址。
          </p>
        </Panel>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Panel
        title={tool.name}
        hint={tool.description || undefined}
        action={
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted">
            <ShieldAlert className="h-3.5 w-3.5" aria-hidden />
            沙箱隔离运行
          </span>
        }
      >
        <div className="flex items-center gap-2 rounded-xl border border-line bg-surface-2 px-3 py-2 text-xs text-muted">
          <Code2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
          以下内容由管理面板自定义，运行在受限沙箱中（无法访问本站页面与 Cookie）。
        </div>
        <iframe
          title={tool.name}
          srcDoc={tool.html || ''}
          sandbox="allow-scripts allow-modals allow-forms allow-popups"
          className="mt-3 h-[520px] w-full rounded-xl border border-line bg-white"
          loading="lazy"
        />
      </Panel>
    </div>
  )
}
