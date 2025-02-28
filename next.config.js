/** @type {import('next').NextConfig} */
const nextConfig = {
  // Comment out the static export for development to allow API routes to work
  // output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;