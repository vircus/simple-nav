import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeScript } from '@/components/theme-script'
import { CursorGlow } from '@/components/fx/cursor-glow'
import { Toaster } from '@/components/ui/toast'

import { getPublicData } from '@/lib/data'

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getPublicData()
  return {
    title: settings.seo?.title || settings.title,
    description: settings.seo?.description || settings.subtitle || '工具 · 链接 · 一处直达',
    keywords: settings.seo?.keywords || undefined,
    icons: settings.faviconUrl ? { icon: settings.faviconUrl } : undefined,
    openGraph: settings.seo?.ogImage ? { images: [settings.seo.ogImage] } : undefined,
  }
}

export async function generateViewport(): Promise<Viewport> {
  const { settings } = await getPublicData()
  return {
    themeColor: settings.themeColor || '#7C3AED',
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { settings } = await getPublicData()
  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      data-theme-default={settings.defaultTheme}
      data-theme-color={settings.themeColor}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-dvh">
        <CursorGlow />
        {children}
        <Toaster />
      </body>
    </html>
  )
}
