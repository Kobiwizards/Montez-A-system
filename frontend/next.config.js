/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // ← MUST HAVE FOR RENDER
  reactStrictMode: true,
  swcMinify: true,
  // For image optimization
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allows all HTTPS images
      },
    ],
    unoptimized: process.env.NODE_ENV === 'production', // Better for non-Vercel hosts
  },
  // For CORS if needed
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
  // Proxy API requests to backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/:path*`,
      },
    ];
  },
  // Increase timeout for Render
  staticPageGenerationTimeout: 180,
}

module.exports = nextConfig