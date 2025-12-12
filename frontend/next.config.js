/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // CRITICAL for Render
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
    unoptimized: true, // Better for non-Vercel hosts
  },
  
  // API rewrites to backend
  async rewrites() {
    // Only add rewrites in production with a backend URL
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    if (process.env.NODE_ENV === 'production' && backendUrl) {
      return [
        {
          source: '/api/:path*',
          destination: `${backendUrl}/:path*`,
        },
      ];
    }
    return [];
  },
  
  // Optional: Increase timeout for build
  staticPageGenerationTimeout: 300,
}

module.exports = nextConfig