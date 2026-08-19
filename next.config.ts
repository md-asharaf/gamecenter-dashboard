import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8080";
    const formattedUrl = backendUrl.endsWith("/") ? backendUrl.slice(0, -1) : backendUrl;
    return [
      {
        source: "/api/:path*",
        destination: `${formattedUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
