import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typedRoutes: true,
  transpilePackages: [
    '@qassem/ui',
    '@qassem/theme-engine',
    '@qassem/ai-core',
    '@qassem/realtime'
  ]
}

export default nextConfig
