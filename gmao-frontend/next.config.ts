import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output : "standalone",
  async rewrites() {
    // NOTE: rewrites() is evaluated at BUILD time and baked into
    // routes-manifest.json — setting these vars on the running container does
    // nothing. They must be passed as Docker --build-arg (see Dockerfile/CI).
    // Use local backend by default for dev, or the remote URL if explicitly provided
    const backendUrl =
      process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
