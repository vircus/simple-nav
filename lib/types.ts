export type ThemeMode = 'light' | 'dark' | 'system'
export type ToolCategory =
  | 'devops'
  | 'text'
  | 'education'
  | 'image'
  | 'chart'
  | 'random'
  | 'misc'
  | 'ai'
  | 'game'
export type TokenPlacement = 'none' | 'header' | 'query'

export interface Category {
  id: string
  name: string
  icon?: string
  order: number
}

export interface Site {
  id: string
  categoryId: string
  name: string
  url: string
  icon?: string
  description?: string
  isInternal: boolean
  openInNewTab: boolean
  order: number
}

export interface ToolConfig {
  slug: string
  enabled: boolean
  order: number
}

export interface NetworkServiceConfig {
  enabled: boolean
  /** Supports {ip} / {domain} / {type} placeholders */
  endpoint: string
  method: 'GET' | 'POST'
  /** Custom request headers as a JSON string */
  headers?: string
  /** Secret token — server-side only, never sent to the browser */
  token?: string
  tokenPlacement: TokenPlacement
  tokenKey?: string
  timeoutMs: number
  cacheTtlSec: number
}

export type SayingProvider = 'uapis' | 'hitokoto'

/**
 * 首页 Hero 文案使用的一言接口配置。
 * 按 preferred 优先级尝试，失败自动回落到另一个源。
 */
export interface SayingSettings {
  /** uapis.cn 的 API Key（免费接口可不填；配置后以 Bearer 方式携带） */
  apiKey?: string
  preferred: SayingProvider
}

export interface SiteSettings {
  title: string
  subtitle?: string
  logoUrl?: string
  faviconUrl?: string
  themeColor: string
  defaultTheme: ThemeMode
  footerText?: string
  /**
   * Sole purpose: identify whether a site URL belongs to this domain,
   * so the "本站" badge can be rendered. Never used for routing, redirect,
   * auth or cookie scope.
   */
  primaryDomain?: string
  network?: {
    ipLookup: NetworkServiceConfig
    dnsLookup: NetworkServiceConfig
  }

  // —— 一言（首页 Hero 文案）——
  saying?: SayingSettings

  seo?: {
    title?: string
    description?: string
    keywords?: string
    ogImage?: string
  }
}

export type CustomToolType = 'link' | 'embed'

/**
 * A tool created from the admin panel.
 *  - link  : opens an external URL (a tool hosted elsewhere)
 *  - embed : renders admin-authored HTML inside a sandboxed iframe
 */
export interface CustomTool {
  id: string
  slug: string
  name: string
  description?: string
  category: ToolCategory
  icon?: string
  type: CustomToolType
  url: string
  html?: string
  enabled: boolean
  order: number
}

export interface SiteData {
  categories: Category[]
  sites: Site[]
  tools: ToolConfig[]
  settings: SiteSettings
  customTools: CustomTool[]
}

/** Payload returned by the public endpoint — secrets stripped. */
export interface PublicSiteData extends SiteData {
  networkPublic?: {
    ipLookup: PublicNetworkConfig
    dnsLookup: PublicNetworkConfig
  }
}

export interface PublicNetworkConfig {
  enabled: boolean
  /** Only exposed when no secret token is configured, so the browser may call directly */
  endpoint?: string
  method: 'GET' | 'POST'
  timeoutMs: number
  /** true → must go through /api/tools/proxy because a secret token is involved */
  useProxy: boolean
}
