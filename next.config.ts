import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // EdgeOne Pages has no persistent filesystem; keep everything serverless-safe.
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  // NOTE: Next.js native `redirects` / `rewrites` are NOT supported on EdgeOne Pages.
  // Routing for the hidden admin path is handled in middleware.ts instead.
}

export default nextConfig
