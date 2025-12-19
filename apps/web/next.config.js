/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['@nexus-ai/shared', '@nexus-ai/ui'],
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
