import type { NextConfig } from 'next'

const config: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
  swcMinify: true,
  reactStrictMode: true,
}

export default config
