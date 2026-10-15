import { z } from 'zod'
import { isSafeHttpUrl } from './utils'
import { TOOL_MAP } from './registry'

const httpUrl = z
  .string()
  .min(1)
  .refine(isSafeHttpUrl, { message: '仅允许 http:// 或 https:// 开头的地址' })

const optionalUrl = z
  .string()
  .refine((v) => v === '' || isSafeHttpUrl(v), { message: '仅允许 http:// 或 https:// 开头的地址' })
  .optional()

export const categorySchema = z.object({
  id: z.string().min(1).max(64),
  name: z.string().min(1, '名称不能为空').max(40),
  icon: z.string().max(60).optional(),
  order: z.number().int().min(0).max(9999),
})

export const siteSchema = z.object({
  id: z.string().min(1).max(64),
  categoryId: z.string().min(1),
  name: z.string().min(1, '名称不能为空').max(60),
  url: httpUrl,
  icon: optionalUrl,
  description: z.string().max(200).optional(),
  isInternal: z.boolean(),
  openInNewTab: z.boolean(),
  order: z.number().int().min(0).max(9999),
})

export const toolConfigSchema = z.object({
  slug: z.string().refine((s) => TOOL_MAP.has(s), { message: '未知工具' }),
  enabled: z.boolean(),
  order: z.number().int().min(0).max(9999),
})

export const networkServiceSchema = z.object({
  enabled: z.boolean(),
  endpoint: z.string().max(500),
  method: z.enum(['GET', 'POST']),
  headers: z.string().max(1000).optional(),
  token: z.string().max(500).optional(),
  tokenPlacement: z.enum(['none', 'header', 'query']),
  tokenKey: z.string().max(100).optional(),
  timeoutMs: z.number().int().min(1000).max(30000),
  cacheTtlSec: z.number().int().min(0).max(86400),
})

const slugRe = /^[a-z0-9][a-z0-9-]{0,39}$/

export const customToolSchema = z.object({
  id: z.string().min(1).max(64),
  slug: z
    .string()
    .regex(slugRe, { message: '标识只能包含小写字母、数字与连字符，且不能以连字符开头' })
    .refine((s) => !TOOL_MAP.has(s), { message: '标识与内置工具冲突，请换一个' }),
  name: z.string().min(1, '名称不能为空').max(60),
  description: z.string().max(200).optional(),
  category: z.enum([
    'devops',
    'text',
    'education',
    'image',
    'chart',
    'random',
    'misc',
    'ai',
    'game',
  ]),
  icon: z.string().max(60).optional(),
  type: z.enum(['link', 'embed']),
  url: z.string().refine((v) => v === '' || isSafeHttpUrl(v), {
    message: '仅允许 http:// 或 https:// 开头的地址',
  }),
  html: z.string().max(200_000).optional(),
  enabled: z.boolean(),
  order: z.number().int().min(0).max(9999),
})

const hex = z
  .string()
  .regex(/^#([0-9a-fA-F]{6})$/, { message: '需为 #RRGGBB 格式' })

export const settingsSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(60),
  subtitle: z.string().max(120).optional(),
  logoUrl: optionalUrl,
  faviconUrl: optionalUrl,
  themeColor: hex,
  defaultTheme: z.enum(['light', 'dark', 'system']),
  footerText: z.string().max(200).optional(),
  primaryDomain: z
    .string()
    .max(120)
    .refine((v) => v === '' || /^(\*\.)?[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(v), {
      message: '请填写形如 example.com 的域名',
    })
    .optional(),
  network: z
    .object({
      ipLookup: networkServiceSchema,
      dnsLookup: networkServiceSchema,
    })
    .optional(),
  saying: z
    .object({
      apiKey: z.string().max(500).optional(),
      preferred: z.enum(['uapis', 'hitokoto']),
    })
    .optional(),
  seo: z
    .object({
      title: z.string().max(120).optional(),
      description: z.string().max(300).optional(),
      keywords: z.string().max(200).optional(),
      ogImage: optionalUrl,
    })
    .optional(),
})

export const collectionsSchema = z.object({
  categories: z.array(categorySchema).max(200),
  sites: z.array(siteSchema).max(3000),
  tools: z.array(toolConfigSchema).max(500),
})

export type ValidationIssue = { path: string; message: string }

export function firstIssues(err: z.ZodError): ValidationIssue[] {
  return err.issues.slice(0, 6).map((i) => ({
    path: i.path.join('.'),
    message: i.message,
  }))
}
