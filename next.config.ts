import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Suppress "Cross origin request detected" warnings for local development endpoints
  images: {
    remotePatterns: [],
  },
  experimental: {
    // Suppress Next.js 15+ proxy warnings for local dev
    serverActions: {
      allowedOrigins: ["localhost:3000", "127.0.0.1:3000"],
    },
  },
};

export default nextConfig;
