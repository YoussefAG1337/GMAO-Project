import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output : "standalone",
  async rewrites() {
    // We use the stable default FQDN of the backend (without revision suffix)
    const backendUrl = "https://ca-backend-gmao-tf.livelyocean-c3c19832.swedencentral.azurecontainerapps.io/api";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
