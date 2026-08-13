import type { NextConfig } from "next";
import os from "os";

const getLocalIPs = (): string[] => {
  const interfaces = os.networkInterfaces();
  const ips: string[] = ["localhost", "localhost:3000", "127.0.0.1"];
  for (const name of Object.keys(interfaces)) {
    const netList = interfaces[name];
    if (netList) {
      for (const net of netList) {
        // Support Node.js family check compat
        if ((net.family === "IPv4" || (net.family as any) === 4) && !net.internal) {
          ips.push(net.address);
          ips.push(`${net.address}:3000`);
        }
      }
    }
  }
  return ips;
};

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
      },
    ],
  },
  allowedDevOrigins: getLocalIPs(),
};

export default nextConfig;
