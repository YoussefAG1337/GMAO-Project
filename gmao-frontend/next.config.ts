import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output : "standalone",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://gmao-backend-supra-ggbmdqgef4beeab3.swedencentral-01.azurewebsites.net/api/:path*",
      },
    ];
  },
};

export default nextConfig;
