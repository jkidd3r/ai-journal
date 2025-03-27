/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable font preloading to prevent warnings
  optimizeFonts: false,
  experimental: {
    optimizePackageImports: ['@/components'],
  },
}

module.exports = nextConfig