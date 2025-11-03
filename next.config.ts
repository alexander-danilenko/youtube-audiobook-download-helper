import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export', // Generate static HTML files only
  images: {
    unoptimized: true, // Required for static export
    // domains: ['img.youtube.com'], // Deprecated in Next.js 13+
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        port: '',
        pathname: '/vi/**',
      },
    ],
  },
  // Theme is configured in src/app/theme-provider.tsx
  // Components should use useTheme() hook to access theme values
};

export default nextConfig;
