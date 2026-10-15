import { Radio } from 'lucide-react'
import { UapiPanel } from '@/components/uapi-panel'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'UAPI 实验室 · 导航站' }

export default function UapiPage() {
  return (
    <div>
      <header className="mb-6">
        <span className="chip mb-3 bg-brand/12 text-brand animate-pop-in">
          <Radio className="h-3.5 w-3.5" aria-hidden />
          在线接口
        </span>
        <h1 className="font-black leading-[1.05] tracking-tight text-display-sm sm:text-display-md">
          <span className="grad-text">UAPI 实验室</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          聚合自 uapis.cn 的免费公开接口。由于上游不返回 CORS 头，所有请求均由本站服务端代理转发并缓存，
          避免浏览器直连失败与重复请求。
        </p>
      </header>

      <UapiPanel />

      <p className="mt-5 text-xs text-muted/80">
        数据来源：uapis.cn（免费公开 API）。天气与每日单词等结果按上游缓存策略展示，点击卡片右上角可手动刷新。
      </p>
    </div>
  )
}
