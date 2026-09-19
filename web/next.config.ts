import os from "node:os";
import path from "node:path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** IPv4 LAN cua may nay — dien thoai/may khac trong mang dung IP nay de mo site. */
const lanAddresses = Object.values(os.networkInterfaces())
  .flatMap((ifaces) => ifaces ?? [])
  .filter((iface) => iface.family === "IPv4" && !iface.internal)
  .map((iface) => iface.address);

const nextConfig: NextConfig = {
  output: "standalone",

  turbopack: {
    root: path.join(__dirname),
  },

  // Cho phep truy cap tu localhost + IP LAN (vd. 192.168.11.170:3010)
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "::1",
    "192.168.11.150",
    "192.168.11.170",
    ...lanAddresses,
  ],

  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", pathname: "**" },
      { protocol: "http", hostname: "127.0.0.1", pathname: "**" },
      ...lanAddresses.map((hostname) => ({
        protocol: "http" as const,
        hostname,
        pathname: "**",
      })),
      { protocol: "https", hostname: "realtyhub.com.vn", pathname: "**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "**" },
    ],
  },
};

export default withNextIntl(nextConfig);
