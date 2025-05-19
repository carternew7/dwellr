/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ✅ This disables TypeScript/ESLint warnings from blocking production builds
    ignoreDuringBuilds: true,
  },
  // You can add more config here if needed
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
};

export default nextConfig;
