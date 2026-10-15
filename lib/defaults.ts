import type { NetworkServiceConfig, SiteData, SiteSettings } from './types'
import { TOOL_REGISTRY } from './registry'

const EXAMPLE_DOMAIN = 'example.com'

export const DEFAULT_SETTINGS: SiteSettings = {
  title: '我的导航站',
  subtitle: '工具 · 链接 · 一处直达',
  logoUrl: '',
  faviconUrl: '',
  themeColor: '#7C3AED',
  defaultTheme: 'system',
  footerText: '由 EdgeOne Pages 强力驱动',
  primaryDomain: '',
  network: {
    ipLookup: {
      enabled: true,
      endpoint: 'https://ipwho.is/{ip}',
      method: 'GET',
      headers: '',
      token: '',
      tokenPlacement: 'none',
      tokenKey: '',
      timeoutMs: 8000,
      cacheTtlSec: 300,
    },
    dnsLookup: {
      enabled: true,
      endpoint: 'https://dns.google/resolve?name={domain}&type={type}',
      method: 'GET',
      headers: '',
      token: '',
      tokenPlacement: 'none',
      tokenKey: '',
      timeoutMs: 8000,
      cacheTtlSec: 300,
    },
  },
  saying: {
    apiKey: '',
    preferred: 'uapis' as const,
  },
  seo: {
    title: '',
    description: '',
    keywords: '',
    ogImage: '',
  },
}

export const DEFAULT_DATA: SiteData = {
  categories: [
    { id: 'cat_internal', name: '本站服务', icon: 'Home', order: 0 },
    { id: 'cat_dev', name: '开发资源', icon: 'Code2', order: 1 },
    { id: 'cat_design', name: '设计灵感', icon: 'Palette', order: 2 },
    { id: 'cat_productivity', name: '效率工具', icon: 'Zap', order: 3 },
    { id: 'cat_ai', name: 'AI 助手', icon: 'Sparkles', order: 4 },
    { id: 'cat_learn', name: '学习文档', icon: 'BookOpen', order: 5 },
  ],
  sites: [
    {
      id: 'site_blog',
      categoryId: 'cat_internal',
      name: '博客',
      url: `https://blog.${EXAMPLE_DOMAIN}`,
      icon: '',
      description: '示例二级域名站点，请在管理面板替换',
      isInternal: true,
      openInNewTab: true,
      order: 0,
    },
    {
      id: 'site_tools',
      categoryId: 'cat_internal',
      name: '工具箱',
      url: `https://tools.${EXAMPLE_DOMAIN}`,
      icon: '',
      description: '示例二级域名站点，请在管理面板替换',
      isInternal: true,
      openInNewTab: true,
      order: 1,
    },
    {
      id: 'site_wiki',
      categoryId: 'cat_internal',
      name: '知识库',
      url: `https://wiki.${EXAMPLE_DOMAIN}`,
      icon: '',
      description: '示例二级域名站点，请在管理面板替换',
      isInternal: true,
      openInNewTab: true,
      order: 2,
    },
    { id: 'site_github', categoryId: 'cat_dev', name: 'GitHub', url: 'https://github.com', icon: '', description: '代码托管与协作', isInternal: false, openInNewTab: true, order: 0 },
    { id: 'site_mdn', categoryId: 'cat_dev', name: 'MDN Web Docs', url: 'https://developer.mozilla.org', icon: '', description: 'Web 技术权威文档', isInternal: false, openInNewTab: true, order: 1 },
    { id: 'site_so', categoryId: 'cat_dev', name: 'Stack Overflow', url: 'https://stackoverflow.com', icon: '', description: '开发者问答社区', isInternal: false, openInNewTab: true, order: 2 },
    { id: 'site_caniuse', categoryId: 'cat_dev', name: 'Can I use', url: 'https://caniuse.com', icon: '', description: '浏览器兼容性查询', isInternal: false, openInNewTab: true, order: 3 },
    { id: 'site_npm', categoryId: 'cat_dev', name: 'npm', url: 'https://www.npmjs.com', icon: '', description: '前端包仓库与版本查询', isInternal: false, openInNewTab: true, order: 4 },
    { id: 'site_devdocs', categoryId: 'cat_dev', name: 'DevDocs', url: 'https://devdocs.io', icon: '', description: '聚合式离线 API 文档', isInternal: false, openInNewTab: true, order: 5 },
    { id: 'site_codepen', categoryId: 'cat_dev', name: 'CodePen', url: 'https://codepen.io', icon: '', description: '在线前端代码实验场', isInternal: false, openInNewTab: true, order: 6 },
    { id: 'site_regex101', categoryId: 'cat_dev', name: 'Regex101', url: 'https://regex101.com', icon: '', description: '正则表达式调试', isInternal: false, openInNewTab: true, order: 7 },

    { id: 'site_figma', categoryId: 'cat_design', name: 'Figma', url: 'https://www.figma.com', icon: '', description: '界面设计与原型', isInternal: false, openInNewTab: true, order: 0 },
    { id: 'site_dribbble', categoryId: 'cat_design', name: 'Dribbble', url: 'https://dribbble.com', icon: '', description: '设计作品灵感', isInternal: false, openInNewTab: true, order: 1 },
    { id: 'site_lucide', categoryId: 'cat_design', name: 'Lucide Icons', url: 'https://lucide.dev', icon: '', description: '开源线性图标库', isInternal: false, openInNewTab: true, order: 2 },
    { id: 'site_coolors', categoryId: 'cat_design', name: 'Coolors', url: 'https://coolors.co', icon: '', description: '配色方案生成器', isInternal: false, openInNewTab: true, order: 3 },
    { id: 'site_unsplash', categoryId: 'cat_design', name: 'Unsplash', url: 'https://unsplash.com', icon: '', description: '免费高清图库', isInternal: false, openInNewTab: true, order: 4 },

    { id: 'site_notion', categoryId: 'cat_productivity', name: 'Notion', url: 'https://www.notion.so', icon: '', description: '笔记与知识管理', isInternal: false, openInNewTab: true, order: 0 },
    { id: 'site_excalidraw', categoryId: 'cat_productivity', name: 'Excalidraw', url: 'https://excalidraw.com', icon: '', description: '手绘风白板', isInternal: false, openInNewTab: true, order: 1 },
    { id: 'site_drawio', categoryId: 'cat_productivity', name: 'draw.io', url: 'https://app.diagrams.net', icon: '', description: '免费流程图与架构图', isInternal: false, openInNewTab: true, order: 2 },
    { id: 'site_mubu', categoryId: 'cat_productivity', name: '幕布', url: 'https://mubu.com', icon: '', description: '大纲笔记与思维导图', isInternal: false, openInNewTab: true, order: 3 },

    { id: 'site_chatgpt', categoryId: 'cat_ai', name: 'ChatGPT', url: 'https://chatgpt.com', icon: '', description: '通用对话助手', isInternal: false, openInNewTab: true, order: 0 },
    { id: 'site_claude', categoryId: 'cat_ai', name: 'Claude', url: 'https://claude.ai', icon: '', description: '长文本与代码助手', isInternal: false, openInNewTab: true, order: 1 },
    { id: 'site_tongyi', categoryId: 'cat_ai', name: '通义千问', url: 'https://tongyi.aliyun.com', icon: '', description: '阿里大模型助手', isInternal: false, openInNewTab: true, order: 2 },
    { id: 'site_doubao', categoryId: 'cat_ai', name: '豆包', url: 'https://www.doubao.com', icon: '', description: '字节跳动 AI 助手', isInternal: false, openInNewTab: true, order: 3 },
    { id: 'site_kimi', categoryId: 'cat_ai', name: 'Kimi', url: 'https://kimi.moonshot.cn', icon: '', description: '长文阅读与总结', isInternal: false, openInNewTab: true, order: 4 },

    { id: 'site_runoob', categoryId: 'cat_learn', name: '菜鸟教程', url: 'https://www.runoob.com', icon: '', description: '基础编程入门教程', isInternal: false, openInNewTab: true, order: 0 },
    { id: 'site_juejin', categoryId: 'cat_learn', name: '掘金', url: 'https://juejin.cn', icon: '', description: '中文开发者社区', isInternal: false, openInNewTab: true, order: 1 },
    { id: 'site_ruanyifeng', categoryId: 'cat_learn', name: '阮一峰的网络日志', url: 'https://www.ruanyifeng.com/blog/', icon: '', description: '技术周刊与教程', isInternal: false, openInNewTab: true, order: 2 },
    { id: 'site_fcc', categoryId: 'cat_learn', name: 'freeCodeCamp', url: 'https://www.freecodecamp.org', icon: '', description: '免费编程课程与练习', isInternal: false, openInNewTab: true, order: 3 },
    { id: 'site_sf', categoryId: 'cat_learn', name: 'SegmentFault', url: 'https://segmentfault.com', icon: '', description: '中文技术问答社区', isInternal: false, openInNewTab: true, order: 4 },
  ],
  tools: TOOL_REGISTRY.map((t, i) => ({ slug: t.slug, enabled: true, order: i })),
  settings: DEFAULT_SETTINGS,
  customTools: [],
}

export function defaultNetworkConfig(): NetworkServiceConfig {
  return {
    enabled: true,
    endpoint: '',
    method: 'GET',
    headers: '',
    token: '',
    tokenPlacement: 'none',
    tokenKey: '',
    timeoutMs: 8000,
    cacheTtlSec: 300,
  }
}
