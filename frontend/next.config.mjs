/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  devIndicators: false,

  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || (process.env.VERCEL ? 'https://mern-stack-dtgy.vercel.app' : 'http://167.172.196.0:5000'),
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || (process.env.VERCEL ? 'https://mern-stack-dtgy.vercel.app' : 'http://167.172.196.0:5000'),
  },

  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
};

export default nextConfig;
