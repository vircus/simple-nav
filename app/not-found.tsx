import Link from 'next/link'
import { Compass } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="relative z-10 grid min-h-dvh place-items-center px-5 text-center">
      <div className="max-w-md">
        <span className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl grad-fill text-white shadow-glow animate-float">
          <Compass className="h-8 w-8" aria-hidden />
        </span>
        <p className="text-6xl font-black tracking-tighter grad-text">404</p>
        <h1 className="mt-2 text-xl font-extrabold tracking-tight">这里什么也没有</h1>
        <p className="mt-2 text-sm text-muted">页面可能已被移动、重命名，或者从未存在。</p>
        <Link
          href="/"
          className="mt-6 inline-flex h-11 items-center rounded-pill grad-fill px-6 text-sm font-bold text-white shadow-glow transition duration-200 ease-smooth hover:-translate-y-0.5 active:scale-95"
        >
          回到首页
        </Link>
      </div>
    </div>
  )
}
