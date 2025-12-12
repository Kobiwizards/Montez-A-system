/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true,
  },
  // Optional: Add API proxy for backend
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    if (backendUrl) {
      return [
        {
          source: '/api/:path*',
          destination: `${backendUrl}/:path*`,
        },
      ];
    }
    return [];
  },
  // Increase build timeout for Render
  staticPageGenerationTimeout: 300,
  // Disable strict mode for problematic packages if needed
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Handle external packages
  experimental: {
    esmExternals: 'loose',
  },
  // Webpack configuration to handle missing modules
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig