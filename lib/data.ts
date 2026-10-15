import { readSiteData } from './kv'
import { TOOL_REGISTRY } from './registry'
import type { NetworkServiceConfig, PublicNetworkConfig, PublicSiteData, SiteData, ToolConfig } from './types'

/** Ensure every registry tool has an entry, preserving admin-defined state. */
export function reconcileTools(tools: ToolConfig[]): ToolConfig[] {
  const known = new Map(tools.map((t) => [t.slug, t]))
  return TOOL_REGISTRY.map((meta, i) => {
    const existing = known.get(meta.slug)
    return existing ?? { slug: meta.slug, enabled: true, order: 100 + i }
  }).sort((a, b) => a.order - b.order)
}

/**
 * Strip every secret before the payload leaves the server.
 * A token-carrying endpoint is only reachable via /api/tools/proxy.
 */
export function publicNetworkConfig(cfg?: NetworkServiceConfig): PublicNetworkConfig {
  const hasSecret = Boolean(cfg?.token && cfg?.tokenPlacement !== 'none')
  return {
    enabled: Boolean(cfg?.enabled),
    endpoint: hasSecret ? undefined : cfg?.endpoint,
    method: cfg?.method ?? 'GET',
    timeoutMs: cfg?.timeoutMs ?? 8000,
    useProxy: hasSecret,
  }
}

export async function getPublicData(): Promise<PublicSiteData> {
  const data = await readSiteData()
  const { network, ...safeSettings } = data.settings
  return {
    categories: data.categories.slice().sort((a, b) => a.order - b.order),
    sites: data.sites.slice().sort((a, b) => a.order - b.order),
    tools: reconcileTools(data.tools).filter((t) => t.enabled),
    settings: { ...safeSettings, network: undefined },
    customTools: (data.customTools ?? [])
      .filter((t) => t.enabled)
      .sort((a, b) => a.order - b.order),
    networkPublic: {
      ipLookup: publicNetworkConfig(network?.ipLookup),
      dnsLookup: publicNetworkConfig(network?.dnsLookup),
    },
  }
}

export async function getAdminData(): Promise<SiteData> {
  const data = await readSiteData()
  return {
    categories: data.categories.slice().sort((a, b) => a.order - b.order),
    sites: data.sites.slice().sort((a, b) => a.order - b.order),
    tools: reconcileTools(data.tools),
    settings: data.settings,
    customTools: (data.customTools ?? []).slice().sort((a, b) => a.order - b.order),
  }
}
