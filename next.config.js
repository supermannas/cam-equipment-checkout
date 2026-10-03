/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! WARN !!
    // Ignore type errors during build
    ignoreBuildErrors: true,
  },
  eslint: {
    // !! WARN !!
    // Ignore ESLint errors during build
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
