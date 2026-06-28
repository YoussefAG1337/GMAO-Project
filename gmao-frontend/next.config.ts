import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output : "standalone",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://gmao-backend-tf-supra.azurewebsites.net/api/:path*",
      },
    ];
  },
};

export default nextConfig;
