/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['images.unsplash.com', 'github.com'],
  },
  experimental: {
    // Required for server components
    serverComponentsExternalPackages: ['@prisma/client', 'bcrypt'],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      // Add any custom aliases here
    };
    return config;
  },
};

module.exports = nextConfig;
