/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! WARN !!
    // Ignorar erros de TypeScript no build
    ignoreBuildErrors: true,
  },
  eslint: {
    // !! WARN !!
    // Ignorar erros de ESLint no build
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig 