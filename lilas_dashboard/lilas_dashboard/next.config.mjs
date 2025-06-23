/** @type {import('next').NextConfig} */

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  }
];

const nextConfig = {
    experimental: {
      // ppr: 'incremental',
    },
    // images: {
    //   domains: ['localhost', 'api.mediax.com.vn'],
    // },
    async redirects() {
      return [
        {
          source: '/',
          destination: '/dang-nhap',
          permanent: true,
        },
      ];
    },
    async headers() {
      return [
        {
          source: '/:path*',
          headers: securityHeaders,
        },
      ]
    },
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "api.mediax.com.vn",
        },
        {
          protocol: "https",
          hostname: "lilas.mediax.com.vn",
        },
        {
          protocol: "http",
          hostname: "localhost",
        },
        {
          protocol: "https",
          hostname: "lilas-dashboard-backend.onrender.com",
        },
      ],
    },
  };

export default nextConfig;