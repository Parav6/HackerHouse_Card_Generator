import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        pathname: "/**",
      },
    ],
  },
  allowedDevOrigins: [
    "*.localtunnel.me",
    "*.lt.dev",
    "10.61.119.43",
    "localhost:3000"
  ],
};

export default nextConfig;
