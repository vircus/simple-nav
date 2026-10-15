'use client'

import { iconFor } from '@/lib/tool-icons'

/** Client wrapper so server components can render a tool icon by name. */
export function ToolIcon({ name, className }: { name: string; className?: string }) {
  const Icon = iconFor(name)
  return <Icon className={className} aria-hidden />
}
