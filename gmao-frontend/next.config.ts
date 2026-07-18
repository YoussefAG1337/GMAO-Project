import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output : "standalone",
  async rewrites() {
    // Use local backend by default for dev, or the remote URL if explicitly provided
    const backendUrl = process.env.BACKEND_URL || "http://localhost:5000/api";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
